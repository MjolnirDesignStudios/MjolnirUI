// app/api/analytics/track/route.ts
// POST /api/analytics/track — capture client-side events.
// Auth optional: signed-in users get user_id + tier/role snapshotted; anonymous
// page_views are allowed (the RLS policy permits user_id IS NULL inserts).
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/nextAuthOptions";
import { supabaseAuthAdmin } from "@/lib/supabaseAdmin";

const VALID_EVENT_TYPES = [
  "page_view",
  "tool_open",
  "component_click",
  "save_asset",
  "export_action",
  "upgrade_click",
] as const;

type ValidEventType = (typeof VALID_EVENT_TYPES)[number];

function isValidEventType(v: unknown): v is ValidEventType {
  return typeof v === "string" && (VALID_EVENT_TYPES as readonly string[]).includes(v);
}

export async function POST(req: Request) {
  let body: { event_type?: unknown; payload?: unknown };
  try {
    // sendBeacon delivers as text/plain or application/json — handle both
    const text = await req.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventType = body.event_type;
  if (!isValidEventType(eventType)) {
    return NextResponse.json(
      { error: `event_type must be one of: ${VALID_EVENT_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const payload =
    body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
      ? (body.payload as Record<string, unknown>)
      : {};

  // Optional session — allow anonymous events
  const session = await getServerSession(nextAuthOptions).catch(() => null);
  const userId = session?.user?.id ?? null;
  const userTier = (session?.user as { tier?: string } | undefined)?.tier ?? null;
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? null;

  // Insert via service role — bypasses RLS, but we already validated event_type
  // and userId comes from the trusted server session, not the client body.
  try {
    const { error } = await supabaseAuthAdmin
      .schema("public")
      .from("analytics_events")
      .insert({
        user_id: userId,
        event_type: eventType,
        payload,
        user_tier: userTier,
        user_role: userRole,
      });
    if (error) {
      // Don't expose detailed errors to clients — silently 204 so analytics
      // failures never break the UX. Log server-side only.
      console.error("[analytics] insert failed:", error.message);
    }
  } catch (err) {
    console.error("[analytics] unexpected error:", err);
  }

  // Always 204. The client doesn't care about the result.
  return new NextResponse(null, { status: 204 });
}
