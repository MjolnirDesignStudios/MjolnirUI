// app/components/canvas/BackgroundPreviewModal.tsx
// Opens when a card in the Backgrounds / Shader gallery is clicked.
// Live-renders the actual component using dynamic import so the gallery page
// stays cheap. Provides:
//   - Full-bleed live preview pane (resizable height)
//   - Copy import statement + JSX snippet
//   - Tier-aware install command (npx mjolnirui add ...)
//   - Locked overlay for users below the required tier
"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, LockKeyhole, Maximize, Minimize, Code2, ExternalLink } from "lucide-react";
import { TIER_CONFIG, hasAccess, type TierName } from "@/lib/tierConfig";
import type { CatalogEntry } from "./backgroundCatalog";

interface BackgroundPreviewModalProps {
  entry: CatalogEntry | null;
  userTier: TierName;
  onClose: () => void;
}

/* ═══════════════════════════════════════════════════════
   DYNAMIC IMPORT MAP
   next/dynamic requires statically-analyzable import strings — we can't
   build the path at runtime. Hence this explicit map keyed by catalog
   importKey. Adding a new background = add an entry here + a catalog entry.
   ssr:false because most use WebGL / canvas / window.
   ═══════════════════════════════════════════════════════ */

type LoadFn = () => Promise<{ default: React.ComponentType<any> }>;

const LOADERS: Record<string, LoadFn> = {
  // ── Simple ─────────────────────────────────────────────
  "color-halo": () =>
    import("@/components/mjolnirui/backgrounds/color-halo/ColorHalo").then(
      (m) => ({ default: (m as any).default ?? (m as any).ColorHalo })
    ),
  prism: () =>
    import("@/components/mjolnirui/backgrounds/prism/Prism").then((m) => ({
      default: (m as any).default ?? (m as any).Prism,
    })),
  "silky-lines": () =>
    import("@/components/mjolnirui/backgrounds/silky-lines/SilkyLines").then(
      (m) => ({ default: (m as any).default ?? (m as any).SilkyLines })
    ),
  "star-field": () =>
    import("@/components/mjolnirui/backgrounds/star-field/StarField").then(
      (m) => ({ default: (m as any).default ?? (m as any).StarField })
    ),
  "matrix-rain": () =>
    import("@/components/mjolnirui/animations/matrix-rain/MatrixRain").then(
      (m) => ({ default: (m as any).default ?? (m as any).MatrixRain })
    ),
  "neural-net": () =>
    import("@/components/mjolnirui/backgrounds/neural/NeuralNet").then((m) => ({
      default: (m as any).default ?? (m as any).NeuralNet,
    })),
  atomic: () =>
    import("@/components/mjolnirui/backgrounds/atomic/Atomic").then((m) => ({
      default: (m as any).default ?? (m as any).Atomic,
    })),
  smoke: () =>
    import("@/components/mjolnirui/backgrounds/smoke/Smoke").then((m) => ({
      default: (m as any).default ?? (m as any).Smoke,
    })),
  "stars-bg": () =>
    import("@/components/mjolnirui/backgrounds/stars/StarsBackground").then(
      (m) => ({ default: (m as any).default ?? (m as any).StarsBackground })
    ),
  atmosphere: () =>
    import("@/components/mjolnirui/animations/atmosphere/Atmosphere").then(
      (m) => ({ default: (m as any).default ?? (m as any).Atmosphere })
    ),
  "light-pillar": () =>
    import("@/components/mjolnirui/animations/light-pillar/LightPillar").then(
      (m) => ({ default: (m as any).default ?? (m as any).LightPillar })
    ),
  vortex: () =>
    import("@/components/mjolnirui/backgrounds/vortex/Vortex").then((m) => ({
      default: (m as any).default ?? (m as any).Vortex,
    })),
  "liquid-ribbons": () =>
    import(
      "@/components/mjolnirui/backgrounds/liquid-ribbons/LiquidRibbons"
    ).then((m) => ({ default: (m as any).default ?? (m as any).LiquidRibbons })),
  "swirling-gas": () =>
    import("@/components/mjolnirui/animations/swirling-gas/SwirlingGas").then(
      (m) => ({ default: (m as any).default ?? (m as any).SwirlingGas })
    ),
  singularity: () =>
    import("@/components/mjolnirui/backgrounds/singularity/Singularity").then(
      (m) => ({ default: (m as any).default ?? (m as any).Singularity })
    ),

  // ── Shader ─────────────────────────────────────────────
  "ripple-grid": () =>
    import("@/components/mjolnirui/animations/ripple-grid/RippleGrid").then(
      (m) => ({ default: (m as any).default ?? (m as any).RippleGrid })
    ),
  lightning: () =>
    import("@/components/mjolnirui/animations/lightning/Lightning").then(
      (m) => ({ default: (m as any).default ?? (m as any).Lightning })
    ),
  "aura-waves": () =>
    import("@/components/mjolnirui/animations/aurora/AuraWaves").then((m) => ({
      default: (m as any).default ?? (m as any).AuraWaves,
    })),
  accretion: () =>
    import("@/components/mjolnirui/backgrounds/accretion/Accretion").then(
      (m) => ({ default: (m as any).default ?? (m as any).Accretion })
    ),
  bifrost: () =>
    import("@/components/mjolnirui/backgrounds/bifrost/BiFrost").then((m) => ({
      default: (m as any).default ?? (m as any).BiFrost,
    })),
  "dark-veil": () =>
    import("@/components/mjolnirui/backgrounds/dark-veil/DarkVeil").then(
      (m) => ({ default: (m as any).default ?? (m as any).DarkVeil })
    ),
  "laser-flow": () =>
    import("@/components/mjolnirui/animations/laser-flow/LaserFlow").then(
      (m) => ({ default: (m as any).default ?? (m as any).LaserFlow })
    ),
  "black-hole": () =>
    import("@/components/mjolnirui/animations/black-hole/BlackHole").then(
      (m) => ({ default: (m as any).default ?? (m as any).BlackHole })
    ),
  globe: () =>
    import("@/components/mjolnirui/animations/globe/Globe").then((m) => ({
      default: (m as any).default ?? (m as any).Globe,
    })),
  "gravity-lens": () =>
    import("@/components/mjolnirui/backgrounds/gravity-lens/GravityLens").then(
      (m) => ({ default: (m as any).default ?? (m as any).GravityLens })
    ),
  "liquid-ether": () =>
    import("@/components/mjolnirui/backgrounds/liquid-ether/LiquidEther").then(
      (m) => ({ default: (m as any).default ?? (m as any).LiquidEther })
    ),
  hyperspeed: () =>
    import("@/components/mjolnirui/animations/hyperspeed/Hyperspeed").then(
      (m) => ({ default: (m as any).default ?? (m as any).Hyperspeed })
    ),
};

/* ═══════════════════════════════════════════════════════
   MODAL
   ═══════════════════════════════════════════════════════ */
export function BackgroundPreviewModal({
  entry,
  userTier,
  onClose,
}: BackgroundPreviewModalProps) {
  const [copied, setCopied] = useState<"cmd" | "jsx" | "import" | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Lock body scroll while open
  useEffect(() => {
    if (!entry) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [entry]);

  // Close on Escape
  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (fullscreen) setFullscreen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entry, fullscreen, onClose]);

  // Dynamic component — memoize so we don't re-import on every render
  const LiveComponent = useMemo(() => {
    if (!entry) return null;
    const loader = LOADERS[entry.importKey];
    if (!loader) return null;
    return dynamic(loader, {
      ssr: false,
      loading: () => (
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
          Loading shader…
        </div>
      ),
    });
  }, [entry]);

  if (!entry) return null;

  const isLocked = !hasAccess(userTier, entry.requiredTier);
  const tier = TIER_CONFIG[entry.requiredTier];

  const installCmd = `npx mjolnirui add ${entry.id}`;
  const componentName = entry.name.replace(/[^A-Za-z0-9]/g, "");
  const importPath = `@/components/mjolnirui/${entry.bucket === "shader" ? "(see catalog)" : "(see catalog)"}/${entry.id}`;
  const importStmt = `import ${componentName} from "${importPath}";`;
  const jsxSnippet = `<${componentName} />`;

  const copy = (key: "cmd" | "jsx" | "import", value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="bg-modal"
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
          className={`relative bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col ${
            fullscreen ? "w-full h-full max-w-none" : "w-full max-w-5xl max-h-[90vh]"
          }`}
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
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setFullscreen((v) => !v)}
                className="p-2 text-gray-400 hover:text-white transition"
                aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Preview pane */}
          <div className="relative flex-1 bg-black overflow-hidden min-h-[300px]">
            {LiveComponent ? (
              <Suspense
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                    Loading…
                  </div>
                }
              >
                <div
                  className="absolute inset-0"
                  style={
                    !LiveComponent || isLocked
                      ? { filter: "blur(12px)", opacity: 0.6 }
                      : undefined
                  }
                >
                  <LiveComponent />
                </div>
              </Suspense>
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: entry.gradient }}
              />
            )}

            {/* Locked overlay */}
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
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
                    Upgrade to {tier.label} to use this background in your projects.
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

          {/* Code area */}
          {!fullscreen && (
            <div className="border-t border-zinc-800 p-4 space-y-2 shrink-0">
              <CodeRow
                label="Install"
                code={installCmd}
                copied={copied === "cmd"}
                onCopy={() => copy("cmd", installCmd)}
                disabled={isLocked}
              />
              <CodeRow
                label="Import"
                code={importStmt}
                copied={copied === "import"}
                onCopy={() => copy("import", importStmt)}
                disabled={isLocked}
              />
              <CodeRow
                label="JSX"
                code={jsxSnippet}
                copied={copied === "jsx"}
                onCopy={() => copy("jsx", jsxSnippet)}
                disabled={isLocked}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function CodeRow({
  label,
  code,
  copied,
  onCopy,
  disabled,
}: {
  label: string;
  code: string;
  copied: boolean;
  onCopy: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
      <Code2 size={12} className="text-gray-500 shrink-0" />
      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 shrink-0 w-14">
        {label}
      </span>
      <code className="text-[11px] font-mono text-gray-300 truncate flex-1">{code}</code>
      <button
        onClick={onCopy}
        disabled={disabled}
        className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <Check size={12} className="text-[#10B981]" />
        ) : (
          <Copy size={12} className="text-gray-400" />
        )}
      </button>
    </div>
  );
}
