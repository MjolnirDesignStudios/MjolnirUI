// components/ui/Cards/FlipCard.tsx
"use client";
import React from "react";
import type { TechIcon } from "@/data/index";

export type FlipCardProps = {
  icon: TechIcon;
  gradient: string;
  glowColor: string;
  /** Which axis this card is currently flipping on */
  flipAxis: "X" | "Y";
  /** Direction of rotation: 1 = positive angle, -1 = negative angle */
  flipDirection: 1 | -1;
  /** True while the flip animation is in progress */
  isFlipping: boolean;
  /** CSS transform string — set by TechCardGrid, applied directly */
  transform: string;
  /** When false, CSS transition is disabled (during instant Phase 2 reset) */
  transitionEnabled: boolean;
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
}: FlipCardProps) {
  // Extract #RRGGBB from glowColor string like "#0EA5E930"
  const baseColor = glowColor.slice(0, 7);

  const renderIcon = () => {
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
          transition: transitionEnabled ? "transform 300ms ease-in-out" : "none",
          transform,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            background: "#030303",
            boxShadow: [
              `inset 0 0 0 1.5px ${baseColor}cc`,
              `inset 0 0 18px -3px  ${baseColor}dd`,
              `inset 0 0 32px -5px  ${baseColor}88`,
            ].join(", "),
          }}
        >
          {renderIcon()}
        </div>
      </div>
    </div>
  );
}
