// app/api/admin/users/route.ts
// GET /api/admin/users — list users for the admin dashboard.
// Optional query params:
//   ?search=<text>        — match name OR email (case-insensitive)
//   ?tier=<tier>          — filter by tier
//   ?role=<role>          — filter by role
//   ?limit=<n>            — page size (default 50, max 200)
//   ?offset=<n>           — for pagination
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { supabaseAuthAdmin } from "@/lib/supabaseAdmin";

export interface AdminUserRow {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  tier: string | null;
  role: string | null;
  created_at: string | null;
}

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const tier = url.searchParams.get("tier")?.trim() || "";
    const role = url.searchParams.get("role")?.trim() || "";
    const limit = Math.min(
      Math.max(parseInt(url.searchParams.get("limit") || "50", 10), 1),
      200
    );
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);

    let query = supabaseAuthAdmin
      .from("users")
      .select("id, email, name, image, tier, role, \"emailVerified\"", { count: "exact" })
      .order("\"emailVerified\"", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (tier) query = query.eq("tier", tier);
    if (role) query = query.eq("role", role);
    if (search) {
      // Match in email OR name
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    const { data, error, count } = await query.returns<
      Array<AdminUserRow & { emailVerified?: string | null }>
    >();
    if (error) throw error;

    // Normalize emailVerified -> created_at-style for the UI
    const users: AdminUserRow[] = (data || []).map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      image: row.image,
      tier: row.tier,
      role: row.role,
      created_at: row.emailVerified ?? null,
    }));

    return NextResponse.json({ users, total: count ?? users.length, limit, offset });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to list users" },
      { status: 500 }
    );
  }
}
