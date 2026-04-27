// app/(protected)/blocks/foundation/icons/page.tsx
// Icons page — Free: browse Lucide + Tabler curated set, search, filter,
//                    copy SVG / import / JSX snippets, size + stroke controls
//              Base+: custom shape builder (Phase 5 — coming soon stub)
//              Pro/Elite: OdinAI Icon Wizard (shell)
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Copy, Check, Filter, Bot, Wand2, X,
  Sparkles, Trash2, RefreshCw, Lock,
} from "lucide-react";
import { TierBadge } from "@/components/Dashboards/TierBadge";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { IconBuilder } from "@/components/foundation/IconBuilder";
import {
  ICON_REGISTRY,
  getIconCategories,
  searchIcons,
  getImportStatement,
  getJsxSnippet,
  type IconEntry,
  type IconLibrary,
} from "@/lib/iconRegistry";

const LIBRARIES: { id: IconLibrary | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "lucide", label: "Lucide" },
  { id: "tabler", label: "Tabler" },
];

interface SavedIcon {
  id: string;
  name: string;
  config: { svg: string; shapes: Array<{ type: string }> };
  created_at: string;
}

export default function IconsPage() {
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || "free";
  const canSave = hasAccess(userTier, "base");

  const [query, setQuery] = useState("");
  const [library, setLibrary] = useState<IconLibrary | "all">("all");
  const [category, setCategory] = useState<string | null>(null);
  const [size, setSize] = useState(24);
  const [stroke, setStroke] = useState(2);
  const [color, setColor] = useState("#FFCC11");
  const [active, setActive] = useState<IconEntry | null>(null);

  const [saved, setSaved] = useState<SavedIcon[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);

  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: "base", featureName: "" });

  const requestUpgrade = (featureName: string, requiredTier: TierName) =>
    setUpgradeModal({ isOpen: true, featureName, requiredTier });

  const categories = useMemo(() => getIconCategories(), []);
  const results = useMemo(
    () =>
      searchIcons(query, {
        library: library === "all" ? undefined : library,
        category: category ?? undefined,
      }),
    [query, library, category]
  );

  const loadSaved = async () => {
    if (!canSave) return;
    setLoadingSaved(true);
    setSavedError(null);
    try {
      const res = await fetch("/api/design-assets?type=icon", { cache: "no-store" });
      if (!res.ok) {
        setSavedError("Couldn't load saved icons — try again in a minute.");
        return;
      }
      const body = await res.json();
      setSaved(body.assets || []);
    } catch {
      setSavedError("Network error.");
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
    }
  };

  const proConfig = getTierConfig("pro");
  const baseConfig = getTierConfig("base");

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-[#FFCC11]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Foundation
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Icons</h1>
        <p className="text-lg text-gray-400 max-w-2xl">
          A curated library of Lucide and Tabler icons. Search, filter, preview at any size,
          copy SVG or React imports — all free. Custom builder &amp; AI wizard come with Pro.
        </p>
      </motion.div>

      {/* ── Search + filters ────────────────────────────── */}
      <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus-within:border-[#FFCC11]/40 transition">
          <Search size={16} className="text-gray-500 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, keyword, or category…"
            className="flex-1 bg-transparent text-sm text-white outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-500 hover:text-white transition">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Library tabs */}
          <div className="flex rounded-xl bg-zinc-950 border border-zinc-800 p-1">
            {LIBRARIES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLibrary(l.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  library === l.id ? "bg-[#FFCC11] text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Category dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-gray-500" />
            <select
              value={category ?? ""}
              onChange={(e) => setCategory(e.target.value || null)}
              className="rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-white outline-none focus:border-[#FFCC11]/40 transition"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Size slider */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Size</span>
            <input
              type="range"
              min={12}
              max={64}
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-24 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#FFCC11]
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FFCC11]"
            />
            <span className="text-[10px] font-mono text-gray-400 w-7 text-right">{size}px</span>
          </div>
          {/* Stroke (Lucide-style) */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Stroke</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.25}
              value={stroke}
              onChange={(e) => setStroke(parseFloat(e.target.value))}
              className="w-20 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#FFCC11]
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FFCC11]"
            />
            <span className="text-[10px] font-mono text-gray-400 w-9 text-right">{stroke.toFixed(2)}</span>
          </div>
          {/* Color picker */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Color</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value.toUpperCase())}
              className="w-8 h-7 rounded-md border border-zinc-700 cursor-pointer bg-transparent appearance-none
                [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none"
              aria-label="Icon color"
            />
          </div>
        </div>
      </section>

      {/* ── Icon grid ───────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Library
          </h2>
          <span className="text-xs text-gray-500">
            {results.length} of {ICON_REGISTRY.length}
          </span>
        </div>

        {results.length === 0 ? (
          <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-sm text-gray-500">
              No icons match. Try clearing filters or your query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2">
            {results.map((icon) => (
              <IconTile
                key={`${icon.library}-${icon.name}`}
                icon={icon}
                size={size}
                stroke={stroke}
                color={color}
                onClick={() => setActive(icon)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Custom Icon Builder (Base+) ─────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Custom Icon Builder
        </h2>
        <IconBuilder
          userTier={userTier}
          onRequestUpgrade={requestUpgrade}
          onSaved={loadSaved}
        />
      </section>

      {/* ── Saved icons (Base+) ─────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            My Saved Icons
          </h2>
          <div className="flex items-center gap-2">
            {canSave && (
              <button
                onClick={loadSaved}
                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-zinc-800/50 transition"
                aria-label="Refresh"
              >
                <RefreshCw size={14} className={loadingSaved ? "animate-spin" : ""} />
              </button>
            )}
            <span className="text-xs text-gray-500">
              {canSave
                ? `${saved.length} saved · limit ${userTier === "elite" ? "∞" : userTier === "pro" ? 25 : 5}`
                : "Base+"}
            </span>
          </div>
        </div>

        {!canSave ? (
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-8 text-center">
            <Lock size={28} className="text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-3">
              Saving custom icons is a Base feature.
            </p>
            <button
              onClick={() => requestUpgrade("Save Custom Icon", "base")}
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
              No saved icons yet. Compose one above and hit Save.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {saved.map((s) => (
              <SavedIconCard key={s.id} item={s} onDelete={() => handleDelete(s.id)} />
            ))}
          </div>
        )}
      </section>

      {/* ── Pro/Elite shell ─────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Pro / Elite
        </h2>

        {/* OdinAI Icon Wizard (Pro/Elite) */}
        <div
          className="relative overflow-hidden rounded-2xl border p-6 md:p-8"
          style={{ backgroundColor: "rgba(15,23,42,0.4)", borderColor: `${proConfig.color}40` }}
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
              style={{ backgroundColor: `${proConfig.color}20`, border: `1px solid ${proConfig.color}40` }}
            >
              <Bot size={22} style={{ color: proConfig.color }} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-lg font-bold text-white">OdinAI Icon Wizard</h3>
                <TierBadge tier="pro" size="sm" />
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFCC11]/15 text-[#FFCC11] border border-[#FFCC11]/30">
                  Coming with OdinAI
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                Describe an icon (&ldquo;a hammer striking lightning&rdquo;) — OdinAI returns 4 SVG
                variants composed from geometric primitives. Plus a logo design assistant: monogram
                generator, brand kit export, favicon set.
              </p>
              <ul className="space-y-1 text-xs text-gray-400">
                {[
                  "SVG-composition icons via Claude (no diffusion model)",
                  "Multi-icon scenes (up to 4 elements)",
                  "Logo design assistant + monogram generator",
                  "Brand kit export — icon + wordmark + favicon set + 1024×1024 social variants",
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
      </section>

      {/* ── Detail modal ────────────────────────────────── */}
      <AnimatePresence>
        {active && (
          <IconDetailModal
            icon={active}
            size={size}
            stroke={stroke}
            color={color}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal((s) => ({ ...s, isOpen: false }))}
        requiredTier={upgradeModal.requiredTier}
        featureName={upgradeModal.featureName}
      />
    </div>
  );
}

/* ── Saved-icon card ──────────────────────────────────── */
function SavedIconCard({ item, onDelete }: { item: SavedIcon; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(item.config.svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="group relative bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 hover:border-[#FFCC11]/30 transition">
      <div
        className="aspect-square bg-black/40 rounded-lg flex items-center justify-center mb-2 overflow-hidden"
        dangerouslySetInnerHTML={{ __html: item.config.svg }}
      />
      <div className="text-xs text-white font-semibold truncate">{item.name}</div>
      <div className="text-[9px] text-gray-500 mt-0.5">
        {item.config.shapes.length} layer{item.config.shapes.length === 1 ? "" : "s"}
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onCopy}
          className="p-1.5 rounded-md bg-zinc-900/90 border border-zinc-700 text-gray-400 hover:text-white hover:border-[#FFCC11]/40 transition"
          aria-label="Copy SVG"
          title="Copy SVG"
        >
          {copied ? <Check size={11} className="text-[#10B981]" /> : <Copy size={11} />}
        </button>
        <button
          onClick={() => {
            if (confirming) onDelete();
            else {
              setConfirming(true);
              setTimeout(() => setConfirming(false), 3000);
            }
          }}
          className={`p-1.5 rounded-md transition border ${
            confirming
              ? "bg-red-500/20 border-red-500/40 text-red-300"
              : "bg-zinc-900/90 border-zinc-700 text-gray-400 hover:text-red-400 hover:border-red-500/40"
          }`}
          aria-label="Delete"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

/* ── Single icon tile ─────────────────────────────────── */
function IconTile({
  icon,
  size,
  stroke,
  color,
  onClick,
}: {
  icon: IconEntry;
  size: number;
  stroke: number;
  color: string;
  onClick: () => void;
}) {
  const Component = icon.component as React.ComponentType<{
    size?: number;
    stroke?: number | string;
    color?: string;
    className?: string;
  }>;
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="aspect-square flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/50 hover:border-[#FFCC11]/30 hover:bg-zinc-900 transition group"
      title={`${icon.name} (${icon.library})`}
    >
      <Component size={size} stroke={stroke} color={color} />
      <span className="text-[9px] font-mono text-gray-500 group-hover:text-gray-300 truncate w-full text-center transition">
        {icon.name}
      </span>
    </motion.button>
  );
}

/* ── Detail modal ─────────────────────────────────────── */
function IconDetailModal({
  icon,
  size,
  stroke,
  color,
  onClose,
}: {
  icon: IconEntry;
  size: number;
  stroke: number;
  color: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const Component = icon.component as React.ComponentType<{
    size?: number;
    stroke?: number | string;
    color?: string;
    className?: string;
  }>;

  const importStmt = getImportStatement(icon);
  const jsxSnippet = getJsxSnippet(icon, size);

  const copy = (kind: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-32 h-32 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Component size={size * 2.5} stroke={stroke} color={color} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">{icon.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {icon.library === "lucide" ? "Lucide" : "Tabler"} · {icon.category}
            </p>
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {icon.keywords.map((k) => (
                <span
                  key={k}
                  className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800/80 text-gray-400 border border-zinc-700/50"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <CodeRow
            label="Import"
            code={importStmt}
            copied={copied === "import"}
            onCopy={() => copy("import", importStmt)}
          />
          <CodeRow
            label="JSX"
            code={jsxSnippet}
            copied={copied === "jsx"}
            onCopy={() => copy("jsx", jsxSnippet)}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function CodeRow({
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
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800/50">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded text-gray-400 hover:text-white hover:bg-zinc-800/50 transition"
        >
          {copied ? <Check size={11} className="text-[#10B981]" /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="text-xs font-mono text-gray-300 p-3 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}
