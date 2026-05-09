// app/api/cross-project/metrics/route.ts
// GET /api/cross-project/metrics?days=30
// Cross-project read-only metrics endpoint consumed by the MDS admin dashboard.
//
// Auth: shared-secret API key in the X-Cross-Project-Key header. Configured
// via the CROSS_PROJECT_API_KEY env var. NO session needed — this is server-
// to-server.
//
// Returns:
//   - revenue: real Stripe MRR + ARR (computed inline so MDS gets a single
//     consistent payload without making 2 calls)
//   - users: total / paid / tier breakdown / Free→Paid conversion
//   - tools: most-used tools in the window (top 10)
//   - saves: total saves + breakdown by asset_type
//   - activity: last 30 days daily totals
//
// Designed so MDS can render the MjolnirUI panels in one fetch.
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAuthAdmin } from "@/lib/supabaseAdmin";
import { TOOL_LABELS } from "@/lib/analytics";

export interface CrossProjectMetrics {
  generated_at: string;
  window_days: number;
  source_project: "mjolnirui";
  revenue: {
    mrr_cents: number;
    arr_cents: number;
    active_subscriptions: number;
    currency: string;
    source: "stripe" | "estimate";
  };
  users: {
    total: number;
    paid: number;
    free: number;
    conversion_pct: number;
    by_tier: Record<string, number>;
  };
  tools: Array<{
    tool: string;
    label: string;
    opens: number;
    unique_users: number;
  }>;
  saves: {
    total: number;
    by_type: Record<string, number>;
  };
  activity: Array<{
    date: string;
    total: number;
  }>;
}

function unauthorized(reason: string) {
  return NextResponse.json({ error: reason }, { status: 401 });
}

function badRequest(reason: string) {
  return NextResponse.json({ error: reason }, { status: 400 });
}

export async function GET(req: Request) {
  // Shared-secret check
  const expectedKey = process.env.CROSS_PROJECT_API_KEY;
  if (!expectedKey) {
    return NextResponse.json(
      {
        error:
          "CROSS_PROJECT_API_KEY is not configured on this MjolnirUI instance.",
      },
      { status: 503 }
    );
  }
  const presentedKey = req.headers.get("x-cross-project-key");
  if (!presentedKey || presentedKey !== expectedKey) {
    return unauthorized("Invalid or missing X-Cross-Project-Key header");
  }

  const url = new URL(req.url);
  const daysRaw = parseInt(url.searchParams.get("days") || "30", 10);
  if (Number.isNaN(daysRaw)) return badRequest("days must be a number");
  const days = Math.min(Math.max(daysRaw, 1), 90);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const sinceIso = since.toISOString();

  try {
    /* ── Users ─────────────────────────────────────────── */
    const { data: users, error: usersErr } = await supabaseAuthAdmin
      .from("users")
      .select("id, tier")
      .returns<Array<{ id: string; tier: string | null }>>();
    if (usersErr) throw usersErr;

    const byTier: Record<string, number> = { free: 0, base: 0, pro: 0, elite: 0 };
    for (const u of users || []) {
      const tier = u.tier || "free";
      byTier[tier] = (byTier[tier] || 0) + 1;
    }
    const totalUsers = users?.length ?? 0;
    const freeUsers = byTier.free || 0;
    const paidUsers = totalUsers - freeUsers;
    const conversionPct =
      totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;

    /* ── Saves ─────────────────────────────────────────── */
    const { data: saves, error: savesErr } = await supabaseAuthAdmin
      .schema("public")
      .from("user_design_assets")
      .select("asset_type")
      .returns<Array<{ asset_type: string }>>();
    if (savesErr) throw savesErr;

    const savesByType: Record<string, number> = {
      color_palette: 0,
      type_system: 0,
      token_set: 0,
      icon: 0,
    };
    for (const s of saves || []) {
      savesByType[s.asset_type] = (savesByType[s.asset_type] || 0) + 1;
    }

    /* ── Tools (popular) ───────────────────────────────── */
    const { data: toolEvents, error: toolsErr } = await supabaseAuthAdmin
      .schema("public")
      .from("analytics_events")
      .select("payload, user_id")
      .eq("event_type", "tool_open")
      .gte("created_at", sinceIso)
      .returns<Array<{ payload: { tool?: string }; user_id: string | null }>>();
    if (toolsErr) throw toolsErr;

    const toolCounts = new Map<
      string,
      { opens: number; users: Set<string> }
    >();
    for (const row of toolEvents || []) {
      const tool = row.payload?.tool;
      if (!tool || typeof tool !== "string") continue;
      const entry = toolCounts.get(tool) ?? {
        opens: 0,
        users: new Set<string>(),
      };
      entry.opens += 1;
      if (row.user_id) entry.users.add(row.user_id);
      toolCounts.set(tool, entry);
    }
    const tools = Array.from(toolCounts.entries())
      .map(([tool, { opens, users }]) => ({
        tool,
        label: TOOL_LABELS[tool] ?? tool,
        opens,
        unique_users: users.size,
      }))
      .sort((a, b) => b.opens - a.opens)
      .slice(0, 10);

    /* ── Activity (daily totals) ───────────────────────── */
    const { data: allEvents, error: actErr } = await supabaseAuthAdmin
      .schema("public")
      .from("analytics_events")
      .select("created_at")
      .gte("created_at", sinceIso)
      .returns<Array<{ created_at: string }>>();
    if (actErr) throw actErr;

    const buckets = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const e of allEvents || []) {
      const key = e.created_at.slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    const activity = Array.from(buckets.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));

    /* ── Revenue (Stripe) ──────────────────────────────── */
    let mrrCents = 0;
    let activeSubs = 0;
    let currency = "usd";
    let source: "stripe" | "estimate" = "estimate";

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      try {
        const stripe = new Stripe(stripeKey);
        for await (const sub of stripe.subscriptions.list({
          status: "all",
          limit: 100,
        })) {
          if (sub.status !== "active" && sub.status !== "trialing") continue;
          activeSubs += 1;
          for (const item of sub.items.data) {
            const price = item.price;
            if (!price.recurring) continue;
            currency = price.currency || currency;
            const unitAmount = price.unit_amount ?? 0;
            const qty = item.quantity ?? 1;
            let monthly = unitAmount * qty;
            if (price.recurring.interval === "year") {
              monthly = Math.round(monthly / 12);
            } else if (price.recurring.interval === "week") {
              monthly = Math.round(monthly * 4.345);
            } else if (price.recurring.interval === "day") {
              monthly = Math.round(monthly * 30.4);
            }
            mrrCents += monthly;
          }
        }
        source = "stripe";
      } catch (stripeErr) {
        console.error("[cross-project] Stripe read failed:", stripeErr);
        // Fall through to estimate path below
      }
    }

    if (source === "estimate") {
      // Fallback: estimate from tier counts using monthly tier prices
      mrrCents =
        (byTier.base || 0) * 1000 +
        (byTier.pro || 0) * 2500 +
        (byTier.elite || 0) * 5000;
    }

    const result: CrossProjectMetrics = {
      generated_at: new Date().toISOString(),
      window_days: days,
      source_project: "mjolnirui",
      revenue: {
        mrr_cents: mrrCents,
        arr_cents: mrrCents * 12,
        active_subscriptions: activeSubs,
        currency,
        source,
      },
      users: {
        total: totalUsers,
        paid: paidUsers,
        free: freeUsers,
        conversion_pct: conversionPct,
        by_tier: byTier,
      },
      tools,
      saves: {
        total: saves?.length ?? 0,
        by_type: savesByType,
      },
      activity,
    };
    return NextResponse.json(result, {
      headers: {
        // Cache hint for MDS — these metrics are aggregates; 60s freshness OK
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
      },
    });
  } catch (err: any) {
    console.error("[cross-project] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to compute cross-project metrics" },
      { status: 500 }
    );
  }
}
