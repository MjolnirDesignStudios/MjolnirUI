// app/api/admin/users/[id]/route.ts
// GET   /api/admin/users/:id  — full user detail + recent saved assets
// PATCH /api/admin/users/:id  — update tier or role (admin actions)
//
// Updates write to BOTH next_auth.users AND public.users so the JWT callback
// + RLS policies stay consistent.
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { supabaseAuthAdmin } from "@/lib/supabaseAdmin";
import type { TierName } from "@/lib/tierConfig";

const VALID_TIERS: TierName[] = ["free", "base", "pro", "elite"];
const VALID_ROLES = ["user", "admin"] as const;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  try {
    // User row
    const { data: user, error: userErr } = await supabaseAuthAdmin
      .from("users")
      .select("id, email, name, image, tier, role")
      .eq("id", id)
      .maybeSingle();
    if (userErr) throw userErr;
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Recent saves across all asset types (top 10 most recent)
    const { data: assets, error: assetsErr } = await supabaseAuthAdmin
      .schema("public")
      .from("user_design_assets")
      .select("id, asset_type, name, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (assetsErr) throw assetsErr;

    // Per-type counts
    const { data: allAssets, error: countErr } = await supabaseAuthAdmin
      .schema("public")
      .from("user_design_assets")
      .select("asset_type")
      .eq("user_id", id);
    if (countErr) throw countErr;

    const counts: Record<string, number> = {};
    for (const a of allAssets || []) {
      counts[(a as any).asset_type] = (counts[(a as any).asset_type] || 0) + 1;
    }

    return NextResponse.json({ user, recentAssets: assets || [], counts });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  let body: { tier?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate inputs
  const patch: { tier?: string; role?: string } = {};
  if (typeof body.tier === "string") {
    if (!VALID_TIERS.includes(body.tier as TierName)) {
      return NextResponse.json(
        { error: `tier must be one of: ${VALID_TIERS.join(", ")}` },
        { status: 400 }
      );
    }
    patch.tier = body.tier;
  }
  if (typeof body.role === "string") {
    if (!VALID_ROLES.includes(body.role as (typeof VALID_ROLES)[number])) {
      return NextResponse.json(
        { error: `role must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }
    patch.role = body.role;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update (tier, role)" },
      { status: 400 }
    );
  }

  // Self-demotion guard: don't let an admin remove their own admin role.
  // Otherwise they'd lock themselves out.
  if (
    patch.role &&
    patch.role !== "admin" &&
    guard.session.user.id === id
  ) {
    return NextResponse.json(
      { error: "You can't remove your own admin role." },
      { status: 400 }
    );
  }

  try {
    // Mirror update across both schemas so JWT callback (next_auth) and
    // anything else querying public.users sees the same state.
    const { error: nextAuthErr } = await supabaseAuthAdmin
      .from("users")
      .update(patch)
      .eq("id", id);
    if (nextAuthErr) throw nextAuthErr;

    const { error: publicErr } = await supabaseAuthAdmin
      .schema("public")
      .from("users")
      .update(patch)
      .eq("id", id);
    if (publicErr) throw publicErr;

    // Return the fresh row
    const { data: user, error: readErr } = await supabaseAuthAdmin
      .from("users")
      .select("id, email, name, image, tier, role")
      .eq("id", id)
      .maybeSingle();
    if (readErr) throw readErr;

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
