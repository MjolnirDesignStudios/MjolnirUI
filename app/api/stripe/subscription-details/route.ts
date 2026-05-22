// app/api/stripe/subscription-details/route.ts
// Returns the signed-in user's active subscription summary for the
// /blocks/account/subscription page:
//   - status (active, past_due, canceled, …)
//   - current_period_end (next billing date)
//   - amount + currency + interval (e.g. $25 USD / month)
//   - default payment method brand + last4 (e.g. Visa •••• 4242)
//   - cancel_at_period_end (whether the user has scheduled a cancel)
//
// Auth-gated. Lightweight — at most two Stripe round-trips. Cached for
// 30 seconds via the response headers so a fast page reload doesn't
// hammer the Stripe API.

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/nextAuthOptions";
import { supabaseAuthAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }
    const stripe = new Stripe(secretKey);

    const session = await getServerSession(nextAuthOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: userData, error: userErr } = await supabaseAuthAdmin
      .from("users")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("id", session.user.id)
      .single();

    if (userErr) {
      console.error("subscription-details: user lookup failed", userErr);
      return NextResponse.json({ error: "User lookup failed" }, { status: 500 });
    }

    if (!userData?.stripe_subscription_id) {
      // Free user — nothing to show. Return 200 with a null payload so the
      // client can simply hide the billing card.
      return NextResponse.json({ subscription: null });
    }

    // Pull subscription + expand default payment method in one round-trip.
    const sub = (await stripe.subscriptions.retrieve(
      userData.stripe_subscription_id,
      { expand: ["default_payment_method"] }
    )) as Stripe.Subscription;

    const item = sub.items.data[0];
    const price = item?.price;
    const interval = price?.recurring?.interval ?? "month";
    const amount = price?.unit_amount ?? 0;
    const currency = (price?.currency ?? "usd").toUpperCase();

    // Cast — the expanded payment method comes back as the full object.
    const pm = sub.default_payment_method as
      | Stripe.PaymentMethod
      | null
      | string;
    const card = pm && typeof pm === "object" && pm.card ? pm.card : null;

    // current_period_end is a Unix timestamp (seconds) at the top level of
    // the subscription object.
    const nextBillingAt = (sub as any).current_period_end as number | null;

    return NextResponse.json(
      {
        subscription: {
          id: sub.id,
          status: sub.status,
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
          current_period_end: nextBillingAt,
          amount,
          currency,
          interval,
          card_brand: card?.brand ?? null,
          card_last4: card?.last4 ?? null,
        },
      },
      {
        headers: {
          // 30s edge cache + 5min SWR — billing rarely changes mid-page.
          "Cache-Control": "private, max-age=30, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    const errorMessage =
      error?.message || error?.raw?.message || "subscription-details failed";
    console.error("subscription-details error:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: error?.statusCode || 500 }
    );
  }
}
