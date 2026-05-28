// components/Dashboards/MobileDrawer.tsx
// Full slide-in navigation sheet for mobile. Triggered by the hamburger
// button in MobileHeader OR the "More" tab in BottomNav.
//
// v2 enhancements (Nav redesign):
//   - Inline search input at the top — filters all 44 sidebar items by name
//     or tag in real time. When the query is non-empty, sections collapse
//     and matches render as a flat list.
//   - Recents strip — tracks the last 5 visited /blocks/* paths in
//     localStorage. Surfaces them right under the search bar.
//   - All existing behavior preserved: section accordion, tier gating,
//     PortalSwitcher, account section.
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, X, ChevronDown, ChevronRight, Search,
  LockKeyhole, User, Receipt, HelpCircle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import {
  sidebarSections,
  accountItems,
  isItemNew,
  NEW_LAUNCHES,
  type SidebarItem,
  type SidebarSection,
} from "./Sidebar";
import { UpgradeModal } from "./UpgradeModal";
import { TierBadge } from "./TierBadge";
import { PortalSwitcher } from "./PortalSwitcher";
import { useSafeSessionUser } from "@/lib/devPreview";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENTS_KEY = "mjolnir-mobile-recents";
const MAX_RECENTS = 5;

/** Track a path visit in localStorage. Called from MobileLayout on route change. */
export function pushRecent(path: string) {
  if (typeof window === "undefined") return;
  // Only track actual destination pages, not the dashboard root.
  if (!path.startsWith("/blocks/") || path === "/blocks/dashboard") return;
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const recents: string[] = raw ? JSON.parse(raw) : [];
    const next = [path, ...recents.filter((p) => p !== path)].slice(0, MAX_RECENTS);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* ignore localStorage failures (quota, privacy mode) */
  }
}

function readRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Find a SidebarItem matching a given href. Returns undefined if no match.
 *  Searches NEW_LAUNCHES first so a recent visit to a fresh component
 *  resolves to the launch entry (with releasedAt date intact). */
function findItemByHref(href: string): SidebarItem | undefined {
  const fromNew = NEW_LAUNCHES.find((it) => it.href === href);
  if (fromNew) return fromNew;
  for (const section of sidebarSections) {
    const m = section.items.find((it) => it.href === href);
    if (m) return m;
  }
  return undefined;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userTier = (session?.user?.tier as TierName) || "free";
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const tierConfig = getTierConfig(userTier);

  // Sections visible to this user — admin-only sections (e.g. DEV TOOLS)
  // are filtered out for everyone except role === "admin". Also injects
  // a dynamic "NEW FEATURES" section at the top containing any
  // NEW_LAUNCHES that are still within the 10-day window.
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

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<string[]>([]);
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: "base", featureName: "" });

  // Pull recents from localStorage when the drawer opens.
  useEffect(() => {
    if (isOpen) setRecents(readRecents());
  }, [isOpen]);

  // Auto-expand the section containing the current route on first mount.
  useEffect(() => {
    if (!pathname) return;
    for (const section of visibleSections) {
      const hasActive = section.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      );
      if (hasActive) {
        setExpandedSections((prev) => new Set([...prev, section.title]));
      }
    }
  }, [pathname]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Reset query when the drawer closes so the next open starts fresh.
  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  const toggleSection = (title: string) =>
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  /* ── Search: flatten matches across all sections ────── */
  const searchMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const hits: Array<{ section: string; item: SidebarItem }> = [];
    for (const section of visibleSections) {
      for (const item of section.items) {
        if (
          item.name.toLowerCase().includes(q) ||
          item.href.toLowerCase().includes(q) ||
          section.title.toLowerCase().includes(q)
        ) {
          hits.push({ section: section.title, item });
        }
      }
    }
    return hits;
  }, [query, visibleSections]);

  /* ── Resolve recent paths to sidebar items for display ── */
  const recentItems = useMemo(() => {
    return recents
      .map((href) => findItemByHref(href))
      .filter((it): it is SidebarItem => Boolean(it));
  }, [recents]);

  // Mask name/email in preview mode unless we're on an admin route — the
  // mobile drawer renders only on user-side surfaces today, but we gate
  // defensively in case it gets reused under /admin in the future.
  const isAdminRoute = (pathname || "").startsWith("/admin");
  const viewer = useSafeSessionUser(session?.user);
  const userName = isAdminRoute
    ? session?.user?.name || session?.user?.email || "User"
    : viewer.name || viewer.email || "User";
  const accountIconMap = { Profile: User, Subscription: Receipt, Support: HelpCircle };

  /* Handle click on a search/recent/section item — gates locked items */
  const handleItemClick = (item: SidebarItem, e: React.MouseEvent) => {
    const isLocked = !hasAccess(userTier, item.requiredTier);
    if (isLocked) {
      e.preventDefault();
      setUpgradeModal({
        isOpen: true,
        requiredTier: item.requiredTier,
        featureName: item.name,
      });
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[88vw] max-w-[360px] flex flex-col bg-linear-to-b from-zinc-950 via-black to-zinc-950 border-r border-white/10 md:hidden overflow-hidden"
            role="dialog"
            aria-label="Navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                <img
                  src="/logos/MjolnirUI.png"
                  alt="MjolnirUI"
                  className="h-7 object-contain"
                />
              </Link>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-white transition"
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>

            {/* User strip */}
            <div className="px-5 py-3 border-b border-white/10 flex items-center gap-3 shrink-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border border-white/10 shrink-0"
                style={{
                  backgroundColor: `${tierConfig.color}20`,
                  color: tierConfig.color,
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white truncate">{userName}</div>
                <div className="mt-0.5">
                  <TierBadge tier={userTier} size="sm" />
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="px-3 pt-3 pb-2 shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus-within:border-[#FFCC11]/40 transition">
                <Search size={14} className="text-gray-500 shrink-0" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search navigation…"
                  className="bg-transparent text-sm text-white outline-none w-full"
                  /* Don't autoFocus on mobile — opens the keyboard unexpectedly */
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="text-gray-500 hover:text-white transition"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable nav body */}
            <nav
              className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 space-y-0.5"
              style={{ scrollbarWidth: "thin" }}
            >
              {/* ── Search results (when query active) ───── */}
              {query.trim() ? (
                <div className="space-y-0.5">
                  <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {searchMatches.length} result{searchMatches.length === 1 ? "" : "s"}
                  </div>
                  {searchMatches.length === 0 ? (
                    <div className="px-3 py-6 text-xs text-gray-500 text-center">
                      Nothing matched. Try a different keyword.
                    </div>
                  ) : (
                    searchMatches.map(({ section, item }) => (
                      <SearchHitRow
                        key={`${section}-${item.name}`}
                        item={item}
                        section={section}
                        userTier={userTier}
                        currentPath={pathname || ""}
                        onClick={(e) => handleItemClick(item, e)}
                      />
                    ))
                  )}
                </div>
              ) : (
                <>
                  {/* ── Portal switcher (admin only) ───── */}
                  <PortalSwitcher variant="menu-item" onNavigate={onClose} />

                  {/* ── Recents ────────────────────────── */}
                  {recentItems.length > 0 && (
                    <div className="mb-2 mt-1">
                      <div className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <Clock size={10} />
                        <span>Recent</span>
                      </div>
                      <div className="space-y-0.5">
                        {recentItems.map((item) => {
                          const isLocked = !hasAccess(userTier, item.requiredTier);
                          const isActive = pathname === item.href;
                          const itemTier = getTierConfig(item.requiredTier);
                          return (
                            <Link
                              key={`recent-${item.href}`}
                              href={item.href}
                              onClick={(e) => handleItemClick(item, e)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition min-h-[40px]",
                                isActive
                                  ? "bg-white/10 text-white"
                                  : isLocked
                                    ? "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                                    : "text-gray-300 hover:text-white hover:bg-white/5"
                              )}
                            >
                              <item.icon size={14} className={cn(isLocked && "opacity-40")} />
                              <span className={cn("flex-1 truncate text-xs", isLocked && "opacity-50")}>
                                {item.name}
                              </span>
                              {isItemNew(item) && !isLocked && (
                                <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-[#FFCC11]/15 text-[#FFCC11] border border-[#FFCC11]/30 shrink-0">
                                  New
                                </span>
                              )}
                              {isLocked && (
                                <LockKeyhole
                                  size={10}
                                  style={{ color: itemTier.color }}
                                  className="opacity-60 shrink-0"
                                />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Dashboard quick link ───────────── */}
                  <Link
                    href="/blocks/dashboard"
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition min-h-[44px]",
                      pathname === "/blocks/dashboard"
                        ? "bg-white/10 text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <LayoutGrid size={16} />
                    <span>Dashboard</span>
                  </Link>

                  {/* ── Collapsible sections ────────────── */}
                  {visibleSections.map((section) => {
                    const isExpanded = expandedSections.has(section.title);
                    return (
                      <div key={section.title} className="mt-2">
                        <button
                          onClick={() => toggleSection(section.title)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wider hover:text-gray-300 hover:bg-white/5 transition"
                        >
                          <span>{section.title}</span>
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-0.5 pt-0.5">
                                {section.items.map((item) => {
                                  const isLocked = !hasAccess(userTier, item.requiredTier);
                                  const isActive = pathname === item.href;
                                  const itemTier = getTierConfig(item.requiredTier);
                                  return (
                                    <Link
                                      key={item.name}
                                      href={item.href}
                                      onClick={(e) => handleItemClick(item, e)}
                                      className={cn(
                                        "flex items-center gap-3 pl-6 pr-3 py-2.5 rounded-lg text-sm transition min-h-[44px]",
                                        isActive
                                          ? "bg-white/10 text-white"
                                          : isLocked
                                            ? "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                                            : "text-gray-300 hover:text-white hover:bg-white/5"
                                      )}
                                      style={
                                        isActive
                                          ? { borderLeft: `2px solid ${itemTier.color}` }
                                          : undefined
                                      }
                                    >
                                      <item.icon
                                        size={14}
                                        className={cn(isLocked && "opacity-40")}
                                      />
                                      <span
                                        className={cn("flex-1 truncate", isLocked && "opacity-50")}
                                      >
                                        {item.name}
                                      </span>
                                      {isItemNew(item) && !isLocked && (
                                        <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-[#FFCC11]/15 text-[#FFCC11] border border-[#FFCC11]/30 shrink-0">
                                          New
                                        </span>
                                      )}
                                      {isLocked && (
                                        <LockKeyhole
                                          size={11}
                                          style={{ color: itemTier.color }}
                                          className="opacity-60 shrink-0"
                                        />
                                      )}
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  {/* ── Account section ───────────────── */}
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Account
                    </div>
                    {accountItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon =
                        (accountIconMap as Record<string, typeof User>)[item.name] ?? User;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition min-h-[44px]",
                            isActive
                              ? "bg-white/10 text-white"
                              : "text-gray-300 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <Icon size={14} />
                          <span className="flex-1 truncate">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </nav>
          </motion.aside>

          <UpgradeModal
            isOpen={upgradeModal.isOpen}
            onClose={() => setUpgradeModal((prev) => ({ ...prev, isOpen: false }))}
            requiredTier={upgradeModal.requiredTier}
            featureName={upgradeModal.featureName}
          />
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Single search hit — flatter design, includes section breadcrumb ────── */
function SearchHitRow({
  item,
  section,
  userTier,
  currentPath,
  onClick,
}: {
  item: SidebarItem;
  section: string;
  userTier: TierName;
  currentPath: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const isLocked = !hasAccess(userTier, item.requiredTier);
  const isActive = currentPath === item.href;
  const itemTier = getTierConfig(item.requiredTier);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition min-h-[44px]",
        isActive
          ? "bg-white/10 text-white"
          : isLocked
            ? "text-gray-600 hover:text-gray-400 hover:bg-white/5"
            : "text-gray-300 hover:text-white hover:bg-white/5"
      )}
    >
      <item.icon size={14} className={cn(isLocked && "opacity-40")} />
      <div className="flex-1 min-w-0">
        <div className={cn("text-sm truncate", isLocked && "opacity-60")}>{item.name}</div>
        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider truncate">
          {section}
        </div>
      </div>
      {isLocked && (
        <LockKeyhole
          size={11}
          style={{ color: itemTier.color }}
          className="opacity-60 shrink-0"
        />
      )}
    </Link>
  );
}
