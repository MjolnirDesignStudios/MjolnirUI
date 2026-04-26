// components/ui/Buttons/ShimmerButton.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

/* ─── Hammer SVG icon for Gold variant ─── */
function HammerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 010-3L12 9" />
      <path d="M17.64 15L22 10.64" />
      <path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25V6.5a.5.5 0 00-.5-.5H16.5c-.85 0-1.65-.33-2.25-.93l-1.25-1.25" />
      <path d="M13.04 2.82l.94.94c.6.6.93 1.4.93 2.25v.75" />
      <path d="M8 12h4" />
    </svg>
  );
}

/* ─── Lightning SVG icon for Storm variant ─── */
function LightningIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

type ShimmerVariant = "primary" | "bronze" | "silver" | "gold" | "emerald" | "storm" | "electric-gold" | "electric-storm";

interface Props {
  title: string;
  icon?: React.ReactNode;
  position?: string;
  handleClick?: () => void;
  otherClasses?: string;
  variant?: ShimmerVariant;
}

const VARIANT_CONFIG: Record<ShimmerVariant, {
  border: string;
  bg: string;
  focus: string;
  glow?: string;
  defaultIcon?: React.ReactNode;
}> = {
  primary: {
    border: "border-slate-800",
    bg: "bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)]",
    focus: "focus:ring-4 focus:ring-white/20",
  },
  bronze: {
    border: "border-orange-600/50",
    bg: "bg-[linear-gradient(110deg,#000103,45%,#9a3412,55%,#000103)]",
    focus: "focus:ring-4 focus:ring-orange-600/30",
  },
  silver: {
    border: "border-gray-400/50",
    bg: "bg-[linear-gradient(110deg,#000103,45%,#6b7280,55%,#000103)]",
    focus: "focus:ring-4 focus:ring-gray-400/30",
  },
  gold: {
    border: "border-amber-500/50",
    bg: "bg-[linear-gradient(110deg,#000103,45%,#b45309,55%,#000103)]",
    focus: "focus:ring-4 focus:ring-amber-500/30",
  },
  emerald: {
    border: "border-emerald-500/50",
    bg: "bg-[linear-gradient(110deg,#000103,45%,#065f46,55%,#000103)]",
    focus: "focus:ring-4 focus:ring-emerald-500/30",
  },
  storm: {
    border: "border-gray-300/40",
    bg: "bg-[linear-gradient(110deg,#0a0a0f,45%,#374151,55%,#0a0a0f)]",
    focus: "focus:ring-4 focus:ring-gray-300/30",
    glow: "hover:shadow-[0_0_20px_rgba(228,228,231,0.15)]",
    defaultIcon: <LightningIcon className="w-6 h-6 shrink-0" />,
  },
  "electric-gold": {
    border: "border-yellow-400/60",
    bg: "bg-[linear-gradient(110deg,#000103,40%,#b45309,50%,#fbbf24,55%,#b45309,60%,#000103)]",
    focus: "focus:ring-4 focus:ring-yellow-400/40",
    glow: "hover:shadow-[0_0_24px_rgba(251,191,36,0.25)]",
    defaultIcon: <HammerIcon className="w-6 h-6 shrink-0" />,
  },
  "electric-storm": {
    border: "border-white/30",
    bg: "bg-[linear-gradient(110deg,#0a0a0f,40%,#6b7280,50%,#e4e4e7,55%,#6b7280,60%,#0a0a0f)]",
    focus: "focus:ring-4 focus:ring-white/30",
    glow: "hover:shadow-[0_0_24px_rgba(228,228,231,0.2)]",
    defaultIcon: <LightningIcon className="w-6 h-6 shrink-0" />,
  },
};

export default function ShimmerButton({
  title,
  icon,
  position = "left",
  handleClick,
  otherClasses,
  variant = "primary",
}: Props) {
  const config = VARIANT_CONFIG[variant];
  const resolvedIcon = icon || config.defaultIcon || <Zap className="w-6 h-6 shrink-0" />;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group/shimmer inline-flex h-14 items-center justify-center rounded-xl",
        config.border,
        config.bg,
        "animate-shimmer",
        "px-6 font-bold text-xl text-white transition-all duration-200",
        // 3D bezel effect
        "shadow-[0_4px_0_rgba(0,0,0,0.4),0_6px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]",
        "hover:shadow-[0_6px_0_rgba(0,0,0,0.4),0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]",
        "hover:translate-y-[-2px]",
        // Pressed effect
        "active:shadow-[0_1px_0_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(0,0,0,0.3)]",
        "active:translate-y-[2px]",
        config.focus,
        config.glow,
        "whitespace-nowrap overflow-hidden relative",
        "w-full sm:w-auto sm:min-w-[240px]",
        otherClasses
      )}
      style={{ backgroundSize: '200% 100%' }}
    >
      {/* Shimmer sweep overlay */}
      <span
        className="absolute inset-0 -translate-x-full group-hover/shimmer:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
        }}
      />
      <span className="relative flex items-center gap-3 truncate">
        {position === "left" && resolvedIcon}
        <span className="truncate">{title}</span>
        {position === "right" && resolvedIcon}
      </span>
    </button>
  );
}
