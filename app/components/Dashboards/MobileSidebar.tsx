// components/Dashboards/MobileSidebar.tsx — Mobile icon rail + slide-out drawer
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, BookOpen, Palette, Image, LayoutTemplate,
  Navigation, MousePointer, Sparkles, Box, Gauge, Bot,
  User, Settings, X, LockKeyhole,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { sidebarSections, accountItems, type SidebarSection } from "./Sidebar";
import { UpgradeModal } from "./UpgradeModal";

const POSITION_KEY = "mjolnir-sidebar-position";

// Icon mapping for each section in the rail
const sectionIcons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  "GET STARTED": BookOpen,
  "FOUNDATION": Palette,
  "CANVAS": Image,
  "LAYOUT": LayoutTemplate,
  "NAVIGATION": Navigation,
  "COMPONENTS": MousePointer,
  "ANIMATION": Sparkles,
  "3D & WEBGL": Box,
  "SYSTEMS": Gauge,
  "AI TOOLS": Bot,
};

export function MobileSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userTier = (session?.user?.tier as TierName) || "free";
  const tierConfig = getTierConfig(userTier);

  const [position, setPosition] = useState<"left" | "right">("left");
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: "base", featureName: "" });

  // Load position preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(POSITION_KEY);
    if (saved === "left" || saved === "right") {
      setPosition(saved);
    }
  }, []);

  const togglePosition = useCallback(() => {
    setPosition((prev) => {
      const next = prev === "left" ? "right" : "left";
      localStorage.setItem(POSITION_KEY, next);
      window.dispatchEvent(new CustomEvent("mjolnir-sidebar-position", { detail: next }));
      return next;
    });
    setActiveDrawer(null);
  }, []);

  const handleDrawerToggle = useCallback((key: string) => {
    setActiveDrawer((prev) => (prev === key ? null : key));
  }, []);

  const closeDrawer = useCallback(() => {
    setActiveDrawer(null);
  }, []);

  // Determine which section is active based on pathname
  const getActiveSectionKey = (): string | null => {
    if (pathname === "/blocks/dashboard") return "dashboard";
    for (const section of sidebarSections) {
      for (const item of section.items) {
        if (pathname === item.href || pathname.startsWith(item.href + "/")) {
          return section.title;
        }
      }
    }
    for (const item of accountItems) {
      if (pathname === item.href) return "account";
    }
    return null;
  };

  const activeSectionKey = getActiveSectionKey();

  // Get the items to display in the drawer
  const getDrawerContent = (): { title: string; items: typeof accountItems } | null => {
    if (activeDrawer === "dashboard") return null; // Dashboard is a direct link
    if (activeDrawer === "account") return { title: "ACCOUNT", items: accountItems };
    const section = sidebarSections.find((s) => s.title === activeDrawer);
    if (section) return { title: section.title, items: section.items };
    return null;
  };

  const drawerContent = getDrawerContent();
  const isLeft = position === "left";

  // Rail items: Dashboard + sections + Account + Settings
  const railItems: {
    key: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    label: string;
    href?: string;
  }[] = [
    { key: "dashboard", icon: LayoutGrid, label: "Dashboard", href: "/blocks/dashboard" },
    ...sidebarSections.map((s) => ({
      key: s.title,
      icon: sectionIcons[s.title] || LayoutGrid,
      label: s.title,
    })),
    { key: "account", icon: User, label: "Account" },
  ];

  return (
    <>
      {/* Icon Rail — slim 56px */}
      <div
        className={cn(
          "fixed top-0 bottom-0 z-50 w-14 flex flex-col items-center py-3 gap-0.5",
          "bg-black/95 backdrop-blur-xl border-white/10",
          isLeft ? "left-0 border-r" : "right-0 border-l"
        )}
      >
        {/* Logo */}
        <Link href="/" className="mb-2 flex-shrink-0">
          <img
            src="/logos/MjolnirUI.png"
            alt="MjolnirUI"
            className="h-6 w-6 object-contain"
          />
        </Link>

        {/* Rail Icons */}
        <nav className="flex-1 flex flex-col items-center gap-px overflow-y-auto overflow-x-hidden w-full scrollbar-none">
          {railItems.map((item) => {
            const isActive = activeSectionKey === item.key;
            const isDrawerOpen = activeDrawer === item.key;
            const Icon = item.icon;

            // Dashboard is a direct link, others open drawers
            if (item.href) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={closeDrawer}
                  className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-lg transition-all",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  )}
                  title={item.label}
                >
                  {isActive && (
                    <span
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full",
                        isLeft ? "-left-[5px]" : "-right-[5px]"
                      )}
                      style={{ backgroundColor: tierConfig.color }}
                    />
                  )}
                  <Icon size={18} />
                </Link>
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => handleDrawerToggle(item.key)}
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-lg transition-all",
                  isActive || isDrawerOpen
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                )}
                title={item.label}
              >
                {isActive && (
                  <span
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full",
                      isLeft ? "-left-[5px]" : "-right-[5px]"
                    )}
                    style={{ backgroundColor: tierConfig.color }}
                  />
                )}
                <Icon size={20} />
              </button>
            );
          })}
        </nav>

        {/* Settings toggle */}
        <button
          onClick={togglePosition}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
          title={`Move sidebar to ${isLeft ? "right" : "left"}`}
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Slide-out Drawer + Backdrop */}
      <AnimatePresence>
        {activeDrawer && drawerContent && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={closeDrawer}
            />

            {/* Drawer Panel */}
            <motion.div
              key="drawer"
              initial={{ x: isLeft ? -256 : 256 }}
              animate={{ x: 0 }}
              exit={{ x: isLeft ? -256 : 256 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "fixed top-0 bottom-0 z-45 w-64 flex flex-col",
                "bg-black/95 backdrop-blur-xl border-white/10",
                isLeft ? "left-14 border-r" : "right-14 border-l"
              )}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {drawerContent.title}
                </span>
                <button
                  onClick={closeDrawer}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Items */}
              <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                {drawerContent.items.map((item) => {
                  const isLocked = !hasAccess(userTier, item.requiredTier);
                  const isActive = pathname === item.href;
                  const itemTierConfig = getTierConfig(item.requiredTier);

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
                          closeDrawer();
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all min-h-[44px]",
                        isActive
                          ? "bg-white/10 text-white"
                          : isLocked
                            ? "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                      style={
                        isActive
                          ? { borderLeft: `2px solid ${itemTierConfig.color}` }
                          : undefined
                      }
                    >
                      <item.icon
                        size={16}
                        className={cn(isLocked && "opacity-40")}
                      />
                      <span className={cn("flex-1", isLocked && "opacity-40")}>
                        {item.name}
                      </span>
                      {isLocked && (
                        <LockKeyhole
                          size={12}
                          style={{ color: itemTierConfig.color }}
                          className="opacity-60"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() =>
          setUpgradeModal((prev) => ({ ...prev, isOpen: false }))
        }
        requiredTier={upgradeModal.requiredTier}
        featureName={upgradeModal.featureName}
      />
    </>
  );
}
