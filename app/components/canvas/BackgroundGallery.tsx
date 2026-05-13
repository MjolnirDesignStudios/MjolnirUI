// app/components/canvas/BackgroundGallery.tsx
// Reusable gallery used by both /canvas/backgrounds and /canvas/shaders.
// Filters the catalog by bucket, drives card grid + tier filter + preview modal.
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Search, Filter, Sparkles } from "lucide-react";
import { hasAccess, TIER_CONFIG, type TierName } from "@/lib/tierConfig";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";
import { BackgroundCard } from "./BackgroundCard";
import { BackgroundPreviewModal } from "./BackgroundPreviewModal";
import {
  BACKGROUND_CATALOG,
  type CatalogEntry,
} from "./backgroundCatalog";
import { analytics, TOOL_SLUGS } from "@/lib/analytics";

type SortMode = "default" | "name" | "tier" | "popular";
type TierFilter = "all" | TierName;

interface BackgroundGalleryProps {
  bucket: "simple" | "shader";
  /** Hero header */
  title: string;
  description: string;
  /** Analytics slug for tool_open events */
  toolSlug: string;
}

const TIER_ORDER: Record<string, number> = { free: 0, base: 1, pro: 2, elite: 3 };

export function BackgroundGallery({
  bucket,
  title,
  description,
  toolSlug,
}: BackgroundGalleryProps) {
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || "free";

  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [sortBy, setSortBy] = useState<SortMode>("default");

  const [activeEntry, setActiveEntry] = useState<CatalogEntry | null>(null);
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: "base", featureName: "" });

  // Fire tool_open on first mount with the page's tool slug
  useEffect(() => {
    analytics.toolOpen({ tool: toolSlug });
  }, [toolSlug]);

  // Slice the catalog for this bucket
  const bucketEntries = useMemo(
    () => BACKGROUND_CATALOG.filter((e) => e.bucket === bucket),
    [bucket]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = bucketEntries;
    if (q) {
      rows = rows.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.tech.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (tierFilter !== "all") {
      rows = rows.filter((e) => e.requiredTier === tierFilter);
    }
    if (sortBy === "name") {
      rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "tier") {
      rows = [...rows].sort(
        (a, b) => (TIER_ORDER[a.requiredTier] ?? 0) - (TIER_ORDER[b.requiredTier] ?? 0)
      );
    } else if (sortBy === "popular") {
      rows = [...rows].sort(
        (a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0)
      );
    }
    return rows;
  }, [bucketEntries, search, tierFilter, sortBy]);

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of bucketEntries) {
      counts[e.requiredTier] = (counts[e.requiredTier] || 0) + 1;
    }
    return counts;
  }, [bucketEntries]);

  const handleOpen = (entry: CatalogEntry) => {
    setActiveEntry(entry);
    analytics.componentClick({
      component_id: entry.id,
      category: entry.bucket === "shader" ? "shader" : "backgrounds",
      required_tier: entry.requiredTier,
    });
  };

  const handleUpgrade = (requiredTier: TierName, featureName: string) => {
    setUpgradeModal({ isOpen: true, requiredTier, featureName });
    analytics.upgradeClick({
      from_tier: userTier,
      required_tier: requiredTier,
      feature: featureName,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-[#FFCC11]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Canvas
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">{title}</h1>
        <p className="text-base text-gray-400 max-w-2xl leading-relaxed">{description}</p>
      </motion.div>

      {/* ── Search + filters ────────────────────────────── */}
      <div className="flex items-stretch gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus-within:border-[#FFCC11]/40 transition flex-1 min-w-[240px]">
          <Search size={14} className="text-gray-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search backgrounds by name, tag, or tech…"
            className="bg-transparent text-sm text-white outline-none w-full"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortMode)}
          className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#FFCC11]/40 cursor-pointer"
        >
          <option value="default">Curated</option>
          <option value="popular">Popular first</option>
          <option value="name">A → Z</option>
          <option value="tier">By tier</option>
        </select>
      </div>

      {/* Tier pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={12} className="text-gray-500 mr-1" />
        {(["all", "free", "base", "pro", "elite"] as const).map((t) => {
          const config = t === "all" ? null : TIER_CONFIG[t];
          const count = t === "all" ? bucketEntries.length : tierCounts[t] || 0;
          return (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition border"
              style={
                tierFilter === t
                  ? config
                    ? {
                        backgroundColor: `${config.color}20`,
                        color: config.color,
                        borderColor: `${config.color}50`,
                      }
                    : {
                        backgroundColor: "rgba(255,255,255,0.10)",
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.20)",
                      }
                  : {
                      backgroundColor: "transparent",
                      color: "#9ca3af",
                      borderColor: "rgba(63,63,70,0.6)",
                    }
              }
            >
              {t === "all" ? `All (${bucketEntries.length})` : `${t} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Showing <span className="text-white font-bold">{filtered.length}</span> of{" "}
          <span className="text-white">{bucketEntries.length}</span>
        </p>
      </div>

      {/* ── Card grid ───────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-12 text-center">
          <Sparkles size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No backgrounds match. Try clearing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((entry) => (
            <BackgroundCard
              key={entry.id}
              entry={entry}
              userTier={userTier}
              onOpen={handleOpen}
              onUpgrade={handleUpgrade}
            />
          ))}
        </div>
      )}

      {/* ── Live preview modal ──────────────────────────── */}
      <BackgroundPreviewModal
        entry={activeEntry}
        userTier={userTier}
        onClose={() => setActiveEntry(null)}
      />

      {/* ── Upgrade modal ───────────────────────────────── */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal((prev) => ({ ...prev, isOpen: false }))}
        requiredTier={upgradeModal.requiredTier}
        featureName={upgradeModal.featureName}
      />
    </div>
  );
}
