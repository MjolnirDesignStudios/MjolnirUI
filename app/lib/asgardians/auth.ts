// Auth guard for the Asgardians admin API routes — same policy as the gaming
// cockpit: any signed-in user in dev, admin role required in production.
import type { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { nextAuthOptions } from "@/lib/nextAuthOptions";
import { isAdmin } from "@/lib/adminUtils";

export type WriteGuard = { session: Session } | { error: string; status: number };

export async function requireWrite(): Promise<WriteGuard> {
  const session = await getServerSession(nextAuthOptions);
  if (!session) return { error: "unauthorized", status: 401 };
  if (process.env.NODE_ENV === "production" && !isAdmin(session.user)) {
    return { error: "forbidden", status: 403 };
  }
  return { session };
}
