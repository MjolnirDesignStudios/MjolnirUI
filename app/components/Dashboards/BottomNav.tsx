// app/components/Dashboards/BottomNav.tsx
// Mobile-only bottom tab bar — Linear / Notion / Cal.com style.
//
// 4 tabs always visible: Home · Browse · Studio · More.
// The "More" tab is an action button that opens the MobileDrawer (full nav
// tree); the other three navigate directly to a canonical route.
//
// Designed to be copy-paste-ready into any Next.js project:
//   - Props-driven tab list (override the defaults if you want different
//     destinations).
//   - Zero internal state — active state is derived from usePathname().
//   - iOS safe-area inset baked into the wrapper.
//   - No tier coupling; the component renders the same for every user.
//
// Tier-aware behavior (locked Studio for Free users) is handled via the
// `lockedTabs` prop. When a locked tab is tapped, `onLockedTabTap` fires —
// the host component can show an upgrade modal.
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Search, Wand2, MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════ */

export interface BottomNavTab {
  /** Stable id used for active-state + analytics */
  id: string;
  /** Short label shown under the icon (1 word ideal) */
  label: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Destination path. Either href OR onClick must be set. */
  href?: string;
  /** Tap handler — used for the "More" tab which opens a drawer. */
  onClick?: () => void;
  /** Regex that decides whether this tab is "active" for the current path. */
  activeMatch?: RegExp;
  /** Optional tinted accent color for the active indicator (defaults to gold) */
  accent?: string;
}

export interface BottomNavProps {
  /** Override the tab list. If omitted, the default 4 tabs are used. */
  tabs?: BottomNavTab[];
  /** Tab ids that should render as locked (e.g. Studio for Free users). */
  lockedTabs?: string[];
  /** Fires when a locked tab is tapped. */
  onLockedTabTap?: (tabId: string) => void;
  /** Optional analytics callback fired on every tab tap. */
  onTabTap?: (tabId: string) => void;
  /** Hide on these path prefixes (e.g. "/admin" if you don't want it in admin). */
  hidePathPrefixes?: string[];
  /** Extra class names for the wrapper. */
  className?: string;
}

/* Default tabs — mirrors the MjolnirUI sidebar's primary destinations. */
export const DEFAULT_TABS: BottomNavTab[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    href: "/blocks/dashboard",
    activeMatch: /^\/blocks\/dashboard(?:$|\/)/,
  },
  {
    id: "browse",
    label: "Browse",
    icon: Search,
    href: "/blocks/browse",
    activeMatch: /^\/blocks\/browse/,
  },
  {
    id: "studio",
    label: "Studio",
    icon: Wand2,
    href: "/blocks/background-studio",
    /* Active across all three studio surfaces */
    activeMatch:
      /^\/blocks\/(background-studio|particle-engine|shader-tool|foundation|layout|animation|canvas)/,
  },
  {
    id: "more",
    label: "More",
    icon: MoreHorizontal,
    /* No href — host wires onClick to open the drawer */
  },
];

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */

export function BottomNav({
  tabs = DEFAULT_TABS,
  lockedTabs = [],
  onLockedTabTap,
  onTabTap,
  hidePathPrefixes = [],
  className = "",
}: BottomNavProps) {
  const pathname = usePathname() || "";
  const router = useRouter();

  // Conditional hiding for routes that shouldn't show the bottom nav
  // (e.g. studio canvases that need every pixel).
  if (hidePathPrefixes.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav
      aria-label="Primary mobile navigation"
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-zinc-800/60 bg-black/85 backdrop-blur-xl ${className}`}
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="grid grid-cols-4 h-[60px]">
        {tabs.map((tab) => {
          const isLocked = lockedTabs.includes(tab.id);
          const isActive = !!tab.activeMatch?.test(pathname);
          const Icon = tab.icon;
          const accent = tab.accent || "#FFCC11";

          const handleClick = (e: React.MouseEvent) => {
            onTabTap?.(tab.id);
            if (isLocked) {
              e.preventDefault();
              onLockedTabTap?.(tab.id);
              return;
            }
            if (tab.onClick) {
              e.preventDefault();
              tab.onClick();
              return;
            }
            // href links use default behavior via the <Link> component.
          };

          /* Active-line indicator across the top of the tab */
          const indicator = isActive ? (
            <span
              aria-hidden
              className="absolute top-0 inset-x-6 h-0.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
          ) : null;

          const innerContent = (
            <>
              {indicator}
              <Icon
                size={20}
                className="transition"
                style={{
                  color: isActive ? accent : isLocked ? "#52525b" : "#a1a1aa",
                  opacity: isLocked ? 0.55 : 1,
                }}
                aria-hidden
              />
              <span
                className={`text-[10px] mt-0.5 font-semibold uppercase tracking-wider transition`}
                style={{
                  color: isActive ? accent : isLocked ? "#52525b" : "#a1a1aa",
                  opacity: isLocked ? 0.6 : 1,
                }}
              >
                {tab.label}
              </span>
            </>
          );

          // Render as Link when href is set and not locked; otherwise as button.
          if (tab.href && !isLocked && !tab.onClick) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={(e) => onTabTap?.(tab.id) /* analytics only */}
                className="relative flex flex-col items-center justify-center gap-0.5 min-h-[44px] hover:bg-white/5 transition active:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC11]/40"
                aria-current={isActive ? "page" : undefined}
              >
                {innerContent}
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={handleClick}
              className="relative flex flex-col items-center justify-center gap-0.5 min-h-[44px] hover:bg-white/5 transition active:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC11]/40"
              aria-label={isLocked ? `${tab.label} — locked` : tab.label}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={isLocked}
            >
              {innerContent}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
