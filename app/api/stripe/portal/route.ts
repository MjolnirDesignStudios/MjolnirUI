// app/api/stripe/portal/route.ts
// Creates a Stripe Billing Portal session so a paid user can self-serve:
//   - Update card / billing details
//   - Cancel or pause subscription
//   - View / download past invoices
//   - Change plan within the same product
//
// The flow:
//   1. Client (subscription page "Manage Billing" button) → POST here
//   2. We look up the user's stripe_customer_id in next_auth.users
//   3. Create a portal session with return_url back to the subscription page
//   4. Return the portal URL; client window.location's into it
//
// Auth-gated. Rate-limited (10/min/IP, same as checkout).
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/nextAuthOptions";
import { supabaseAuthAdmin } from "@/lib/supabaseAdmin";
import { rateLimit } from "@/lib/rateLimit";

// Lazy-init Stripe inside the handler — module-load instantiation breaks the
// build when STRIPE_SECRET_KEY isn't available during page data collection.

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.error("Missing STRIPE_SECRET_KEY");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }
    const stripe = new Stripe(secretKey);

    // Rate limit: 10 requests per minute per IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    await limiter.check(10, ip);

    const session = await getServerSession(nextAuthOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Look up the Stripe customer ID. A user without one has never purchased
    // — they shouldn't have a portal button visible, but guard server-side too.
    const { data: userData, error: userErr } = await supabaseAuthAdmin
      .from("users")
      .select("stripe_customer_id")
      .eq("id", session.user.id)
      .single();

    if (userErr) {
      console.error("Portal: user lookup failed", userErr);
      return NextResponse.json({ error: "User lookup failed" }, { status: 500 });
    }

    if (!userData?.stripe_customer_id) {
      return NextResponse.json(
        {
          error:
            "No Stripe customer on file. Upgrade your plan first to access the billing portal.",
        },
        { status: 400 }
      );
    }

    // Return user to the subscription page after they're done in the portal.
    const returnUrl = `${process.env.NEXTAUTH_URL}/blocks/account/subscription`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    if (error.status === 429) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
    const errorMessage =
      error?.message || error?.raw?.message || "Portal session failed";
    console.error(
      "Stripe portal error:",
      errorMessage,
      error?.type,
      error?.statusCode
    );
    return NextResponse.json(
      { error: errorMessage },
      { status: error?.statusCode || 500 }
    );
  }
}
