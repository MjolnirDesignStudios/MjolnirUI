// app/components/foundation/ScaleGenerator.tsx
// Base+ feature: modular type scale generator.
// Free users see the UI but the "Save" button gates with upgrade prompt.
"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Save, RotateCcw, Sparkles, LockKeyhole, Loader2, Copy, Check } from "lucide-react";
import {
  generateScale,
  type ScaleRatio,
  type ScaleStep,
  FONT_PAIRS,
  type FontPair,
} from "@/lib/typeScale";
import type { TypeSystemConfig } from "@/lib/designAssets";
import type { TierName } from "@/lib/tierConfig";
import { hasAccess, getTierConfig } from "@/lib/tierConfig";

interface ScaleGeneratorProps {
  userTier: TierName;
  onRequestUpgrade: (featureName: string, requiredTier: TierName) => void;
  onSaved?: () => void;
}

const RATIOS: { value: ScaleRatio; label: string; description: string }[] = [
  { value: 1.2, label: "1.200", description: "Minor third — subtle hierarchy" },
  { value: 1.25, label: "1.250", description: "Major third — balanced (default)" },
  { value: 1.333, label: "1.333", description: "Perfect fourth — clear" },
  { value: 1.5, label: "1.500", description: "Perfect fifth — dramatic" },
  { value: 1.618, label: "1.618", description: "Golden ratio — luxury" },
];

const SCALE_STEPS: ScaleStep[] = [
  "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl",
];

/* Lazy-load Google Fonts when a pair is selected */
const loadedUrls = new Set<string>();
function loadGoogleFont(url?: string) {
  if (typeof window === "undefined" || !url || loadedUrls.has(url)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
  loadedUrls.add(url);
}

export function ScaleGenerator({
  userTier,
  onRequestUpgrade,
  onSaved,
}: ScaleGeneratorProps) {
  const [ratio, setRatio] = useState<ScaleRatio>(1.25);
  const [basePx, setBasePx] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [pairId, setPairId] = useState<string>(FONT_PAIRS[0].id);
  const [name, setName] = useState("My Type System");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [copiedPanel, setCopiedPanel] = useState<"tailwind" | "css" | null>(null);

  const canSave = hasAccess(userTier, "base");
  const baseConfig = getTierConfig("base");

  const pair: FontPair = useMemo(
    () => FONT_PAIRS.find((p) => p.id === pairId) ?? FONT_PAIRS[0],
    [pairId]
  );

  React.useEffect(() => {
    loadGoogleFont(pair.display.googleFontsUrl);
    loadGoogleFont(pair.body.googleFontsUrl);
    loadGoogleFont(pair.mono?.googleFontsUrl);
  }, [pair]);

  const scale = useMemo(() => generateScale(ratio, basePx), [ratio, basePx]);

  const handleReset = () => {
    setRatio(1.25);
    setBasePx(16);
    setLineHeight(1.6);
    setLetterSpacing(0);
    setPairId(FONT_PAIRS[0].id);
    setName("My Type System");
  };

  const handleSave = async () => {
    if (!canSave) {
      onRequestUpgrade("Save Type System", "base");
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      const config: TypeSystemConfig = {
        display: pair.display.family,
        body: pair.body.family,
        mono: pair.mono?.family,
        ratio,
        basePx,
        lineHeight,
        letterSpacing,
      };
      const res = await fetch("/api/design-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_type: "type_system",
          name: name || "Untitled Type System",
          config,
        }),
      });
      if (res.status === 403) {
        const body = await res.json();
        setSaveMessage({ kind: "err", text: body.error || "Tier limit reached." });
      } else if (!res.ok) {
        setSaveMessage({
          kind: "err",
          text: "Couldn't save right now — saving is temporarily unavailable. Try again in a minute.",
        });
      } else {
        setSaveMessage({ kind: "ok", text: "Saved." });
        onSaved?.();
      }
    } catch {
      setSaveMessage({ kind: "err", text: "Network error — couldn't reach the server." });
    } finally {
      setSaving(false);
    }
  };

  const tailwindConfig = useMemo(() => {
    const fontSize: Record<string, [string, { lineHeight: string; letterSpacing: string }]> = {};
    SCALE_STEPS.forEach((step) => {
      fontSize[step] = [
        scale.rem[step],
        {
          lineHeight: String(lineHeight),
          letterSpacing: `${letterSpacing}em`,
        },
      ];
    });
    return JSON.stringify({ theme: { extend: { fontSize, fontFamily: { display: [pair.display.name], body: [pair.body.name], ...(pair.mono ? { mono: [pair.mono.name] } : {}) } } } }, null, 2);
  }, [scale, lineHeight, letterSpacing, pair]);

  const cssCustomProps = useMemo(() => {
    const lines = [
      ":root {",
      `  /* Type system: ${pair.name} @ ${ratio} */`,
      `  --font-display: ${pair.display.family};`,
      `  --font-body:    ${pair.body.family};`,
      ...(pair.mono ? [`  --font-mono:    ${pair.mono.family};`] : []),
      "",
      ...SCALE_STEPS.map((step) => `  --text-${step}:      ${scale.rem[step]};`),
      "",
      `  --leading:       ${lineHeight};`,
      `  --tracking:      ${letterSpacing}em;`,
      "}",
    ];
    return lines.join("\n");
  }, [scale, lineHeight, letterSpacing, pair, ratio]);

  const handleCopy = (kind: "tailwind" | "css", value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedPanel(kind);
    setTimeout(() => setCopiedPanel(null), 1500);
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-[#FFCC11]" />
            Scale Generator
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Modular type scale + base size + leading + tracking. Saved type systems power the Tokens page.
          </p>
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
          style={{
            backgroundColor: `${baseConfig.color}20`,
            color: baseConfig.color,
            border: `1px solid ${baseConfig.color}40`,
          }}
        >
          Base+ to save
        </span>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Pair picker */}
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Font pair
          </label>
          <select
            value={pairId}
            onChange={(e) => setPairId(e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-[#FFCC11]/40 transition"
          >
            {FONT_PAIRS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.display.name} + {p.body.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ratio + Base + Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Modular ratio
            </label>
            <select
              value={ratio}
              onChange={(e) => setRatio(parseFloat(e.target.value) as ScaleRatio)}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-[#FFCC11]/40 transition"
            >
              {RATIOS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} — {r.description}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Base size (px): {basePx}
            </label>
            <input
              type="range"
              min={12}
              max={20}
              step={1}
              value={basePx}
              onChange={(e) => setBasePx(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#FFCC11]
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FFCC11]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-[#FFCC11]/40 transition"
              placeholder="My Type System"
            />
          </div>
        </div>

        {/* Leading + Tracking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Line height: {lineHeight.toFixed(2)}
            </label>
            <input
              type="range"
              min={1}
              max={2.2}
              step={0.05}
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#FFCC11]
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FFCC11]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Letter spacing: {letterSpacing.toFixed(2)}em
            </label>
            <input
              type="range"
              min={-0.05}
              max={0.1}
              step={0.005}
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#FFCC11]
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FFCC11]"
            />
          </div>
        </div>
      </div>

      {/* Scale preview */}
      <motion.div
        layout
        key={`${ratio}-${basePx}-${pairId}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-black/40 border border-zinc-800/50 rounded-xl p-5"
      >
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Live scale — using {pair.display.name} for headings
        </div>
        <div className="space-y-2">
          {SCALE_STEPS.map((step) => (
            <div key={step} className="flex items-baseline gap-4 group">
              <span className="text-[10px] font-mono text-gray-500 w-10 shrink-0 uppercase">
                {step}
              </span>
              <span
                className="text-white truncate"
                style={{
                  fontFamily: parseInt(step.replace(/\D/g, "")) > 0 || step === "lg" || step === "xl" || step.endsWith("xl")
                    ? pair.display.family
                    : pair.body.family,
                  fontSize: scale.rem[step],
                  fontWeight: pair.display.weight ?? 700,
                  lineHeight,
                  letterSpacing: `${letterSpacing}em`,
                }}
              >
                Mjolnir
              </span>
              <span className="text-[10px] font-mono text-gray-500 ml-auto">
                {scale.rem[step]} ({scale.px[step]}px)
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Export panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ExportPanel
          label="Tailwind config"
          code={tailwindConfig}
          copied={copiedPanel === "tailwind"}
          onCopy={() => handleCopy("tailwind", tailwindConfig)}
        />
        <ExportPanel
          label="CSS custom properties"
          code={cssCustomProps}
          copied={copiedPanel === "css"}
          onCopy={() => handleCopy("css", cssCustomProps)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-wait"
          style={{
            backgroundColor: canSave ? "#FFCC11" : `${baseConfig.color}20`,
            color: canSave ? "#000" : baseConfig.color,
            border: canSave ? "none" : `1px solid ${baseConfig.color}40`,
          }}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : canSave ? (
            <Save size={16} />
          ) : (
            <LockKeyhole size={16} />
          )}
          {saving ? "Saving…" : canSave ? "Save Type System" : "Save (Base+)"}
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition"
        >
          <RotateCcw size={14} />
          Reset
        </button>
        {saveMessage && (
          <span className={`text-xs ${saveMessage.kind === "ok" ? "text-[#10B981]" : "text-amber-400"}`}>
            {saveMessage.text}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Reusable export panel with copy button ───────────── */
function ExportPanel({
  label,
  code,
  copied,
  onCopy,
}: {
  label: string;
  code: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="bg-black/40 border border-zinc-800/50 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md text-gray-400 hover:text-white hover:bg-zinc-800/50 transition"
        >
          {copied ? <Check size={12} className="text-[#10B981]" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="text-[10px] font-mono text-gray-300 p-4 overflow-x-auto max-h-48 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
