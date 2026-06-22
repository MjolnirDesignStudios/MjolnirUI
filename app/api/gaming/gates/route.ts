import { NextRequest, NextResponse } from "next/server";
import { requireSession, requireWrite } from "@/lib/gaming/auth";
import { readGate, writeGate, workspaceAvailable } from "@/lib/gaming/workspace";
import { PHASES } from "@/lib/gaming/agents";
import type { Gate } from "@/lib/gaming/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/gaming/gates — every phase with its approval state.
export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const available = workspaceAvailable();
  const gates = PHASES.map((p) => ({
    phase: p.n,
    slug: p.slug,
    name: p.name,
    swarm: p.swarm,
    gate: available ? readGate(p.n) : null,
  }));
  return NextResponse.json({ available, gates });
}

// POST /api/gaming/gates — approve a phase gate (writes gates/phaseN-<slug>-approval.json).
export async function POST(request: NextRequest) {
  const guard = await requireWrite();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const session = guard.session;
  if (!workspaceAvailable()) {
    return NextResponse.json({ error: "workspace unavailable" }, { status: 503 });
  }

  let body: Partial<Gate> & { phase?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const phase = Number(body.phase);
  const meta = PHASES.find((p) => p.n === phase);
  if (!meta) {
    return NextResponse.json({ error: "invalid phase" }, { status: 400 });
  }

  const who = session.user?.name || session.user?.email || "Admin";
  const gate: Gate = {
    phase: meta.slug,
    game_id: body.game_id,
    approved_by: body.approved_by || who,
    reviewed_by: body.reviewed_by ?? ["Chris", "ANNA", "OdinAI"],
    date: new Date().toISOString().slice(0, 10),
    notes: body.notes ?? "",
    conditions: body.conditions ?? [],
  };

  const ok = writeGate(phase, gate);
  return NextResponse.json({ ok, phase, gate }, { status: ok ? 200 : 500 });
}
