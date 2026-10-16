// POST /api/asgardians/onboard — advance an associate through the pipeline.
import { NextRequest, NextResponse } from "next/server";
import { requireWrite } from "@/lib/asgardians/auth";
import { supabaseAdmin } from "@/lib/asgardians/db";
import type { AssociateStatus } from "@/lib/asgardians/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: AssociateStatus[] = ["applicant", "screening", "enhanced", "onboarded", "asgardian"];

export async function POST(request: NextRequest) {
  const guard = await requireWrite();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  let body: { associateId?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.associateId || !STATUSES.includes(body.status as AssociateStatus)) {
    return NextResponse.json(
      { error: `associateId and status (${STATUSES.join("|")}) are required` },
      { status: 400 },
    );
  }
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("asgardians_associates")
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq("id", body.associateId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ associate: data });
}
