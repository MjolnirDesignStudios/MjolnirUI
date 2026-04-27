// app/lib/defaultTokens.ts
// Hardcoded baseline token sets — Asgard Dark (current brand) + Asgard Light.
// These power the read-only Free-tier Tokens page and serve as the starting
// point for Base+ composition.

export interface TokenSet {
  id: "asgard-dark" | "asgard-light";
  name: string;
  description: string;
  mode: "dark" | "light";
  colors: Record<string, string>;
  spacing: Record<string, string>;
  radii: Record<string, string>;
  shadows: Record<string, string>;
  typography: {
    display: string;
    body: string;
    mono: string;
    sizes: Record<string, string>;
    weights: Record<string, number>;
  };
  motion: Record<string, string>;
}

const SHARED_SPACING: Record<string, string> = {
  "0": "0",
  px: "1px",
  "0.5": "0.125rem",
  "1": "0.25rem",
  "2": "0.5rem",
  "3": "0.75rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "8": "2rem",
  "10": "2.5rem",
  "12": "3rem",
  "16": "4rem",
  "20": "5rem",
  "24": "6rem",
  "32": "8rem",
};

const SHARED_RADII: Record<string, string> = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  "3xl": "2rem",
  full: "9999px",
};

const SHARED_TYPO_SIZES: Record<string, string> = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
  "6xl": "3.75rem",
};

const SHARED_TYPO_WEIGHTS: Record<string, number> = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900,
};

const SHARED_MOTION: Record<string, string> = {
  fast: "150ms",
  base: "250ms",
  slow: "400ms",
  slower: "600ms",
  ease: "cubic-bezier(0.4, 0, 0.2, 1)",
  "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
  "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
  spring: "cubic-bezier(0.5, -0.5, 0.5, 1.5)",
};

export const ASGARD_DARK: TokenSet = {
  id: "asgard-dark",
  name: "Asgard Dark",
  description: "The default MjolnirUI brand — gold + cyan on storm-deep dark.",
  mode: "dark",
  colors: {
    /* Brand */
    "gold-bright": "#FFD700",
    gold: "#FFCC11",
    "gold-deep": "#B87333",
    electric: "#00F0FF",
    /* Surface */
    "storm-deep": "#020617",
    "storm-mid": "#0A0A0F",
    "storm-soft": "#0F172A",
    "surface-1": "#0F172A",
    "surface-2": "#1E293B",
    "surface-3": "#334155",
    /* Text */
    "text-primary": "#FFFFFF",
    "text-secondary": "#CBD5E1",
    "text-muted": "#64748B",
    "text-inverse": "#020617",
    /* Border */
    "border-subtle": "rgba(255,255,255,0.08)",
    "border-default": "rgba(255,255,255,0.12)",
    "border-strong": "rgba(255,255,255,0.20)",
    /* Semantic */
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    /* Tier */
    "tier-free": "#3B82F6",
    "tier-base": "#10B981",
    "tier-pro": "#EAB308",
    "tier-elite": "#F97316",
  },
  spacing: SHARED_SPACING,
  radii: SHARED_RADII,
  shadows: {
    sm: "0 1px 2px 0 rgba(0,0,0,0.5)",
    md: "0 4px 8px -2px rgba(0,0,0,0.6), 0 2px 4px -2px rgba(0,0,0,0.4)",
    lg: "0 12px 24px -6px rgba(0,0,0,0.7), 0 6px 12px -4px rgba(0,0,0,0.5)",
    xl: "0 24px 48px -12px rgba(0,0,0,0.8)",
    glow: "0 0 25px rgba(255,204,17,0.4), 0 0 50px rgba(255,204,17,0.15)",
    "glow-electric": "0 0 25px rgba(0,240,255,0.4), 0 0 50px rgba(0,240,255,0.15)",
  },
  typography: {
    display: "'Satoshi', system-ui, sans-serif",
    body: "'Ubuntu', system-ui, sans-serif",
    mono: "'Geist Mono', ui-monospace, monospace",
    sizes: SHARED_TYPO_SIZES,
    weights: SHARED_TYPO_WEIGHTS,
  },
  motion: SHARED_MOTION,
};

export const ASGARD_LIGHT: TokenSet = {
  id: "asgard-light",
  name: "Asgard Light",
  description: "Brand inverted — gold + cyan on parchment-warm light.",
  mode: "light",
  colors: {
    /* Brand */
    "gold-bright": "#D4A800",
    gold: "#B87333",
    "gold-deep": "#8B5A2B",
    electric: "#0099AA",
    /* Surface */
    "paper-warm": "#FAF8F2",
    "paper-cool": "#F2F4F8",
    "paper-default": "#FFFFFF",
    "surface-1": "#FFFFFF",
    "surface-2": "#F8FAFC",
    "surface-3": "#E2E8F0",
    /* Text */
    "text-primary": "#020617",
    "text-secondary": "#334155",
    "text-muted": "#64748B",
    "text-inverse": "#FFFFFF",
    /* Border */
    "border-subtle": "rgba(15,23,42,0.06)",
    "border-default": "rgba(15,23,42,0.12)",
    "border-strong": "rgba(15,23,42,0.20)",
    /* Semantic */
    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",
    info: "#2563EB",
    /* Tier */
    "tier-free": "#2563EB",
    "tier-base": "#059669",
    "tier-pro": "#CA8A04",
    "tier-elite": "#EA580C",
  },
  spacing: SHARED_SPACING,
  radii: SHARED_RADII,
  shadows: {
    sm: "0 1px 2px 0 rgba(15,23,42,0.06)",
    md: "0 4px 8px -2px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)",
    lg: "0 12px 24px -6px rgba(15,23,42,0.10), 0 6px 12px -4px rgba(15,23,42,0.06)",
    xl: "0 24px 48px -12px rgba(15,23,42,0.18)",
    glow: "0 0 25px rgba(184,115,51,0.3), 0 0 50px rgba(184,115,51,0.10)",
    "glow-electric": "0 0 25px rgba(0,153,170,0.3), 0 0 50px rgba(0,153,170,0.10)",
  },
  typography: {
    display: "'Satoshi', system-ui, sans-serif",
    body: "'Ubuntu', system-ui, sans-serif",
    mono: "'Geist Mono', ui-monospace, monospace",
    sizes: SHARED_TYPO_SIZES,
    weights: SHARED_TYPO_WEIGHTS,
  },
  motion: SHARED_MOTION,
};

export const DEFAULT_TOKEN_SETS: TokenSet[] = [ASGARD_DARK, ASGARD_LIGHT];

/* ═══════════════════════════════════════════════════════
   EXPORTERS
   ═══════════════════════════════════════════════════════ */

/** Generate CSS custom properties from a token set */
export function exportToCss(set: TokenSet): string {
  const lines: string[] = [];
  lines.push(`/* ${set.name} — ${set.description} */`);
  lines.push(`:root {`);

  Object.entries(set.colors).forEach(([k, v]) => {
    lines.push(`  --color-${k}: ${v};`);
  });
  lines.push("");
  Object.entries(set.spacing).forEach(([k, v]) => {
    lines.push(`  --spacing-${k}: ${v};`);
  });
  lines.push("");
  Object.entries(set.radii).forEach(([k, v]) => {
    lines.push(`  --radius-${k}: ${v};`);
  });
  lines.push("");
  Object.entries(set.shadows).forEach(([k, v]) => {
    lines.push(`  --shadow-${k}: ${v};`);
  });
  lines.push("");
  lines.push(`  --font-display: ${set.typography.display};`);
  lines.push(`  --font-body:    ${set.typography.body};`);
  lines.push(`  --font-mono:    ${set.typography.mono};`);
  Object.entries(set.typography.sizes).forEach(([k, v]) => {
    lines.push(`  --text-${k}: ${v};`);
  });
  Object.entries(set.typography.weights).forEach(([k, v]) => {
    lines.push(`  --weight-${k}: ${v};`);
  });
  lines.push("");
  Object.entries(set.motion).forEach(([k, v]) => {
    lines.push(`  --motion-${k}: ${v};`);
  });

  lines.push("}");
  return lines.join("\n");
}

/** Generate a partial Tailwind config object */
export function exportToTailwind(set: TokenSet): string {
  const cfg = {
    theme: {
      extend: {
        colors: set.colors,
        spacing: set.spacing,
        borderRadius: set.radii,
        boxShadow: set.shadows,
        fontFamily: {
          display: [set.typography.display],
          body: [set.typography.body],
          mono: [set.typography.mono],
        },
        fontSize: set.typography.sizes,
        fontWeight: set.typography.weights,
        transitionDuration: Object.fromEntries(
          Object.entries(set.motion).filter(([_, v]) => v.endsWith("ms"))
        ),
        transitionTimingFunction: Object.fromEntries(
          Object.entries(set.motion).filter(([_, v]) => v.startsWith("cubic-bezier"))
        ),
      },
    },
  };
  return JSON.stringify(cfg, null, 2);
}

/** Generate W3C Design Tokens (Community Group) JSON format */
export function exportToW3cJson(set: TokenSet): string {
  const wrap = (group: Record<string, string>, type: string) =>
    Object.fromEntries(
      Object.entries(group).map(([k, v]) => [k, { $value: v, $type: type }])
    );

  const json = {
    $schema: "https://schemas.tokens.studio/v1.0/tokens.json",
    [set.name.replace(/\s+/g, "-").toLowerCase()]: {
      $description: set.description,
      color: wrap(set.colors, "color"),
      spacing: wrap(set.spacing, "dimension"),
      radius: wrap(set.radii, "dimension"),
      shadow: wrap(set.shadows, "shadow"),
      fontFamily: {
        display: { $value: set.typography.display, $type: "fontFamily" },
        body: { $value: set.typography.body, $type: "fontFamily" },
        mono: { $value: set.typography.mono, $type: "fontFamily" },
      },
      fontSize: wrap(set.typography.sizes, "dimension"),
      fontWeight: Object.fromEntries(
        Object.entries(set.typography.weights).map(([k, v]) => [
          k,
          { $value: String(v), $type: "fontWeight" },
        ])
      ),
      duration: Object.fromEntries(
        Object.entries(set.motion)
          .filter(([_, v]) => v.endsWith("ms"))
          .map(([k, v]) => [k, { $value: v, $type: "duration" }])
      ),
    },
  };
  return JSON.stringify(json, null, 2);
}
