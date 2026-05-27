// app/api/webhooks/stripe/route.ts
// Handles Stripe webhook events to sync subscription status with Supabase.
//
// CRITICAL: Signature verification is mandatory — without it, anyone can
// upgrade their own tier by hand-rolling a fake event POST.
//
// Hardening v2 (pre-launch 2026-05-29):
//   • Idempotency — every event_id is logged to public.stripe_webhook_events
//     via INSERT ... ON CONFLICT DO NOTHING. If the conflict path is hit, the
//     event was already processed and we early-return 200. Without this
//     guard, Stripe's exponential-backoff retries could re-grant tier
//     upgrades or fire double emails.
//   • invoice.payment_failed — immediate downgrade to free per policy. We
//     accept the harsh UX of an instant lockout in exchange for revenue
//     protection; the user can re-checkout from the pricing page.
//   • invoice.payment_succeeded — log-only renewal confirmation (kept for
//     forensic value, no DB write).

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin, supabaseAuthAdmin } from '@/lib/supabaseAdmin';
import { PRICE_TO_TIER } from '@/lib/tierConfig';
import { sendWelcomePro } from '@/lib/resend';

// Lazy-init Stripe inside the handler — module-load instantiation breaks the
// build when STRIPE_SECRET_KEY isn't available during page data collection.
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    console.error('Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  const stripe = new Stripe(secretKey);

  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ── Idempotency claim ───────────────────────────────────
  // Atomically attempt to record this event_id. If the row already exists
  // (Stripe retry), the insert is a no-op and we exit early with 200 so Stripe
  // stops retrying. If the dedup table itself is missing or unreachable we
  // log the failure but continue processing — better to risk a double-process
  // than to drop a legitimate event.
  try {
    const { data: claim, error: claimErr } = await supabaseAdmin
      .from('stripe_webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        meta: { livemode: event.livemode },
      })
      .select('event_id')
      .maybeSingle();

    if (claimErr) {
      const code = (claimErr as any).code as string | undefined;
      if (code === '23505') {
        // Unique-constraint violation = duplicate event. Already processed.
        console.log(`Webhook ${event.id} (${event.type}) deduped — already processed`);
        return NextResponse.json({ received: true, deduped: true });
      }
      // Any other failure: log and continue (e.g. table missing on a fresh
      // env). Don't 500 — that would make Stripe retry forever.
      console.error('Webhook dedup insert failed (continuing):', claimErr);
    } else if (!claim) {
      // Conflict with no error — also dedup hit on some PostgREST configs.
      console.log(`Webhook ${event.id} (${event.type}) deduped — no row returned`);
      return NextResponse.json({ received: true, deduped: true });
    }
  } catch (e) {
    // Table missing or DB unreachable — process anyway.
    console.error('Webhook dedup table check threw (continuing):', e);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.metadata?.userId ||
          (session.client_reference_id as string | null) ||
          null;
        if (!userId) {
          console.error('No userId in checkout session metadata');
          break;
        }
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        // Fetch subscription to get price ID
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items.data[0].price.id;
        const tier = PRICE_TO_TIER[priceId] || 'free';

        // Update user in Supabase + pull display name / email for the
        // welcome email send.
        const { data: updatedUser } = await supabaseAuthAdmin
          .from('users')
          .update({
            tier,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select('email, name')
          .single();

        console.log(`User ${userId} upgraded to ${tier}`);

        // Fire-and-forget welcome email. Failures are logged but do NOT
        // block the webhook 200 response (Stripe would retry → double-
        // process the upgrade). RESEND_API_KEY-less environments skip
        // gracefully.
        if (updatedUser?.email && tier !== 'free') {
          const firstName = updatedUser.name
            ? String(updatedUser.name).split(' ')[0]
            : undefined;
          sendWelcomePro({
            to: updatedUser.email,
            firstName,
            tier,
          }).catch((e) => console.error('[webhook] welcome email failed:', e));
        }
        break;
      }

      case 'customer.subscription.updated': {
        // Handles plan changes (upgrades/downgrades)
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0].price.id;
        const tier = PRICE_TO_TIER[priceId] || 'free';
        const customerId = sub.customer as string;

        await supabaseAuthAdmin
          .from('users')
          .update({
            tier,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        console.log(`Subscription updated: customer ${customerId} → ${tier}`);
        break;
      }

      case 'customer.subscription.deleted': {
        // Subscription cancelled — downgrade to free
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabaseAuthAdmin
          .from('users')
          .update({
            tier: 'free',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        console.log(`Subscription cancelled: customer ${customerId} → free`);
        break;
      }

      case 'invoice.payment_failed': {
        // POLICY: immediate downgrade to free on payment failure. This is the
        // strict-protection mode chosen on 2026-05-20. The user can re-enter
        // payment details via the Customer Portal or check out again.
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId =
          (invoice as any).subscription as string | null;

        if (!customerId) {
          console.error('invoice.payment_failed without customer id');
          break;
        }

        await supabaseAuthAdmin
          .from('users')
          .update({
            tier: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        console.warn(
          `Payment failed for customer ${customerId} (sub ${subscriptionId}) → downgraded to free`
        );
        break;
      }

      case 'invoice.payment_succeeded': {
        // Log-only — confirms a renewal went through. No DB write needed
        // because subscription.updated already handled any plan changes.
        const invoice = event.data.object as Stripe.Invoice;
        console.log(
          `Renewal paid: customer ${invoice.customer} amount ${invoice.amount_paid} ${invoice.currency}`
        );
        break;
      }
    }
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
