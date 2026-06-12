// app/components/ui/charts/DonutChart.tsx
// Mjolnir-themed donut / pie chart with optional center label slot.
// Use for distributions — tier breakdown, traffic source, asset-type splits.
"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  tooltipStyle,
  tooltipLabelStyle,
  tooltipItemStyle,
  pickColors,
  type ChartVariant,
} from "@/lib/chartTheme";

export interface DonutDatum {
  label: string;
  value: number;
  color?: string;
}

export interface MjolnirDonutChartProps {
  data: DonutDatum[];
  variant?: ChartVariant;
  /** Hole size as fraction of outer radius. 0 = pie, 0.6 = thick donut. */
  innerRatio?: number;
  /** Slot for center content (rendered absolutely-positioned). */
  centerLabel?: React.ReactNode;
  showLegend?: boolean;
  /** "right" stacks the legend on the right; "bottom" puts it under. */
  legendPosition?: "right" | "bottom";
  height?: number;
  className?: string;
}

export function MjolnirDonutChart({
  data,
  variant,
  innerRatio = 0.6,
  centerLabel,
  showLegend = true,
  legendPosition = "right",
  height = 280,
  className,
}: MjolnirDonutChartProps) {
  const colors = pickColors(variant, data.length);
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className={className} style={{ width: "100%", height, position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart
          margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
        >
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={`${innerRatio * 100}%`}
            outerRadius="90%"
            paddingAngle={2}
            stroke="rgba(0, 0, 0, 0.4)"
            strokeWidth={2}
            isAnimationActive
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.label}
                fill={entry.color ?? colors[i]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
            formatter={(value: number) => {
              const pct =
                total > 0 ? ` (${((value / total) * 100).toFixed(1)}%)` : "";
              return [`${value.toLocaleString()}${pct}`, ""];
            }}
          />
          {showLegend && (
            <Legend
              layout={legendPosition === "right" ? "vertical" : "horizontal"}
              align={legendPosition === "right" ? "right" : "center"}
              verticalAlign={legendPosition === "right" ? "middle" : "bottom"}
              wrapperStyle={{
                fontSize: 11,
                color: "#a1a1aa",
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Center label slot — positioned over the pie hole. */}
      {centerLabel && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: legendPosition === "right" ? "30%" : "50%",
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

export default MjolnirDonutChart;
