// app/components/layout/patterns/grids.tsx
// Live preview components for each grid pattern in the LAYOUT_CATALOG.
// Used by LayoutPreviewModal — all kept in one file so the dynamic-import map
// stays small and previews share style helpers.
"use client";

import React from "react";

/* Shared building block — a flat tile used to show the grid topology. */
function Tile({
  label,
  className = "",
  tone = "default",
  height = "auto",
}: {
  label?: string;
  className?: string;
  tone?: "default" | "gold" | "cyan" | "violet" | "emerald" | "orange";
  height?: string | number;
}) {
  const palette: Record<NonNullable<typeof tone>, string> = {
    default: "bg-zinc-800/80 border-zinc-700/60",
    gold: "bg-[#FFCC11]/15 border-[#FFCC11]/30 text-[#FFCC11]",
    cyan: "bg-[#00f0ff]/15 border-[#00f0ff]/30 text-[#00f0ff]",
    violet: "bg-[#7C3AED]/15 border-[#7C3AED]/30 text-[#7C3AED]",
    emerald: "bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]",
    orange: "bg-[#F97316]/15 border-[#F97316]/30 text-[#F97316]",
  };
  return (
    <div
      className={`rounded-xl border flex items-center justify-center text-xs font-mono uppercase tracking-wider p-4 min-h-[80px] ${palette[tone]} ${className}`}
      style={typeof height === "number" ? { height } : { height }}
    >
      {label}
    </div>
  );
}

export function TwoColGrid() {
  return (
    <div className="w-full p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Tile label="Column 1" tone="gold" />
        <Tile label="Column 2" tone="cyan" />
      </div>
    </div>
  );
}

export function ThreeColGrid() {
  return (
    <div className="w-full p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Tile label="One" tone="gold" />
        <Tile label="Two" tone="cyan" />
        <Tile label="Three" tone="emerald" />
      </div>
    </div>
  );
}

export function FourColGrid() {
  return (
    <div className="w-full p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <Tile label="A" tone="gold" />
        <Tile label="B" tone="cyan" />
        <Tile label="C" tone="emerald" />
        <Tile label="D" tone="violet" />
      </div>
    </div>
  );
}

export function AsymmetricGrid() {
  return (
    <div className="w-full p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Tile label="Featured 2/3" tone="gold" className="lg:col-span-2" height={160} />
        <Tile label="Sidebar 1/3" tone="violet" height={160} />
      </div>
    </div>
  );
}

export function MasonryGrid() {
  return (
    <div className="w-full p-6">
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 [&>div]:mb-3">
        <div className="break-inside-avoid">
          <Tile label="Short" tone="gold" height={80} />
        </div>
        <div className="break-inside-avoid">
          <Tile label="Tall" tone="cyan" height={180} />
        </div>
        <div className="break-inside-avoid">
          <Tile label="Medium" tone="emerald" height={120} />
        </div>
        <div className="break-inside-avoid">
          <Tile label="Tall" tone="violet" height={180} />
        </div>
        <div className="break-inside-avoid">
          <Tile label="Short" tone="orange" height={80} />
        </div>
        <div className="break-inside-avoid">
          <Tile label="Medium" tone="gold" height={120} />
        </div>
      </div>
    </div>
  );
}

export function BentoGrid() {
  return (
    <div className="w-full p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 grid-rows-3 gap-3 sm:h-[420px]">
        <Tile label="Headliner" tone="gold" className="sm:col-span-2 sm:row-span-2" />
        <Tile label="Side A" tone="cyan" />
        <Tile label="Side B" tone="emerald" />
        <Tile label="Wide footer" tone="violet" className="sm:col-span-2" />
        <Tile label="Tail" tone="orange" />
      </div>
    </div>
  );
}

export function AutoFitGrid() {
  return (
    <div className="w-full p-6">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Tile
            key={i}
            label={`#${i + 1}`}
            tone={(["gold", "cyan", "emerald", "violet"] as const)[i % 4]}
          />
        ))}
      </div>
    </div>
  );
}

export function HolyGrailGrid() {
  return (
    <div className="w-full p-4">
      <div className="min-h-[420px] grid grid-rows-[auto_1fr_auto] grid-cols-1 lg:grid-cols-[160px_1fr_200px] gap-3">
        <div className="lg:col-span-3 rounded-xl border border-zinc-700/60 bg-zinc-800/50 p-3 text-xs font-mono uppercase tracking-wider text-gray-400 text-center">
          Header
        </div>
        <div className="rounded-xl border border-[#FFCC11]/30 bg-[#FFCC11]/15 p-3 text-xs font-mono uppercase tracking-wider text-[#FFCC11] text-center flex items-center justify-center">
          Nav
        </div>
        <div className="rounded-xl border border-[#00f0ff]/30 bg-[#00f0ff]/10 p-3 text-xs font-mono uppercase tracking-wider text-[#00f0ff] flex items-center justify-center min-h-[120px]">
          Main Content
        </div>
        <div className="rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/15 p-3 text-xs font-mono uppercase tracking-wider text-[#7C3AED] text-center flex items-center justify-center">
          Aside
        </div>
        <div className="lg:col-span-3 rounded-xl border border-zinc-700/60 bg-zinc-800/50 p-3 text-xs font-mono uppercase tracking-wider text-gray-400 text-center">
          Footer
        </div>
      </div>
    </div>
  );
}
