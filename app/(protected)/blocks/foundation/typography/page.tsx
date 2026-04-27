// app/(protected)/blocks/foundation/typography/page.tsx
// Typography page — Free: 30 curated font pairs with custom preview text
//                   Base+: scale generator + saved type systems
//                   Pro/Elite: OdinAI Font Stylist (shell — coming with OdinAI)
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Type as TypeIcon, Sparkles, Trash2, Bot, Wand2, Lock,
  RefreshCw, Filter,
} from "lucide-react";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";
import { TierBadge } from "@/components/Dashboards/TierBadge";
import { TypePairCard } from "@/components/foundation/TypePairCard";
import { ScaleGenerator } from "@/components/foundation/ScaleGenerator";
import {
  FONT_PAIRS,
  getAllTags,
  type FontPair,
  type ScaleRatio,
} from "@/lib/typeScale";

interface SavedTypeSystem {
  id: string;
  name: string;
  config: {
    display: string;
    body: string;
    mono?: string;
    ratio: ScaleRatio;
    basePx: number;
    lineHeight: number;
    letterSpacing: number;
  };
  created_at: string;
}

export default function TypographyPage() {
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || "free";
  const canSave = hasAccess(userTier, "base");

  const [previewText, setPreviewText] = useState("Whosoever holds this hammer");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedTypeSystem[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);

  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: "base", featureName: "" });

  const requestUpgrade = (featureName: string, requiredTier: TierName) =>
    setUpgradeModal({ isOpen: true, featureName, requiredTier });

  const allTags = useMemo(() => getAllTags(), []);
  const filteredPairs: FontPair[] = useMemo(() => {
    if (!activeTag) return FONT_PAIRS;
    return FONT_PAIRS.filter((p) => p.tags.includes(activeTag));
  }, [activeTag]);

  /* Load saved type systems */
  const loadSaved = async () => {
    if (!canSave) return;
    setLoadingSaved(true);
    setSavedError(null);
    try {
      const res = await fetch("/api/design-assets?type=type_system", {
        cache: "no-store",
      });
      if (!res.ok) {
        setSavedError("Couldn't load saved type systems — try again in a minute.");
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
      setSaved(previous);
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
          <TypeIcon size={18} className="text-[#FFCC11]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Foundation</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Typography</h1>
        <p className="text-lg text-gray-400 max-w-2xl">
          30 curated font pairs across moods. Modular type scale generator. Saved systems power
          your Tokens page.
        </p>
      </motion.div>

      {/* ── Custom preview text ─────────────────────────── */}
      <section>
        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
          Preview text
        </label>
        <input
          type="text"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          maxLength={120}
          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white outline-none focus:border-[#FFCC11]/40 transition"
          placeholder="Type anything to see it live across all 30 pairs"
        />
      </section>

      {/* ── Tag filters ────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Filter size={14} className="text-gray-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Filter by mood</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterButton label="All" active={!activeTag} onClick={() => setActiveTag(null)} />
          {allTags.map((tag) => (
            <FilterButton
              key={tag}
              label={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            />
          ))}
        </div>
      </section>

      {/* ── Pairs gallery ───────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Font Pairs
          </h2>
          <span className="text-xs text-gray-500">
            {filteredPairs.length} of {FONT_PAIRS.length}
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredPairs.map((pair) => (
            <TypePairCard key={pair.id} pair={pair} customText={previewText} />
          ))}
        </div>
      </section>

      {/* ── Scale generator ─────────────────────────────── */}
      <section>
        <ScaleGenerator
          userTier={userTier}
          onRequestUpgrade={requestUpgrade}
          onSaved={loadSaved}
        />
      </section>

      {/* ── Saved type systems ─────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            My Saved Type Systems
          </h2>
          <div className="flex items-center gap-2">
            {canSave && (
              <button
                onClick={loadSaved}
                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-zinc-800/50 transition"
                aria-label="Refresh saved type systems"
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
              Saving type systems is a Base feature.
            </p>
            <button
              onClick={() => requestUpgrade("Save Type System", "base")}
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
              No saved type systems yet. Build one above and hit Save.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {saved.map((s) => (
              <SavedTypeSystemCard key={s.id} item={s} onDelete={() => handleDelete(s.id)} />
            ))}
          </div>
        )}
      </section>

      {/* ── Pro/Elite shell ─────────────────────────────── */}
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
                  <h3 className="text-lg font-bold text-white">OdinAI Font Stylist</h3>
                  <TierBadge tier="pro" size="sm" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFCC11]/15 text-[#FFCC11] border border-[#FFCC11]/30">
                    Coming with OdinAI
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-3">
                  Describe your brand voice — &ldquo;editorial + tech,&rdquo; &ldquo;playful + bold,&rdquo;
                  &ldquo;minimalist authority.&rdquo; OdinAI returns 3 paired stacks with rationale,
                  contrast ratios, and a fallback chain.
                </p>
                <ul className="space-y-1 text-xs text-gray-400">
                  {[
                    "Variable font playground (axes — weight, optical size, slant)",
                    "Webfont self-hosting export (download .woff2 + @font-face CSS)",
                    "Reading-rhythm analysis (tested on real paragraphs)",
                    "Unlimited iterations to find the right voice",
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

/* ── Filter button ─────────────────────────────────────── */
function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full font-semibold uppercase tracking-wider transition ${
        active
          ? "bg-[#FFCC11] text-black"
          : "bg-zinc-800/60 text-gray-400 hover:bg-zinc-800 hover:text-white border border-zinc-700/50"
      }`}
    >
      {label}
    </button>
  );
}

/* ── Saved type system card ────────────────────────────── */
function SavedTypeSystemCard({
  item,
  onDelete,
}: {
  item: SavedTypeSystem;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="relative bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-white truncate">{item.name}</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Saved {new Date(item.created_at).toLocaleDateString()} · ratio {item.config.ratio} · {item.config.basePx}px base
          </p>
        </div>
        <button
          onClick={() => {
            if (confirming) {
              onDelete();
            } else {
              setConfirming(true);
              setTimeout(() => setConfirming(false), 3000);
            }
          }}
          className={`p-2 rounded-lg transition border ${
            confirming
              ? "bg-red-500/20 border-red-500/40 text-red-300"
              : "bg-zinc-900/80 border-zinc-700 text-gray-500 hover:text-red-400 hover:border-red-500/40"
          }`}
          aria-label={confirming ? "Confirm delete" : "Delete"}
          title={confirming ? "Click again to confirm" : "Delete"}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Display</div>
          <div className="text-2xl text-white truncate" style={{ fontFamily: item.config.display }}>
            {item.name}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Body</div>
          <div
            className="text-sm text-gray-300 truncate"
            style={{
              fontFamily: item.config.body,
              lineHeight: item.config.lineHeight,
              letterSpacing: `${item.config.letterSpacing}em`,
            }}
          >
            Asgardian-grade typography, forged in the heart of a dying star.
          </div>
        </div>
      </div>
    </div>
  );
}
