// app/api/admin/mrr/route.ts
// GET /api/admin/mrr — real MRR computed from Stripe active subscriptions.
// Replaces the tier-count estimate used in /api/admin/stats.
//
// Uses lazy Stripe init (the Day 0 build-fix pattern) so the route never
// crashes during page-data collection.
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdmin } from "@/lib/adminGuard";

export interface MrrResult {
  mrr_cents: number;            // monthly recurring revenue, cents
  arr_cents: number;            // annual recurring revenue, cents
  active_subscriptions: number; // count of status='active' or 'trialing'
  by_tier: Record<string, { count: number; mrr_cents: number }>;
  currency: string;             // assumed uniform across subscriptions
  source: "stripe" | "estimate"; // marker so the dashboard can label this
  note?: string;
}

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json<MrrResult>(
      {
        mrr_cents: 0,
        arr_cents: 0,
        active_subscriptions: 0,
        by_tier: {},
        currency: "usd",
        source: "estimate",
        note: "STRIPE_SECRET_KEY not configured. Returning zero MRR.",
      },
      { status: 200 }
    );
  }

  const stripe = new Stripe(secretKey);

  try {
    // Stripe paginates 100 per page. Walk all active + trialing subscriptions.
    const subs: Stripe.Subscription[] = [];
    for await (const sub of stripe.subscriptions.list({
      status: "all",
      limit: 100,
      expand: ["data.items.data.price"],
    })) {
      if (sub.status === "active" || sub.status === "trialing") {
        subs.push(sub);
      }
    }

    let mrr = 0;
    const byTier: Record<string, { count: number; mrr_cents: number }> = {};
    let currency = "usd";

    for (const sub of subs) {
      for (const item of sub.items.data) {
        const price = item.price;
        if (!price.recurring) continue;
        currency = price.currency || currency;

        const unitAmount = price.unit_amount ?? 0;
        const qty = item.quantity ?? 1;
        let monthly = unitAmount * qty;

        // Normalize annual subs into monthly equivalent
        if (price.recurring.interval === "year") {
          monthly = Math.round(monthly / 12);
        } else if (price.recurring.interval === "week") {
          monthly = Math.round(monthly * 4.345);
        } else if (price.recurring.interval === "day") {
          monthly = Math.round(monthly * 30.4);
        }
        mrr += monthly;

        // Best-effort tier resolution: read price.metadata.tier or
        // product.metadata.tier; fall back to the price nickname.
        const priceMeta = (price.metadata || {}) as Record<string, string>;
        const tier =
          priceMeta.tier ||
          (typeof price.product === "string"
            ? "unknown"
            : ((price.product as Stripe.Product)?.metadata?.tier ||
                price.nickname ||
                "unknown"));

        const tierKey = tier.toLowerCase();
        const bucket = byTier[tierKey] ?? { count: 0, mrr_cents: 0 };
        bucket.count += 1;
        bucket.mrr_cents += monthly;
        byTier[tierKey] = bucket;
      }
    }

    const result: MrrResult = {
      mrr_cents: mrr,
      arr_cents: mrr * 12,
      active_subscriptions: subs.length,
      by_tier: byTier,
      currency,
      source: "stripe",
    };
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to read Stripe MRR" },
      { status: 500 }
    );
  }
}
