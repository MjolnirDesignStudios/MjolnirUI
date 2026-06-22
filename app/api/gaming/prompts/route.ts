import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireSession, requireWrite } from "@/lib/gaming/auth";
import {
  readPromptQueue, appendPrompt, clearPromptQueue, workspaceAvailable,
} from "@/lib/gaming/workspace";
import type { QueuedPrompt } from "@/lib/gaming/types";
import { AGENT_IDS } from "@/lib/gaming/agents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/gaming/prompts — the current human-directive queue.
export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const available = workspaceAvailable();
  return NextResponse.json({ available, queue: available ? readPromptQueue() : [] });
}

// POST /api/gaming/prompts — queue a new directive for the swarm.
export async function POST(request: NextRequest) {
  const guard = await requireWrite();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  if (!workspaceAvailable()) {
    return NextResponse.json({ error: "workspace unavailable" }, { status: 503 });
  }

  let body: { route?: string; game?: string; prompt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const prompt = (body.prompt || "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  const route = AGENT_IDS.includes(body.route || "") ? body.route! : "planr";

  const entry: QueuedPrompt = {
    id: `PROMPT-${randomUUID().slice(0, 8)}`,
    ts: new Date().toISOString(),
    route,
    game: body.game,
    prompt,
    status: "queued",
    requested_by: guard.session.user?.name || guard.session.user?.email || "Admin",
  };

  const queue = appendPrompt(entry);
  return NextResponse.json({ ok: true, entry, queue });
}

// DELETE /api/gaming/prompts — clear the queue.
export async function DELETE() {
  const guard = await requireWrite();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const ok = clearPromptQueue();
  return NextResponse.json({ ok, queue: [] }, { status: ok ? 200 : 500 });
}
