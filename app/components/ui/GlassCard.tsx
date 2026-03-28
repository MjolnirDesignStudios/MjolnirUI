"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/* ─────── Glow tracking hook ─────── */
function useGlowTracking() {
  const ref = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlowPos({ x, y });
  }, []);

  return { ref, glowPos, isHovered, setIsHovered, handleMouseMove };
}

/* ─────── Variant config ─────── */
type GlassVariant = "storm" | "ember" | "gold" | "bifrost" | "void";

const GLASS_VARIANTS: Record<
  GlassVariant,
  {
    border: string;
    glowColor: string;
    hoverBorder: string;
    accentLine: string;
  }
> = {
  storm: {
    border: "border-cyan-500/10",
    glowColor: "rgba(0, 240, 255, 0.15)",
    hoverBorder: "border-cyan-500/30",
    accentLine: "from-transparent via-cyan-500/50 to-transparent",
  },
  ember: {
    border: "border-red-500/10",
    glowColor: "rgba(239, 68, 68, 0.15)",
    hoverBorder: "border-red-500/30",
    accentLine: "from-transparent via-red-500/50 to-transparent",
  },
  gold: {
    border: "border-amber-500/10",
    glowColor: "rgba(255, 204, 17, 0.15)",
    hoverBorder: "border-amber-500/30",
    accentLine: "from-transparent via-amber-500/50 to-transparent",
  },
  bifrost: {
    border: "border-violet-500/10",
    glowColor: "rgba(139, 92, 246, 0.12)",
    hoverBorder: "border-violet-500/30",
    accentLine: "from-cyan-500/50 via-violet-500/50 to-amber-500/50",
  },
  void: {
    border: "border-white/5",
    glowColor: "rgba(255, 255, 255, 0.06)",
    hoverBorder: "border-white/15",
    accentLine: "from-transparent via-white/20 to-transparent",
  },
};

/* ─────── Props ─────── */
export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: GlassVariant;
  /** Show the accent gradient line at top */
  accentLine?: boolean;
  /** Enable mouse-tracking glow effect */
  trackGlow?: boolean;
  /** Enable hover lift animation */
  hoverLift?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Render as a different element */
  as?: "div" | "article" | "section" | "li";
}

/* ─────── Component ─────── */
export function GlassCard({
  children,
  className,
  variant = "storm",
  accentLine = true,
  trackGlow = true,
  hoverLift = true,
  onClick,
  as: Tag = "div",
}: GlassCardProps) {
  const { ref, glowPos, isHovered, setIsHovered, handleMouseMove } =
    useGlowTracking();
  const config = GLASS_VARIANTS[variant];
  const isInteractive = !!onClick;

  return (
    <motion.div
      ref={ref}
      className={cn(
        // Base glass morphism
        "relative overflow-hidden rounded-2xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border",
        isHovered ? config.hoverBorder : config.border,
        // Transition
        "transition-[border-color,box-shadow] duration-500",
        // Interactive states
        isInteractive && "cursor-pointer",
        className
      )}
      onMouseMove={trackGlow ? handleMouseMove : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={hoverLift ? { y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      {/* Mouse-tracking radial glow */}
      {trackGlow && (
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] transition-opacity duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(
              400px circle at ${glowPos.x}% ${glowPos.y}%,
              ${config.glowColor},
              transparent 60%
            )`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Top accent gradient line */}
      {accentLine && (
        <div
          className={cn(
            "absolute top-0 left-[10%] right-[10%] h-px",
            "bg-gradient-to-r",
            config.accentLine,
            "transition-opacity duration-500",
            isHovered ? "opacity-100" : "opacity-40"
          )}
          aria-hidden="true"
        />
      )}

      {/* Inner noise texture — very subtle grain */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/* ─────── Subcomponents for structured cards ─────── */
export function GlassCardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 pt-6 pb-2", className)}>{children}</div>
  );
}

export function GlassCardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 py-2", className)}>{children}</div>;
}

export function GlassCardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-6 pb-6 pt-2 flex items-center gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}
