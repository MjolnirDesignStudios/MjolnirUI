// app/api/free-unlocks/track/route.ts
// Records a Free-tier user's trial unlock of a Base-tier component.
//
// Storage model is HYBRID:
//   - Client owns localStorage as the source of truth for gating decisions.
//     Reads are instant; the page never blocks on the network.
//   - This endpoint is the analytics sink. The client fire-and-forgets a
//     POST here on every successful unlock so the admin funnel can see real
//     usage data ("conversion rate when users hit the 5-cap").
//
// Idempotency:
//   - The same (user_id, componentId) pair never double-counts. We check
//     array membership in the WHERE clause and only increment + append
//     when the componentId is missing.
//
// Auth: NextAuth session required. Free tier only — paid users have no
// reason to use the trial, so the route 204's early for them.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/nextAuthOptions";
import { supabaseAuthAdmin } from "@/lib/supabaseAdmin";
import { rateLimit } from "@/lib/rateLimit";

const MAX_TRIAL_UNLOCKS = 5;

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function POST(req: Request) {
  try {
    // Rate limit at 20/min/IP — onboarding flows might fire several unlocks
    // per minute as the user clicks through components.
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    await limiter.check(20, ip);

    const session = await getServerSession(nextAuthOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { componentId } = await req.json();
    if (!componentId || typeof componentId !== "string") {
      return NextResponse.json(
        { error: "Missing componentId" },
        { status: 400 }
      );
    }

    // Only Free-tier users benefit from the trial. Higher tiers no-op.
    if (session.user.tier && session.user.tier !== "free") {
      return new NextResponse(null, { status: 204 });
    }

    // Read current row.
    const { data: user, error: readErr } = await supabaseAuthAdmin
      .from("users")
      .select("free_unlocks_count, free_unlocks_ids")
      .eq("id", session.user.id)
      .single();

    if (readErr) {
      console.error("free-unlocks/track: read failed", readErr);
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }

    const existingIds: string[] = user?.free_unlocks_ids || [];
    const existingCount: number = user?.free_unlocks_count || 0;

    // Already counted → 200 with current state, no write.
    if (existingIds.includes(componentId)) {
      return NextResponse.json({
        count: existingCount,
        max: MAX_TRIAL_UNLOCKS,
        deduped: true,
      });
    }

    // Cap respected server-side — the client also gates, but we double-check
    // here in case a hostile client bypasses the hook.
    if (existingCount >= MAX_TRIAL_UNLOCKS) {
      return NextResponse.json(
        {
          error: "Trial cap reached",
          count: existingCount,
          max: MAX_TRIAL_UNLOCKS,
        },
        { status: 403 }
      );
    }

    const nextIds = [...existingIds, componentId];
    const nextCount = existingCount + 1;

    const { error: writeErr } = await supabaseAuthAdmin
      .from("users")
      .update({
        free_unlocks_count: nextCount,
        free_unlocks_ids: nextIds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (writeErr) {
      console.error("free-unlocks/track: write failed", writeErr);
      return NextResponse.json({ error: "Write failed" }, { status: 500 });
    }

    return NextResponse.json({
      count: nextCount,
      max: MAX_TRIAL_UNLOCKS,
      deduped: false,
    });
  } catch (error: any) {
    if (error.status === 429) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }
    console.error("free-unlocks/track error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

// GET — let the client hydrate from the server on first mount (so trials
// persist across devices even though gating is localStorage-first).
export async function GET() {
  try {
    const session = await getServerSession(nextAuthOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: user, error } = await supabaseAuthAdmin
      .from("users")
      .select("free_unlocks_count, free_unlocks_ids")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("free-unlocks/track GET: read failed", error);
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }

    return NextResponse.json({
      count: user?.free_unlocks_count || 0,
      ids: user?.free_unlocks_ids || [],
      max: MAX_TRIAL_UNLOCKS,
    });
  } catch (e: any) {
    console.error("free-unlocks/track GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
