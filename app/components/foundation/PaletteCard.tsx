// app/components/foundation/PaletteCard.tsx
// Renders one palette: header + ramp swatches + accent swatches.
// Each swatch is click-to-copy.
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Palette as PaletteIcon } from "lucide-react";
import {
  type DefaultPalette,
  type Ramp,
  getReadableTextColor,
} from "@/lib/colorMath";

const RAMP_STEPS: Array<keyof Ramp> = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

export function PaletteCard({ palette }: { palette: DefaultPalette }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-zinc-800/50">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: palette.seed + "20", border: `1px solid ${palette.seed}40` }}
          >
            <PaletteIcon size={18} style={{ color: palette.seed }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className="text-base font-bold text-white">{palette.name}</h3>
              <span className="text-[10px] font-mono text-gray-500 uppercase">
                {palette.mode}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{palette.description}</p>
          </div>
        </div>
      </div>

      {/* Ramp grid */}
      <div className="p-5">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Ramp
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {RAMP_STEPS.map((step) => (
            <Swatch key={step} label={String(step)} value={palette.ramp[step]} />
          ))}
        </div>
      </div>

      {/* Accents */}
      {palette.accents && Object.keys(palette.accents).length > 0 && (
        <div className="px-5 pb-5">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Accents
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
            {Object.entries(palette.accents).map(([name, hex]) => (
              <Swatch key={name} label={name} value={hex} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Click-to-copy swatch tile ────────────────────────── */
function Swatch({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const textColor = getReadableTextColor(value);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <motion.button
      onClick={handleCopy}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className="group relative aspect-square rounded-md overflow-hidden border border-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-[#FFCC11]/50"
      style={{ backgroundColor: value }}
      aria-label={`Copy ${label} (${value})`}
      title={`${label} — ${value}`}
    >
      {/* Step / name label */}
      <span
        className="absolute top-1 left-1.5 text-[9px] font-mono font-semibold uppercase opacity-80 truncate max-w-[80%]"
        style={{ color: textColor }}
      >
        {label}
      </span>

      {/* Hex on hover */}
      <span
        className="absolute bottom-1 left-1.5 right-1.5 text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity truncate"
        style={{ color: textColor }}
      >
        {value}
      </span>

      {/* Copied confirmation */}
      {copied && (
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: textColor, backgroundColor: value }}
        >
          <Check size={14} />
        </span>
      )}
      {!copied && (
        <Copy
          size={10}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-60"
          style={{ color: textColor }}
        />
      )}
    </motion.button>
  );
}
