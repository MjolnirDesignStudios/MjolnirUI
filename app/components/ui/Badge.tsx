"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

/* ─────── Variant system ─────── */
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 font-medium transition-all duration-300",
    "border select-none whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      variant: {
        // Core status badges
        default: "bg-zinc-900/80 border-zinc-700/50 text-zinc-300",
        success: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
        warning: "bg-amber-950/60 border-amber-500/30 text-amber-400",
        error: "bg-red-950/60 border-red-500/30 text-red-400",
        info: "bg-blue-950/60 border-blue-500/30 text-blue-400",

        // MjolnirUI brand badges
        electric: [
          "bg-cyan-950/40 border-cyan-500/30 text-cyan-300",
          "shadow-[0_0_8px_rgba(0,240,255,0.15)]",
        ].join(" "),
        gold: [
          "bg-amber-950/40 border-amber-500/40 text-amber-300",
          "shadow-[0_0_8px_rgba(255,204,17,0.15)]",
        ].join(" "),
        forge: [
          "bg-orange-950/40 border-orange-500/30 text-orange-300",
          "shadow-[0_0_8px_rgba(249,115,22,0.15)]",
        ].join(" "),
        bifrost: [
          "bg-violet-950/40 border-violet-500/30 text-violet-300",
          "shadow-[0_0_8px_rgba(139,92,246,0.15)]",
        ].join(" "),

        // Tier badges
        free: "bg-zinc-900/60 border-zinc-600/40 text-zinc-400",
        base: "bg-blue-950/50 border-blue-500/30 text-blue-400",
        pro: "bg-emerald-950/50 border-emerald-500/30 text-emerald-400",
        elite: [
          "bg-gradient-to-r from-amber-950/60 to-orange-950/60",
          "border-amber-500/40 text-amber-300",
          "shadow-[0_0_12px_rgba(255,204,17,0.2)]",
        ].join(" "),
      },
      size: {
        xs: "h-5 px-1.5 text-[10px] rounded-md",
        sm: "h-6 px-2 text-xs rounded-lg",
        md: "h-7 px-2.5 text-xs rounded-lg",
        lg: "h-8 px-3 text-sm rounded-xl",
      },
      glow: {
        true: "",
        false: "",
      },
      pulse: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      glow: false,
      pulse: false,
    },
  }
);

/* ─────── Glow intensity per variant ─────── */
const GLOW_COLORS: Partial<Record<string, string>> = {
  electric: "0 0 12px rgba(0,240,255,0.3), 0 0 4px rgba(0,240,255,0.15)",
  gold: "0 0 12px rgba(255,204,17,0.3), 0 0 4px rgba(255,204,17,0.15)",
  forge: "0 0 12px rgba(249,115,22,0.3), 0 0 4px rgba(249,115,22,0.15)",
  bifrost: "0 0 12px rgba(139,92,246,0.3), 0 0 4px rgba(139,92,246,0.15)",
  elite: "0 0 16px rgba(255,204,17,0.35), 0 0 6px rgba(255,204,17,0.2)",
  success: "0 0 10px rgba(16,185,129,0.25)",
  error: "0 0 10px rgba(239,68,68,0.25)",
  warning: "0 0 10px rgba(245,158,11,0.25)",
  info: "0 0 10px rgba(59,130,246,0.25)",
};

/* ─────── Pulse dot colors ─────── */
const PULSE_COLORS: Partial<Record<string, string>> = {
  default: "bg-zinc-500",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-red-400",
  info: "bg-blue-400",
  electric: "bg-cyan-400",
  gold: "bg-amber-400",
  forge: "bg-orange-400",
  bifrost: "bg-violet-400",
  free: "bg-zinc-400",
  base: "bg-blue-400",
  pro: "bg-emerald-400",
  elite: "bg-amber-400",
};

/* ─────── Props ─────── */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Left icon slot */
  icon?: React.ReactNode;
  /** Removable — shows X button and fires onRemove */
  removable?: boolean;
  onRemove?: () => void;
}

/* ─────── Component ─────── */
export function Badge({
  className,
  variant = "default",
  size = "sm",
  glow = false,
  pulse = false,
  icon,
  removable = false,
  onRemove,
  children,
  ...props
}: BadgeProps) {
  const glowShadow = glow ? GLOW_COLORS[variant ?? "default"] : undefined;
  const pulseColor = PULSE_COLORS[variant ?? "default"] ?? "bg-zinc-500";

  return (
    <span
      className={cn(badgeVariants({ variant, size, glow, pulse, className }))}
      style={glowShadow ? { boxShadow: glowShadow } : undefined}
      {...props}
    >
      {/* Pulse indicator dot */}
      {pulse && (
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-50",
              pulseColor
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              pulseColor
            )}
          />
        </span>
      )}

      {/* Icon */}
      {icon && <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3">{icon}</span>}

      {/* Content */}
      <span>{children}</span>

      {/* Remove button */}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 shrink-0 rounded-sm opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
          aria-label="Remove"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      )}
    </span>
  );
}

export { badgeVariants };
