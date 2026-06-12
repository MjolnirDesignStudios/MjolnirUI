// app/components/ui/Avatar.tsx
// Circular profile avatar with:
//   - Image source (falls back to initials when missing or fails to load)
//   - Initials fallback (auto-computed from `name`, or override via `initials`)
//   - Optional tier ring (uses tierConfig color for the surrounding stroke)
//   - Optional status dot (online / busy / offline)
//   - 4 size presets + arbitrary px size override
//
// Composes well inside DataTable cells, MobileHeader, Recent Users tables, etc.
"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getTierConfig, type TierName } from "@/lib/tierConfig";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<AvatarSize, { px: number; text: string }> = {
  xs: { px: 24, text: "text-[10px]" },
  sm: { px: 32, text: "text-xs" },
  md: { px: 40, text: "text-sm" },
  lg: { px: 56, text: "text-lg" },
  xl: { px: 72, text: "text-xl" },
};

export type AvatarStatus = "online" | "busy" | "away" | "offline";

const STATUS_COLOR: Record<AvatarStatus, string> = {
  online: "#10B981", // emerald
  busy: "#ef4444", // red
  away: "#FFCC11", // gold
  offline: "#71717a", // zinc
};

export interface MjolnirAvatarProps {
  /** Image src. Falls back to initials if omitted or fails. */
  src?: string | null;
  /** Used for alt text + to compute initials. */
  name?: string | null;
  /** Override the computed initials. */
  initials?: string;
  /** Preset size or px number. */
  size?: AvatarSize | number;
  /** Optional tier — colors the surrounding ring. */
  tier?: TierName;
  /** Direct ring color override (overrides tier). */
  ringColor?: string;
  /** Status dot in bottom-right. */
  status?: AvatarStatus;
  /** Custom className on the root. */
  className?: string;
  /** Click handler. Adds cursor-pointer + focus ring when set. */
  onClick?: () => void;
}

export function MjolnirAvatar({
  src,
  name,
  initials,
  size = "md",
  tier,
  ringColor,
  status,
  className,
  onClick,
}: MjolnirAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Resolve size.
  const resolved =
    typeof size === "number"
      ? { px: size, text: size >= 56 ? "text-lg" : size >= 40 ? "text-sm" : "text-xs" }
      : SIZE_MAP[size];

  // Compute initials from name if not provided.
  const resolvedInitials = (
    initials ??
    (name
      ? name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
      : "?")
  )
    .toUpperCase()
    .slice(0, 2);

  // Ring color: explicit > tier > none
  const effectiveRingColor =
    ringColor ?? (tier ? getTierConfig(tier).color : undefined);

  const showImage = !!src && !imageError;

  // Determinate background tint from initials (stable hash → palette).
  const initialBg = useMemo(
    () => bgForInitials(resolvedInitials),
    [resolvedInitials]
  );

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full overflow-visible select-none shrink-0",
        onClick &&
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC11]/40 cursor-pointer",
        className
      )}
      style={{ width: resolved.px, height: resolved.px }}
      aria-label={name ?? "Avatar"}
    >
      {/* Tier ring — outer stroke. Uses an absolutely-positioned span so it
          doesn't affect the avatar's content box sizing. */}
      {effectiveRingColor && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `0 0 0 2px ${effectiveRingColor}`,
          }}
        />
      )}

      {/* Image or initials */}
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={name ?? ""}
          onError={() => setImageError(true)}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span
          className={cn(
            "w-full h-full rounded-full flex items-center justify-center font-bold text-white",
            resolved.text
          )}
          style={{ backgroundColor: initialBg }}
        >
          {resolvedInitials}
        </span>
      )}

      {/* Status dot — bottom-right corner */}
      {status && (
        <span
          aria-hidden
          className="absolute rounded-full ring-2 ring-zinc-950"
          style={{
            width: Math.max(8, resolved.px * 0.22),
            height: Math.max(8, resolved.px * 0.22),
            backgroundColor: STATUS_COLOR[status],
            right: -2,
            bottom: -2,
          }}
        />
      )}
    </Tag>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */

// Small fixed palette of tinted-brand-friendly background colors. Stable
// hash of the initials picks one so the same user always gets the same color.
const INITIAL_PALETTE = [
  "#3b3650", // muted bifrost
  "#1d4a4a", // muted storm
  "#3b2b1a", // muted thunder
  "#2a3d2a", // muted emerald
  "#3d2722", // muted forge
  "#332a45", // mid-violet
];

function bgForInitials(initials: string): string {
  let h = 0;
  for (let i = 0; i < initials.length; i++) {
    h = (h * 31 + initials.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % INITIAL_PALETTE.length;
  return INITIAL_PALETTE[idx];
}

export default MjolnirAvatar;
