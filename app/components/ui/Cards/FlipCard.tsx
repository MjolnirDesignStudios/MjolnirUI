// components/ui/Cards/FlipCard.tsx
"use client";
import React from "react";
import type { TechIcon } from "@/data/index";

export type FlipCardProps = {
  icon: TechIcon;
  gradient: string;
  glowColor: string;
  flipAxis: "X" | "Y";
  flipDirection: 1 | -1;
  isFlipping: boolean;
  transform: string;
  transitionEnabled: boolean;
  /** Pure CSS lightning strike overlay (~5% on flip) */
  showLightning?: boolean;
};

export function FlipCard({
  icon,
  gradient: _gradient,
  glowColor,
  isFlipping,
  flipAxis,
  flipDirection,
  transform,
  transitionEnabled,
  showLightning = false,
}: FlipCardProps) {
  const baseColor = glowColor.slice(0, 7);
  const isBlank = icon.name === "__blank__";

  const renderIcon = () => {
    if (isBlank) return null;

    if (icon.svgPath) {
      return (
        <img
          src={icon.svgPath}
          width={48}
          height={48}
          alt={icon.name}
          style={{
            filter: "brightness(0) invert(1)",
            objectFit: "contain",
            width: 48,
            height: 48,
          }}
        />
      );
    }
    if (icon.reactIcon) {
      const Icon = icon.reactIcon;
      return <Icon size={48} color="white" />;
    }
    if (icon.initials) {
      const fontSize = icon.initials.length <= 2 ? "1.5rem" : "1.1rem";
      return (
        <span
          style={{
            fontWeight: 900,
            color: "white",
            fontSize,
            letterSpacing: "-0.02em",
          }}
        >
          {icon.initials}
        </span>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        perspective: "800px",
        aspectRatio: "1 / 1",
        pointerEvents: isFlipping ? "none" : "auto",
      }}
      data-flip-axis={flipAxis}
      data-flip-direction={flipDirection}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: transitionEnabled ? "transform 450ms ease-in-out" : "none",
          transform,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            background: "#030303",
            overflow: "hidden",
            boxShadow: [
              `inset 0 0 0 1.5px ${baseColor}cc`,
              `inset 0 0 18px -3px  ${baseColor}dd`,
              `inset 0 0 32px -5px  ${baseColor}88`,
            ].join(", "),
          }}
        >
          {renderIcon()}

          {/* CSS Lightning bolt overlay — rare ~5% */}
          {showLightning && (
            <>
              {/* Flash */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle at 50% 30%, ${baseColor}ee, transparent 70%)`,
                  opacity: 0,
                  animation: "lightning-flash 800ms ease-out forwards",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              />
              {/* Bolt SVG */}
              <svg
                viewBox="0 0 40 80"
                fill="none"
                style={{
                  position: "absolute",
                  width: "40%",
                  height: "70%",
                  zIndex: 11,
                  pointerEvents: "none",
                  filter: `drop-shadow(0 0 6px ${baseColor}) drop-shadow(0 0 12px ${baseColor}88)`,
                  animation: "lightning-bolt 800ms ease-out forwards",
                }}
              >
                <path
                  d="M22 2 L14 32 L22 30 L16 52 L28 52 L20 78 L32 40 L24 42 L34 12 L22 14 Z"
                  fill="white"
                  opacity="0.95"
                />
                <path
                  d="M22 2 L14 32 L22 30 L16 52 L28 52 L20 78 L32 40 L24 42 L34 12 L22 14 Z"
                  fill={baseColor}
                  opacity="0.5"
                />
              </svg>
              <style>{`
                @keyframes lightning-flash {
                  0%   { opacity: 0; }
                  10%  { opacity: 0.9; }
                  30%  { opacity: 0.3; }
                  50%  { opacity: 0.7; }
                  100% { opacity: 0; }
                }
                @keyframes lightning-bolt {
                  0%   { opacity: 0; transform: scaleY(0.3) translateY(-20%); }
                  8%   { opacity: 1; transform: scaleY(1) translateY(0); }
                  25%  { opacity: 0.4; }
                  40%  { opacity: 1; }
                  70%  { opacity: 0.6; }
                  100% { opacity: 0; transform: scaleY(1) translateY(0); }
                }
              `}</style>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
