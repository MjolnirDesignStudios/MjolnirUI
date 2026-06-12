// app/components/ui/DataTable.tsx
// Mjolnir-themed data table — sortable columns, optional row selection,
// configurable density, pinned header.
//
// Headless-ish: no opinions about pagination or fetching — caller passes
// `data` + `columns` and gets a sortable, accessible table. For server-side
// pagination, render the controls externally and pass sliced data.
//
// Usage:
//   <MjolnirDataTable
//     data={users}
//     columns={[
//       { key: "name", header: "Name", sortable: true },
//       { key: "email", header: "Email", sortable: true, mono: true },
//       { key: "tier", header: "Tier", render: (row) => <TierBadge tier={row.tier} /> },
//       { key: "mrr", header: "MRR", align: "right", format: (v) => `$${v}` },
//     ]}
//     onRowClick={(row) => console.log(row)}
//   />
"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface DataTableColumn<T> {
  /** Field key in the row. Must be string-indexable on T. */
  key: keyof T & string;
  /** Column header label. */
  header: React.ReactNode;
  /** Render the cell with custom JSX. Receives the entire row. */
  render?: (row: T) => React.ReactNode;
  /** Format the raw value (used when render isn't provided). */
  format?: (value: T[keyof T]) => React.ReactNode;
  /** Cell alignment. */
  align?: "left" | "right" | "center";
  /** Use monospace font (good for IDs, emails, currencies). */
  mono?: boolean;
  /** Whether this column is sortable. Default false. */
  sortable?: boolean;
  /** Fixed column width — e.g. "120px" or "20%". */
  width?: string;
  /** Add a subtle dim style to the cell text. */
  dim?: boolean;
}

export interface MjolnirDataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  /** Row click handler. Adds hover + cursor-pointer when set. */
  onRowClick?: (row: T, index: number) => void;
  /** Highlight the row currently considered "active". */
  isRowActive?: (row: T, index: number) => boolean;
  /** Optional row key extractor. Default = index. */
  getRowKey?: (row: T, index: number) => string | number;
  /** Compact (~36px row height) or comfortable (~52px). */
  density?: "compact" | "comfortable";
  /** Show zebra striping. */
  striped?: boolean;
  /** Sticky header (within the table's overflow container). */
  stickyHeader?: boolean;
  /** Optional className for the wrapping element. */
  className?: string;
  /** Empty-state slot when data is []. Default = a small placeholder row. */
  emptyState?: React.ReactNode;
}

type SortDir = "asc" | "desc";

export function MjolnirDataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  isRowActive,
  getRowKey,
  density = "comfortable",
  striped = true,
  stickyHeader = false,
  className,
  emptyState,
}: MjolnirDataTableProps<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  /* Sort data client-side. Callers doing server-side sorting should sort
     before passing data in and skip the sortable: true flag on columns. */
  const sorted = useMemo(() => {
    if (!sortBy) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = (a as any)[sortBy];
      const bv = (b as any)[sortBy];
      // Nulls last regardless of direction.
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [data, sortBy, sortDir]);

  const handleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    if (sortBy === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col.key);
      setSortDir("asc");
    }
  };

  const cellPadY = density === "compact" ? "py-2" : "py-3";
  const alignClass = (a: DataTableColumn<T>["align"]) =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  return (
    <div
      className={cn(
        "bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead
            className={cn(
              "bg-zinc-900/60 text-[10px] font-semibold uppercase tracking-wider text-gray-500",
              stickyHeader && "sticky top-0 z-10"
            )}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-2.5 select-none",
                    alignClass(col.align),
                    col.sortable && "cursor-pointer hover:text-gray-300 transition"
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => handleSort(col)}
                  aria-sort={
                    col.sortable && sortBy === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <SortIndicator
                        active={sortBy === col.key}
                        dir={sortDir}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyState ?? "No rows."}
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => {
                const key = getRowKey ? getRowKey(row, i) : i;
                const active = isRowActive?.(row, i) ?? false;
                const clickable = !!onRowClick;
                return (
                  <tr
                    key={key}
                    onClick={clickable ? () => onRowClick!(row, i) : undefined}
                    className={cn(
                      "transition",
                      striped && i % 2 === 1 && "bg-white/[0.015]",
                      clickable && "cursor-pointer hover:bg-white/5",
                      active && "bg-[#FFCC11]/10"
                    )}
                    style={
                      active
                        ? { boxShadow: "inset 2px 0 0 0 #FFCC11" }
                        : undefined
                    }
                  >
                    {columns.map((col) => {
                      const raw = row[col.key];
                      const content = col.render
                        ? col.render(row)
                        : col.format
                          ? col.format(raw)
                          : raw == null
                            ? "—"
                            : String(raw);
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "px-4",
                            cellPadY,
                            alignClass(col.align),
                            col.mono && "font-mono text-xs",
                            col.dim ? "text-gray-500" : "text-gray-200"
                          )}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return <ChevronsUpDown size={11} className="text-gray-600 opacity-60" />;
  }
  return dir === "asc" ? (
    <ChevronUp size={11} className="text-[#FFCC11]" />
  ) : (
    <ChevronDown size={11} className="text-[#FFCC11]" />
  );
}

export default MjolnirDataTable;
