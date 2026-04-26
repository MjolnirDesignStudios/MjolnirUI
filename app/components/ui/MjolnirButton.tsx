"use client";

import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";

/* ─────── Lightning bolt SVG path generator ─────── */
function generateBolt(
  x: number,
  y: number,
  segments: number = 6,
  spread: number = 30
): string {
  let path = `M ${x} ${y}`;
  let cx = x;
  let cy = y;
  for (let i = 0; i < segments; i++) {
    const dx = (Math.random() - 0.5) * spread;
    const dy = 8 + Math.random() * 14;
    cx += dx;
    cy += dy;
    path += ` L ${cx} ${cy}`;
  }
  return path;
}

/* ─────── Spark particle ─────── */
interface Spark {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

/* ─────── Variant system ─────── */
const mjolnirButtonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 overflow-hidden",
    "font-semibold tracking-wide transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    "disabled:pointer-events-none disabled:opacity-40",
    "select-none cursor-pointer",
  ].join(" "),
  {
    variants: {
      variant: {
        // Storm — primary dark with cyan electric glow
        storm: [
          "bg-gradient-to-b from-zinc-900 to-black",
          "border border-cyan-500/30 hover:border-cyan-400/60",
          "text-cyan-50",
          "shadow-[0_0_0_1px_rgba(0,240,255,0.1),0_4px_20px_rgba(0,0,0,0.5)]",
          "hover:shadow-[0_0_20px_rgba(0,240,255,0.3),0_4px_30px_rgba(0,0,0,0.6)]",
          "focus-visible:ring-cyan-500",
        ].join(" "),
        // Thunder — gold/amber power
        thunder: [
          "bg-gradient-to-b from-amber-900/80 to-black",
          "border border-amber-500/40 hover:border-amber-400/70",
          "text-amber-50",
          "shadow-[0_0_0_1px_rgba(255,204,17,0.1),0_4px_20px_rgba(0,0,0,0.5)]",
          "hover:shadow-[0_0_20px_rgba(255,204,17,0.3),0_4px_30px_rgba(0,0,0,0.6)]",
          "focus-visible:ring-amber-500",
        ].join(" "),
        // Bifrost — rainbow prismatic
        bifrost: [
          "bg-gradient-to-r from-violet-900/60 via-cyan-900/60 to-emerald-900/60",
          "border border-white/20 hover:border-white/40",
          "text-white",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.5)]",
          "hover:shadow-[0_0_24px_rgba(139,92,246,0.2),0_0_24px_rgba(0,240,255,0.2)]",
          "focus-visible:ring-violet-400",
        ].join(" "),
        // Void — minimal dark ghost
        void: [
          "bg-transparent",
          "border border-white/10 hover:border-white/25",
          "text-zinc-300 hover:text-white",
          "hover:bg-white/5",
          "focus-visible:ring-zinc-500",
        ].join(" "),
        // Forge — destructive / fire
        forge: [
          "bg-gradient-to-b from-red-900/70 to-black",
          "border border-red-500/40 hover:border-red-400/60",
          "text-red-50",
          "shadow-[0_0_0_1px_rgba(239,68,68,0.1),0_4px_20px_rgba(0,0,0,0.5)]",
          "hover:shadow-[0_0_20px_rgba(239,68,68,0.3),0_4px_30px_rgba(0,0,0,0.6)]",
          "focus-visible:ring-red-500",
        ].join(" "),
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-lg",
        md: "h-11 px-6 text-sm rounded-xl",
        lg: "h-13 px-8 text-base rounded-xl",
        xl: "h-15 px-10 text-lg rounded-2xl",
      },
      strike: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "storm",
      size: "md",
      strike: true,
    },
  }
);

/* ─────── Color map for lightning per variant ─────── */
const LIGHTNING_COLORS: Record<string, { bolt: string; spark: string; glow: string }> = {
  storm: { bolt: "#00f0ff", spark: "#00f0ff", glow: "rgba(0,240,255,0.6)" },
  thunder: { bolt: "#FFD700", spark: "#FFCC11", glow: "rgba(255,204,17,0.6)" },
  bifrost: { bolt: "#c084fc", spark: "#a78bfa", glow: "rgba(192,132,252,0.5)" },
  void: { bolt: "#a1a1aa", spark: "#71717a", glow: "rgba(161,161,170,0.4)" },
  forge: { bolt: "#f97316", spark: "#ef4444", glow: "rgba(249,115,22,0.6)" },
};

/* ─────── Props ─────── */
export interface MjolnirButtonProps
  extends VariantProps<typeof mjolnirButtonVariants> {
  /** Left icon slot */
  icon?: React.ReactNode;
  /** Right icon slot */
  iconRight?: React.ReactNode;
  /** Loading state — shows spinner, disables interaction */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Button children */
  children?: React.ReactNode;
  /** Additional classes */
  className?: string;
  /** Button type */
  type?: "button" | "submit" | "reset";
  /** Aria label */
  "aria-label"?: string;
}

/* ─────── Component ─────── */
export function MjolnirButton({
  className,
  variant = "storm",
  size = "md",
  strike = true,
  icon,
  iconRight,
  loading = false,
  disabled = false,
  children,
  onClick,
  type = "button",
  "aria-label": ariaLabel,
}: MjolnirButtonProps) {
  const [bolts, setBolts] = useState<string[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [isStriking, setIsStriking] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sparkId = useRef(0);

  const colors = LIGHTNING_COLORS[variant ?? "storm"];

  const triggerLightning = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!strike || disabled || loading) return;

      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Generate 2-4 bolts from click point
      const count = 2 + Math.floor(Math.random() * 3);
      const newBolts: string[] = [];
      for (let i = 0; i < count; i++) {
        newBolts.push(generateBolt(x, y, 4 + Math.floor(Math.random() * 4), 25));
      }
      setBolts(newBolts);

      // Generate 6-10 sparks
      const newSparks: Spark[] = [];
      const sparkCount = 6 + Math.floor(Math.random() * 5);
      for (let i = 0; i < sparkCount; i++) {
        newSparks.push({
          id: sparkId.current++,
          x,
          y,
          angle: Math.random() * 360,
          distance: 20 + Math.random() * 40,
          size: 1.5 + Math.random() * 2.5,
          delay: Math.random() * 0.1,
        });
      }
      setSparks(newSparks);
      setIsStriking(true);

      setTimeout(() => {
        setBolts([]);
        setSparks([]);
        setIsStriking(false);
      }, 400);
    },
    [strike, disabled, loading]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerLightning(e);
      onClick?.(e);
    },
    [triggerLightning, onClick]
  );

  return (
    <motion.button
      ref={buttonRef}
      className={cn(mjolnirButtonVariants({ variant, size, strike, className }))}
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      aria-label={ariaLabel}
    >
      {/* Ambient pulse glow on hover */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.glow} 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Lightning SVG overlay */}
      <AnimatePresence>
        {bolts.length > 0 && (
          <motion.svg
            className="pointer-events-none absolute inset-0 z-20"
            width="100%"
            height="100%"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0.8, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            aria-hidden="true"
          >
            {bolts.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={colors.bolt}
                strokeWidth={1.5 + Math.random()}
                strokeLinecap="round"
                filter="url(#mjolnir-bolt-glow)"
                opacity={0.7 + Math.random() * 0.3}
              />
            ))}
            <defs>
              <filter id="mjolnir-bolt-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>
            </defs>
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Spark particles */}
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.span
            key={spark.id}
            className="pointer-events-none absolute z-20 rounded-full"
            style={{
              width: spark.size,
              height: spark.size,
              backgroundColor: colors.spark,
              left: spark.x,
              top: spark.y,
              boxShadow: `0 0 ${spark.size * 2}px ${colors.spark}`,
            }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{
              opacity: 0,
              x: Math.cos((spark.angle * Math.PI) / 180) * spark.distance,
              y: Math.sin((spark.angle * Math.PI) / 180) * spark.distance,
              scale: 0,
            }}
            transition={{ duration: 0.4, delay: spark.delay, ease: "easeOut" }}
            aria-hidden="true"
          />
        ))}
      </AnimatePresence>

      {/* Flash overlay on strike */}
      {isStriking && (
        <motion.span
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
          style={{ backgroundColor: colors.glow }}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-label="Loading"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="60"
              strokeDashoffset="20"
              opacity="0.4"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="60"
              strokeDashoffset="45"
            />
          </svg>
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
        {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
      </span>
    </motion.button>
  );
}

export { mjolnirButtonVariants };
