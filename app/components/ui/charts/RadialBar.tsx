// app/components/ui/charts/RadialBar.tsx
// Mjolnir-themed radial progress gauge. Renders a single circular arc
// from 0% to N% with optional center label. Useful for:
//   - Performance score (Lighthouse, AISO Score)
//   - "75% of goal reached" KPIs
//   - Conversion rate dials
"use client";

import React from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { pickColors, type ChartVariant } from "@/lib/chartTheme";

export interface MjolnirRadialBarProps {
  /** Value 0-100 (percent). Capped automatically. */
  value: number;
  /** Color variant. Default thunder (gold). */
  variant?: ChartVariant;
  /** Override the bar color directly. */
  color?: string;
  /** Override the background-track color. */
  trackColor?: string;
  /** Bar thickness as fraction of radius. */
  thickness?: number;
  /** Slot for center content (rendered absolutely-positioned over the gauge). */
  centerLabel?: React.ReactNode;
  /** Container size in px. Square. Default 180. */
  size?: number;
  className?: string;
}

export function MjolnirRadialBar({
  value,
  variant = "thunder",
  color,
  trackColor = "rgba(255, 255, 255, 0.08)",
  thickness = 0.18,
  centerLabel,
  size = 180,
  className,
}: MjolnirRadialBarProps) {
  const accent = color ?? pickColors(variant, 1)[0];
  const clamped = Math.max(0, Math.min(100, value));

  // recharts RadialBar wants the data point to have a `fill` key,
  // and PolarAngleAxis controls the 0-100 mapping range.
  const data = [{ name: "value", value: clamped, fill: accent }];

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: "relative" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={data}
          cx="50%"
          cy="50%"
          startAngle={90}
          endAngle={-270}
          innerRadius={`${(1 - thickness) * 90}%`}
          outerRadius="90%"
          barSize={size * thickness}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <RadialBar
            background={{ fill: trackColor }}
            dataKey="value"
            cornerRadius={size / 2}
            isAnimationActive
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center label slot. */}
      {centerLabel && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            textAlign: "center",
          }}
        >
          {centerLabel}
        </div>
      )}
    </div>
  );
}

export default MjolnirRadialBar;
