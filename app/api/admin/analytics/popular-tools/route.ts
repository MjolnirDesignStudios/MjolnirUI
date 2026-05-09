// app/api/admin/analytics/popular-tools/route.ts
// GET /api/admin/analytics/popular-tools?days=30
// Aggregates tool_open events grouped by payload->>'tool' over the window.
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { supabaseAuthAdmin } from "@/lib/supabaseAdmin";
import { TOOL_LABELS } from "@/lib/analytics";

export interface PopularTool {
  tool: string;
  label: string;
  opens: number;
  unique_users: number;
}

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const days = Math.min(
    Math.max(parseInt(url.searchParams.get("days") || "30", 10), 1),
    365
  );
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { data, error } = await supabaseAuthAdmin
      .schema("public")
      .from("analytics_events")
      .select("payload, user_id")
      .eq("event_type", "tool_open")
      .gte("created_at", since)
      .returns<Array<{ payload: { tool?: string }; user_id: string | null }>>();
    if (error) throw error;

    // Aggregate
    const counts = new Map<string, { opens: number; users: Set<string> }>();
    for (const row of data || []) {
      const tool = row.payload?.tool;
      if (!tool || typeof tool !== "string") continue;
      const entry = counts.get(tool) ?? { opens: 0, users: new Set<string>() };
      entry.opens += 1;
      if (row.user_id) entry.users.add(row.user_id);
      counts.set(tool, entry);
    }

    const tools: PopularTool[] = Array.from(counts.entries())
      .map(([tool, { opens, users }]) => ({
        tool,
        label: TOOL_LABELS[tool] ?? tool,
        opens,
        unique_users: users.size,
      }))
      .sort((a, b) => b.opens - a.opens);

    return NextResponse.json({ window_days: days, tools });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to compute popular tools" },
      { status: 500 }
    );
  }
}
