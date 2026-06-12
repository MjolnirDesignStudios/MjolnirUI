// app/components/ui/Heatmap.tsx
// GitHub contribution-style heatmap grid. Pure SVG, no dep.
//
// Pass an array of { date: "2026-06-10", value: 12 } and it renders a
// grid (default: 52 weeks × 7 days = 1 year). Cell color intensity scales
// from min → max value. Hover shows tooltip with date + raw value.
"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { pickColors, type ChartVariant } from "@/lib/chartTheme";

export interface HeatmapDatum {
  /** ISO date string YYYY-MM-DD */
  date: string;
  value: number;
}

export interface MjolnirHeatmapProps {
  data: HeatmapDatum[];
  /** Number of weeks (columns) to render. Default 52. */
  weeks?: number;
  /** Reference end-date — last day of the rightmost column. Default today. */
  endDate?: Date;
  /** Color variant for the intensity ramp. */
  variant?: ChartVariant;
  /** Cell size in px. */
  cellSize?: number;
  /** Gap between cells in px. */
  cellGap?: number;
  /** Show day labels (Mon, Wed, Fri) on the left. */
  showDayLabels?: boolean;
  /** Show month labels along the top. */
  showMonthLabels?: boolean;
  /** Color of empty (value=0) cells. */
  emptyColor?: string;
  className?: string;
}

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toISODateLocal(d: Date): string {
  // Avoid TZ flips that toISOString() can introduce.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function MjolnirHeatmap({
  data,
  weeks = 52,
  endDate,
  variant = "thunder",
  cellSize = 12,
  cellGap = 3,
  showDayLabels = true,
  showMonthLabels = true,
  emptyColor = "rgba(255, 255, 255, 0.04)",
  className,
}: MjolnirHeatmapProps) {
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    date: string;
    value: number;
  } | null>(null);

  // Build value lookup + max for intensity scaling.
  const { byDate, maxValue } = useMemo(() => {
    const m = new Map<string, number>();
    let max = 0;
    for (const d of data) {
      m.set(d.date, d.value);
      if (d.value > max) max = d.value;
    }
    return { byDate: m, maxValue: max };
  }, [data]);

  // Compute grid: columns are weeks, rows are days of week (Mon..Sun).
  // We snap the rightmost column to the week containing endDate.
  const grid = useMemo(() => {
    const end = endDate ?? new Date();
    // Find the Sunday at or after end.
    const lastCol: Date[] = [];
    const endClone = new Date(end);
    // We anchor each column on its Monday; iterate backwards from `end`.
    const cols: Date[][] = [];
    // Cell at the rightmost-bottom is endDate. Walk backwards.
    let day = new Date(end);
    for (let c = 0; c < weeks; c++) {
      const col: (Date | null)[] = new Array(7).fill(null);
      for (let r = 6; r >= 0; r--) {
        col[r] = new Date(day);
        day.setDate(day.getDate() - 1);
      }
      cols.unshift(col as Date[]);
      void lastCol;
      void endClone;
    }
    return cols;
  }, [endDate, weeks]);

  const accent = pickColors(variant, 1)[0];

  // 5 intensity levels from emptyColor → accent.
  const intensities = useMemo(() => {
    return [emptyColor, withAlpha(accent, 0.25), withAlpha(accent, 0.5), withAlpha(accent, 0.75), accent];
  }, [accent, emptyColor]);

  const colorFor = (value: number | undefined): string => {
    if (!value || value <= 0 || maxValue === 0) return intensities[0];
    const t = value / maxValue;
    if (t <= 0.25) return intensities[1];
    if (t <= 0.5) return intensities[2];
    if (t <= 0.75) return intensities[3];
    return intensities[4];
  };

  const labelWidth = showDayLabels ? 28 : 0;
  const labelHeight = showMonthLabels ? 16 : 0;
  const colW = cellSize + cellGap;
  const rowH = cellSize + cellGap;
  const totalW = labelWidth + colW * weeks;
  const totalH = labelHeight + rowH * 7;

  // Compute month label positions — render a label at the column whose
  // Monday begins a new month.
  const monthLabelPositions: { x: number; label: string }[] = [];
  let lastMonth = -1;
  grid.forEach((col, ci) => {
    const monday = col[0];
    if (!monday) return;
    if (monday.getMonth() !== lastMonth && monday.getDate() <= 7) {
      monthLabelPositions.push({
        x: labelWidth + ci * colW,
        label: MONTH_LABELS[monday.getMonth()],
      });
      lastMonth = monday.getMonth();
    }
  });

  return (
    <div className={cn("relative inline-block", className)}>
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        role="img"
      >
        {/* Month labels */}
        {showMonthLabels &&
          monthLabelPositions.map((m, i) => (
            <text
              key={`${m.label}-${i}`}
              x={m.x}
              y={11}
              fill="#a1a1aa"
              fontSize={10}
              fontFamily="ui-monospace, monospace"
            >
              {m.label}
            </text>
          ))}

        {/* Day labels (Mon, Wed, Fri) */}
        {showDayLabels &&
          DAY_LABELS.map(
            (lbl, r) =>
              lbl && (
                <text
                  key={r}
                  x={0}
                  y={labelHeight + r * rowH + cellSize - 2}
                  fill="#a1a1aa"
                  fontSize={9}
                  fontFamily="ui-monospace, monospace"
                >
                  {lbl}
                </text>
              )
          )}

        {/* Cells */}
        {grid.map((col, ci) =>
          col.map((date, ri) => {
            if (!date) return null;
            const iso = toISODateLocal(date);
            const value = byDate.get(iso);
            const fill = colorFor(value);
            return (
              <rect
                key={`${ci}-${ri}`}
                x={labelWidth + ci * colW}
                y={labelHeight + ri * rowH}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={fill}
                onMouseEnter={() =>
                  setHover({
                    x: labelWidth + ci * colW + cellSize / 2,
                    y: labelHeight + ri * rowH,
                    date: iso,
                    value: value ?? 0,
                  })
                }
                onMouseLeave={() => setHover(null)}
              />
            );
          })
        )}
      </svg>

      {/* Tooltip */}
      {hover && (
        <div
          className="absolute pointer-events-none px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-white whitespace-nowrap shadow-xl z-10"
          style={{
            transform: "translate(-50%, -100%)",
            left: hover.x,
            top: hover.y - 6,
          }}
        >
          <div className="text-gray-300 font-bold">{hover.date}</div>
          <div className="text-gray-500">
            {hover.value} {hover.value === 1 ? "contribution" : "contributions"}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */

function withAlpha(hex: string, alpha: number): string {
  // Accepts #RGB / #RRGGBB.
  const h = hex.replace("#", "");
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2, 4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default MjolnirHeatmap;
