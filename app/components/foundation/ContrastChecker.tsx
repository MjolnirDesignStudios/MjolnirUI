// app/components/foundation/ContrastChecker.tsx
// WCAG contrast ratio checker — Free tier feature.
// User pastes 2 hex codes, sees ratio + AA/AAA badges + live preview.
"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import {
  getContrastRatio,
  getContrastRating,
  type WcagRating,
} from "@/lib/colorMath";

const RATING_META: Record<
  WcagRating,
  { label: string; color: string; bg: string; description: string }
> = {
  fail: {
    label: "Fails WCAG",
    color: "#F87171",
    bg: "rgba(248,113,113,0.12)",
    description: "Below 3:1 — not accessible.",
  },
  "aa-large": {
    label: "AA Large",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.12)",
    description: "Passes for headlines (≥18pt) only.",
  },
  aa: {
    label: "AA",
    color: "#34D399",
    bg: "rgba(52,211,153,0.12)",
    description: "Passes for normal body text.",
  },
  aaa: {
    label: "AAA",
    color: "#22D3EE",
    bg: "rgba(34,211,238,0.12)",
    description: "Excellent contrast — exceeds AAA.",
  },
};

function isValidHex(value: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function normalizeHex(value: string): string {
  const trimmed = value.trim().replace(/^#/, "");
  return "#" + (trimmed.length === 3 ? trimmed.split("").map((c) => c + c).join("") : trimmed).toUpperCase();
}

export function ContrastChecker({
  defaultBg = "#0F172A",
  defaultFg = "#FFCC11",
}: {
  defaultBg?: string;
  defaultFg?: string;
}) {
  const [bg, setBg] = useState(defaultBg);
  const [fg, setFg] = useState(defaultFg);

  const valid = isValidHex(bg) && isValidHex(fg);
  const { ratio, rating } = useMemo(() => {
    if (!valid) return { ratio: 0, rating: "fail" as WcagRating };
    const r = getContrastRatio(normalizeHex(bg), normalizeHex(fg));
    return { ratio: r, rating: getContrastRating(r) };
  }, [bg, fg, valid]);

  const meta = RATING_META[rating];

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Contrast Checker</h3>
          <p className="text-xs text-gray-500 mt-0.5">Live WCAG ratio between any two colors.</p>
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
          style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6", border: "1px solid #3B82F633" }}
        >
          Free
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <ColorInput label="Background" value={bg} onChange={setBg} />
        <ColorInput label="Foreground" value={fg} onChange={setFg} />
      </div>

      {/* Result panel */}
      <motion.div
        layout
        className="rounded-xl border p-5 transition-colors"
        style={{
          backgroundColor: meta.bg,
          borderColor: `${meta.color}40`,
        }}
      >
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
              Contrast ratio
            </div>
            <div className="text-4xl font-black text-white tabular-nums">
              {valid ? ratio.toFixed(2) : "—"}
              <span className="text-xl text-gray-500 ml-1">: 1</span>
            </div>
          </div>
          <span
            className="px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide"
            style={{ backgroundColor: meta.color, color: "#000" }}
          >
            {meta.label}
          </span>
        </div>
        <p className="text-xs text-gray-400">{meta.description}</p>
      </motion.div>

      {/* Live preview swatch */}
      {valid && (
        <div
          className="mt-4 rounded-xl p-6 text-center"
          style={{ backgroundColor: normalizeHex(bg), color: normalizeHex(fg) }}
        >
          <p className="text-2xl font-bold mb-1">Whosoever holds this hammer</p>
          <p className="text-sm opacity-80">if he be worthy, shall possess the power of Thor.</p>
        </div>
      )}
    </div>
  );
}

/* ── Color input — paired text + native color picker ─── */
function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const valid = isValidHex(value);

  const handleCopy = () => {
    if (!valid) return;
    navigator.clipboard.writeText(normalizeHex(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      <div className="relative flex items-center gap-2 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 focus-within:border-[#FFCC11]/40 transition">
        <input
          type="color"
          value={valid ? normalizeHex(value) : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="w-8 h-8 rounded-md border border-zinc-700 cursor-pointer bg-transparent appearance-none
            [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent text-sm font-mono text-white outline-none"
          placeholder="#FFCC11"
          aria-label={`${label} hex value`}
        />
        <button
          onClick={handleCopy}
          disabled={!valid}
          className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label={`Copy ${label} hex`}
        >
          {copied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} className="text-gray-400" />}
        </button>
      </div>
      {!valid && <p className="text-[11px] text-amber-400 mt-1">Not a valid hex color</p>}
    </div>
  );
}
