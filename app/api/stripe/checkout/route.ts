// app/api/stripe/checkout/route.ts
// Creates a Stripe Checkout Session for subscription purchases.
// Uses Stripe-hosted checkout (recommended 2026 approach).
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { nextAuthOptions } from '@/lib/nextAuthOptions';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit } from '@/lib/rateLimit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(req: Request) {
  try {
    // Rate limit: 10 requests per minute per IP
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    await limiter.check(10, ip);

    const session = await getServerSession(nextAuthOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { priceId, mode } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    // Check for existing Stripe customer to avoid duplicates
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: mode || 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/blocks/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/#pricing`,
      metadata: { userId: session.user.id },
    };

    // Reuse existing customer or pre-fill email for new customers
    if (userData?.stripe_customer_id) {
      checkoutParams.customer = userData.stripe_customer_id;
    } else {
      checkoutParams.customer_email = session.user.email;
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
