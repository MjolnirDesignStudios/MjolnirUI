// app/components/foundation/RampGenerator.tsx
// Base+ feature: input one hex, get a 10-step ramp.
// Free users see the UI but the "Save" button gates with an upgrade prompt.
"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Save, RotateCcw, Sparkles, LockKeyhole, Loader2 } from "lucide-react";
import {
  generateRamp,
  hexToHsl,
  type RampMode,
  type DefaultPalette,
} from "@/lib/colorMath";
import type { ColorPaletteConfig } from "@/lib/designAssets";
import type { TierName } from "@/lib/tierConfig";
import { hasAccess, getTierConfig } from "@/lib/tierConfig";
import { PaletteCard } from "./PaletteCard";

interface RampGeneratorProps {
  userTier: TierName;
  onRequestUpgrade: (featureName: string, requiredTier: TierName) => void;
  onSaved?: () => void;
}

export function RampGenerator({ userTier, onRequestUpgrade, onSaved }: RampGeneratorProps) {
  const [seed, setSeed] = useState("#FFCC11");
  const [mode, setMode] = useState<RampMode>("dark");
  const [name, setName] = useState("My Asgard Palette");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const canSave = hasAccess(userTier, "base");

  const palette: DefaultPalette = useMemo(() => {
    const ramp = generateRamp(seed, mode);
    return {
      id: "asgard-dark", // placeholder; not persisted in this preview
      name,
      description: `Generated from seed ${seed.toUpperCase()} (${mode} mode).`,
      mode,
      seed,
      ramp,
    };
  }, [seed, mode, name]);

  const handleReset = () => {
    setSeed("#FFCC11");
    setMode("dark");
    setName("My Asgard Palette");
  };

  const handleSave = async () => {
    if (!canSave) {
      onRequestUpgrade("Save Custom Palette", "base");
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      const config: ColorPaletteConfig = {
        seed,
        mode,
        ramp: generateRamp(seed, mode),
      };
      const res = await fetch("/api/design-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_type: "color_palette",
          name: name || "Untitled Palette",
          config,
        }),
      });
      if (res.status === 403) {
        const body = await res.json();
        setSaveMessage({ kind: "err", text: body.error || "Tier limit reached." });
      } else if (!res.ok) {
        // Most likely the Supabase platform incident or a missing migration.
        setSaveMessage({
          kind: "err",
          text: "Couldn't save right now — saving is temporarily unavailable. Try again in a minute.",
        });
      } else {
        setSaveMessage({ kind: "ok", text: "Saved." });
        onSaved?.();
      }
    } catch {
      setSaveMessage({
        kind: "err",
        text: "Network error — couldn't reach the server.",
      });
    } finally {
      setSaving(false);
    }
  };

  const seedHsl = hexToHsl(seed);
  const baseConfig = getTierConfig("base");

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-[#FFCC11]" />
            Ramp Generator
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            One color in, ten balanced steps out. Saved palettes power the Tokens page.
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

      {/* Controls row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {/* Seed color picker */}
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Seed color
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 focus-within:border-[#FFCC11]/40 transition">
            <input
              type="color"
              value={seed}
              onChange={(e) => setSeed(e.target.value.toUpperCase())}
              className="w-8 h-8 rounded-md border border-zinc-700 cursor-pointer bg-transparent appearance-none
                [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
              aria-label="Seed color"
            />
            <input
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-transparent text-sm font-mono text-white outline-none w-full min-w-0"
              placeholder="#FFCC11"
            />
          </div>
        </div>

        {/* Mode toggle */}
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Mode
          </label>
          <div className="flex rounded-xl bg-zinc-950 border border-zinc-800 p-1">
            {(["dark", "light"] as RampMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  mode === m ? "bg-[#FFCC11] text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Name input */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Palette name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-[#FFCC11]/40 transition"
            placeholder="My Asgard Palette"
          />
        </div>
      </div>

      {/* Ramp preview */}
      <motion.div
        layout
        key={`${seed}-${mode}-${name}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PaletteCard palette={palette} />
      </motion.div>

      {/* Seed HSL hint */}
      <div className="mt-3 text-[11px] font-mono text-gray-500">
        Seed HSL: hsl({seedHsl.h}, {seedHsl.s}%, {seedHsl.l}%)
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center gap-3 flex-wrap">
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
          {saving ? "Saving…" : canSave ? "Save Palette" : "Save (Base+)"}
        </button>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition"
        >
          <RotateCcw size={14} />
          Reset
        </button>

        {saveMessage && (
          <span
            className={`text-xs ${saveMessage.kind === "ok" ? "text-[#10B981]" : "text-amber-400"}`}
          >
            {saveMessage.text}
          </span>
        )}
      </div>
    </div>
  );
}
