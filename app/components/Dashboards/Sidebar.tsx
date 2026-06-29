// components/Dashboards/Sidebar.tsx — Sequential Design System Workflow
"use client";
import React, { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, Download, Terminal, Cpu,
  Palette, Type, Paintbrush, Smile,
  Image, Sparkles, Layers,
  LayoutGrid, LayoutTemplate, FileText,
  Navigation, PanelLeft, Smartphone, ArrowRight,
  MousePointer, CreditCard, Tag, FormInput, MessageSquare, BarChart3,
  AlignLeft, ArrowRightLeft, Clapperboard, Wand2, Zap,
  Orbit, Box, Hammer,
  Lock, Gauge, Wrench, DollarSign,
  Bot, Code2,
  User, Receipt, HelpCircle,
  ChevronDown, ChevronRight, LockKeyhole,
  Shield, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";

import { UpgradeModal } from "./UpgradeModal";

export type SidebarItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  requiredTier: TierName;
  /** When set, the Link receives a data-onboarding="<id>" attribute so the
   *  OnboardingFlow tour can anchor a popover to this row. */
  onboardingId?: string;
  /** ISO date when this item shipped. Auto-promoted into the "NEW FEATURES"
   *  section while age < NEW_FEATURE_DAYS, then automatically removed from
   *  the sidebar once it expires (item stays browseable via /blocks/browse).
   *  The "NEW" chip + section membership are both derived from this. */
  releasedAt?: string;
};

/** Items younger than this many days appear in the auto-generated
 *  "NEW FEATURES" sidebar section. Tune up for slower content cadence,
 *  down for faster turnover. */
export const NEW_FEATURE_DAYS = 10;

/** Returns true if the item's releasedAt is within the last
 *  NEW_FEATURE_DAYS. Falsy or invalid releasedAt → false. */
export function isItemNew(item: SidebarItem, now: number = Date.now()): boolean {
  if (!item.releasedAt) return false;
  const t = new Date(item.releasedAt).getTime();
  if (Number.isNaN(t)) return false;
  return now - t < NEW_FEATURE_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Recently-shipped components surface here.
 *
 * USAGE:
 *   - Adding a new component? Append a row with today's ISO date as
 *     releasedAt. It will auto-appear in the "NEW FEATURES" sidebar
 *     section and auto-fall-out after 10 days.
 *   - No cron job required. The clock is just JavaScript's Date.now().
 *   - Items always remain browseable via /blocks/browse — only the
 *     dedicated sidebar row expires.
 *
 * Keep this list curated to the past few weeks. Older expired items
 * can be cleaned out manually whenever convenient (no harm in leaving
 * them — they just don't render).
 */
export const NEW_LAUNCHES: SidebarItem[] = [
  // ── 2026-06-29 tranche 3 · feedback + forms ─────────────────────
  // (Previous 6/11 waves auto-expired around 6/21 — left in place as
  //  reference; isItemNew filters them out anyway. Remove later for tidiness.)
  { name: "Toast", href: "/blocks/browse/toast", icon: MessageSquare, requiredTier: "free", releasedAt: "2026-06-29" },
  { name: "Alert", href: "/blocks/browse/alert", icon: MessageSquare, requiredTier: "free", releasedAt: "2026-06-29" },
  { name: "Banner", href: "/blocks/browse/banner", icon: PanelLeft, requiredTier: "free", releasedAt: "2026-06-29" },
  { name: "Checkbox", href: "/blocks/browse/checkbox", icon: FormInput, requiredTier: "free", releasedAt: "2026-06-29" },
  { name: "Switch", href: "/blocks/browse/switch", icon: FormInput, requiredTier: "free", releasedAt: "2026-06-29" },
];

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
  /** When true, the section is only rendered for session.user.role === "admin". */
  adminOnly?: boolean;
};

export const sidebarSections: SidebarSection[] = [
  /* "NEW FEATURES" is NOT defined here — it's auto-generated at render
     time from NEW_LAUNCHES (above), filtered to items younger than
     NEW_FEATURE_DAYS. See MjolnirSidebar for the merge logic. */
  {
    title: "GET STARTED",
    items: [
      { name: "Introduction", href: "/blocks/docs/intro", icon: BookOpen, requiredTier: "free" },
      { name: "Installation", href: "/blocks/docs/install", icon: Download, requiredTier: "free" },
      { name: "CLI Reference", href: "/blocks/docs/cli", icon: Terminal, requiredTier: "free" },
      { name: "MCP / AI Agent", href: "/blocks/docs/mcp", icon: Cpu, requiredTier: "pro" },
      { name: "Documentation", href: "/blocks/docs", icon: BookOpen, requiredTier: "free", onboardingId: "docs" },
    ],
  },
  {
    title: "FOUNDATION",
    items: [
      { name: "Design Tokens", href: "/blocks/foundation/tokens", icon: Palette, requiredTier: "free" },
      { name: "Typography", href: "/blocks/foundation/typography", icon: Type, requiredTier: "free" },
      { name: "Color System", href: "/blocks/foundation/colors", icon: Paintbrush, requiredTier: "free" },
      { name: "Icons", href: "/blocks/foundation/icons", icon: Smile, requiredTier: "free" },
    ],
  },
  {
    title: "CANVAS",
    items: [
      { name: "Backgrounds", href: "/blocks/canvas/backgrounds", icon: Image, requiredTier: "base" },
      { name: "Shader Backgrounds", href: "/blocks/canvas/shaders", icon: Sparkles, requiredTier: "pro" },
      { name: "Background Studio", href: "/blocks/background-studio", icon: Layers, requiredTier: "base", onboardingId: "background-studio" },
    ],
  },
  {
    title: "LAYOUT",
    items: [
      { name: "Grid Systems", href: "/blocks/layout/grids", icon: LayoutGrid, requiredTier: "free" },
      { name: "Sections", href: "/blocks/layout/sections", icon: LayoutTemplate, requiredTier: "base" },
      { name: "Page Templates", href: "/blocks/layout/templates", icon: FileText, requiredTier: "base" },
    ],
  },
  {
    title: "NAVIGATION",
    items: [
      { name: "Navbar", href: "/blocks/navigation/navbar", icon: Navigation, requiredTier: "free" },
      { name: "Sidebar", href: "/blocks/navigation/sidebar", icon: PanelLeft, requiredTier: "base" },
      { name: "Floating Nav", href: "/blocks/navigation/floating", icon: Smartphone, requiredTier: "free" },
      { name: "Breadcrumbs", href: "/blocks/navigation/breadcrumbs", icon: ArrowRight, requiredTier: "base" },
    ],
  },
  {
    title: "COMPONENTS",
    /* Permanent navigation — each item deep-links into /blocks/browse
       with a search filter pre-applied. These aren't "launches"; they're
       category entry points. New components show up in NEW FEATURES
       (auto-generated) for 10 days, then settle into these filtered
       category views indefinitely. */
    items: [
      { name: "Buttons", href: "/blocks/browse?category=ui&search=button", icon: MousePointer, requiredTier: "free" },
      { name: "Cards", href: "/blocks/browse?category=ui&search=card", icon: CreditCard, requiredTier: "free" },
      { name: "Badges", href: "/blocks/browse?category=ui&search=badge", icon: Tag, requiredTier: "free" },
      { name: "Inputs & Forms", href: "/blocks/browse?category=ui&search=input", icon: FormInput, requiredTier: "free" },
      { name: "Modals & Dialogs", href: "/blocks/browse?category=ui&search=modal", icon: MessageSquare, requiredTier: "base" },
      { name: "Stats & Data", href: "/blocks/browse?category=ui&search=stat", icon: BarChart3, requiredTier: "free" },
      { name: "Charts", href: "/blocks/browse?category=ui&search=chart", icon: BarChart3, requiredTier: "base" },
      { name: "Loaders", href: "/blocks/browse?category=ui&search=loader", icon: Loader2, requiredTier: "free" },
    ],
  },
  {
    title: "ANIMATION",
    items: [
      { name: "Text Effects", href: "/blocks/browse?category=ui&search=text", icon: AlignLeft, requiredTier: "free" },
      { name: "Transitions", href: "/blocks/animation/transitions", icon: ArrowRightLeft, requiredTier: "free" },
      { name: "Framer Motion", href: "/blocks/animation/framer", icon: Clapperboard, requiredTier: "base" },
      { name: "GSAP Animations", href: "/blocks/animation/gsap", icon: Wand2, requiredTier: "pro" },
      { name: "Electric Effects", href: "/blocks/animation/electric", icon: Zap, requiredTier: "base" },
    ],
  },
  {
    title: "3D & WEBGL",
    /* Permanent 3D nav. Wireframe Hammer / Orb / Grid live in
       NEW FEATURES for their 10-day window — they don't get duplicated
       here. They remain browseable via /blocks/browse forever. */
    items: [
      { name: "Wireframes", href: "/blocks/browse?category=3d&search=wireframe", icon: Box, requiredTier: "free" },
      { name: "Animated Orbs", href: "/blocks/browse/animated-orb", icon: Orbit, requiredTier: "base" },
      { name: "3D Showcase", href: "/blocks/3d/showcase", icon: Box, requiredTier: "pro" },
      { name: "3D Forge", href: "/blocks/3d/forge", icon: Hammer, requiredTier: "pro" },
    ],
  },
  {
    title: "SYSTEMS",
    items: [
      { name: "Authentication", href: "/blocks/systems/auth", icon: Lock, requiredTier: "base" },
      { name: "Dashboard Builder", href: "/blocks/systems/dashboard", icon: Gauge, requiredTier: "pro" },
      { name: "Website Tuner", href: "/blocks/systems/tuner", icon: Wrench, requiredTier: "pro" },
      { name: "Payments", href: "/blocks/systems/payments", icon: DollarSign, requiredTier: "base" },
    ],
  },
  {
    title: "AI TOOLS",
    items: [
      { name: "OdinAI Agent", href: "/blocks/ai/odinai", icon: Bot, requiredTier: "elite" },
      { name: "Asgardian Shader Tool", href: "/blocks/shader-tool", icon: Code2, requiredTier: "pro" },
      { name: "Particle Engine", href: "/blocks/particle-engine", icon: Sparkles, requiredTier: "pro" },
    ],
  },
  /* Admin-only utility section — rendered only when session.user.role === "admin".
     Filtered at render time in MjolnirSidebar + MobileDrawer. */
  {
    title: "DEV TOOLS",
    adminOnly: true,
    items: [
      { name: "Mobile Preview", href: "/blocks/dev/mobile-preview", icon: Smartphone, requiredTier: "free" },
    ],
  },
];

export const accountItems: SidebarItem[] = [
  { name: "Profile", href: "/blocks/account/profile", icon: User, requiredTier: "free" },
  { name: "Subscription", href: "/blocks/account/subscription", icon: Receipt, requiredTier: "free", onboardingId: "subscription" },
  { name: "Support", href: "/blocks/account/support", icon: HelpCircle, requiredTier: "free" },
];

export function MjolnirSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userTier = (session?.user?.tier as TierName) || 'free';
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  /* Build the live sidebar:
       1. Filter the static section list by adminOnly role gate.
       2. Compute which NEW_LAUNCHES are still "fresh" (< NEW_FEATURE_DAYS
          old). If any exist, prepend a virtual "NEW FEATURES" section.
       3. Re-render when the clock crosses the 10-day boundary by reading
          Date.now() inside a useMemo gated on the day-resolution time.

     Items expire automatically — once an entry's age exceeds NEW_FEATURE_DAYS,
     it stops appearing in NEW FEATURES (and isn't duplicated anywhere else in
     the sidebar). The component remains browseable via /blocks/browse forever.
  */
  // Day-resolution clock so the useMemo only re-runs when the day rolls
  // over, not on every render.
  const todayBucket = Math.floor(Date.now() / (24 * 60 * 60 * 1000));

  const visibleSections = useMemo(() => {
    const now = todayBucket * 24 * 60 * 60 * 1000;
    const adminFiltered = sidebarSections.filter(
      (s) => !s.adminOnly || userRole === "admin"
    );
    const liveNewItems = NEW_LAUNCHES.filter((item) => isItemNew(item, now));
    if (liveNewItems.length === 0) return adminFiltered;
    return [
      { title: "NEW FEATURES", items: liveNewItems } as SidebarSection,
      ...adminFiltered,
    ];
  }, [userRole, todayBucket]);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([...sidebarSections.map((s) => s.title), "NEW FEATURES"])
  );
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: 'base', featureName: '' });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const handleItemClick = (item: SidebarItem, e: React.MouseEvent) => {
    if (!hasAccess(userTier, item.requiredTier)) {
      e.preventDefault();
      setUpgradeModal({
        isOpen: true,
        requiredTier: item.requiredTier,
        featureName: item.name,
      });
    }
  };

  return (
    <>
      <aside className="hidden md:flex w-64 bg-linear-to-br from-zinc-900 via-black to-zinc-950 border-r border-zinc-800/50 h-screen flex-col">
        {/* Logo — sticky */}
        <div className="p-6 pb-4 shrink-0 border-b border-zinc-800/30">
          <Link href="/" className="block">
            <img src="/logos/MjolnirUI.png" alt="MjolnirUI" className="h-10 object-contain" />
          </Link>
        </div>

        {/* Navigation Sections — scrollable */}
        <nav className="flex-1 px-3 pb-4 space-y-1 overflow-y-auto scrollbar-thin"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          }}
        >
          {/* Dashboard Home */}
          <Link
            href="/blocks/dashboard"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
              pathname === "/blocks/dashboard"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <LayoutGrid size={16} />
            <span>Dashboard</span>
          </Link>

          {/* Browse All Components */}
          <Link
            href="/blocks/browse"
            data-onboarding="browse"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all mb-2",
              pathname === "/blocks/browse"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Layers size={16} />
            <span>Browse All (72)</span>
          </Link>

          {visibleSections.map((section) => {
            const isExpanded = expandedSections.has(section.title);
            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-black text-[#FFCC11] uppercase tracking-widest hover:text-[#FFD700] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    {section.title === "NEW FEATURES" && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#FFCC11] animate-pulse"
                        style={{ boxShadow: "0 0 6px #FFCC11" }}
                        aria-hidden
                      />
                    )}
                    {section.title}
                  </span>
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                {isExpanded && (
                  <div className="space-y-0.5 mb-2">
                    {section.items.map((item) => {
                      const isLocked = !hasAccess(userTier, item.requiredTier);
                      const isActive = pathname === item.href;
                      const tierConfig = getTierConfig(item.requiredTier);

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          data-onboarding={item.onboardingId}
                          onClick={(e) => handleItemClick(item, e)}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group",
                            isActive
                              ? "bg-white/10 text-white"
                              : isLocked
                                ? "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                          )}
                          style={isActive ? { borderLeft: `2px solid ${tierConfig.color}` } : undefined}
                        >
                          <item.icon size={16} className={cn(isLocked && "opacity-40")} />
                          <span className={cn("flex-1", isLocked && "opacity-40")}>{item.name}</span>
                          {isItemNew(item) && !isLocked && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#FFCC11]/15 text-[#FFCC11] border border-[#FFCC11]/30">
                              New
                            </span>
                          )}
                          {isLocked && (
                            <LockKeyhole size={12} style={{ color: tierConfig.color }} className="opacity-60" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Account Section */}
          <div className="border-t border-zinc-800/50 pt-2 mt-4">
            <div className="px-3 py-2 text-xs font-black text-[#FFCC11] uppercase tracking-widest">
              ACCOUNT
            </div>
            <div className="space-y-0.5">
              {accountItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    data-onboarding={item.onboardingId}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal(prev => ({ ...prev, isOpen: false }))}
        requiredTier={upgradeModal.requiredTier}
        featureName={upgradeModal.featureName}
      />
    </>
  );
}
