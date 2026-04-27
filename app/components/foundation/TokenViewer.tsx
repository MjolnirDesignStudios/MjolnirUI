// app/components/foundation/TokenViewer.tsx
// Read-only display of a token set — Free tier feature.
// Click any value to copy. Sectioned by category.
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Palette, Ruler, Square, Layers, Type, Activity } from "lucide-react";
import type { TokenSet } from "@/lib/defaultTokens";
import { getReadableTextColor } from "@/lib/colorMath";

interface TokenViewerProps {
  set: TokenSet;
  /** When provided, indicates this token set was overridden via composition */
  badge?: string;
}

export function TokenViewer({ set, badge }: TokenViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">{set.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{set.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-[#FFCC11]/15 text-[#FFCC11] border border-[#FFCC11]/30">
              {badge}
            </span>
          )}
          <span className="text-[10px] font-mono text-gray-500 uppercase">{set.mode}</span>
        </div>
      </div>

      <div className="divide-y divide-zinc-800/40">
        <Section icon={Palette} title="Colors">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(set.colors).map(([name, value]) => (
              <ColorTokenChip key={name} name={name} value={value} />
            ))}
          </div>
        </Section>

        <Section icon={Ruler} title="Spacing">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Object.entries(set.spacing).map(([name, value]) => (
              <ValueChip key={name} name={`spacing-${name}`} value={value} />
            ))}
          </div>
        </Section>

        <Section icon={Square} title="Radii">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Object.entries(set.radii).map(([name, value]) => (
              <ValueChip key={name} name={`radius-${name}`} value={value} />
            ))}
          </div>
        </Section>

        <Section icon={Layers} title="Shadows">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(set.shadows).map(([name, value]) => (
              <ShadowChip key={name} name={name} value={value} />
            ))}
          </div>
        </Section>

        <Section icon={Type} title="Typography">
          <div className="space-y-3 mb-4">
            <FontChip label="Display" value={set.typography.display} />
            <FontChip label="Body" value={set.typography.body} />
            <FontChip label="Mono" value={set.typography.mono} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {Object.entries(set.typography.sizes).map(([name, value]) => (
              <ValueChip key={name} name={`text-${name}`} value={value} />
            ))}
          </div>
        </Section>

        <Section icon={Activity} title="Motion">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Object.entries(set.motion).map(([name, value]) => (
              <ValueChip key={name} name={`motion-${name}`} value={value} />
            ))}
          </div>
        </Section>
      </div>
    </motion.div>
  );
}

/* ── Section header + container ───────────────────────── */
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-[#FFCC11]" />
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  );
}

/* ── Click-to-copy helpers ────────────────────────────── */
function useCopy(value: string) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return { copied, onCopy };
}

function ColorTokenChip({ name, value }: { name: string; value: string }) {
  const { copied, onCopy } = useCopy(value);
  // hex/rgb-only swatch; rgba/cubic-bezier strings just show value text
  const isStandalone = /^#|^rgb/.test(value);
  const textColor = isStandalone ? getReadableTextColor(value.startsWith("rgba") ? "#0F172A" : value) : "#fff";

  return (
    <button
      onClick={onCopy}
      className="group relative flex items-center gap-2 p-2 rounded-lg border border-zinc-800/60 hover:border-[#FFCC11]/30 transition text-left"
    >
      <span
        className="w-9 h-9 rounded-md border border-zinc-700 shrink-0"
        style={{ backgroundColor: isStandalone ? value : "transparent", color: textColor }}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-mono text-gray-300 truncate">{name}</span>
        <span className="block text-[9px] font-mono text-gray-500 truncate">{value}</span>
      </span>
      {copied ? (
        <Check size={12} className="text-[#10B981] shrink-0" />
      ) : (
        <Copy size={12} className="text-gray-600 group-hover:text-gray-300 shrink-0 transition" />
      )}
    </button>
  );
}

function ValueChip({ name, value }: { name: string; value: string }) {
  const { copied, onCopy } = useCopy(value);
  return (
    <button
      onClick={onCopy}
      className="group flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-zinc-800/60 hover:border-[#FFCC11]/30 transition"
    >
      <span className="text-[10px] font-mono text-gray-300 truncate">{name}</span>
      <span className="text-[10px] font-mono text-gray-500 shrink-0 ml-auto">{value}</span>
      {copied ? (
        <Check size={11} className="text-[#10B981] shrink-0" />
      ) : (
        <Copy size={11} className="text-gray-700 group-hover:text-gray-400 shrink-0 transition" />
      )}
    </button>
  );
}

function ShadowChip({ name, value }: { name: string; value: string }) {
  const { copied, onCopy } = useCopy(value);
  return (
    <button
      onClick={onCopy}
      className="group flex items-center gap-3 p-3 rounded-lg border border-zinc-800/60 hover:border-[#FFCC11]/30 transition text-left"
    >
      <div
        className="w-12 h-12 rounded-md bg-zinc-700 shrink-0"
        style={{ boxShadow: value }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-mono text-gray-300">shadow-{name}</div>
        <div className="text-[9px] font-mono text-gray-500 truncate">{value}</div>
      </div>
      {copied ? (
        <Check size={12} className="text-[#10B981] shrink-0" />
      ) : (
        <Copy size={12} className="text-gray-600 group-hover:text-gray-300 shrink-0 transition" />
      )}
    </button>
  );
}

function FontChip({ label, value }: { label: string; value: string }) {
  const { copied, onCopy } = useCopy(value);
  return (
    <button
      onClick={onCopy}
      className="group w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-zinc-800/60 hover:border-[#FFCC11]/30 transition text-left"
    >
      <div className="min-w-0">
        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">
          {label}
        </div>
        <div className="text-base text-white truncate" style={{ fontFamily: value }}>
          The quick brown fox jumps over Mjolnir
        </div>
        <div className="text-[10px] font-mono text-gray-500 truncate mt-0.5">{value}</div>
      </div>
      {copied ? (
        <Check size={14} className="text-[#10B981] shrink-0" />
      ) : (
        <Copy size={14} className="text-gray-600 group-hover:text-gray-300 shrink-0 transition" />
      )}
    </button>
  );
}
