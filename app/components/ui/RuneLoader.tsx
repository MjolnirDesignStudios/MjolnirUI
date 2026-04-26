"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/* ─────── Elder Futhark rune SVG paths (simplified for rendering) ─────── */
const RUNES = {
  fehu: "M4 2v20M4 5l8 5M4 10l8 5", // ᚠ Fehu — Wealth
  uruz: "M4 2v20M4 2l8 8v12", // ᚢ Uruz — Strength
  thurisaz: "M4 2v20M4 6l8 6-8 6", // ᚦ Thurisaz — Thor
  ansuz: "M4 2v20M4 6l8-4M4 12l8-4", // ᚨ Ansuz — Odin
  raido: "M4 2v20M4 2l8 8H4", // ᚱ Raido — Journey
  kenaz: "M4 2l8 10-8 10", // ᚲ Kenaz — Torch
  algiz: "M8 22V6M8 6l-6 8M8 6l6 8", // ᛉ Algiz — Protection
  tiwaz: "M8 2v20M2 2h12M8 2", // ᛏ Tiwaz — Victory
  loki: "M4 2v20M4 2l8 10M12 2v20M4 12l8 10", // ᛚ Loki — Trickster (intertwined staves)
} as const;

type RuneName = keyof typeof RUNES;

/* ─────── Size config ─────── */
const SIZE_MAP = {
  sm: { container: 32, stroke: 1.5, rune: 16 },
  md: { container: 48, stroke: 2, rune: 24 },
  lg: { container: 64, stroke: 2.5, rune: 32 },
  xl: { container: 80, stroke: 3, rune: 40 },
};

/* ─────── Color config ─────── */
const COLOR_MAP = {
  electric: { primary: "#00f0ff", glow: "rgba(0,240,255,0.4)", ring: "rgba(0,240,255,0.2)" },
  gold: { primary: "#FFD700", glow: "rgba(255,215,0,0.4)", ring: "rgba(255,215,0,0.2)" },
  forge: { primary: "#f97316", glow: "rgba(249,115,22,0.4)", ring: "rgba(249,115,22,0.2)" },
  bifrost: { primary: "#a78bfa", glow: "rgba(167,139,250,0.4)", ring: "rgba(167,139,250,0.2)" },
  white: { primary: "#e4e4e7", glow: "rgba(228,228,231,0.3)", ring: "rgba(228,228,231,0.15)" },
  emerald: { primary: "#10B981", glow: "rgba(16,185,129,0.4)", ring: "rgba(16,185,129,0.2)" },
};

/* ─────── Props ─────── */
export interface RuneLoaderProps {
  /** Which rune to display — defaults to "thurisaz" (Thor's rune) */
  rune?: RuneName;
  /** Size preset */
  size?: "sm" | "md" | "lg" | "xl";
  /** Color theme */
  color?: keyof typeof COLOR_MAP;
  /** Loading text shown below */
  label?: string;
  /** Custom className */
  className?: string;
  /** Spin the outer ring (default true) */
  spin?: boolean;
  /** Pulse the rune glow (default true) */
  pulse?: boolean;
}

/* ─────── Component ─────── */
export function RuneLoader({
  rune = "thurisaz",
  size = "md",
  color = "electric",
  label,
  className,
  spin = true,
  pulse = true,
}: RuneLoaderProps) {
  const sizeConfig = SIZE_MAP[size];
  const colorConfig = COLOR_MAP[color];
  const runePath = RUNES[rune];

  return (
    <div
      className={cn("inline-flex flex-col items-center gap-2", className)}
      role="status"
      aria-label={label || "Loading"}
    >
      <div
        className="relative"
        style={{
          width: sizeConfig.container,
          height: sizeConfig.container,
        }}
      >
        {/* Outer spinning ring */}
        <motion.svg
          className="absolute inset-0"
          width={sizeConfig.container}
          height={sizeConfig.container}
          viewBox={`0 0 ${sizeConfig.container} ${sizeConfig.container}`}
          animate={spin ? { rotate: 360 } : undefined}
          transition={
            spin
              ? { duration: 3, repeat: Infinity, ease: "linear" }
              : undefined
          }
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`rune-ring-${rune}-${color}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colorConfig.primary} stopOpacity="0.8" />
              <stop offset="50%" stopColor={colorConfig.primary} stopOpacity="0.1" />
              <stop offset="100%" stopColor={colorConfig.primary} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <circle
            cx={sizeConfig.container / 2}
            cy={sizeConfig.container / 2}
            r={sizeConfig.container / 2 - sizeConfig.stroke}
            fill="none"
            stroke={`url(#rune-ring-${rune}-${color})`}
            strokeWidth={sizeConfig.stroke}
            strokeLinecap="round"
            strokeDasharray={`${sizeConfig.container * 0.6} ${sizeConfig.container * 1.5}`}
          />
        </motion.svg>

        {/* Background ring (static, subtle) */}
        <svg
          className="absolute inset-0"
          width={sizeConfig.container}
          height={sizeConfig.container}
          viewBox={`0 0 ${sizeConfig.container} ${sizeConfig.container}`}
          aria-hidden="true"
        >
          <circle
            cx={sizeConfig.container / 2}
            cy={sizeConfig.container / 2}
            r={sizeConfig.container / 2 - sizeConfig.stroke}
            fill="none"
            stroke={colorConfig.ring}
            strokeWidth={sizeConfig.stroke * 0.5}
          />
        </svg>

        {/* Center rune glyph */}
        <motion.svg
          className="absolute"
          style={{
            top: (sizeConfig.container - sizeConfig.rune) / 2,
            left: (sizeConfig.container - sizeConfig.rune) / 2,
            filter: `drop-shadow(0 0 ${sizeConfig.stroke * 2}px ${colorConfig.glow})`,
          }}
          width={sizeConfig.rune}
          height={sizeConfig.rune}
          viewBox="0 0 16 24"
          animate={
            pulse
              ? { opacity: [0.6, 1, 0.6], scale: [0.97, 1, 0.97] }
              : undefined
          }
          transition={
            pulse
              ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
          aria-hidden="true"
        >
          <path
            d={runePath}
            fill="none"
            stroke={colorConfig.primary}
            strokeWidth={sizeConfig.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </div>

      {/* Label */}
      {label && (
        <motion.span
          className="text-xs font-medium tracking-wider uppercase"
          style={{ color: colorConfig.primary }}
          animate={pulse ? { opacity: [0.5, 1, 0.5] } : undefined}
          transition={
            pulse
              ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
