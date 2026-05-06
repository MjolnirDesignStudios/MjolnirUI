// app/lib/adminGuard.ts
// Reusable admin-route guard. All /api/admin/* routes call requireAdmin()
// at the top of their handler. Returns the session if admin, otherwise
// returns a NextResponse error you should `return` immediately.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/nextAuthOptions";
import type { Session } from "next-auth";

export type AdminGuardResult =
  | { ok: true; session: Session }
  | { ok: false; response: NextResponse };

export async function requireAdmin(): Promise<AdminGuardResult> {
  const session = await getServerSession(nextAuthOptions);
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }
  if (session.user.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 }),
    };
  }
  return { ok: true, session };
}
