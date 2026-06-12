// app/components/ui/ProgressBar.tsx
// Linear progress bar with 3 modes:
//   - determinate   → fixed % from 0 to 100
//   - indeterminate → animated shimmer (unknown duration)
//   - segmented     → 5 dots/blocks lighting up by % (good for tier progress)
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { pickColors, type ChartVariant } from "@/lib/chartTheme";

export type ProgressMode = "determinate" | "indeterminate" | "segmented";

export interface MjolnirProgressBarProps {
  /** Mode of the bar. */
  mode?: ProgressMode;
  /** 0-100 (ignored when mode === "indeterminate"). */
  value?: number;
  /** Brand color variant. */
  variant?: ChartVariant;
  /** Override the accent color directly. */
  color?: string;
  /** Override the track color (default = subtle zinc). */
  trackColor?: string;
  /** Optional label rendered above the bar. */
  label?: React.ReactNode;
  /** Show the % value on the right end of the label row. */
  showValue?: boolean;
  /** Track height in px. */
  height?: number;
  /** Number of segments for mode="segmented". Default 5. */
  segments?: number;
  className?: string;
}

export function MjolnirProgressBar({
  mode = "determinate",
  value = 0,
  variant = "thunder",
  color,
  trackColor = "rgba(255, 255, 255, 0.06)",
  label,
  showValue = false,
  height = 6,
  segments = 5,
  className,
}: MjolnirProgressBarProps) {
  const accent = color ?? pickColors(variant, 1)[0];
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5 text-[11px]">
          {label && <span className="text-gray-400 font-semibold">{label}</span>}
          {showValue && mode !== "indeterminate" && (
            <span
              className="font-mono font-bold"
              style={{ color: accent }}
            >
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}

      {mode === "segmented" ? (
        <div className="flex items-center gap-1">
          {Array.from({ length: segments }).map((_, i) => {
            const segPercent = ((i + 1) / segments) * 100;
            const filled = clamped >= segPercent;
            const partial = !filled && clamped > (i / segments) * 100;
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-300"
                style={{
                  height,
                  backgroundColor: filled
                    ? accent
                    : partial
                      ? withAlpha(accent, 0.45)
                      : trackColor,
                  boxShadow: filled ? `0 0 8px ${withAlpha(accent, 0.4)}` : "none",
                }}
              />
            );
          })}
        </div>
      ) : (
        <div
          className="relative w-full overflow-hidden rounded-full"
          style={{ height, backgroundColor: trackColor }}
          role="progressbar"
          aria-valuenow={mode === "indeterminate" ? undefined : clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {mode === "indeterminate" ? (
            <div
              className="absolute inset-y-0 rounded-full"
              style={{
                width: "40%",
                background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                animation: "mjolnir-progress-slide 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
              }}
            />
          ) : (
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${clamped}%`,
                backgroundColor: accent,
                boxShadow: `0 0 8px ${withAlpha(accent, 0.35)}`,
              }}
            />
          )}
        </div>
      )}

      {/* Local keyframes for the indeterminate sweep — scoped via <style>. */}
      {mode === "indeterminate" && (
        <style>{`@keyframes mjolnir-progress-slide {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(350%); }
          }`}</style>
      )}
    </div>
  );
}

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2, 4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default MjolnirProgressBar;
