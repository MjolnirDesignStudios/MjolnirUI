// components/ui/NeonGlowText.tsx — Pulsing neon glow with optional flicker
"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface NeonGlowTextProps {
  children: React.ReactNode;
  /** Glow color (cyan default) */
  glowColor?: string;
  /** Inner text color */
  textColor?: string;
  /** Glow intensity in px (max blur) */
  intensity?: number;
  /** Pulse animation duration (sec) */
  pulseSpeed?: number;
  /** Enable flicker effect */
  flicker?: boolean;
  /** Flicker style: subtle (rare), neon (sign-like), broken (frequent) */
  flickerStyle?: "subtle" | "neon" | "broken";
  className?: string;
}

const FLICKER_KEYFRAMES = {
  subtle: `
    0%, 95%, 100% { opacity: 1; }
    97% { opacity: 0.7; }
    98% { opacity: 1; }
  `,
  neon: `
    0%, 18%, 22%, 25%, 53%, 57%, 100% {
      opacity: 1;
    }
    20%, 24%, 55% {
      opacity: 0.4;
    }
  `,
  broken: `
    0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
      opacity: 0.99;
    }
    20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
      opacity: 0.4;
    }
  `,
};

export function NeonGlowText({
  children,
  glowColor = "#00f0ff",
  textColor = "#ffffff",
  intensity = 20,
  pulseSpeed = 2.5,
  flicker = false,
  flickerStyle = "neon",
  className,
}: NeonGlowTextProps) {
  const id = React.useId().replace(/:/g, "");

  const baseShadow = `
    0 0 ${intensity * 0.25}px ${glowColor},
    0 0 ${intensity * 0.5}px ${glowColor},
    0 0 ${intensity}px ${glowColor},
    0 0 ${intensity * 2}px ${glowColor}
  `;

  return (
    <span
      className={cn("inline-block font-bold", className)}
      style={{
        color: textColor,
        textShadow: baseShadow,
        animation: `neon-pulse-${id} ${pulseSpeed}s ease-in-out infinite${flicker ? `, neon-flicker-${id} 4s linear infinite` : ""}`,
      }}
    >
      {children}
      <style jsx>{`
        @keyframes neon-pulse-${id} {
          0%, 100% {
            text-shadow:
              0 0 ${intensity * 0.25}px ${glowColor},
              0 0 ${intensity * 0.5}px ${glowColor},
              0 0 ${intensity}px ${glowColor},
              0 0 ${intensity * 2}px ${glowColor};
          }
          50% {
            text-shadow:
              0 0 ${intensity * 0.5}px ${glowColor},
              0 0 ${intensity}px ${glowColor},
              0 0 ${intensity * 1.75}px ${glowColor},
              0 0 ${intensity * 3}px ${glowColor};
          }
        }
        @keyframes neon-flicker-${id} {
          ${FLICKER_KEYFRAMES[flickerStyle]}
        }
      `}</style>
    </span>
  );
}
