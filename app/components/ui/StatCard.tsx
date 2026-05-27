// app/components/ui/StatCard.tsx
// KPI / stat display card — Mjolnir-branded.
// Surfaces a label, value, optional delta indicator, and icon.
// Used in dashboards, analytics surfaces, marketing pages.
//
// Variants control the accent / glow color. The card itself is a glass
// surface; the accent shows in the top hairline + icon + delta arrow.
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export type StatCardVariant = "storm" | "thunder" | "bifrost" | "void" | "forge";

const VARIANT_CONFIG: Record<
  StatCardVariant,
  { accent: string; glow: string; chip: string; chipText: string }
> = {
  storm: {
    accent: "#00f0ff",
    glow: "rgba(0,240,255,0.18)",
    chip: "rgba(0,240,255,0.15)",
    chipText: "#67e8f9",
  },
  thunder: {
    accent: "#FFCC11",
    glow: "rgba(255,204,17,0.22)",
    chip: "rgba(255,204,17,0.15)",
    chipText: "#FFD700",
  },
  bifrost: {
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.18)",
    chip: "rgba(167,139,250,0.15)",
    chipText: "#c4b5fd",
  },
  void: {
    accent: "#a1a1aa",
    glow: "rgba(161,161,170,0.12)",
    chip: "rgba(161,161,170,0.1)",
    chipText: "#d4d4d8",
  },
  forge: {
    accent: "#f97316",
    glow: "rgba(249,115,22,0.18)",
    chip: "rgba(249,115,22,0.15)",
    chipText: "#fb923c",
  },
};

export interface StatCardProps {
  /** Short uppercase label, e.g. "Total Users" or "MRR" */
  label: string;
  /** Main value — string allows formatted ($, %, K). number formats with commas. */
  value: string | number;
  /** Optional icon (lucide component). */
  icon?: React.ComponentType<{
    size?: number;
    className?: string;
    style?: React.CSSProperties;
  }>;
  /** Percent change for the delta indicator. Positive = up, negative = down. */
  delta?: number;
  /** Optional label for the delta (e.g. "vs last week"). */
  deltaLabel?: string;
  /** Whether to invert delta polarity (e.g. "errors" — down is good). */
  invertDelta?: boolean;
  /** Accent color variant. */
  variant?: StatCardVariant;
  /** Optional sub-line under the value (e.g. "active subs · ARR $X"). */
  sub?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel,
  invertDelta = false,
  variant = "storm",
  sub,
  className,
}: StatCardProps) {
  const cfg = VARIANT_CONFIG[variant];

  // Compute delta visual.
  let deltaIcon: React.ReactNode = null;
  let deltaColor = "#71717a";
  if (delta !== undefined) {
    const positive = invertDelta ? delta < 0 : delta > 0;
    const negative = invertDelta ? delta > 0 : delta < 0;
    if (positive) {
      deltaIcon = <TrendingUp size={11} />;
      deltaColor = "#10B981";
    } else if (negative) {
      deltaIcon = <TrendingDown size={11} />;
      deltaColor = "#ef4444";
    } else {
      deltaIcon = <Minus size={11} />;
      deltaColor = "#71717a";
    }
  }

  const formatted =
    typeof value === "number"
      ? value.toLocaleString()
      : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-linear-to-br from-zinc-900/60 to-black border border-zinc-800/60 p-5 transition-all duration-300",
        className
      )}
      whileHover={{
        boxShadow: `0 0 24px ${cfg.glow}, 0 0 48px ${cfg.glow.replace("0.18", "0.08").replace("0.22", "0.1").replace("0.12", "0.06")}`,
      }}
    >
      {/* Top hairline accent */}
      <div
        className="absolute top-0 inset-x-5 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)`,
        }}
      />

      {/* Row 1 — label + icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {label}
        </span>
        {Icon && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: cfg.chip,
              border: `1px solid ${cfg.accent}30`,
            }}
          >
            <Icon size={13} style={{ color: cfg.accent }} />
          </div>
        )}
      </div>

      {/* Row 2 — value */}
      <div
        className="text-3xl font-black leading-none tracking-tight"
        style={{ color: cfg.accent }}
      >
        {formatted}
      </div>

      {/* Row 3 — delta + sub */}
      {(delta !== undefined || sub) && (
        <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
          {delta !== undefined && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold"
              style={{ color: deltaColor }}
            >
              {deltaIcon}
              {delta > 0 ? "+" : ""}
              {delta}%
              {deltaLabel && (
                <span className="text-gray-500 font-normal ml-1">
                  {deltaLabel}
                </span>
              )}
            </span>
          )}
          {sub && (
            <span className="text-[11px] text-gray-500 truncate">{sub}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default StatCard;
