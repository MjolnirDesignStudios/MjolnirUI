// Component Browser — React Bits-style browseable component library
// Sidebar: category filters, search, tier filter
// Main: component cards with live preview thumbnails, tier badges, tech tags
"use client";
import React, { useState, useMemo, Suspense, lazy } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Grid3X3, List, LockKeyhole, Flame, Sparkles,
  Copy, Check, ExternalLink, ChevronDown, X,
  Image as ImageIcon, Zap, Box, Layers, MousePointer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";
import {
  COMPONENT_REGISTRY,
  TOTAL_COMPONENTS,
  type ComponentMeta,
  type ComponentCategory,
} from "@/lib/componentRegistry";

/* ── Category metadata ───────────────────────────────── */
const CATEGORY_META: Record<ComponentCategory, { label: string; icon: React.ReactNode; count: number }> = {
  backgrounds: { label: "Backgrounds", icon: <ImageIcon size={16} />, count: COMPONENT_REGISTRY.filter(c => c.category === "backgrounds").length },
  animations: { label: "Animations", icon: <Zap size={16} />, count: COMPONENT_REGISTRY.filter(c => c.category === "animations").length },
  ui: { label: "UI Components", icon: <MousePointer size={16} />, count: COMPONENT_REGISTRY.filter(c => c.category === "ui").length },
  "3d": { label: "3D & WebGL", icon: <Box size={16} />, count: COMPONENT_REGISTRY.filter(c => c.category === "3d").length },
};

/* ── Tech badge colors ───────────────────────────────── */
const TECH_COLORS: Record<string, string> = {
  css: "#3B82F6",
  canvas: "#10B981",
  three: "#EAB308",
  ogl: "#8B5CF6",
  glsl: "#F97316",
  "framer-motion": "#EC4899",
  gsap: "#22C55E",
  r3f: "#06B6D4",
  tsparticles: "#6366F1",
  postprocessing: "#F43F5E",
};

/* ── Component Card ──────────────────────────────────── */
function ComponentCard({
  component,
  userTier,
  onSelect,
  onUpgrade,
}: {
  component: ComponentMeta;
  userTier: TierName;
  onSelect: (c: ComponentMeta) => void;
  onUpgrade: (tier: TierName, name: string) => void;
}) {
  const isLocked = !hasAccess(userTier, component.requiredTier);
  const tierConfig = getTierConfig(component.requiredTier);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cmd = `npx mjolnirui add ${component.id}`;
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClick = () => {
    onSelect(component);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      layout
      className="group relative rounded-2xl border border-zinc-800/50 bg-zinc-950 hover:border-zinc-600/50 transition-all duration-300 cursor-pointer overflow-hidden"
      style={{
        ["--glow" as string]: tierConfig.color,
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 25px ${tierConfig.color}50, 0 0 50px ${tierConfig.color}30, 0 0 80px ${tierConfig.color}15`;
        e.currentTarget.style.borderColor = `${tierConfig.color}60`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "";
      }}
    >
      {/* Preview area — always fully visible so free users see the power */}
      <div className="h-36 relative overflow-hidden rounded-t-2xl"
        style={{
          background: `linear-gradient(135deg, ${tierConfig.color}08 0%, #020617 50%, ${tierConfig.color}05 100%)`,
        }}
      >
        {/* Decorative gradient orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${tierConfig.color}60 0%, transparent 70%)`, filter: "blur(20px)" }} />
        </div>

        {/* Component name as watermark */}
        <div className="absolute bottom-3 left-4 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
          {component.id}
        </div>

        {/* Badges — top right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {component.isNew && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30">
              New
            </span>
          )}
          {component.isPopular && (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30" title="Popular">
              <Flame size={12} className="text-orange-400" />
            </span>
          )}
        </div>

        {/* Tier badge — top left, always visible as colored indicator */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-sm"
            style={{
              backgroundColor: `${tierConfig.color}20`,
              color: tierConfig.color,
              border: `1px solid ${tierConfig.color}40`,
            }}>
            {component.requiredTier}
          </span>
        </div>
      </div>

      {/* Info area */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-bold text-sm text-white">
            {component.name}
          </h3>
        </div>
        <p className="text-xs mb-3 line-clamp-2 text-gray-400">
          {component.description}
        </p>

        {/* Tech tags */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {component.tech.map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase"
              style={{
                backgroundColor: `${TECH_COLORS[t] || "#666"}15`,
                color: TECH_COLORS[t] || "#666",
                border: `1px solid ${TECH_COLORS[t] || "#666"}30`,
              }}>
              {t}
            </span>
          ))}
        </div>

        {/* Install command — visible to all, copy gated by tier */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isLocked) {
              onUpgrade(component.requiredTier, component.name);
            } else {
              handleCopy(e);
            }
          }}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-[11px] font-mono transition-colors group/copy",
            isLocked
              ? "bg-zinc-900/50 border-zinc-800/50 text-gray-600 hover:border-zinc-700"
              : "bg-zinc-900 border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-600"
          )}
        >
          <span className="truncate">npx mjolnirui add {component.id}</span>
          {isLocked ? (
            <LockKeyhole size={12} className="shrink-0 ml-2" style={{ color: tierConfig.color }} />
          ) : copied ? (
            <Check size={12} className="text-green-400 shrink-0 ml-2" />
          ) : (
            <Copy size={12} className="shrink-0 ml-2 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
          )}
        </button>
      </div>
    </motion.div>
  );
}


/* ═══════════════════════════════════════════════════════
   MAIN BROWSER PAGE
   ═══════════════════════════════════════════════════════ */
export default function ComponentBrowserPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userTier = (session?.user?.tier as TierName) || "free";

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | "all">("all");
  const [activeTier, setActiveTier] = useState<TierName | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "tier" | "popular">("popular");

  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: "base", featureName: "" });

  /* ── Filter + sort ─────────────────────────────────── */
  const filtered = useMemo(() => {
    let result = [...COMPONENT_REGISTRY];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.id.includes(q) ||
          c.tech.some((t) => t.includes(q))
      );
    }

    // Category
    if (activeCategory !== "all") {
      result = result.filter((c) => c.category === activeCategory);
    }

    // Tier
    if (activeTier !== "all") {
      result = result.filter((c) => c.requiredTier === activeTier);
    }

    // Sort
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "tier") {
      const tierOrder: Record<TierName, number> = { free: 0, base: 1, pro: 2, elite: 3 };
      result.sort((a, b) => tierOrder[a.requiredTier] - tierOrder[b.requiredTier]);
    } else {
      // Popular first, then new, then alphabetical
      result.sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return result;
  }, [search, activeCategory, activeTier, sortBy]);

  const handleSelect = (c: ComponentMeta) => {
    router.push(`/blocks/browse/${c.id}`);
  };

  const handleUpgrade = (tier: TierName, name: string) => {
    setUpgradeModal({ isOpen: true, requiredTier: tier, featureName: name });
  };

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { all: TOTAL_COMPONENTS };
    COMPONENT_REGISTRY.forEach((c) => {
      counts[c.requiredTier] = (counts[c.requiredTier] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="h-full overflow-y-auto px-6 md:px-10 lg:px-14 py-8"
      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-black text-white">Component Library</h1>
          <span className="px-2.5 py-1 rounded-full bg-[#FFCC11]/10 text-[#FFCC11] text-sm font-bold border border-[#FFCC11]/20">
            {TOTAL_COMPONENTS}
          </span>
        </div>
        <p className="text-gray-400">
          Browse, preview, and install premium components. Each one is copy/paste ready or installable via CLI.
        </p>
      </div>

      {/* Search + Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components... (e.g. 'bifrost', 'glsl', 'lightning')"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#FFCC11]/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "name" | "tier" | "popular")}
          className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-[#FFCC11]/50 cursor-pointer"
        >
          <option value="popular">Popular First</option>
          <option value="name">A — Z</option>
          <option value="tier">By Tier</option>
        </select>
      </div>

      {/* Category + Tier Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Category pills */}
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
            activeCategory === "all"
              ? "bg-white/10 text-white border border-white/20"
              : "bg-zinc-900 text-gray-400 border border-zinc-800 hover:text-white"
          )}
        >
          All ({TOTAL_COMPONENTS})
        </button>
        {(Object.entries(CATEGORY_META) as [ComponentCategory, typeof CATEGORY_META["backgrounds"]][]).map(
          ([key, meta]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                activeCategory === key
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-zinc-900 text-gray-400 border border-zinc-800 hover:text-white"
              )}
            >
              {meta.icon}
              {meta.label} ({meta.count})
            </button>
          )
        )}

        <div className="w-px h-8 bg-zinc-800 mx-1 self-center" />

        {/* Tier pills */}
        {(["all", "free", "base", "pro", "elite"] as const).map((tier) => {
          const config = tier === "all" ? null : getTierConfig(tier);
          return (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                activeTier === tier
                  ? "text-white border"
                  : "bg-zinc-900 text-gray-500 border border-zinc-800 hover:text-gray-300"
              )}
              style={
                activeTier === tier && config
                  ? { borderColor: `${config.color}50`, backgroundColor: `${config.color}15`, color: config.color }
                  : activeTier === tier
                    ? { borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.1)" }
                    : undefined
              }
            >
              {tier === "all" ? `All` : `${tier} (${tierCounts[tier] || 0})`}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          Showing <span className="text-white font-bold">{filtered.length}</span> of{" "}
          <span className="text-white">{TOTAL_COMPONENTS}</span> components
        </p>
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              userTier={userTier}
              onSelect={handleSelect}
              onUpgrade={handleUpgrade}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Sparkles size={40} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-400 mb-2">No components found</h3>
          <p className="text-sm text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal((prev) => ({ ...prev, isOpen: false }))}
        requiredTier={upgradeModal.requiredTier}
        featureName={upgradeModal.featureName}
      />
    </div>
  );
}
