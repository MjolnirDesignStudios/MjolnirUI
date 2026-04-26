// components/ui/ShinyText.tsx — Metallic shimmer sweep across text
"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ShinyTextProps {
  children: React.ReactNode;
  /** Animation duration in seconds */
  speed?: number;
  /** Base text color (the dim part) */
  baseColor?: string;
  /** Shimmer highlight color */
  shineColor?: string;
  /** Width of the shimmer band as % */
  shineWidth?: number;
  /** Disable animation */
  disabled?: boolean;
  className?: string;
}

export function ShinyText({
  children,
  speed = 5,
  baseColor = "#666",
  shineColor = "#FFD700",
  shineWidth = 30,
  disabled = false,
  className,
}: ShinyTextProps) {
  return (
    <span
      className={cn("inline-block bg-clip-text text-transparent", className)}
      style={{
        backgroundImage: `linear-gradient(110deg, ${baseColor} 0%, ${baseColor} ${50 - shineWidth / 2}%, ${shineColor} 50%, ${baseColor} ${50 + shineWidth / 2}%, ${baseColor} 100%)`,
        backgroundSize: "300% 100%",
        backgroundRepeat: "no-repeat",
        animation: disabled ? undefined : `shiny-sweep ${speed}s linear infinite`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
      <style jsx>{`
        @keyframes shiny-sweep {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
      `}</style>
    </span>
  );
}
