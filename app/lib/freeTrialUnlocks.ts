// app/lib/freeTrialUnlocks.ts
// Hybrid storage for the Free-tier 5-component Base-trial.
//
// Source of truth: localStorage (instant reads, no network on gate
// decisions). Best-effort sync: POST /api/free-unlocks/track on every
// new unlock, plus a one-time GET on mount that reconciles localStorage
// with the server-side count (so users who cleared their browser get
// their remaining trial count restored).
//
// Usage:
//   const trial = useFreeTrialUnlocks();
//   trial.unlockedIds          // Set<string>
//   trial.count                // number
//   trial.MAX                  // 5
//   trial.canStillUnlock       // boolean (count < MAX)
//   trial.tryUnlock(id)        // returns { ok, alreadyUnlocked, count }
//   trial.isComponentUnlocked  // (id) => boolean
//
// The hook is safe to call during SSR — it returns count=0 / empty set
// until the client effect runs and hydrates from localStorage + the API.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

const STORAGE_KEY = "mjolnir-free-trial-unlocks";
export const MAX_FREE_TRIAL_UNLOCKS = 5;

interface StoredState {
  /** Component IDs the user has unlocked via the trial. */
  ids: string[];
  /** ISO timestamp of the last write — useful for stale-cache cleanup. */
  updatedAt: string;
}

function readStorage(): StoredState {
  if (typeof window === "undefined") return { ids: [], updatedAt: "" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ids: [], updatedAt: "" };
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (!Array.isArray(parsed.ids)) return { ids: [], updatedAt: "" };
    return {
      ids: parsed.ids.filter((x) => typeof x === "string"),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return { ids: [], updatedAt: "" };
  }
}

function writeStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    const next: StoredState = {
      ids,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* localStorage quota / privacy mode — gating still works in-memory */
  }
}

export interface UnlockResult {
  ok: boolean;
  alreadyUnlocked: boolean;
  count: number;
}

export function useFreeTrialUnlocks() {
  const { data: session, status } = useSession();
  const [ids, setIds] = useState<string[]>([]);
  /** False until the localStorage read (sync) AND the server merge
   *  (async, best-effort) have both resolved. Consumers MUST gate
   *  auto-unlock logic on this flag — otherwise a Free user with
   *  5 unlocks already used would over-grant on first paint. */
  const [ready, setReady] = useState(false);
  const hydratedRef = useRef(false);

  // On mount + auth-resolved: read localStorage, then reconcile against
  // server. Server wins if it has MORE unlocks (cross-device persistence);
  // otherwise localStorage stands.
  useEffect(() => {
    if (status === "loading") return;
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const local = readStorage();
    setIds(local.ids);

    // Unauthenticated → no server reconcile needed.
    if (status !== "authenticated") {
      setReady(true);
      return;
    }

    // Fire-and-forget server reconcile.
    fetch("/api/free-unlocks/track", { method: "GET", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (!body || !Array.isArray(body.ids)) return;
        const serverIds: string[] = body.ids;
        // Merge — union of both sets, capped at MAX.
        const merged = Array.from(new Set([...local.ids, ...serverIds])).slice(
          0,
          MAX_FREE_TRIAL_UNLOCKS
        );
        if (
          merged.length !== local.ids.length ||
          merged.some((x, i) => x !== local.ids[i])
        ) {
          setIds(merged);
          writeStorage(merged);
        }
      })
      .catch(() => {
        /* offline / DB down — localStorage stays authoritative */
      })
      .finally(() => {
        setReady(true);
      });
  }, [status]);

  const unlockedIds = new Set(ids);
  const count = ids.length;
  const canStillUnlock = count < MAX_FREE_TRIAL_UNLOCKS;

  const tryUnlock = useCallback(
    (componentId: string): UnlockResult => {
      if (ids.includes(componentId)) {
        return { ok: true, alreadyUnlocked: true, count: ids.length };
      }
      if (ids.length >= MAX_FREE_TRIAL_UNLOCKS) {
        return { ok: false, alreadyUnlocked: false, count: ids.length };
      }
      // Optimistically write — localStorage is source of truth.
      const nextIds = [...ids, componentId];
      setIds(nextIds);
      writeStorage(nextIds);
      // Best-effort server sync (do not await — UX must not block).
      fetch("/api/free-unlocks/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ componentId }),
        keepalive: true,
      }).catch(() => {
        /* analytics-only sync — failures are acceptable */
      });
      return { ok: true, alreadyUnlocked: false, count: nextIds.length };
    },
    [ids]
  );

  const isComponentUnlocked = useCallback(
    (componentId: string) => unlockedIds.has(componentId),
    [unlockedIds]
  );

  return {
    ids,
    unlockedIds,
    count,
    MAX: MAX_FREE_TRIAL_UNLOCKS,
    canStillUnlock,
    tryUnlock,
    isComponentUnlocked,
    ready,
    /** True only for Free-tier users — Pro/Elite have no trial. */
    isEligible:
      status === "authenticated" &&
      ((session?.user as { tier?: string } | undefined)?.tier ?? "free") === "free",
  };
}
