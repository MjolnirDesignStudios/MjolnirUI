// app/api/admin/analytics/activity/route.ts
// GET /api/admin/analytics/activity?days=30
// Returns daily event counts (per event_type) for the timeline chart.
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { supabaseAuthAdmin } from "@/lib/supabaseAdmin";

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  page_view: number;
  tool_open: number;
  component_click: number;
  save_asset: number;
  export_action: number;
  upgrade_click: number;
  total: number;
}

const EVENT_TYPES = [
  "page_view",
  "tool_open",
  "component_click",
  "save_asset",
  "export_action",
  "upgrade_click",
] as const;

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const days = Math.min(
    Math.max(parseInt(url.searchParams.get("days") || "30", 10), 1),
    90
  );
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const { data, error } = await supabaseAuthAdmin
      .schema("public")
      .from("analytics_events")
      .select("event_type, created_at")
      .gte("created_at", since.toISOString())
      .returns<Array<{ event_type: string; created_at: string }>>();
    if (error) throw error;

    // Pre-fill all days with zeros so the chart renders even sparse data
    const buckets = new Map<string, ActivityDay>();
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, {
        date: key,
        page_view: 0,
        tool_open: 0,
        component_click: 0,
        save_asset: 0,
        export_action: 0,
        upgrade_click: 0,
        total: 0,
      });
    }

    for (const row of data || []) {
      const key = row.created_at.slice(0, 10);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      const type = row.event_type as (typeof EVENT_TYPES)[number];
      if ((EVENT_TYPES as readonly string[]).includes(type)) {
        bucket[type] += 1;
        bucket.total += 1;
      }
    }

    const series = Array.from(buckets.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return NextResponse.json({ window_days: days, series });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to compute activity timeline" },
      { status: 500 }
    );
  }
}
