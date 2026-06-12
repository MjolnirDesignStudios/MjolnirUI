// app/components/ui/charts/Sparkline.tsx
// Tiny inline trend chart — minimal axes, no grid, designed to drop into
// table cells, StatCards, or any "trend at a glance" surface.
//
// Two visual modes:
//   - line  → thin line + optional area fill underneath
//   - bars  → tiny vertical bars (think GitHub contribution row)
"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart as RBarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { pickColors, type ChartVariant } from "@/lib/chartTheme";

export interface MjolnirSparklineProps {
  /** Array of numeric values, plotted left-to-right. */
  data: number[];
  /** Visual mode. */
  mode?: "line" | "bars";
  /** Color variant. Default thunder gold. */
  variant?: ChartVariant;
  /** Override the accent color directly. */
  color?: string;
  /** Container width — number for px, string for any CSS unit. Default 100%. */
  width?: number | string;
  /** Container height in px. Default 32. */
  height?: number;
  className?: string;
}

export function MjolnirSparkline({
  data,
  mode = "line",
  variant = "thunder",
  color,
  width = "100%",
  height = 32,
  className,
}: MjolnirSparklineProps) {
  const accent = color ?? pickColors(variant, 1)[0];
  const series = data.map((v, i) => ({ x: i, value: v }));

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        {mode === "bars" ? (
          <RBarChart data={series} margin={{ top: 1, right: 0, bottom: 1, left: 0 }}>
            <Bar
              dataKey="value"
              fill={accent}
              radius={[1, 1, 0, 0]}
              maxBarSize={4}
              isAnimationActive={false}
            />
          </RBarChart>
        ) : (
          <AreaChart data={series} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`mjolnir-sparkline-${accent.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.4} />
                <stop offset="100%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={accent}
              strokeWidth={1.5}
              fill={`url(#mjolnir-sparkline-${accent.replace("#", "")})`}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default MjolnirSparkline;
