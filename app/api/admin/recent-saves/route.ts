// app/api/admin/recent-saves/route.ts
// GET /api/admin/recent-saves — most recent saved design assets across all users.
// Returns rows with the owning user's email/name joined in for display.
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { supabaseAuthAdmin } from "@/lib/supabaseAdmin";

export interface RecentSaveRow {
  id: string;
  asset_type: string;
  name: string;
  created_at: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
}

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") || "20", 10), 1),
    100
  );

  try {
    const { data: assets, error: assetsErr } = await supabaseAuthAdmin
      .schema("public")
      .from("user_design_assets")
      .select("id, asset_type, name, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (assetsErr) throw assetsErr;

    const userIds = Array.from(new Set((assets || []).map((a) => (a as any).user_id)));

    // Lookup users in one query
    const { data: users, error: usersErr } =
      userIds.length > 0
        ? await supabaseAuthAdmin
            .from("users")
            .select("id, email, name")
            .in("id", userIds)
        : { data: [], error: null };
    if (usersErr) throw usersErr;

    const userMap = new Map<string, { email: string | null; name: string | null }>();
    for (const u of users || []) {
      userMap.set((u as any).id, {
        email: (u as any).email,
        name: (u as any).name,
      });
    }

    const rows: RecentSaveRow[] = (assets || []).map((a) => {
      const u = userMap.get((a as any).user_id);
      return {
        id: (a as any).id,
        asset_type: (a as any).asset_type,
        name: (a as any).name,
        created_at: (a as any).created_at,
        user_id: (a as any).user_id,
        user_email: u?.email ?? null,
        user_name: u?.name ?? null,
      };
    });

    return NextResponse.json({ recentSaves: rows });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load recent saves" },
      { status: 500 }
    );
  }
}
