// app/(protected)/blocks/background-studio/page.tsx
// Background Studio — Phase C layered composer (REPLACES the previous 991-line
// single-preset previewer).
//
// Layered design model: stack of BackgroundLayer entries (solid/gradient/
// mesh-gradient/noise/particles/shapes/shader-preset), each independently
// configurable, with per-layer opacity + blend modes. Live preview, save to
// /api/design-assets, export to React/CSS/PNG/JSON.
"use client";

import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Save, Loader2, LockKeyhole, RefreshCw, RotateCcw, Sparkles,
  Wand2, Bot, Trash2,
} from "lucide-react";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";
import { TierBadge } from "@/components/Dashboards/TierBadge";
import {
  starterState,
  type StudioState,
  type BackgroundLayer,
} from "@/components/background-studio/studioTypes";
import { studioReducer, MAX_LAYERS } from "@/components/background-studio/studioReducer";
import { StudioCanvas } from "@/components/background-studio/StudioCanvas";
import { StudioLayerRail } from "@/components/background-studio/StudioLayerRail";
import { StudioInspector } from "@/components/background-studio/StudioInspector";
import { StudioExportMenu } from "@/components/background-studio/StudioExportMenu";
import { analytics } from "@/lib/analytics";

interface SavedBackgroundSet {
  id: string;
  name: string;
  config: StudioState;
  created_at: string;
}

export default function BackgroundStudioPage() {
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || "free";
  const canSave = hasAccess(userTier, "base");

  const [state, dispatch] = useReducer(studioReducer, undefined, () => starterState());
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mobileTab, setMobileTab] = useState<"layers" | "canvas" | "inspector">(
    "canvas"
  );

  const [saved, setSaved] = useState<SavedBackgroundSet[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: "base", featureName: "" });

  const activeLayer: BackgroundLayer | null = useMemo(
    () => state.layers.find((l) => l.id === state.activeLayerId) ?? null,
    [state.layers, state.activeLayerId]
  );

  const proConfig = getTierConfig("pro");
  const baseConfig = getTierConfig("base");

  /* ─ Saved sets ─────────────────────────────────────── */
  const loadSaved = async () => {
    if (!canSave) return;
    setLoadingSaved(true);
    try {
      const res = await fetch("/api/design-assets?type=background_set", {
        cache: "no-store",
      });
      if (res.ok) setSaved((await res.json()).assets || []);
    } catch {
      /* silent */
    } finally {
      setLoadingSaved(false);
    }
  };
  useEffect(() => {
    loadSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSave]);

  /* ─ Save handler ───────────────────────────────────── */
  const handleSave = async () => {
    if (!canSave) {
      setUpgradeModal({
        isOpen: true,
        requiredTier: "base",
        featureName: "Save Background Set",
      });
      analytics.upgradeClick({
        from_tier: userTier,
        required_tier: "base",
        feature: "Save Background Set",
      });
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      const config = {
        name: state.name,
        canvasAspect: state.canvasAspect,
        layers: state.layers,
        meta: { schemaVersion: state.schemaVersion },
      };
      const res = await fetch("/api/design-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_type: "background_set",
          name: state.name || "Untitled Background",
          config,
        }),
      });
      if (res.status === 403) {
        const body = await res.json();
        setSaveMsg({ kind: "err", text: body.error || "Tier limit reached." });
      } else if (!res.ok) {
        setSaveMsg({ kind: "err", text: "Couldn't save — try again." });
      } else {
        setSaveMsg({ kind: "ok", text: "Saved." });
        dispatch({ type: "MARK_SAVED" });
        loadSaved();
      }
    } catch {
      setSaveMsg({ kind: "err", text: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = (entry: SavedBackgroundSet) => {
    dispatch({
      type: "LOAD_STATE",
      state: {
        name: entry.name,
        canvasAspect: entry.config?.canvasAspect ?? "16/9",
        layers: entry.config?.layers ?? [],
        activeLayerId:
          entry.config?.layers?.[entry.config.layers.length - 1]?.id ?? null,
        schemaVersion: state.schemaVersion,
        dirty: false,
      },
    });
  };

  const handleDeleteSaved = async (id: string) => {
    const previous = saved;
    setSaved((s) => s.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/design-assets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setSaved(previous);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-3 flex-wrap"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 size={18} className="text-[#FFCC11]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Canvas
            </span>
            <TierBadge tier="pro" size="sm" />
          </div>
          <input
            type="text"
            value={state.name}
            onChange={(e) => dispatch({ type: "RENAME_STUDIO", name: e.target.value })}
            maxLength={80}
            className="w-full bg-transparent text-3xl md:text-4xl font-black text-white outline-none focus:bg-white/5 px-1 -mx-1 rounded transition"
            aria-label="Background name"
          />
          <p className="text-sm text-gray-500 mt-1">
            Compose layered backgrounds with up to {MAX_LAYERS} layers — gradients,
            mesh, noise, particles, shapes, and shader presets. Export to React, CSS,
            PNG, or JSON.
            {state.dirty && (
              <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-400">
                · unsaved
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <select
            value={state.canvasAspect}
            onChange={(e) =>
              dispatch({
                type: "SET_ASPECT",
                aspect: e.target.value as StudioState["canvasAspect"],
              })
            }
            className="px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-[#FFCC11]/40 transition cursor-pointer"
            aria-label="Canvas aspect ratio"
          >
            <option value="16/9">16:9 Landscape</option>
            <option value="1/1">1:1 Square</option>
            <option value="9/16">9:16 Portrait</option>
            <option value="4/3">4:3</option>
            <option value="21/9">21:9 Ultrawide</option>
          </select>
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-gray-300 hover:text-white hover:border-zinc-700 transition"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <StudioExportMenu state={state} canvasRef={canvasRef} />
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50"
            style={{
              backgroundColor: canSave ? "#FFCC11" : `${baseConfig.color}20`,
              color: canSave ? "#000" : baseConfig.color,
              border: canSave ? "none" : `1px solid ${baseConfig.color}40`,
            }}
          >
            {saving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : canSave ? (
              <Save size={12} />
            ) : (
              <LockKeyhole size={12} />
            )}
            {saving ? "Saving…" : canSave ? "Save" : "Save (Base+)"}
          </button>
          {saveMsg && (
            <span
              className={`text-[10px] ${saveMsg.kind === "ok" ? "text-[#10B981]" : "text-amber-400"}`}
            >
              {saveMsg.text}
            </span>
          )}
        </div>
      </motion.div>

      {/* ── Mobile tab switcher (visible < lg) ──────────── */}
      <div className="lg:hidden flex rounded-xl bg-zinc-950 border border-zinc-800 p-1">
        {(["layers", "canvas", "inspector"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMobileTab(t)}
            className={`flex-1 capitalize px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
              mobileTab === t ? "bg-[#FFCC11] text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Three-column layout ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-4">
        {/* LEFT — layer rail */}
        <div className={mobileTab === "layers" ? "block lg:block" : "hidden lg:block"}>
          <div className="lg:sticky lg:top-4">
            <StudioLayerRail
              layers={state.layers}
              activeId={state.activeLayerId}
              maxLayers={MAX_LAYERS}
              onAdd={(type) => dispatch({ type: "ADD_LAYER", layerType: type })}
              onSelect={(id) => dispatch({ type: "SELECT_LAYER", id })}
              onMove={(id, dir) => dispatch({ type: "MOVE_LAYER", id, dir })}
              onToggleVisible={(id) => dispatch({ type: "TOGGLE_VISIBLE", id })}
              onToggleLocked={(id) => dispatch({ type: "TOGGLE_LOCKED", id })}
              onDuplicate={(id) => dispatch({ type: "DUPLICATE_LAYER", id })}
              onRemove={(id) => dispatch({ type: "REMOVE_LAYER", id })}
            />
          </div>
        </div>

        {/* MIDDLE — canvas preview */}
        <div className={mobileTab === "canvas" ? "block lg:block" : "hidden lg:block"}>
          <StudioCanvas ref={canvasRef} state={state} />
        </div>

        {/* RIGHT — inspector */}
        <div className={mobileTab === "inspector" ? "block lg:block" : "hidden lg:block"}>
          <div className="lg:sticky lg:top-4">
            <StudioInspector
              layer={activeLayer}
              onPatch={(id, patch) =>
                dispatch({ type: "PATCH_LAYER", id, patch })
              }
              onRename={(id, name) =>
                dispatch({ type: "RENAME_LAYER", id, name })
              }
            />
          </div>
        </div>
      </div>

      {/* ── Saved sets ──────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            My Saved Backgrounds
          </h2>
          <div className="flex items-center gap-2">
            {canSave && (
              <button
                onClick={loadSaved}
                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-zinc-800/50 transition"
                aria-label="Refresh saved backgrounds"
              >
                <RefreshCw size={12} className={loadingSaved ? "animate-spin" : ""} />
              </button>
            )}
            <span className="text-[10px] text-gray-500">
              {canSave
                ? `${saved.length} saved · limit ${userTier === "elite" ? "∞" : userTier === "pro" ? 15 : 3}`
                : "Base+"}
            </span>
          </div>
        </div>

        {!canSave ? (
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6 text-center">
            <LockKeyhole size={20} className="text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-400">
              Saving backgrounds is a Base feature.
            </p>
          </div>
        ) : saved.length === 0 ? (
          <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl p-6 text-center">
            <Sparkles size={20} className="text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">
              No saved backgrounds yet — compose one and hit Save.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {saved.map((entry) => (
              <SavedSetCard
                key={entry.id}
                entry={entry}
                onLoad={() => handleLoad(entry)}
                onDelete={() => handleDeleteSaved(entry.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Pro/Elite OdinAI shell ──────────────────────── */}
      <section
        className="bg-linear-to-br from-zinc-900/50 via-black to-zinc-900/50 border rounded-2xl p-6 md:p-8 relative overflow-hidden"
        style={{ borderColor: `${proConfig.color}40` }}
      >
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 80% 10%, ${proConfig.color}25 0%, transparent 50%)`,
          }}
        />
        <div className="relative flex items-start gap-4 flex-wrap">
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
              <h3 className="text-lg font-bold text-white">OdinAI Background Generator</h3>
              <TierBadge tier="pro" size="sm" />
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFCC11]/15 text-[#FFCC11] border border-[#FFCC11]/30">
                Coming with OdinAI
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Describe the vibe — &ldquo;moody noir hero, gold particles drifting
              left to right, electric cyan accents&rdquo; — and OdinAI composes a
              full layered background to match. Then iterate on it like a
              chat-driven design partner.
            </p>
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

/* ── Saved set card ─────────────────────────────────────── */
function SavedSetCard({
  entry,
  onLoad,
  onDelete,
}: {
  entry: SavedBackgroundSet;
  onLoad: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  // Quick preview gradient from the first 1-2 layers (heuristic)
  const previewBg = useMemo(() => {
    const layers = entry.config?.layers ?? [];
    const first = layers.find((l) =>
      ["solid", "gradient", "mesh-gradient"].includes(l.type)
    );
    if (!first) return "linear-gradient(135deg, #020617, #1e293b)";
    if (first.type === "solid") return first.color;
    if (first.type === "gradient") {
      const stops = first.stops
        .map((s) => `${s.color} ${(s.offset * 100).toFixed(0)}%`)
        .join(", ");
      return `linear-gradient(${first.angleDeg}deg, ${stops})`;
    }
    if (first.type === "mesh-gradient") {
      const parts = first.anchors
        .map(
          (a) =>
            `radial-gradient(circle at ${(a.x * 100).toFixed(1)}% ${(a.y * 100).toFixed(1)}%, ${a.color} 0%, transparent ${(a.radius * 100).toFixed(1)}%)`
        )
        .join(", ");
      return `${parts}, ${first.fallback}`;
    }
    return "linear-gradient(135deg, #020617, #1e293b)";
  }, [entry.config]);

  return (
    <div className="relative group bg-zinc-900/40 border border-zinc-800/50 rounded-xl overflow-hidden hover:border-zinc-700 transition">
      <button
        onClick={onLoad}
        className="w-full text-left"
        aria-label={`Load ${entry.name}`}
      >
        <div className="aspect-video" style={{ background: previewBg }} />
        <div className="px-3 py-2">
          <div className="text-sm font-semibold text-white truncate">{entry.name}</div>
          <div className="text-[10px] text-gray-500 truncate mt-0.5">
            {entry.config?.layers?.length ?? 0} layers ·{" "}
            {new Date(entry.created_at).toLocaleDateString()}
          </div>
        </div>
      </button>
      <button
        onClick={() => {
          if (confirming) onDelete();
          else {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 3000);
          }
        }}
        className={`absolute top-2 right-2 p-1.5 rounded-md transition border ${
          confirming
            ? "bg-red-500/20 border-red-500/40 text-red-300"
            : "bg-zinc-900/80 border-zinc-700 text-gray-500 hover:text-red-400 hover:border-red-500/40 opacity-0 group-hover:opacity-100"
        }`}
        aria-label={confirming ? "Confirm delete" : "Delete"}
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}
