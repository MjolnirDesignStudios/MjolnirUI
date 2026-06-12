// app/lib/chartTheme.ts
// Shared Mjolnir theme tokens for every chart in the library.
//
// Every chart component (Bar / Line / Area / Donut / Sparkline / RadialBar)
// imports from here so brand evolution stays a one-file change. Variants
// pick a palette; size + density variations are component-level concerns.
//
// Palettes are ordered so calling code can do
//   const c = MJOLNIR_PALETTE[index % MJOLNIR_PALETTE.length]
// for a stable color per data series.

import type { CSSProperties } from "react";

/* ── Storm dark palette (the default brand look) ────────── */
export const MJOLNIR_PALETTE = [
  "#FFCC11", // Mjolnir gold (primary)
  "#00f0ff", // Electric cyan
  "#a78bfa", // Bifrost violet
  "#10B981", // Asgard emerald
  "#f97316", // Forge orange
  "#FFD700", // Bright gold (secondary)
  "#ef4444", // Ember red (use for alerts only)
  "#3B82F6", // Base blue
] as const;

/* ── Single-accent variants ─────────────────────────────── */
export type ChartVariant = "storm" | "thunder" | "bifrost" | "void" | "forge";

export const VARIANT_PALETTE: Record<ChartVariant, readonly string[]> = {
  storm: ["#00f0ff", "#67e8f9", "#a5f3fc", "#cffafe"],
  thunder: ["#FFCC11", "#FFD700", "#FFE066", "#FFF099"],
  bifrost: ["#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"],
  void: ["#a1a1aa", "#d4d4d8", "#e4e4e7", "#f4f4f5"],
  forge: ["#f97316", "#fb923c", "#fdba74", "#fed7aa"],
};

/* ── Chart canvas styling tokens ────────────────────────── */
export const CHART_TOKENS = {
  bg: "#0a0a0f",
  surface: "rgba(24, 24, 27, 0.6)",
  grid: "rgba(255, 255, 255, 0.06)",
  axis: "#52525b",
  axisText: "#a1a1aa",
  axisFontSize: 11,
  axisFontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  tooltipBg: "#020617",
  tooltipBorder: "rgba(255, 255, 255, 0.1)",
  tooltipText: "#e4e4e7",
  legendText: "#a1a1aa",
} as const;

/* ── Recharts-shaped tooltip style (used by all components) ── */
export const tooltipStyle: CSSProperties = {
  backgroundColor: CHART_TOKENS.tooltipBg,
  border: `1px solid ${CHART_TOKENS.tooltipBorder}`,
  borderRadius: "12px",
  padding: "8px 12px",
  fontSize: "12px",
  color: CHART_TOKENS.tooltipText,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45)",
};

export const tooltipLabelStyle: CSSProperties = {
  color: "#e4e4e7",
  fontWeight: 700,
  marginBottom: 2,
};

export const tooltipItemStyle: CSSProperties = {
  color: "#a1a1aa",
  fontSize: "11px",
  fontFamily: CHART_TOKENS.axisFontFamily,
};

/* ── Common axis props (avoid repeating in every component) ── */
export const axisProps = {
  stroke: CHART_TOKENS.axis,
  fontSize: CHART_TOKENS.axisFontSize,
  fontFamily: CHART_TOKENS.axisFontFamily,
  tick: { fill: CHART_TOKENS.axisText },
} as const;

export const gridProps = {
  stroke: CHART_TOKENS.grid,
  strokeDasharray: "3 3",
  vertical: false,
} as const;

/** Resolve a color array for a given variant + index. Falls back to
 *  the rotating MJOLNIR_PALETTE when no variant is specified. */
export function pickColors(
  variant: ChartVariant | undefined,
  count: number
): string[] {
  if (variant) {
    const v = VARIANT_PALETTE[variant];
    return Array.from({ length: count }, (_, i) => v[i % v.length]);
  }
  return Array.from(
    { length: count },
    (_, i) => MJOLNIR_PALETTE[i % MJOLNIR_PALETTE.length]
  );
}
