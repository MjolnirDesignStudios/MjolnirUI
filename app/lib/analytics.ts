// app/lib/analytics.ts
// Type-safe analytics event helpers for the MjolnirUI client.
// All events post to /api/analytics/track which writes to public.analytics_events.

export type AnalyticsEventType =
  | "page_view"
  | "tool_open"
  | "component_click"
  | "save_asset"
  | "export_action"
  | "upgrade_click";

export interface PageViewPayload {
  page: string; // canonical pathname, e.g. "/blocks/foundation/colors"
  referrer?: string;
}
export interface ToolOpenPayload {
  tool: string; // canonical tool slug — see TOOL_SLUGS below
}
export interface ComponentClickPayload {
  component_id: string; // matches componentRegistry id
  category?: string;
  required_tier?: string;
}
export interface SaveAssetPayload {
  asset_type: "color_palette" | "type_system" | "token_set" | "icon";
}
export interface ExportActionPayload {
  format: string; // "css" | "tailwind" | "json" | "svg" | etc.
  source: string; // "tokens" | "colors" | "icon-builder" | etc.
}
export interface UpgradeClickPayload {
  from_tier: string;
  required_tier: string;
  feature: string;
}

export type AnalyticsEventPayload =
  | { event_type: "page_view"; payload: PageViewPayload }
  | { event_type: "tool_open"; payload: ToolOpenPayload }
  | { event_type: "component_click"; payload: ComponentClickPayload }
  | { event_type: "save_asset"; payload: SaveAssetPayload }
  | { event_type: "export_action"; payload: ExportActionPayload }
  | { event_type: "upgrade_click"; payload: UpgradeClickPayload };

/**
 * Canonical tool slugs that show up in the Popular Tools panel.
 * Keep this list in sync with the actual /blocks/* routes that count as
 * "tools" (i.e. the studio surfaces, not the docs / account pages).
 */
export const TOOL_SLUGS = {
  COLORS: "foundation-colors",
  TYPOGRAPHY: "foundation-typography",
  TOKENS: "foundation-tokens",
  ICONS: "foundation-icons",
  ANIMATION_TEXT: "animation-text",
  BACKGROUND_STUDIO: "background-studio",
  PARTICLE_ENGINE: "particle-engine",
  SHADER_TOOL: "shader-tool",
  BROWSE: "browse",
  DASHBOARD: "dashboard",
} as const;

/** Map a pathname → canonical tool slug if it represents a tool, else null. */
export function pathToToolSlug(pathname: string): string | null {
  const map: Array<[RegExp, string]> = [
    [/^\/blocks\/foundation\/colors/, TOOL_SLUGS.COLORS],
    [/^\/blocks\/foundation\/typography/, TOOL_SLUGS.TYPOGRAPHY],
    [/^\/blocks\/foundation\/tokens/, TOOL_SLUGS.TOKENS],
    [/^\/blocks\/foundation\/icons/, TOOL_SLUGS.ICONS],
    [/^\/blocks\/animation\/text/, TOOL_SLUGS.ANIMATION_TEXT],
    [/^\/blocks\/background-studio/, TOOL_SLUGS.BACKGROUND_STUDIO],
    [/^\/blocks\/particle-engine/, TOOL_SLUGS.PARTICLE_ENGINE],
    [/^\/blocks\/shader-tool/, TOOL_SLUGS.SHADER_TOOL],
    [/^\/blocks\/browse(?:\/|$)/, TOOL_SLUGS.BROWSE],
    [/^\/blocks\/dashboard$/, TOOL_SLUGS.DASHBOARD],
  ];
  for (const [pattern, slug] of map) if (pattern.test(pathname)) return slug;
  return null;
}

/** Friendly label for a tool slug (used in the admin Popular Tools panel). */
export const TOOL_LABELS: Record<string, string> = {
  [TOOL_SLUGS.COLORS]: "Colors",
  [TOOL_SLUGS.TYPOGRAPHY]: "Typography",
  [TOOL_SLUGS.TOKENS]: "Tokens",
  [TOOL_SLUGS.ICONS]: "Icons",
  [TOOL_SLUGS.ANIMATION_TEXT]: "Animated Text",
  [TOOL_SLUGS.BACKGROUND_STUDIO]: "Background Studio",
  [TOOL_SLUGS.PARTICLE_ENGINE]: "Particle Engine",
  [TOOL_SLUGS.SHADER_TOOL]: "Shader Tool",
  [TOOL_SLUGS.BROWSE]: "Component Browser",
  [TOOL_SLUGS.DASHBOARD]: "Dashboard",
};

/**
 * Fire-and-forget client-side track call.
 * Failures are silently swallowed — analytics must never break the user UX.
 */
export function track<T extends AnalyticsEventPayload>(event: T): void {
  if (typeof window === "undefined") return; // SSR no-op

  // Use sendBeacon when available — survives page navigation / unload.
  // Fall back to fetch with keepalive.
  try {
    const body = JSON.stringify(event);
    const url = "/api/analytics/track";
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        /* ignore */
      });
    }
  } catch {
    /* never throw from analytics */
  }
}

/* ── Convenience wrappers ─────────────────────────────── */
export const analytics = {
  pageView: (payload: PageViewPayload) =>
    track({ event_type: "page_view", payload }),
  toolOpen: (payload: ToolOpenPayload) =>
    track({ event_type: "tool_open", payload }),
  componentClick: (payload: ComponentClickPayload) =>
    track({ event_type: "component_click", payload }),
  saveAsset: (payload: SaveAssetPayload) =>
    track({ event_type: "save_asset", payload }),
  exportAction: (payload: ExportActionPayload) =>
    track({ event_type: "export_action", payload }),
  upgradeClick: (payload: UpgradeClickPayload) =>
    track({ event_type: "upgrade_click", payload }),
};
