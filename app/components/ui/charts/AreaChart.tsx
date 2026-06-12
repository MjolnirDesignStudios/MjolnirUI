// app/components/ui/charts/AreaChart.tsx
// Mjolnir-themed AreaChart — recharts wrapper. Single + multi-series,
// with branded gradient fills underneath each line.
//
// Most useful for cumulative metrics over time:
//   - MRR growth
//   - Total signups over time
//   - Daily active users with weekly average overlay
"use client";

import React from "react";
import {
  AreaChart as RAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  axisProps,
  gridProps,
  tooltipStyle,
  tooltipLabelStyle,
  tooltipItemStyle,
  pickColors,
  type ChartVariant,
} from "@/lib/chartTheme";

export interface AreaSeries {
  key: string;
  name?: string;
  color?: string;
}

export interface MjolnirAreaChartProps {
  data: Array<Record<string, string | number>>;
  series?: AreaSeries[];
  labelKey?: string;
  variant?: ChartVariant;
  curve?: "monotone" | "linear" | "step" | "natural";
  /** Stack series on top of each other. Useful for "by tier" splits. */
  stacked?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number;
  className?: string;
}

export function MjolnirAreaChart({
  data,
  series,
  labelKey = "label",
  variant,
  curve = "monotone",
  stacked = false,
  showLegend,
  showGrid = true,
  height = 280,
  className,
}: MjolnirAreaChartProps) {
  const resolvedSeries: AreaSeries[] =
    series ??
    (data[0]
      ? Object.keys(data[0])
          .filter((k) => k !== labelKey)
          .map((key) => ({ key, name: key }))
      : []);

  const colors = pickColors(variant, resolvedSeries.length);
  const showLegendResolved = showLegend ?? resolvedSeries.length > 1;

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RAreaChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
        >
          {/* Brand-colored gradients — one per series — used as the fill. */}
          <defs>
            {resolvedSeries.map((s, i) => {
              const color = s.color ?? colors[i];
              return (
                <linearGradient
                  key={s.key}
                  id={`mjolnir-area-${s.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          {showGrid && <CartesianGrid {...gridProps} />}
          <XAxis dataKey={labelKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
            cursor={{ stroke: "rgba(255, 255, 255, 0.15)", strokeWidth: 1 }}
          />
          {showLegendResolved && (
            <Legend
              wrapperStyle={{
                fontSize: 11,
                color: "#a1a1aa",
                paddingTop: 8,
              }}
            />
          )}
          {resolvedSeries.map((s, i) => {
            const color = s.color ?? colors[i];
            return (
              <Area
                key={s.key}
                type={curve}
                dataKey={s.key}
                name={s.name ?? s.key}
                stroke={color}
                strokeWidth={2}
                fill={`url(#mjolnir-area-${s.key})`}
                stackId={stacked ? "mjolnir-area-stack" : undefined}
                activeDot={{ r: 4, fill: color }}
                isAnimationActive
              />
            );
          })}
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MjolnirAreaChart;
