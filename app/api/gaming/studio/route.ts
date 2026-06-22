import { NextResponse } from "next/server";
import { requireSession } from "@/lib/gaming/auth";
import { buildGameViews, workspaceAvailable, WORKSPACE_PATH } from "@/lib/gaming/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/gaming/studio — registry of all titles + phase/gate/last-event state.
export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const available = workspaceAvailable();
  return NextResponse.json({
    available,
    workspace: WORKSPACE_PATH,
    games: available ? buildGameViews() : [],
  });
}
