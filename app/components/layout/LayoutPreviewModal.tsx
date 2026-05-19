// app/components/layout/LayoutPreviewModal.tsx
// Modal opened from a LayoutCard. Renders the live preview component (dynamic
// import) + the copy-to-clipboard code block. Locked users see a blurred
// preview + upgrade CTA.
"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, LockKeyhole, ExternalLink, Code2 } from "lucide-react";
import { TIER_CONFIG, hasAccess, type TierName } from "@/lib/tierConfig";
import type { LayoutCatalogEntry } from "./layoutCatalog";

interface LayoutPreviewModalProps {
  entry: LayoutCatalogEntry | null;
  userTier: TierName;
  onClose: () => void;
}

/* ═══════════════════════════════════════════════════════
   DYNAMIC IMPORT MAP — keep paths static so next/dynamic
   can analyze them. One entry per importKey in the catalog.
   ═══════════════════════════════════════════════════════ */

type LoadFn = () => Promise<{ default: React.ComponentType<unknown> }>;
type AnyMod = Record<string, unknown>;
const pick = (m: AnyMod, name: string): React.ComponentType<unknown> =>
  (m[name] ?? m.default) as React.ComponentType<unknown>;

const LOADERS: Record<string, LoadFn> = {
  // Grids
  "grid-two-col": () =>
    import("./patterns/grids").then((m) => ({ default: pick(m as AnyMod, "TwoColGrid") })),
  "grid-three-col": () =>
    import("./patterns/grids").then((m) => ({ default: pick(m as AnyMod, "ThreeColGrid") })),
  "grid-four-col": () =>
    import("./patterns/grids").then((m) => ({ default: pick(m as AnyMod, "FourColGrid") })),
  "grid-asymmetric": () =>
    import("./patterns/grids").then((m) => ({ default: pick(m as AnyMod, "AsymmetricGrid") })),
  "grid-masonry": () =>
    import("./patterns/grids").then((m) => ({ default: pick(m as AnyMod, "MasonryGrid") })),
  "grid-bento": () =>
    import("./patterns/grids").then((m) => ({ default: pick(m as AnyMod, "BentoGrid") })),
  "grid-auto-fit": () =>
    import("./patterns/grids").then((m) => ({ default: pick(m as AnyMod, "AutoFitGrid") })),
  "grid-holy-grail": () =>
    import("./patterns/grids").then((m) => ({ default: pick(m as AnyMod, "HolyGrailGrid") })),

  // Sections
  "section-hero-centered": () =>
    import("./patterns/sections").then((m) => ({ default: pick(m as AnyMod, "HeroCentered") })),
  "section-hero-split": () =>
    import("./patterns/sections").then((m) => ({ default: pick(m as AnyMod, "HeroSplit") })),
  "section-hero-fullbleed": () =>
    import("./patterns/sections").then((m) => ({ default: pick(m as AnyMod, "HeroFullBleed") })),
  "section-features-three": () =>
    import("./patterns/sections").then((m) => ({ default: pick(m as AnyMod, "FeaturesThreeCol") })),
  "section-features-bento": () =>
    import("./patterns/sections").then((m) => ({ default: pick(m as AnyMod, "FeaturesBento") })),
  "section-pricing": () =>
    import("./patterns/sections").then((m) => ({ default: pick(m as AnyMod, "PricingThreeTier") })),
  "section-testimonials": () =>
    import("./patterns/sections").then((m) => ({ default: pick(m as AnyMod, "TestimonialsGrid") })),
  "section-cta": () =>
    import("./patterns/sections").then((m) => ({ default: pick(m as AnyMod, "CtaBanner") })),
  "section-stats": () =>
    import("./patterns/sections").then((m) => ({ default: pick(m as AnyMod, "StatsFourUp") })),
  "section-faq": () =>
    import("./patterns/sections").then((m) => ({ default: pick(m as AnyMod, "FaqAccordion") })),

  // Templates
  "template-saas-landing": () =>
    import("./patterns/templates").then((m) => ({ default: pick(m as AnyMod, "SaasLandingTemplate") })),
  "template-agency": () =>
    import("./patterns/templates").then((m) => ({ default: pick(m as AnyMod, "AgencyTemplate") })),
  "template-dashboard": () =>
    import("./patterns/templates").then((m) => ({ default: pick(m as AnyMod, "DashboardTemplate") })),
  "template-auth": () =>
    import("./patterns/templates").then((m) => ({ default: pick(m as AnyMod, "AuthTemplate") })),
  "template-docs": () =>
    import("./patterns/templates").then((m) => ({ default: pick(m as AnyMod, "DocsTemplate") })),
};

export function LayoutPreviewModal({
  entry,
  userTier,
  onClose,
}: LayoutPreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"preview" | "code">("preview");

  useEffect(() => {
    if (!entry) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [entry]);

  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entry, onClose]);

  const LiveComponent = useMemo(() => {
    if (!entry) return null;
    const loader = LOADERS[entry.importKey];
    if (!loader) return null;
    return dynamic(loader, {
      ssr: false,
      loading: () => (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
          Loading preview…
        </div>
      ),
    });
  }, [entry]);

  if (!entry) return null;

  const isLocked = !hasAccess(userTier, entry.requiredTier);
  const tier = TIER_CONFIG[entry.requiredTier];

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="layout-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col w-full max-w-6xl max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-zinc-800 shrink-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white truncate">{entry.name}</h2>
                <span
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase border"
                  style={{
                    backgroundColor: `${tier.color}20`,
                    color: tier.color,
                    borderColor: `${tier.color}40`,
                  }}
                >
                  {entry.requiredTier}
                </span>
                {entry.isNew && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30">
                    New
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{entry.description}</p>
            </div>

            {/* Tabs */}
            <div className="hidden sm:flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 shrink-0">
              <button
                onClick={() => setTab("preview")}
                className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                  tab === "preview" ? "bg-[#FFCC11] text-black" : "text-gray-400"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setTab("code")}
                className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                  tab === "code" ? "bg-[#FFCC11] text-black" : "text-gray-400"
                }`}
              >
                Code
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition shrink-0"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mobile-only tab strip */}
          <div className="sm:hidden flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 mx-3 mt-3 shrink-0">
            <button
              onClick={() => setTab("preview")}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                tab === "preview" ? "bg-[#FFCC11] text-black" : "text-gray-400"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setTab("code")}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                tab === "code" ? "bg-[#FFCC11] text-black" : "text-gray-400"
              }`}
            >
              Code
            </button>
          </div>

          {/* Body */}
          <div className="relative flex-1 overflow-hidden flex flex-col min-h-[400px]">
            {tab === "preview" ? (
              <div className="relative flex-1 overflow-y-auto bg-black">
                {LiveComponent ? (
                  <Suspense
                    fallback={
                      <div className="p-8 text-center text-xs text-gray-500">
                        Loading…
                      </div>
                    }
                  >
                    <div style={isLocked ? { filter: "blur(10px)", opacity: 0.5 } : undefined}>
                      <LiveComponent />
                    </div>
                  </Suspense>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: entry.gradient }}
                  />
                )}

                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="text-center max-w-sm px-6">
                      <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                        style={{
                          backgroundColor: `${tier.color}20`,
                          border: `1px solid ${tier.color}40`,
                        }}
                      >
                        <LockKeyhole size={28} style={{ color: tier.color }} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {entry.name} is a {tier.label} feature
                      </h3>
                      <p className="text-sm text-gray-400 mb-5">
                        Upgrade to {tier.label} to use this pattern in your projects.
                      </p>
                      <a
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                        style={{ backgroundColor: tier.color, color: "#000" }}
                      >
                        View pricing
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4">
                <pre className="text-[11px] font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                  <code>{entry.code}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Footer with copy */}
          <div className="border-t border-zinc-800 px-4 py-3 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase tracking-wider">
              <Code2 size={11} />
              {entry.tags.slice(0, 3).join(" · ")}
            </div>
            <button
              onClick={handleCopy}
              disabled={isLocked}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFCC11] text-black hover:bg-[#FFD700] transition disabled:opacity-40"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy code"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
