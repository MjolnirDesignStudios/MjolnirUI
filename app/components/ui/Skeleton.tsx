// app/components/ui/Skeleton.tsx
// Loading placeholder primitives with a subtle shimmer animation.
//
// Three preset shapes:
//   - text   → 1.25em height, full-width, slight rounded
//   - box    → rectangular block, caller sizes via className / w-h props
//   - circle → square-aspect circle for avatar slots
//
// Compose into bigger skeleton layouts:
//   <div className="flex items-center gap-3">
//     <Skeleton shape="circle" size={40} />
//     <div className="flex-1 space-y-2">
//       <Skeleton shape="text" w="60%" />
//       <Skeleton shape="text" w="40%" />
//     </div>
//   </div>
"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type SkeletonShape = "text" | "box" | "circle";

export interface MjolnirSkeletonProps {
  shape?: SkeletonShape;
  /** CSS width — px number or any unit string. Default 100% (text) / 80px (box) / 32px (circle). */
  w?: number | string;
  /** CSS height — applies to box/text only. */
  h?: number | string;
  /** Pixel size for circle. Overrides w/h. */
  size?: number;
  /** Border radius override. */
  radius?: number | string;
  className?: string;
  /** Accessible loading label. */
  "aria-label"?: string;
}

export function MjolnirSkeleton({
  shape = "box",
  w,
  h,
  size,
  radius,
  className,
  "aria-label": ariaLabel = "Loading…",
}: MjolnirSkeletonProps) {
  const style: React.CSSProperties = {};
  let computedRadius: number | string;

  if (shape === "circle") {
    const s = size ?? 32;
    style.width = s;
    style.height = s;
    computedRadius = "50%";
  } else if (shape === "text") {
    style.width = w ?? "100%";
    style.height = h ?? "1.25em";
    computedRadius = radius ?? 4;
  } else {
    style.width = w ?? 80;
    style.height = h ?? 12;
    computedRadius = radius ?? 6;
  }
  if (radius !== undefined && shape !== "circle") computedRadius = radius;
  style.borderRadius = computedRadius;

  return (
    <>
      <span
        role="status"
        aria-label={ariaLabel}
        aria-busy="true"
        className={cn(
          "mjolnir-skeleton inline-block align-middle relative overflow-hidden",
          className
        )}
        style={style}
      />
      {/* Scoped keyframes — global var would be cleaner but a single <style>
          per render is fine since the runtime cost is one parse. */}
      <style>{`
        .mjolnir-skeleton {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .mjolnir-skeleton::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.06),
            transparent
          );
          animation: mjolnir-skeleton-shimmer 1.4s ease-in-out infinite;
        }
        @keyframes mjolnir-skeleton-shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}

export default MjolnirSkeleton;
