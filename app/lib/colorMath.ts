// app/lib/colorMath.ts
// Pure color-math helpers for the Foundations Color page.
// HSL/RGB/HEX conversions, WCAG contrast, ramp generation.
// No external dependencies. SSR-safe.

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}
export interface RGB {
  r: number; // 0-255
  g: number;
  b: number;
}
export type RampMode = "dark" | "light";
export type RampStep = "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
export type Ramp = Record<RampStep, string>;
export type WcagRating = "fail" | "aa-large" | "aa" | "aaa";

/* ═══════════════════════════════════════════════════════
   HEX <-> RGB
   ═══════════════════════════════════════════════════════ */
export function hexToRgb(hex: string): RGB {
  const clean = hex.trim().replace(/^#/, "");
  const expanded =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const num = parseInt(expanded, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const hex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

/* ═══════════════════════════════════════════════════════
   RGB <-> HSL
   ═══════════════════════════════════════════════════════ */
export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case rN:
        h = ((gN - bN) / delta + (gN < bN ? 6 : 0)) * 60;
        break;
      case gN:
        h = ((bN - rN) / delta + 2) * 60;
        break;
      case bN:
        h = ((rN - gN) / delta + 4) * 60;
        break;
    }
  }
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hN = ((h % 360) + 360) % 360 / 360;
  const sN = Math.max(0, Math.min(100, s)) / 100;
  const lN = Math.max(0, Math.min(100, l)) / 100;

  if (sN === 0) {
    const v = Math.round(lN * 255);
    return { r: v, g: v, b: v };
  }

  const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
  const p = 2 * lN - q;
  const hueToRgb = (t: number) => {
    let tN = t;
    if (tN < 0) tN += 1;
    if (tN > 1) tN -= 1;
    if (tN < 1 / 6) return p + (q - p) * 6 * tN;
    if (tN < 1 / 2) return q;
    if (tN < 2 / 3) return p + (q - p) * (2 / 3 - tN) * 6;
    return p;
  };
  return {
    r: Math.round(hueToRgb(hN + 1 / 3) * 255),
    g: Math.round(hueToRgb(hN) * 255),
    b: Math.round(hueToRgb(hN - 1 / 3) * 255),
  };
}

/* ═══════════════════════════════════════════════════════
   HEX <-> HSL (convenience)
   ═══════════════════════════════════════════════════════ */
export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

/* ═══════════════════════════════════════════════════════
   WCAG CONTRAST RATIO
   Per WCAG 2.1: ratio in [1, 21]
   - AA (normal text): >= 4.5
   - AA (large text):  >= 3
   - AAA (normal):     >= 7
   - AAA (large):      >= 4.5
   ═══════════════════════════════════════════════════════ */

/** Relative luminance per WCAG */
function luminance({ r, g, b }: RGB): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function getContrastRatio(hexA: string, hexB: string): number {
  const lA = luminance(hexToRgb(hexA));
  const lB = luminance(hexToRgb(hexB));
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getContrastRating(ratio: number): WcagRating {
  if (ratio >= 7) return "aaa";
  if (ratio >= 4.5) return "aa";
  if (ratio >= 3) return "aa-large";
  return "fail";
}

/** True if the color is "light" (luminance > 0.5) — useful for choosing text color */
export function isLight(hex: string): boolean {
  return luminance(hexToRgb(hex)) > 0.5;
}

/** Returns black or white hex for readable text on the given bg */
export function getReadableTextColor(bgHex: string): "#000000" | "#FFFFFF" {
  return isLight(bgHex) ? "#000000" : "#FFFFFF";
}

/* ═══════════════════════════════════════════════════════
   RAMP GENERATION
   Tailwind-style 50/100/.../900 ramp from a single seed color.
   Strategy: use the seed as the "500" anchor, then walk lightness.
   In dark mode, lower numbers = lighter; in light mode (CSS standard),
   lower numbers = lighter (50 is near-white, 900 is near-black).
   ═══════════════════════════════════════════════════════ */

/** Standard Tailwind-like lightness anchors per ramp step (light mode) */
const LIGHT_ANCHORS: Record<RampStep, number> = {
  "50": 97,
  "100": 94,
  "200": 86,
  "300": 76,
  "400": 64,
  "500": 50,
  "600": 42,
  "700": 34,
  "800": 25,
  "900": 14,
};

/** In dark mode: invert the anchor mapping so the "background" steps
 *  (50, 100, 200) are darker and the "foreground" steps (700-900) are
 *  lighter. Useful for dark-themed UIs that want an inverted ramp. */
const DARK_ANCHORS: Record<RampStep, number> = {
  "50": 8,
  "100": 12,
  "200": 18,
  "300": 26,
  "400": 38,
  "500": 50,
  "600": 60,
  "700": 72,
  "800": 84,
  "900": 94,
};

const RAMP_STEPS: RampStep[] = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

/** Generate a 10-step ramp from a single seed color.
 *  Seed acts as the 500 step's hue+saturation anchor.
 *  Saturation tapers slightly at the extremes for a more natural look. */
export function generateRamp(seedHex: string, mode: RampMode = "light"): Ramp {
  const seedHsl = hexToHsl(seedHex);
  const anchors = mode === "dark" ? DARK_ANCHORS : LIGHT_ANCHORS;
  const result = {} as Ramp;

  for (const step of RAMP_STEPS) {
    const lightness = anchors[step];

    // Saturation taper: full saturation at 500, gentle reduction at extremes
    // This avoids over-saturated whites and muddy blacks.
    const distFrom500 = Math.abs(parseInt(step) - 500) / 500; // 0..1
    const satFactor = 1 - distFrom500 * 0.25;
    const saturation = Math.round(seedHsl.s * satFactor);

    result[step] = hslToHex({
      h: seedHsl.h,
      s: saturation,
      l: lightness,
    });
  }
  return result;
}

/* ═══════════════════════════════════════════════════════
   DEFAULT PALETTES — Asgard-rooted (no Bifrost/Storm/Valhalla
   theme variants per foundations-plan.md decision)
   ═══════════════════════════════════════════════════════ */

export interface DefaultPalette {
  id: "asgard-dark" | "asgard-light" | "bifrost-accent" | "storm-neutrals";
  name: string;
  description: string;
  mode: RampMode;
  /** The seed color the ramp derives from */
  seed: string;
  /** Pre-computed ramp */
  ramp: Ramp;
  /** Optional named accents that aren't part of the ramp */
  accents?: Record<string, string>;
}

export const DEFAULT_PALETTES: DefaultPalette[] = [
  {
    id: "asgard-dark",
    name: "Asgard Dark",
    description: "The default brand — Asgardian gold and electric cyan on storm-deep dark.",
    mode: "dark",
    seed: "#FFCC11",
    ramp: generateRamp("#FFCC11", "dark"),
    accents: {
      gold: "#FFCC11",
      "gold-bright": "#FFD700",
      bronze: "#B87333",
      electric: "#00F0FF",
      "storm-deep": "#020617",
      "storm-mid": "#0A0A0F",
      "storm-soft": "#0F172A",
    },
  },
  {
    id: "asgard-light",
    name: "Asgard Light",
    description: "The brand inverted — gold and cyan on a parchment-light backdrop.",
    mode: "light",
    seed: "#FFCC11",
    ramp: generateRamp("#FFCC11", "light"),
    accents: {
      gold: "#FFCC11",
      "gold-deep": "#B87333",
      electric: "#0099AA",
      "paper-warm": "#FAF8F2",
      "paper-cool": "#F2F4F8",
      ink: "#0F172A",
    },
  },
  {
    id: "bifrost-accent",
    name: "Bifrost Accent",
    description: "Decorative rainbow accents — for Bifrost-style cards, gradients, and highlights. Not a full theme.",
    mode: "dark",
    seed: "#7C3AED", // violet anchor
    ramp: generateRamp("#7C3AED", "dark"),
    accents: {
      red: "#FF3B5C",
      orange: "#FF8A3D",
      yellow: "#FFCC11",
      green: "#10B981",
      cyan: "#00F0FF",
      blue: "#3B82F6",
      indigo: "#6366F1",
      violet: "#7C3AED",
    },
  },
  {
    id: "storm-neutrals",
    name: "Storm Neutrals",
    description: "Cool grayscale ramp from storm-deep black to silver, for hierarchy and chrome.",
    mode: "dark",
    seed: "#475569", // slate anchor
    ramp: generateRamp("#475569", "dark"),
    accents: {
      "storm-deep": "#020617",
      "storm-mid": "#0A0A0F",
      "storm-soft": "#0F172A",
      "ash": "#1E293B",
      "stone": "#334155",
      "fog": "#64748B",
      "mist": "#94A3B8",
      "silver": "#CBD5E1",
    },
  },
];
