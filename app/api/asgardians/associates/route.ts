// GET  /api/asgardians/associates — list associates with their latest resume state.
// POST /api/asgardians/associates — manually create an associate profile.
import { NextRequest, NextResponse } from "next/server";
import { requireWrite } from "@/lib/asgardians/auth";
import { supabaseAdmin } from "@/lib/asgardians/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireWrite();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("asgardians_associates")
    .select(
      "id, full_name, email, phone, location, status, credentials, created_at, asgardians_resumes(id, ats_score, iterations, status, created_at)",
    )
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ associates: data });
}

export async function POST(request: NextRequest) {
  const guard = await requireWrite();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  let body: { fullName?: string; email?: string; phone?: string; location?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.fullName) {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("asgardians_associates")
    .insert({
      full_name: body.fullName,
      email: body.email ?? null,
      phone: body.phone ?? null,
      location: body.location ?? null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ associate: data });
}
