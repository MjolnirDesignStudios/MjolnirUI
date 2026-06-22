// Shared auth guard for the gaming admin API routes.
// The route group is behind login; these endpoints additionally verify a
// valid session server-side so game IP is never exposed to anonymous callers.
//
// NOTE (production hardening): for the public deployment, tighten write
// endpoints (gates/control) to require isAdmin(session.user). Kept at
// session-level here so the local-dev cockpit owner is never locked out.

import type { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { nextAuthOptions } from "@/lib/nextAuthOptions";
import { isAdmin } from "@/lib/adminUtils";

export async function getSession() {
  return getServerSession(nextAuthOptions);
}

export async function requireSession() {
  const session = await getSession();
  return session ?? null;
}

// Guard for state-changing endpoints (gates approval, swarm control, prompt
// queue). In production these require an admin role; in local dev any signed-in
// user passes, so the local-cockpit owner is never locked out of their own tool.
export type WriteGuard = { session: Session } | { error: string; status: number };

export async function requireWrite(): Promise<WriteGuard> {
  const session = await getSession();
  if (!session) return { error: "unauthorized", status: 401 };
  if (process.env.NODE_ENV === "production" && !isAdmin(session.user)) {
    return { error: "forbidden", status: 403 };
  }
  return { session };
}
