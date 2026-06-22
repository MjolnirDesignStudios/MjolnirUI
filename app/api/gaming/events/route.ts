import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/gaming/auth";
import { readEvents, workspaceAvailable } from "@/lib/gaming/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/gaming/events?game=&agent=&limit= — tail of the live event stream.
export async function GET(request: NextRequest) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const game = searchParams.get("game") ?? undefined;
  const agent = searchParams.get("agent") ?? undefined;
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Math.min(Math.max(parseInt(limitRaw, 10) || 200, 1), 1000) : 200;

  const available = workspaceAvailable();
  return NextResponse.json({
    available,
    events: available ? readEvents({ game, agent, limit }) : [],
  });
}
