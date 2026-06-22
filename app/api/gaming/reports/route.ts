import { NextResponse } from "next/server";
import { requireSession } from "@/lib/gaming/auth";
import { readGameReports, workspaceAvailable } from "@/lib/gaming/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/gaming/reports — latest handoff artifacts for the active run:
// sprint_plan, build_manifest, qa_report, test_report, patch_tasks.
export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const available = workspaceAvailable();
  return NextResponse.json({
    available,
    reports: available
      ? readGameReports()
      : { sprint_plan: null, build_manifest: null, qa_report: null, test_report: null, patch_tasks: null },
  });
}
