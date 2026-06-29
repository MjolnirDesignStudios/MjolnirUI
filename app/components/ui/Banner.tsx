// app/components/ui/Banner.tsx
// Page-level / app-shell banner — full-width strip pinned to the top of
// the viewport (or a section). Used for announcements, downtime alerts,
// limited-time offers, beta-tier callouts.
//
// Differs from <Alert /> in three ways:
//   1. Visual: full-width, edge-to-edge, denser horizontal layout
//   2. Position: typically rendered at the very top of a layout
//   3. Persistence: optional localStorage key to remember dismissal
//      across page loads
//
// Usage:
//   <MjolnirBanner
//     variant="thunder"
//     persistKey="june-25-hammer-post"
//     dismissible
//     action={<a href="/blog">Read the post →</a>}
//   >
//     🔨 The Hammer · June 2026 is live — here's what shipped.
//   </MjolnirBanner>
"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type BannerVariant =
  | "thunder"
  | "storm"
  | "bifrost"
  | "forge"
  | "neutral";

const BANNER_CONFIG: Record<
  BannerVariant,
  {
    bg: string;
    border: string;
    text: string;
    accent: string;
  }
> = {
  thunder: {
    bg: "bg-amber-500/12",
    border: "border-amber-500/30",
    text: "text-amber-100",
    accent: "#FFCC11",
  },
  storm: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/25",
    text: "text-cyan-100",
    accent: "#00f0ff",
  },
  bifrost: {
    bg: "bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-emerald-500/10",
    border: "border-white/15",
    text: "text-white",
    accent: "#a78bfa",
  },
  forge: {
    bg: "bg-orange-500/12",
    border: "border-orange-500/30",
    text: "text-orange-100",
    accent: "#f97316",
  },
  neutral: {
    bg: "bg-zinc-900",
    border: "border-zinc-800",
    text: "text-zinc-200",
    accent: "#a1a1aa",
  },
};

const STORAGE_PREFIX = "mjolnir-banner-dismissed:";

export interface MjolnirBannerProps {
  variant?: BannerVariant;
  /** Banner body — supports JSX (links, bold, etc.). */
  children: React.ReactNode;
  /** Trailing CTA — anchor, button, etc. */
  action?: React.ReactNode;
  /** Show an X to dismiss. */
  dismissible?: boolean;
  /** When set, dismissal is remembered in localStorage under this key. */
  persistKey?: string;
  /** Fires after dismiss. */
  onDismiss?: () => void;
  /** Optional leading icon / emoji slot — small. */
  icon?: React.ReactNode;
  /** Whether to sticky-pin to the top of its scroll container. */
  sticky?: boolean;
  className?: string;
}

export function MjolnirBanner({
  variant = "thunder",
  children,
  action,
  dismissible = false,
  persistKey,
  onDismiss,
  icon,
  sticky = false,
  className,
}: MjolnirBannerProps) {
  const cfg = BANNER_CONFIG[variant];

  /* Per-banner dismissed state. If persistKey is set, hydrate from
     localStorage on mount (SSR-safe — first render shows the banner,
     then it disappears post-hydration if previously dismissed). */
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (!persistKey || typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(STORAGE_PREFIX + persistKey) === "1") {
        setDismissed(true);
      }
    } catch {
      /* localStorage unavailable (private mode) — just stay visible */
    }
  }, [persistKey]);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (persistKey && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_PREFIX + persistKey, "1");
      } catch {
        /* ignore */
      }
    }
    onDismiss?.();
  };

  return (
    <div
      role="status"
      className={cn(
        "w-full border-b backdrop-blur-md",
        cfg.bg,
        cfg.border,
        sticky && "sticky top-0 z-30",
        className
      )}
      style={{
        boxShadow: `inset 0 -1px 0 0 ${cfg.accent}20`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
        {icon && (
          <div className="shrink-0" style={{ color: cfg.accent }}>
            {icon}
          </div>
        )}
        <div className={cn("flex-1 min-w-0 text-sm", cfg.text)}>{children}</div>
        {action && <div className="shrink-0">{action}</div>}
        {dismissible && (
          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="shrink-0 -mr-1 p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export default MjolnirBanner;
