// app/api/admin/stats/route.ts
// GET /api/admin/stats — KPI strip data for the admin dashboard.
// Returns: total users, paid users, total saves, MRR (placeholder until
// Stripe integration on Day 4), and free→paid conversion %.
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { supabaseAuthAdmin } from "@/lib/supabaseAdmin";

interface AdminStats {
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
  totalSaves: number;
  mrrCents: number; // placeholder until Stripe wired
  conversionPct: number; // free → paid %
  tierBreakdown: Record<string, number>; // tier name → count
  savesByType: Record<string, number>; // asset_type → count
}

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    // Fetch all users with tier info — small project, fine to enumerate
    const { data: users, error: usersErr } = await supabaseAuthAdmin
      .from("users")
      .select("id, tier")
      .returns<{ id: string; tier: string | null }[]>();
    if (usersErr) throw usersErr;

    // Aggregate by tier
    const tierBreakdown: Record<string, number> = {
      free: 0,
      base: 0,
      pro: 0,
      elite: 0,
    };
    for (const u of users || []) {
      const tier = u.tier || "free";
      tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
    }

    const totalUsers = users?.length || 0;
    const freeUsers = tierBreakdown.free || 0;
    const paidUsers = totalUsers - freeUsers;
    const conversionPct = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;

    // Saves count — uses public schema (user_design_assets is public).
    // We use a service-role client to bypass RLS for an admin aggregate read.
    // Note: supabaseAuthAdmin is keyed to next_auth schema; for cross-schema
    // we rely on the service role token.
    const { data: assets, error: assetsErr } = await supabaseAuthAdmin
      .schema("public")
      .from("user_design_assets")
      .select("asset_type")
      .returns<{ asset_type: string }[]>();
    if (assetsErr) throw assetsErr;

    const savesByType: Record<string, number> = {
      color_palette: 0,
      type_system: 0,
      token_set: 0,
      icon: 0,
    };
    for (const a of assets || []) {
      savesByType[a.asset_type] = (savesByType[a.asset_type] || 0) + 1;
    }
    const totalSaves = assets?.length || 0;

    // MRR placeholder — Day 4 wires Stripe API. For now, estimate from tier counts
    // using monthly prices from tierConfig: Base $10, Pro $25, Elite $50.
    const mrrCents =
      tierBreakdown.base * 1000 + tierBreakdown.pro * 2500 + tierBreakdown.elite * 5000;

    const stats: AdminStats = {
      totalUsers,
      paidUsers,
      freeUsers,
      totalSaves,
      mrrCents,
      conversionPct,
      tierBreakdown,
      savesByType,
    };
    return NextResponse.json({ stats });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to compute stats" },
      { status: 500 }
    );
  }
}
