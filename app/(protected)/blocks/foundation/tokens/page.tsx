// app/(protected)/blocks/foundation/tokens/page.tsx
// Tokens page — Free: view default tokens (Asgard Dark / Light), copy values
//               Base+: compose with saved Color + Type, export, save token sets
//               Pro/Elite: OdinAI Token Generator (shell)
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Layers, Sparkles, Bot, Wand2, Lock, RefreshCw, Save, Loader2,
  LockKeyhole, Copy, Check, Trash2,
} from "lucide-react";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";
import { TierBadge } from "@/components/Dashboards/TierBadge";
import { TokenViewer } from "@/components/foundation/TokenViewer";
import {
  ASGARD_DARK,
  ASGARD_LIGHT,
  type TokenSet,
  exportToCss,
  exportToTailwind,
  exportToW3cJson,
} from "@/lib/defaultTokens";
import type { TokenSetConfig } from "@/lib/designAssets";

interface SavedColorPalette {
  id: string;
  name: string;
  config: { seed: string; mode: "dark" | "light"; ramp: Record<string, string> };
}
interface SavedTypeSystem {
  id: string;
  name: string;
  config: { display: string; body: string; mono?: string };
}
interface SavedTokenSet {
  id: string;
  name: string;
  config: TokenSetConfig;
  created_at: string;
}

type ThemeMode = "asgard-dark" | "asgard-light";

export default function TokensPage() {
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || "free";
  const canCompose = hasAccess(userTier, "base");

  const [activeMode, setActiveMode] = useState<ThemeMode>("asgard-dark");

  /* Composer state */
  const [palettes, setPalettes] = useState<SavedColorPalette[]>([]);
  const [typeSystems, setTypeSystems] = useState<SavedTypeSystem[]>([]);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>("");
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [name, setName] = useState("My Token Set");

  /* Saved token sets */
  const [saved, setSaved] = useState<SavedTokenSet[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: "base", featureName: "" });

  const requestUpgrade = (featureName: string, requiredTier: TierName) =>
    setUpgradeModal({ isOpen: true, featureName, requiredTier });

  const proConfig = getTierConfig("pro");
  const baseConfig = getTierConfig("base");

  /* Active token set: defaults, optionally overridden by composition */
  const baseSet: TokenSet = activeMode === "asgard-dark" ? ASGARD_DARK : ASGARD_LIGHT;

  const composedSet: TokenSet = useMemo(() => {
    if (!canCompose || (!selectedPaletteId && !selectedTypeId)) return baseSet;
    const palette = palettes.find((p) => p.id === selectedPaletteId);
    const typeSys = typeSystems.find((t) => t.id === selectedTypeId);

    const next: TokenSet = {
      ...baseSet,
      colors: { ...baseSet.colors },
      typography: { ...baseSet.typography },
    };

    if (palette) {
      // Replace gold/electric/surface tokens with the palette's seed + ramp
      next.colors = {
        ...next.colors,
        gold: palette.config.seed,
        "gold-bright": palette.config.ramp["400"] ?? next.colors["gold-bright"],
        "gold-deep": palette.config.ramp["700"] ?? next.colors["gold-deep"],
        "surface-1": palette.config.ramp[palette.config.mode === "dark" ? "100" : "50"] ?? next.colors["surface-1"],
        "surface-2": palette.config.ramp[palette.config.mode === "dark" ? "200" : "100"] ?? next.colors["surface-2"],
        "surface-3": palette.config.ramp[palette.config.mode === "dark" ? "300" : "200"] ?? next.colors["surface-3"],
      };
    }
    if (typeSys) {
      next.typography = {
        ...next.typography,
        display: typeSys.config.display,
        body: typeSys.config.body,
        mono: typeSys.config.mono ?? next.typography.mono,
      };
    }
    return next;
  }, [canCompose, selectedPaletteId, selectedTypeId, palettes, typeSystems, baseSet]);

  const isComposed = canCompose && (selectedPaletteId || selectedTypeId);

  /* Load saved palettes + type systems for composer */
  useEffect(() => {
    if (!canCompose) return;
    (async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          fetch("/api/design-assets?type=color_palette", { cache: "no-store" }),
          fetch("/api/design-assets?type=type_system", { cache: "no-store" }),
        ]);
        if (pRes.ok) setPalettes((await pRes.json()).assets || []);
        if (tRes.ok) setTypeSystems((await tRes.json()).assets || []);
      } catch {
        /* silent — composer just shows "no saved" state */
      }
    })();
  }, [canCompose]);

  /* Load saved token sets */
  const loadSaved = async () => {
    if (!canCompose) return;
    setLoadingSaved(true);
    setSavedError(null);
    try {
      const res = await fetch("/api/design-assets?type=token_set", { cache: "no-store" });
      if (!res.ok) {
        setSavedError("Couldn't load saved token sets — try again in a minute.");
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
  }, [canCompose]);

  const handleSave = async () => {
    if (!canCompose) {
      requestUpgrade("Save Token Set", "base");
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      const config: TokenSetConfig = {
        themeMode: activeMode,
        colorPaletteId: selectedPaletteId || undefined,
        typeSystemId: selectedTypeId || undefined,
      };
      const res = await fetch("/api/design-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_type: "token_set",
          name: name || "Untitled Token Set",
          config,
        }),
      });
      if (res.status === 403) {
        const body = await res.json();
        setSaveMessage({ kind: "err", text: body.error || "Tier limit reached." });
      } else if (!res.ok) {
        setSaveMessage({
          kind: "err",
          text: "Couldn't save right now — saving is temporarily unavailable.",
        });
      } else {
        setSaveMessage({ kind: "ok", text: "Saved." });
        loadSaved();
      }
    } catch {
      setSaveMessage({ kind: "err", text: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
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
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Layers size={18} className="text-[#FFCC11]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Foundation</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Design Tokens</h1>
        <p className="text-lg text-gray-400 max-w-2xl">
          The unified system — colors, spacing, typography, motion — that powers every MjolnirUI
          component. Compose your own from saved Color palettes and Type systems.
        </p>
      </motion.div>

      {/* ── Mode toggle ─────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Theme mode
          </h2>
          <span className="text-[10px] font-mono text-gray-600 uppercase">
            {isComposed ? "Composed" : "Default"}
          </span>
        </div>
        <div className="inline-flex rounded-xl bg-zinc-950 border border-zinc-800 p-1">
          {([
            { id: "asgard-dark", label: "Asgard Dark" },
            { id: "asgard-light", label: "Asgard Light" },
          ] as const).map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                activeMode === m.id ? "bg-[#FFCC11] text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Composer (Base+) ────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Compose
          </h2>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
            style={{
              backgroundColor: `${baseConfig.color}20`,
              color: baseConfig.color,
              border: `1px solid ${baseConfig.color}40`,
            }}
          >
            Base+ to compose &amp; save
          </span>
        </div>

        {!canCompose ? (
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 text-center">
            <Lock size={24} className="text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-3">
              Compose your own tokens from saved palettes + type systems.
            </p>
            <button
              onClick={() => requestUpgrade("Compose Token Set", "base")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/25 transition"
            >
              Upgrade to Base
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Color palette
                </label>
                <select
                  value={selectedPaletteId}
                  onChange={(e) => setSelectedPaletteId(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-[#FFCC11]/40 transition"
                >
                  <option value="">— Use default —</option>
                  {palettes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {palettes.length === 0 && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    No saved palettes — head to /blocks/foundation/colors
                  </p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Type system
                </label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-[#FFCC11]/40 transition"
                >
                  <option value="">— Use default —</option>
                  {typeSystems.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {typeSystems.length === 0 && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    No saved type systems — head to /blocks/foundation/typography
                  </p>
                )}
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
                  placeholder="My Token Set"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#FFCC11] text-black transition disabled:opacity-50 disabled:cursor-wait"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving…" : "Save Token Set"}
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
        )}
      </section>

      {/* ── Token viewer (live) ─────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Live tokens {isComposed ? "(composed)" : ""}
        </h2>
        <TokenViewer set={composedSet} badge={isComposed ? "Composed" : undefined} />
      </section>

      {/* ── Export panels ───────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Export
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <ExportBlock label="globals.css" code={exportToCss(composedSet)} />
          <ExportBlock label="Tailwind config" code={exportToTailwind(composedSet)} />
          <ExportBlock label="W3C tokens.json" code={exportToW3cJson(composedSet)} />
        </div>
      </section>

      {/* ── Saved token sets ────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            My Saved Token Sets
          </h2>
          <div className="flex items-center gap-2">
            {canCompose && (
              <button
                onClick={loadSaved}
                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-zinc-800/50 transition"
                aria-label="Refresh"
              >
                <RefreshCw size={14} className={loadingSaved ? "animate-spin" : ""} />
              </button>
            )}
            <span className="text-xs text-gray-500">
              {canCompose
                ? `${saved.length} saved · limit ${userTier === "elite" ? "∞" : userTier === "pro" ? 10 : 3}`
                : "Base+"}
            </span>
          </div>
        </div>

        {!canCompose ? null : savedError ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-sm text-amber-200">
            {savedError}
          </div>
        ) : saved.length === 0 ? (
          <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
            <Sparkles size={24} className="text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No saved token sets yet. Compose above and hit Save.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {saved.map((s) => (
              <SavedTokenCard key={s.id} item={s} onDelete={() => handleDelete(s.id)} />
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
                  <h3 className="text-lg font-bold text-white">OdinAI Token Generator</h3>
                  <TierBadge tier="pro" size="sm" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFCC11]/15 text-[#FFCC11] border border-[#FFCC11]/30">
                    Coming with OdinAI
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-3">
                  Describe your brand. OdinAI generates a complete token system —
                  WCAG-validated colors, paired typography, spacing scale, motion
                  curves — in 30 seconds. One click to apply across all components.
                </p>
                <ul className="space-y-1 text-xs text-gray-400">
                  {[
                    "Brand-to-tokens generation in plain English",
                    "Round-trip with Figma tokens (import/export)",
                    "Auto-generate Light variant from Dark",
                    "20-component live preview before commit",
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

/* ── Reusable export block ────────────────────────────── */
function ExportBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
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
      <pre className="text-[10px] font-mono text-gray-300 p-4 overflow-x-auto max-h-72 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ── Saved token-set card ─────────────────────────────── */
function SavedTokenCard({
  item,
  onDelete,
}: {
  item: SavedTokenSet;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-base font-bold text-white truncate">{item.name}</h3>
        <p className="text-[11px] text-gray-500 mt-1">
          {item.config.themeMode} · saved {new Date(item.created_at).toLocaleDateString()}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {item.config.colorPaletteId && (
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800/80 text-gray-400 border border-zinc-700/50">
              palette
            </span>
          )}
          {item.config.typeSystemId && (
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800/80 text-gray-400 border border-zinc-700/50">
              type
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => {
          if (confirming) onDelete();
          else {
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
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
