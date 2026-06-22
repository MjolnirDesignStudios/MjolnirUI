import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/gaming/auth";
import { readAnnaReports } from "@/lib/gaming/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/gaming/anna?game= — ANNA's design-critique reports (.anna/reports/*.md).
export async function GET(request: NextRequest) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const game = searchParams.get("game") ?? undefined;
  return NextResponse.json({ reports: readAnnaReports(game) });
}
