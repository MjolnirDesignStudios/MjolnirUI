// app/api/webhooks/stripe/route.ts
// Handles Stripe webhook events to sync subscription status with Supabase.
// CRITICAL: Signature verification is mandatory — without it, anyone can upgrade their own tier.
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAuthAdmin } from '@/lib/supabaseAdmin';
import { PRICE_TO_TIER } from '@/lib/tierConfig';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
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

        // Update user in Supabase
        await supabaseAuthAdmin.from('users').update({
          tier,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);

        console.log(`User ${userId} upgraded to ${tier}`);
        break;
      }

      case 'customer.subscription.updated': {
        // Handles plan changes (upgrades/downgrades)
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0].price.id;
        const tier = PRICE_TO_TIER[priceId] || 'free';
        const customerId = sub.customer as string;

        await supabaseAuthAdmin.from('users').update({
          tier,
          updated_at: new Date().toISOString(),
        }).eq('stripe_customer_id', customerId);

        console.log(`Subscription updated: customer ${customerId} → ${tier}`);
        break;
      }

      case 'customer.subscription.deleted': {
        // Subscription cancelled — downgrade to free
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabaseAuthAdmin.from('users').update({
          tier: 'free',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        }).eq('stripe_customer_id', customerId);

        console.log(`Subscription cancelled: customer ${customerId} → free`);
        break;
      }
    }
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
