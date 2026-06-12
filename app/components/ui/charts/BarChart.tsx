// app/components/ui/charts/BarChart.tsx
// Mjolnir-themed BarChart — recharts wrapper with brand defaults.
// Supports vertical / horizontal layouts, single + multi-series data,
// stacked + grouped modes.
//
// Data shape:
//   { label: "Mon", users: 240, sessions: 178 }
//   { label: "Tue", users: 312, sessions: 220 }
//
// Pass `series` to declare which keys to plot:
//   series={[{ key: "users", name: "Users" }, { key: "sessions", name: "Sessions" }]}
"use client";

import React from "react";
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
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

export interface BarSeries {
  key: string;
  name?: string;
  color?: string;
}

export interface MjolnirBarChartProps {
  /** Each row keyed by `labelKey` (default "label") plus one or more series keys. */
  data: Array<Record<string, string | number>>;
  /** Series to render. Default = inferred from first non-label key. */
  series?: BarSeries[];
  /** Field name to use as the X (or Y when horizontal) axis label. */
  labelKey?: string;
  /** Color variant for the bars. */
  variant?: ChartVariant;
  /** Stack the series instead of grouping. */
  stacked?: boolean;
  /** Render bars horizontally (categories on Y, values on X). */
  horizontal?: boolean;
  /** Show the legend. Default true when multi-series. */
  showLegend?: boolean;
  /** Show the cartesian grid. Default true. */
  showGrid?: boolean;
  /** Container height in px. Default 280. */
  height?: number;
  className?: string;
}

export function MjolnirBarChart({
  data,
  series,
  labelKey = "label",
  variant,
  stacked = false,
  horizontal = false,
  showLegend,
  showGrid = true,
  height = 280,
  className,
}: MjolnirBarChartProps) {
  // Infer series from the first data row if not provided.
  const resolvedSeries: BarSeries[] =
    series ??
    (data[0]
      ? Object.keys(data[0])
          .filter((k) => k !== labelKey)
          .map((key) => ({ key, name: key }))
      : []);

  const colors = pickColors(variant, resolvedSeries.length);
  const showLegendResolved =
    showLegend ?? resolvedSeries.length > 1;

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
        >
          {showGrid && <CartesianGrid {...gridProps} />}
          {horizontal ? (
            <>
              <XAxis type="number" {...axisProps} />
              <YAxis dataKey={labelKey} type="category" {...axisProps} />
            </>
          ) : (
            <>
              <XAxis dataKey={labelKey} {...axisProps} />
              <YAxis {...axisProps} />
            </>
          )}
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
            cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
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
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name ?? s.key}
              fill={s.color ?? colors[i]}
              stackId={stacked ? "mjolnir-stack" : undefined}
              radius={stacked ? 0 : [4, 4, 0, 0]}
              maxBarSize={48}
            >
              {/* Per-cell coloring fallback (used when single-series + variant accent rotation desired) */}
              {!s.color && resolvedSeries.length === 1 &&
                data.map((_, idx) => (
                  <Cell key={idx} fill={colors[idx % colors.length]} />
                ))}
            </Bar>
          ))}
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MjolnirBarChart;
