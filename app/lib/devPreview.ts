// app/lib/devPreview.ts
// Helpers for the admin-only Mobile Preview dev tool (and any other
// dev-context surface) — never expose real PII when a screen is being
// previewed for QA / screenshots / demos.
//
// Detection rules — a page is treated as "in preview" when:
//   1. It's rendered inside an iframe whose top !== self (the dev tool
//      iframe-embeds routes for mobile QA), OR
//   2. The URL contains `?demo=1` (explicit opt-in for screenshots).
//
// Real PII (emails, names, avatars) must be swapped with the Norse-themed
// dummy data below whenever `useInPreviewMode() === true`.
"use client";

import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════
   PREVIEW-MODE DETECTION
   ═══════════════════════════════════════════════════════ */

/** SSR-safe check — returns false on the server, true if iframed / ?demo=1. */
export function isInPreviewMode(): boolean {
  if (typeof window === "undefined") return false;
  // Query-param opt-in (works even outside an iframe, e.g. demo screenshots).
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") return true;
  } catch {
    /* ignore */
  }
  // Iframe detection — the Mobile Preview dev tool always loads pages
  // inside an iframe whose top window is the dev tool host.
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin iframe access throws → treat as preview.
    return true;
  }
}

/** React hook variant — hydrates on the client without mismatching SSR. */
export function useInPreviewMode(): boolean {
  const [inPreview, setInPreview] = useState(false);
  useEffect(() => {
    setInPreview(isInPreviewMode());
  }, []);
  return inPreview;
}

/* ═══════════════════════════════════════════════════════
   FICTIONAL VIEWER (used to mask the *current* user)
   When a user-facing surface is rendered in preview, every "your name /
   your email" surface MUST resolve to this persona instead of the real
   session.user. NEVER let the real user's identity hit the DOM.
   ═══════════════════════════════════════════════════════ */

export const DEMO_VIEWER = {
  name: "Thor Odinson",
  email: "thor.odinson@example.test",
  image: null as string | null,
  tier: "elite" as const,
  role: "user" as const,
};

export interface SafeSessionUser {
  name: string;
  email: string;
  image: string | null;
  tier: string;
  role: string;
}

/**
 * Returns either the real session user or the fictional DEMO_VIEWER
 * depending on preview mode. Use this on every page / component that
 * displays the *current* viewer's name, email, avatar initials, etc.
 *
 * Admin surfaces (/admin/*) should NOT use this — admins are expected
 * to see real data. This hook is for the user-side dashboard only.
 */
export function useSafeSessionUser(realUser: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  tier?: string | null;
  role?: string | null;
} | null | undefined): SafeSessionUser {
  const inPreview = useInPreviewMode();
  if (inPreview) {
    return {
      name: DEMO_VIEWER.name,
      email: DEMO_VIEWER.email,
      image: DEMO_VIEWER.image,
      tier: DEMO_VIEWER.tier,
      role: DEMO_VIEWER.role,
    };
  }
  return {
    name: realUser?.name ?? "",
    email: realUser?.email ?? "",
    image: realUser?.image ?? null,
    tier: realUser?.tier ?? "free",
    role: realUser?.role ?? "user",
  };
}

/* ═══════════════════════════════════════════════════════
   DUMMY USERS (Norse-themed, completely fictional)
   These IDs / emails / names exist only in this file. No real human
   should ever appear here.
   ═══════════════════════════════════════════════════════ */

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  tier: string;
  role: string;
  created_at: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "demo-user-001",
    email: "thor.odinson@example.test",
    name: "Thor Odinson",
    image: null,
    tier: "elite",
    role: "admin",
    created_at: "2025-11-04T14:22:00.000Z",
  },
  {
    id: "demo-user-002",
    email: "loki.laufeyson@example.test",
    name: "Loki Laufeyson",
    image: null,
    tier: "pro",
    role: "user",
    created_at: "2025-12-12T09:18:00.000Z",
  },
  {
    id: "demo-user-003",
    email: "sif.warrior@example.test",
    name: "Lady Sif",
    image: null,
    tier: "pro",
    role: "user",
    created_at: "2026-01-03T11:42:00.000Z",
  },
  {
    id: "demo-user-004",
    email: "heimdall.gatekeeper@example.test",
    name: "Heimdall",
    image: null,
    tier: "base",
    role: "user",
    created_at: "2026-01-21T08:05:00.000Z",
  },
  {
    id: "demo-user-005",
    email: "freya.vanir@example.test",
    name: "Freya",
    image: null,
    tier: "base",
    role: "user",
    created_at: "2026-02-09T16:31:00.000Z",
  },
  {
    id: "demo-user-006",
    email: "balder.bright@example.test",
    name: "Balder",
    image: null,
    tier: "free",
    role: "user",
    created_at: "2026-02-22T19:54:00.000Z",
  },
  {
    id: "demo-user-007",
    email: "tyr.justice@example.test",
    name: "Tyr",
    image: null,
    tier: "free",
    role: "user",
    created_at: "2026-03-07T12:11:00.000Z",
  },
  {
    id: "demo-user-008",
    email: "idunn.apples@example.test",
    name: "Idunn",
    image: null,
    tier: "free",
    role: "user",
    created_at: "2026-03-29T07:48:00.000Z",
  },
  {
    id: "demo-user-009",
    email: "bragi.skald@example.test",
    name: "Bragi",
    image: null,
    tier: "free",
    role: "user",
    created_at: "2026-04-14T15:09:00.000Z",
  },
  {
    id: "demo-user-010",
    email: "vidar.silent@example.test",
    name: "Vidar",
    image: null,
    tier: "free",
    role: "user",
    created_at: "2026-04-28T22:33:00.000Z",
  },
];

export interface DemoRecentSave {
  id: string;
  asset_type: "color_palette" | "type_system" | "token_set" | "icon";
  name: string;
  created_at: string;
  user_id: string;
  user_email: string;
  user_name: string;
}

export const DEMO_RECENT_SAVES: DemoRecentSave[] = [
  {
    id: "demo-save-001",
    asset_type: "color_palette",
    name: "Bifrost Aurora",
    created_at: "2026-05-18T18:22:00.000Z",
    user_id: "demo-user-002",
    user_email: "loki.laufeyson@example.test",
    user_name: "Loki Laufeyson",
  },
  {
    id: "demo-save-002",
    asset_type: "type_system",
    name: "Asgardian Display Stack",
    created_at: "2026-05-18T14:07:00.000Z",
    user_id: "demo-user-003",
    user_email: "sif.warrior@example.test",
    user_name: "Lady Sif",
  },
  {
    id: "demo-save-003",
    asset_type: "token_set",
    name: "Storm Tokens v2",
    created_at: "2026-05-17T21:44:00.000Z",
    user_id: "demo-user-001",
    user_email: "thor.odinson@example.test",
    user_name: "Thor Odinson",
  },
  {
    id: "demo-save-004",
    asset_type: "icon",
    name: "Mjolnir Glyph",
    created_at: "2026-05-17T11:12:00.000Z",
    user_id: "demo-user-005",
    user_email: "freya.vanir@example.test",
    user_name: "Freya",
  },
  {
    id: "demo-save-005",
    asset_type: "color_palette",
    name: "Valhalla Embers",
    created_at: "2026-05-16T19:58:00.000Z",
    user_id: "demo-user-004",
    user_email: "heimdall.gatekeeper@example.test",
    user_name: "Heimdall",
  },
  {
    id: "demo-save-006",
    asset_type: "icon",
    name: "Yggdrasil Sigil",
    created_at: "2026-05-16T09:30:00.000Z",
    user_id: "demo-user-002",
    user_email: "loki.laufeyson@example.test",
    user_name: "Loki Laufeyson",
  },
  {
    id: "demo-save-007",
    asset_type: "token_set",
    name: "Bronze Foundation",
    created_at: "2026-05-15T22:01:00.000Z",
    user_id: "demo-user-003",
    user_email: "sif.warrior@example.test",
    user_name: "Lady Sif",
  },
  {
    id: "demo-save-008",
    asset_type: "type_system",
    name: "Runic Mono",
    created_at: "2026-05-15T13:47:00.000Z",
    user_id: "demo-user-006",
    user_email: "balder.bright@example.test",
    user_name: "Balder",
  },
];

/** Dummy stats — internally consistent with DEMO_USERS counts. */
export const DEMO_STATS = {
  totalUsers: 247,
  paidUsers: 58,
  freeUsers: 189,
  totalSaves: 1432,
  mrrCents: 184_350,
  conversionPct: 23.5,
  tierBreakdown: { free: 189, base: 31, pro: 19, elite: 8 },
  savesByType: {
    color_palette: 612,
    type_system: 318,
    token_set: 287,
    icon: 215,
  },
};

export const DEMO_MRR = {
  mrr_cents: 184_350,
  arr_cents: 2_212_200,
  active_subscriptions: 58,
  currency: "usd",
  source: "estimate" as const,
  note: "Demo data — not real billing",
};
