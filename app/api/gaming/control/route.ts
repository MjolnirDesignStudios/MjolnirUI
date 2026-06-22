import { NextRequest, NextResponse } from "next/server";
import { requireWrite } from "@/lib/gaming/auth";
import {
  writeWorkspaceJson, deleteWorkspaceFile, workspaceAvailable,
} from "@/lib/gaming/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Action = "halt" | "resume" | "start" | "reset";

// POST /api/gaming/control — drive the swarm via workspace control files.
//   halt   -> write director_override.json (OdinAI emergency stop)
//   resume -> delete director_override.json
//   start  -> write run_request.json (orchestrator picks up the game)
//   reset  -> delete patch_tasks.json (Buildr starts the iteration fresh)
export async function POST(request: NextRequest) {
  const guard = await requireWrite();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const session = guard.session;
  if (!workspaceAvailable()) {
    return NextResponse.json({ error: "workspace unavailable" }, { status: 503 });
  }

  let body: { action?: Action; game?: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const who = session.user?.name || session.user?.email || "Admin";
  const action = body.action;
  let ok = false;

  switch (action) {
    case "halt":
      ok = writeWorkspaceJson("director_override.json", {
        issued_by: who,
        reason: body.reason || "Halted from admin cockpit",
        action: "halt",
        ts: new Date().toISOString(),
      });
      break;
    case "resume":
      ok = deleteWorkspaceFile("director_override.json");
      break;
    case "start":
      ok = writeWorkspaceJson("run_request.json", {
        game: body.game,
        requested_by: who,
        ts: new Date().toISOString(),
      });
      break;
    case "reset":
      ok = deleteWorkspaceFile("patch_tasks.json");
      break;
    default:
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }

  return NextResponse.json({ ok, action }, { status: ok ? 200 : 500 });
}
