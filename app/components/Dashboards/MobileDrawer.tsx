// components/Dashboards/MobileDrawer.tsx
// Full slide-in navigation sheet for mobile. Triggered by the hamburger
// button in MobileHeader. Replaces the legacy 56px icon rail that was
// permanently consuming viewport width and causing card overflow.
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, X, ChevronDown, ChevronRight,
  LockKeyhole, User, Receipt, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { sidebarSections, accountItems } from "./Sidebar";
import { UpgradeModal } from "./UpgradeModal";
import { TierBadge } from "./TierBadge";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userTier = (session?.user?.tier as TierName) || "free";
  const tierConfig = getTierConfig(userTier);

  // Track which sections are expanded — open the section containing the active route by default
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: "base", featureName: "" });

  // Auto-expand the section containing the current route
  useEffect(() => {
    for (const section of sidebarSections) {
      const hasActive = section.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      );
      if (hasActive) {
        setExpandedSections((prev) => new Set([...prev, section.title]));
      }
    }
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Close drawer on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const userName = session?.user?.name || session?.user?.email || "User";
  const accountIconMap = { Profile: User, Subscription: Receipt, Support: HelpCircle };

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

          {/* Drawer panel — 85vw, max 360px, slides in from left */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-[340px] flex flex-col bg-linear-to-b from-zinc-950 via-black to-zinc-950 border-r border-white/10 md:hidden overflow-hidden"
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

            {/* Scrollable nav body */}
            <nav
              className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-0.5"
              style={{ scrollbarWidth: "thin" }}
            >
              {/* Dashboard quick link */}
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

              {/* Sections — collapsible */}
              {sidebarSections.map((section) => {
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
                                  onClick={(e) => {
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
                                  }}
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
                                  <item.icon size={14} className={cn(isLocked && "opacity-40")} />
                                  <span className={cn("flex-1 truncate", isLocked && "opacity-50")}>
                                    {item.name}
                                  </span>
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

              {/* Account section */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Account
                </div>
                {accountItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = (accountIconMap as Record<string, typeof User>)[item.name] ?? User;
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
