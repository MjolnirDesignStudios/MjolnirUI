// components/ui/WaveText.tsx — Sine-wave undulating letters
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface WaveTextProps {
  children: string;
  /** Vertical wave amplitude in px */
  amplitude?: number;
  /** Animation period per letter (sec) */
  duration?: number;
  /** Phase offset between letters (sec) */
  stagger?: number;
  /** Color of letters */
  color?: string;
  /** Optional gradient — array of colors creates per-letter color cycling */
  gradient?: string[];
  className?: string;
}

export function WaveText({
  children,
  amplitude = 12,
  duration = 1.6,
  stagger = 0.08,
  color = "#ffffff",
  gradient,
  className,
}: WaveTextProps) {
  const letters = children.split("");

  return (
    <span
      className={cn("inline-block", className)}
      aria-label={children}
      style={{ lineHeight: 1.2 }}
    >
      {letters.map((letter, i) => {
        const letterColor =
          gradient && gradient.length
            ? gradient[i % gradient.length]
            : color;

        return (
          <motion.span
            key={i}
            aria-hidden="true"
            style={{
              display: "inline-block",
              color: letterColor,
              willChange: "transform",
            }}
            animate={{ y: [0, -amplitude, 0, amplitude, 0] }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * stagger,
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        );
      })}
    </span>
  );
}
