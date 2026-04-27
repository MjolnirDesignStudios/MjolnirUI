// app/components/foundation/TypePairCard.tsx
// Renders one font pair with live preview and lazy Google Fonts loading.
// Click to copy <link> tag and CSS font-family.
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Type as TypeIcon } from "lucide-react";
import type { FontPair } from "@/lib/typeScale";

/* Lazy-load Google Fonts: append a <link> to <head> on first mount,
   one per unique URL — avoids loading 30 stylesheets up front. */
const loadedUrls = new Set<string>();

function loadGoogleFont(url: string | undefined) {
  if (typeof window === "undefined" || !url) return;
  if (loadedUrls.has(url)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
  loadedUrls.add(url);
}

export function TypePairCard({
  pair,
  customText,
}: {
  pair: FontPair;
  customText?: string;
}) {
  useEffect(() => {
    loadGoogleFont(pair.display.googleFontsUrl);
    loadGoogleFont(pair.body.googleFontsUrl);
    loadGoogleFont(pair.mono?.googleFontsUrl);
  }, [pair]);

  const headline = customText?.trim() || "Whosoever holds this hammer";
  const body =
    "If he be worthy, shall possess the power of Thor. Forged in the heart of a dying star — Asgardian tech, built for builders.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 hover:border-[#FFCC11]/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FFCC11]/10 border border-[#FFCC11]/20 flex items-center justify-center shrink-0">
            <TypeIcon size={18} className="text-[#FFCC11]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white truncate">{pair.name}</h3>
            <p className="text-xs text-gray-500 truncate">{pair.description}</p>
          </div>
        </div>
        {pair.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {pair.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800/80 text-gray-400 border border-zinc-700/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Live preview */}
      <div className="space-y-3 mb-5">
        <div
          className="text-3xl md:text-4xl text-white leading-tight"
          style={{ fontFamily: pair.display.family, fontWeight: pair.display.weight ?? 700 }}
        >
          {headline}
        </div>
        <div
          className="text-sm text-gray-300 leading-relaxed"
          style={{ fontFamily: pair.body.family, fontWeight: pair.body.weight ?? 400 }}
        >
          {body}
        </div>
        {pair.mono && (
          <div
            className="text-xs text-gray-500 mt-2"
            style={{ fontFamily: pair.mono.family }}
          >
            const odin = forge(thor)<span className="text-[#FFCC11]">.deploy()</span>
          </div>
        )}
      </div>

      {/* Font names + copy actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-zinc-800/50">
        <FontInfo
          label="Display"
          name={pair.display.name}
          family={pair.display.family}
          url={pair.display.googleFontsUrl}
        />
        <FontInfo
          label="Body"
          name={pair.body.name}
          family={pair.body.family}
          url={pair.body.googleFontsUrl}
        />
      </div>
    </motion.div>
  );
}

/* ── Per-font info row with copy actions ──────────────── */
function FontInfo({
  label,
  name,
  family,
  url,
}: {
  label: string;
  name: string;
  family: string;
  url?: string;
}) {
  const [copied, setCopied] = useState<"family" | "link" | null>(null);

  const copy = (kind: "family" | "link", value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1200);
  };

  const linkTag = url
    ? `<link rel="stylesheet" href="${url}" />`
    : `/* ${name} is bundled with the project */`;

  return (
    <div>
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-sm text-white font-semibold mb-1">{name}</div>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => copy("family", family)}
          className="text-[10px] font-mono px-2 py-1 rounded-md bg-zinc-800/60 hover:bg-zinc-800 text-gray-400 hover:text-white transition flex items-center gap-1"
        >
          {copied === "family" ? <Check size={10} className="text-[#10B981]" /> : <Copy size={10} />}
          font-family
        </button>
        <button
          onClick={() => copy("link", linkTag)}
          disabled={!url}
          className="text-[10px] font-mono px-2 py-1 rounded-md bg-zinc-800/60 hover:bg-zinc-800 text-gray-400 hover:text-white transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied === "link" ? <Check size={10} className="text-[#10B981]" /> : <Copy size={10} />}
          {url ? "<link>" : "bundled"}
        </button>
      </div>
    </div>
  );
}
