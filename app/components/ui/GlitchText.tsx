// components/ui/GlitchText.tsx — Electric Norse glitch distortion text
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface GlitchTextProps {
  /** Text to display */
  children: string;
  /** Glitch intensity: subtle, medium, intense */
  intensity?: "subtle" | "medium" | "intense";
  /** Primary text color */
  color?: string;
  /** Glitch accent color (left offset) */
  glitchColor1?: string;
  /** Glitch accent color (right offset) */
  glitchColor2?: string;
  /** Trigger mode: hover, always, or interval */
  trigger?: "hover" | "always" | "interval";
  /** Interval ms between glitch bursts (only for trigger="interval") */
  interval?: number;
  /** Duration of each glitch burst in ms */
  burstDuration?: number;
  className?: string;
}

const INTENSITY_CONFIG = {
  subtle: { maxOffset: 2, maxSkew: 1, frequency: 0.3 },
  medium: { maxOffset: 4, maxSkew: 3, frequency: 0.5 },
  intense: { maxOffset: 8, maxSkew: 6, frequency: 0.8 },
};

export function GlitchText({
  children,
  intensity = "medium",
  color = "#ffffff",
  glitchColor1 = "#00f0ff",
  glitchColor2 = "#FFD700",
  trigger = "hover",
  interval = 3000,
  burstDuration = 300,
  className,
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(trigger === "always");
  const [glitchFrame, setGlitchFrame] = useState(0);
  const frameRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const config = INTENSITY_CONFIG[intensity];

  const startGlitch = useCallback(() => {
    setIsGlitching(true);
    if (trigger !== "always") {
      setTimeout(() => setIsGlitching(false), burstDuration);
    }
  }, [trigger, burstDuration]);

  // Interval trigger
  useEffect(() => {
    if (trigger !== "interval") return;
    intervalRef.current = setInterval(startGlitch, interval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [trigger, interval, startGlitch]);

  // Animation frame for glitch randomness
  useEffect(() => {
    if (!isGlitching) {
      setGlitchFrame(0);
      return;
    }

    let running = true;
    const animate = () => {
      if (!running) return;
      setGlitchFrame(Math.random());
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isGlitching]);

  // Generate random offset values from glitch frame
  const offset1X = isGlitching
    ? (Math.sin(glitchFrame * 100) * config.maxOffset).toFixed(1)
    : "0";
  const offset2X = isGlitching
    ? (Math.cos(glitchFrame * 77) * config.maxOffset * -1).toFixed(1)
    : "0";
  const skew = isGlitching
    ? (Math.sin(glitchFrame * 50) * config.maxSkew).toFixed(1)
    : "0";
  const clipY1 = isGlitching ? Math.floor(Math.random() * 100) : 0;
  const clipY2 = isGlitching
    ? Math.min(clipY1 + 5 + Math.floor(Math.random() * 20), 100)
    : 100;

  return (
    <span
      className={cn("relative inline-block", className)}
      onMouseEnter={trigger === "hover" ? startGlitch : undefined}
      onMouseLeave={
        trigger === "hover" ? () => setIsGlitching(false) : undefined
      }
      style={{ color }}
    >
      {/* Base text */}
      <span className="relative z-10" style={{ transform: isGlitching ? `skewX(${skew}deg)` : undefined, display: "inline-block" }}>
        {children}
      </span>

      {/* Glitch layer 1 — left offset, cyan */}
      <span
        className="absolute inset-0 z-0 pointer-events-none select-none"
        aria-hidden="true"
        style={{
          color: glitchColor1,
          transform: `translateX(${offset1X}px) skewX(${skew}deg)`,
          clipPath: isGlitching
            ? `polygon(0 ${clipY1}%, 100% ${clipY1}%, 100% ${clipY2}%, 0 ${clipY2}%)`
            : "none",
          opacity: isGlitching ? 0.8 : 0,
          mixBlendMode: "screen",
          transition: isGlitching ? "none" : "opacity 0.15s",
        }}
      >
        {children}
      </span>

      {/* Glitch layer 2 — right offset, gold */}
      <span
        className="absolute inset-0 z-0 pointer-events-none select-none"
        aria-hidden="true"
        style={{
          color: glitchColor2,
          transform: `translateX(${offset2X}px) skewX(${Number(skew) * -0.5}deg)`,
          clipPath: isGlitching
            ? `polygon(0 ${100 - clipY2}%, 100% ${100 - clipY2}%, 100% ${100 - clipY1}%, 0 ${100 - clipY1}%)`
            : "none",
          opacity: isGlitching ? 0.6 : 0,
          mixBlendMode: "screen",
          transition: isGlitching ? "none" : "opacity 0.15s",
        }}
      >
        {children}
      </span>

      {/* Scanline flash */}
      {isGlitching && Math.random() > 1 - config.frequency && (
        <span
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: `linear-gradient(transparent ${clipY1}%, ${glitchColor1}15 ${clipY1}%, ${glitchColor1}15 ${clipY2}%, transparent ${clipY2}%)`,
          }}
        />
      )}
    </span>
  );
}
