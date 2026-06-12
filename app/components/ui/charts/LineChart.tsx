// app/components/ui/charts/LineChart.tsx
// Mjolnir-themed LineChart — recharts wrapper. Single + multi-series,
// optional smooth curves, optional dots.
"use client";

import React from "react";
import {
  LineChart as RLineChart,
  Line,
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

export interface LineSeries {
  key: string;
  name?: string;
  color?: string;
}

export interface MjolnirLineChartProps {
  data: Array<Record<string, string | number>>;
  series?: LineSeries[];
  labelKey?: string;
  variant?: ChartVariant;
  /** "monotone" = smooth curve, "linear" = straight segments. */
  curve?: "monotone" | "linear" | "step" | "natural";
  /** Show data-point dots. Default false (cleaner). */
  showDots?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number;
  strokeWidth?: number;
  className?: string;
}

export function MjolnirLineChart({
  data,
  series,
  labelKey = "label",
  variant,
  curve = "monotone",
  showDots = false,
  showLegend,
  showGrid = true,
  height = 280,
  strokeWidth = 2,
  className,
}: MjolnirLineChartProps) {
  const resolvedSeries: LineSeries[] =
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
        <RLineChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
        >
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
          {resolvedSeries.map((s, i) => (
            <Line
              key={s.key}
              type={curve}
              dataKey={s.key}
              name={s.name ?? s.key}
              stroke={s.color ?? colors[i]}
              strokeWidth={strokeWidth}
              dot={showDots ? { fill: s.color ?? colors[i], r: 3 } : false}
              activeDot={{ r: 5, fill: s.color ?? colors[i] }}
              isAnimationActive
            />
          ))}
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MjolnirLineChart;
