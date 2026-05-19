// app/components/layout/LayoutCard.tsx
// Card in the Layout galleries. Themed gradient placeholder + name +
// description + tags. Click opens the LayoutPreviewModal for the live render
// and copy-code experience.
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Flame, LockKeyhole, Eye } from "lucide-react";
import type { LayoutCatalogEntry } from "./layoutCatalog";
import { TIER_CONFIG, type TierName, hasAccess } from "@/lib/tierConfig";

interface LayoutCardProps {
  entry: LayoutCatalogEntry;
  userTier: TierName;
  onOpen: (entry: LayoutCatalogEntry) => void;
  onUpgrade: (requiredTier: TierName, featureName: string) => void;
}

export function LayoutCard({ entry, userTier, onOpen, onUpgrade }: LayoutCardProps) {
  const isLocked = !hasAccess(userTier, entry.requiredTier);
  const tier = TIER_CONFIG[entry.requiredTier];
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) {
      onUpgrade(entry.requiredTier, entry.name);
      return;
    }
    navigator.clipboard.writeText(entry.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      onClick={() => onOpen(entry)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 25px ${tier.color}40, 0 0 50px ${tier.color}15`;
        e.currentTarget.style.borderColor = `${tier.color}60`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "";
      }}
      className="group relative text-left rounded-2xl border border-zinc-800/50 bg-zinc-950 hover:bg-zinc-900/60 overflow-hidden transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Preview area */}
      <div
        className="relative h-40 overflow-hidden"
        style={{ background: entry.gradient }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${tier.color}30 0%, transparent 70%)`,
          }}
        />

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-sm"
            style={{
              backgroundColor: `${tier.color}30`,
              color: tier.color,
              border: `1px solid ${tier.color}50`,
            }}
          >
            {entry.requiredTier}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {entry.isNew && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#00f0ff]/30 text-[#00f0ff] border border-[#00f0ff]/50 backdrop-blur-sm">
              New
            </span>
          )}
          {entry.isPopular && (
            <span
              className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/30 border border-orange-500/50 backdrop-blur-sm"
              title="Popular"
            >
              <Flame size={11} className="text-orange-300" />
            </span>
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 border border-white/20 text-xs font-semibold text-white backdrop-blur-md">
            <Eye size={12} /> Preview &amp; code
          </div>
        </div>
      </div>

      {/* Info area */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-sm text-white truncate">{entry.name}</h3>
          {isLocked && <LockKeyhole size={12} className="text-gray-500 shrink-0" />}
        </div>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed flex-1">
          {entry.description}
        </p>

        <div className="flex items-center gap-1 flex-wrap">
          {entry.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-zinc-900 text-gray-400 border border-zinc-800"
            >
              {t}
            </span>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className={`mt-2 w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-[11px] font-mono transition ${
            isLocked
              ? "bg-zinc-900/50 border-zinc-800/50 text-gray-600 hover:border-zinc-700"
              : "bg-zinc-900 border-zinc-800 text-gray-300 hover:text-white hover:border-zinc-600"
          }`}
        >
          <span className="truncate">Copy code</span>
          {isLocked ? (
            <LockKeyhole size={11} style={{ color: tier.color }} className="shrink-0" />
          ) : copied ? (
            <Check size={11} className="text-[#10B981] shrink-0" />
          ) : (
            <Copy size={11} className="shrink-0 opacity-60" />
          )}
        </button>
      </div>
    </motion.button>
  );
}
