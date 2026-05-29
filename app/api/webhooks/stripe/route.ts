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
import { PRICE_TO_TIER, type TierName } from '@/lib/tierConfig';
import { sendWelcomePro } from '@/lib/resend';
import {
  getMdsGrantTier,
  isMdsLifetimeGrant,
  MDS_REVOKE_TIER,
} from '@/lib/mdsEntitlements';

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
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!subscriptionId) {
          // One-time payment or zero-line checkout — ignore for tier sync.
          break;
        }

        // Fetch subscription + product so we can decide MDS vs MjolnirUI
        // path. expand price.product so the product ID is on the price obj.
        const sub = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['items.data.price.product'],
        });
        const price = sub.items.data[0].price;
        const priceId = price.id;
        const productId =
          typeof price.product === 'string'
            ? price.product
            : (price.product as Stripe.Product).id;

        // ── MDS cross-grant fork ────────────────────────────
        const mdsGrantTier = getMdsGrantTier(productId);
        if (mdsGrantTier) {
          await applyMdsCrossGrant({
            customerId,
            subscriptionId,
            productId,
            grantTier: mdsGrantTier,
            stripe,
          });
          break;
        }

        // ── MjolnirUI direct purchase ───────────────────────
        const userId =
          session.metadata?.userId ||
          (session.client_reference_id as string | null) ||
          null;
        if (!userId) {
          console.error('No userId in checkout session metadata');
          break;
        }
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
        // Handles plan changes (upgrades/downgrades) for BOTH MDS and
        // MjolnirUI subscriptions.
        const sub = event.data.object as Stripe.Subscription;
        const price = sub.items.data[0].price;
        const priceId = price.id;
        const productId =
          typeof price.product === 'string' ? price.product : null;
        const customerId = sub.customer as string;

        // MDS product → re-apply cross-grant (in case tier changed)
        if (productId) {
          const mdsGrantTier = getMdsGrantTier(productId);
          if (mdsGrantTier) {
            await applyMdsCrossGrant({
              customerId,
              subscriptionId: sub.id,
              productId,
              grantTier: mdsGrantTier,
              stripe,
            });
            console.log(
              `MDS subscription updated: customer ${customerId} → MjolnirUI ${mdsGrantTier}`
            );
            break;
          }
        }

        // MjolnirUI product → standard tier sync
        const tier = PRICE_TO_TIER[priceId] || 'free';
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
        // Subscription cancelled — fork on MDS vs MjolnirUI.
        const sub = event.data.object as Stripe.Subscription;
        const price = sub.items.data[0].price;
        const productId =
          typeof price.product === 'string' ? price.product : null;
        const customerId = sub.customer as string;

        // MDS subscription ended → revoke cross-grant unless lifetime.
        if (productId && getMdsGrantTier(productId)) {
          if (isMdsLifetimeGrant(productId)) {
            console.log(
              `MDS lifetime subscription deleted (customer ${customerId}) — grant preserved`
            );
            break;
          }
          await revokeMdsCrossGrant({ subscriptionId: sub.id });
          console.log(
            `MDS subscription cancelled: customer ${customerId} → MjolnirUI ${MDS_REVOKE_TIER} (revoked)`
          );
          break;
        }

        // MjolnirUI subscription cancelled → standard downgrade to free.
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

/* ═══════════════════════════════════════════════════════
   MDS CROSS-GRANT HELPERS
   ═══════════════════════════════════════════════════════
   When an MDS Stripe subscription event fires, MjolnirUI's webhook
   needs to grant the equivalent MjolnirUI tier — by email lookup,
   pre-creating a next_auth.users row if the customer hasn't signed up
   for MjolnirUI yet. When they later log in via Google/GitHub at
   mjolnirui.com, NextAuth's SupabaseAdapter finds the pre-created row
   and links the OAuth account (requires allowDangerousEmailAccountLinking
   on the providers — see nextAuthOptions.ts). */

interface CrossGrantInput {
  customerId: string;
  subscriptionId: string;
  productId: string;
  grantTier: TierName;
  stripe: Stripe;
}

/**
 * Apply (or refresh) an MDS cross-grant. Looks up the user by their
 * Stripe customer email, upserts a next_auth.users row, and sets the
 * mapped MjolnirUI tier.
 *
 * If the user already has a higher-paid MjolnirUI subscription, the
 * grant is a no-op — we never downgrade a paying customer.
 */
async function applyMdsCrossGrant({
  customerId,
  subscriptionId,
  productId,
  grantTier,
  stripe,
}: CrossGrantInput): Promise<void> {
  // Pull email from Stripe customer (most reliable source — the customer
  // record is created at checkout and verified via email receipt).
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    console.error(`MDS cross-grant: customer ${customerId} is deleted`);
    return;
  }
  const email = (customer as Stripe.Customer).email;
  if (!email) {
    console.error(`MDS cross-grant: customer ${customerId} has no email`);
    return;
  }

  // Does this user already exist in next_auth.users?
  const { data: existing } = await supabaseAuthAdmin
    .from('users')
    .select('id, email, tier, mds_grant')
    .ilike('email', email)
    .maybeSingle();

  const TIER_RANK: Record<TierName, number> = {
    free: 0,
    base: 1,
    pro: 2,
    elite: 3,
  };

  if (existing) {
    // User exists — only upgrade if grant tier is higher than current.
    // Never downgrade a paying customer with a direct MjolnirUI sub.
    const currentTier = (existing.tier ?? 'free') as TierName;
    if (TIER_RANK[grantTier] <= TIER_RANK[currentTier]) {
      console.log(
        `MDS cross-grant: ${email} already at ${currentTier}, grant tier ${grantTier} — no change`
      );
      return;
    }
    await supabaseAuthAdmin
      .from('users')
      .update({
        tier: grantTier,
        mds_grant: true,
        mds_product_id: productId,
        mds_subscription_id: subscriptionId,
        mds_granted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    console.log(
      `MDS cross-grant: upgraded ${email} (id ${existing.id}) to ${grantTier}`
    );
    return;
  }

  // User doesn't exist yet — pre-create a row so they get instant access
  // when they sign in at mjolnirui.com. NextAuth's SupabaseAdapter will
  // link the OAuth identity to this row by email match.
  const { error: insertErr } = await supabaseAuthAdmin
    .from('users')
    .insert({
      email,
      tier: grantTier,
      mds_grant: true,
      mds_product_id: productId,
      mds_subscription_id: subscriptionId,
      mds_granted_at: new Date().toISOString(),
    });
  if (insertErr) {
    console.error(
      `MDS cross-grant: failed to pre-create ${email}:`,
      insertErr
    );
    return;
  }
  console.log(
    `MDS cross-grant: pre-created ${email} with tier ${grantTier} (subscription ${subscriptionId})`
  );
}

/**
 * Revoke an MDS-granted tier — sets the user back to MDS_REVOKE_TIER
 * (default: free) UNLESS they have their own direct MjolnirUI Stripe
 * subscription on file (we don't downgrade paying customers).
 */
async function revokeMdsCrossGrant({
  subscriptionId,
}: {
  subscriptionId: string;
}): Promise<void> {
  // Find the user by mds_subscription_id index.
  const { data: user } = await supabaseAuthAdmin
    .from('users')
    .select('id, email, tier, mds_grant, stripe_subscription_id')
    .eq('mds_subscription_id', subscriptionId)
    .maybeSingle();

  if (!user) {
    console.log(
      `MDS revoke: no user found for subscription ${subscriptionId} — already cleaned up or never granted`
    );
    return;
  }

  // If the user has a direct MjolnirUI sub on top, just clear the MDS
  // grant metadata — don't touch their tier.
  if (user.stripe_subscription_id) {
    await supabaseAuthAdmin
      .from('users')
      .update({
        mds_grant: false,
        mds_product_id: null,
        mds_subscription_id: null,
        mds_granted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    console.log(
      `MDS revoke: ${user.email} has direct MjolnirUI sub — kept their paid tier, cleared MDS marker`
    );
    return;
  }

  // Otherwise revoke fully.
  await supabaseAuthAdmin
    .from('users')
    .update({
      tier: MDS_REVOKE_TIER,
      mds_grant: false,
      mds_product_id: null,
      mds_subscription_id: null,
      mds_granted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
  console.log(
    `MDS revoke: ${user.email} downgraded to ${MDS_REVOKE_TIER}`
  );
}
