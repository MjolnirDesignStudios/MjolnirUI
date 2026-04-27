// app/(protected)/blocks/foundation/colors/page.tsx
// Colors page — Free: contrast checker + default palettes
//                Base+: ramp generator + save up to 3 palettes
//                Pro/Elite: OdinAI Color Architect (shell — coming with OdinAI)
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Palette as PaletteIcon, Sparkles, Trash2, Bot, Lock, Wand2,
  RefreshCw,
} from "lucide-react";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";
import { TierBadge } from "@/components/Dashboards/TierBadge";
import { ContrastChecker } from "@/components/foundation/ContrastChecker";
import { PaletteCard } from "@/components/foundation/PaletteCard";
import { RampGenerator } from "@/components/foundation/RampGenerator";
import {
  DEFAULT_PALETTES,
  type DefaultPalette,
  type Ramp,
  type RampMode,
} from "@/lib/colorMath";

interface SavedPalette {
  id: string;
  name: string;
  config: {
    seed: string;
    mode: RampMode;
    ramp: Ramp;
  };
  created_at: string;
}

export default function ColorsPage() {
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || "free";
  const canSave = hasAccess(userTier, "base");

  const [saved, setSaved] = useState<SavedPalette[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);

  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: "base", featureName: "" });

  const requestUpgrade = (featureName: string, requiredTier: TierName) =>
    setUpgradeModal({ isOpen: true, featureName, requiredTier });

  /* ── Load saved palettes (Base+) ─────────────────── */
  const loadSaved = async () => {
    if (!canSave) return;
    setLoadingSaved(true);
    setSavedError(null);
    try {
      const res = await fetch("/api/design-assets?type=color_palette", {
        cache: "no-store",
      });
      if (!res.ok) {
        setSavedError("Couldn't load saved palettes — try again in a minute.");
        return;
      }
      const body = await res.json();
      setSaved(body.assets || []);
    } catch {
      setSavedError("Network error — couldn't reach the server.");
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, [canSave]);

  const handleDelete = async (id: string) => {
    const previous = saved;
    setSaved((s) => s.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/design-assets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setSaved(previous); // rollback
      setSavedError("Couldn't delete — restored.");
    }
  };

  const proConfig = getTierConfig("pro");

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <PaletteIcon size={18} className="text-[#FFCC11]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Foundation</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Color System</h1>
        <p className="text-lg text-gray-400 max-w-2xl">
          Asgardian palettes, WCAG-compliant contrast pairs, and ramp generation. Build a brand
          system that&apos;s accessible by default.
        </p>
      </motion.div>

      {/* ── Default palettes ────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Default Palettes
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {DEFAULT_PALETTES.map((palette: DefaultPalette, idx) => (
            <motion.div
              key={palette.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <PaletteCard palette={palette} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Contrast checker (free) ─────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Tools
        </h2>
        <ContrastChecker />
      </section>

      {/* ── Ramp generator (free UI, Base+ to save) ─────── */}
      <section>
        <RampGenerator
          userTier={userTier}
          onRequestUpgrade={requestUpgrade}
          onSaved={loadSaved}
        />
      </section>

      {/* ── Saved palettes (Base+) ──────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            My Saved Palettes
          </h2>
          <div className="flex items-center gap-2">
            {canSave && (
              <button
                onClick={loadSaved}
                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-zinc-800/50 transition"
                aria-label="Refresh saved palettes"
              >
                <RefreshCw size={14} className={loadingSaved ? "animate-spin" : ""} />
              </button>
            )}
            <span className="text-xs text-gray-500">
              {canSave
                ? `${saved.length} saved · limit ${userTier === "elite" ? "∞" : userTier === "pro" ? 10 : 3}`
                : "Base+"}
            </span>
          </div>
        </div>

        {!canSave ? (
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-8 text-center">
            <Lock size={28} className="text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-3">
              Saving palettes is a Base feature.
            </p>
            <button
              onClick={() => requestUpgrade("Save Custom Palette", "base")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/25 transition"
            >
              Upgrade to Base
            </button>
          </div>
        ) : savedError ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-sm text-amber-200">
            {savedError}
          </div>
        ) : saved.length === 0 ? (
          <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
            <Sparkles size={24} className="text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No saved palettes yet. Generate one above and hit Save.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {saved.map((p) => (
              <SavedPaletteCard
                key={p.id}
                saved={p}
                onDelete={() => handleDelete(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Pro/Elite shell — OdinAI Color Architect ────── */}
      <section>
        <div
          className="relative overflow-hidden rounded-2xl border p-6 md:p-8"
          style={{
            backgroundColor: "rgba(15,23,42,0.4)",
            borderColor: `${proConfig.color}40`,
          }}
        >
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 80% 10%, ${proConfig.color}25 0%, transparent 50%)`,
            }}
          />
          <div className="relative">
            <div className="flex items-start gap-4 flex-wrap">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${proConfig.color}20`,
                  border: `1px solid ${proConfig.color}40`,
                }}
              >
                <Bot size={22} style={{ color: proConfig.color }} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-lg font-bold text-white">OdinAI Color Architect</h3>
                  <TierBadge tier="pro" size="sm" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFCC11]/15 text-[#FFCC11] border border-[#FFCC11]/30">
                    Coming with OdinAI
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-3">
                  Describe your brand in plain English. OdinAI returns a complete WCAG-validated
                  palette: full ramp, semantic colors (success/warn/error/info), and tested
                  text-on-bg pairs for every component context.
                </p>
                <ul className="space-y-1 text-xs text-gray-400">
                  {[
                    "Image-to-palette extraction (upload a logo or photo)",
                    "Live accessibility simulator (deuteranopia / protanopia / tritanopia)",
                    "CIELAB perceptual uniformity validation",
                    "20-component live preview before you commit",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <Wand2 size={11} className="text-[#FFCC11] shrink-0 mt-1" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal((s) => ({ ...s, isOpen: false }))}
        requiredTier={upgradeModal.requiredTier}
        featureName={upgradeModal.featureName}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* Saved palette display card (with delete button)        */
/* ─────────────────────────────────────────────────────── */
function SavedPaletteCard({
  saved,
  onDelete,
}: {
  saved: SavedPalette;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  // Reuse PaletteCard by adapting the shape
  const adapted: DefaultPalette = {
    id: "asgard-dark",
    name: saved.name,
    description: `Saved ${new Date(saved.created_at).toLocaleDateString()} — seed ${saved.config.seed} (${saved.config.mode})`,
    mode: saved.config.mode,
    seed: saved.config.seed,
    ramp: saved.config.ramp,
  };

  return (
    <div className="relative">
      <PaletteCard palette={adapted} />
      <button
        onClick={() => {
          if (confirming) {
            onDelete();
          } else {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 3000);
          }
        }}
        className={`absolute top-4 right-4 p-2 rounded-lg transition border ${
          confirming
            ? "bg-red-500/20 border-red-500/40 text-red-300"
            : "bg-zinc-900/80 border-zinc-700 text-gray-500 hover:text-red-400 hover:border-red-500/40"
        }`}
        aria-label={confirming ? "Confirm delete" : "Delete palette"}
        title={confirming ? "Click again to confirm" : "Delete"}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
