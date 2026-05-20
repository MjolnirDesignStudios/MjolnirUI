// components/Dashboards/MobileLayout.tsx
// v2 Nav redesign (2026-05-19):
// - Sticky top MobileHeader (hamburger + logo + avatar)
// - Slide-in MobileDrawer with search + recents
// - Bottom-fixed BottomNav (4 tabs) — always visible primary navigation
// - Recents tracker — every protected route change is pushed to localStorage
//
// overflow-x-hidden + max-w-[100vw] preserved from the Day-1 mobile fix.
// Bottom padding on <main> ensures content clears the bottom nav + the iOS
// home-indicator safe area.
"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { MobileDrawer, pushRecent } from "./MobileDrawer";
import { MobileHeader } from "./MobileHeader";
import { BottomNav, DEFAULT_TABS } from "./BottomNav";
import { hasAccess, type TierName } from "@/lib/tierConfig";
import { UpgradeModal } from "./UpgradeModal";

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: "base", featureName: "" });

  const pathname = usePathname();
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || "free";

  // Track route changes for the drawer's "Recents" strip.
  useEffect(() => {
    if (pathname) pushRecent(pathname);
  }, [pathname]);

  /* Configure the BottomNav: wire the "More" tab to open the drawer, and
     lock the Studio tab for users below Base tier (it goes to background-
     studio which is Base+). */
  const tabs = DEFAULT_TABS.map((t) =>
    t.id === "more" ? { ...t, onClick: () => setDrawerOpen(true) } : t
  );
  const lockedTabs = hasAccess(userTier, "base") ? [] : ["studio"];

  return (
    <div className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      {/* Sticky top bar */}
      <MobileHeader onOpenDrawer={() => setDrawerOpen(true)} />

      {/* Slide-in drawer (closed by default) */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Content
          - pb-[76px] clears the 60px bottom nav + 16px safe gap.
          - Safe-area inset additive on iPhones with home indicators. */}
      <main
        className="flex-1 w-full overflow-x-hidden bg-linear-to-br from-zinc-950/50 via-black to-zinc-950/50 px-4 py-5"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.1) transparent",
          paddingBottom: "calc(76px + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </main>

      {/* Bottom-fixed tab bar */}
      <BottomNav
        tabs={tabs}
        lockedTabs={lockedTabs}
        onLockedTabTap={(tabId) => {
          if (tabId === "studio") {
            setUpgradeModal({
              isOpen: true,
              requiredTier: "base",
              featureName: "Background Studio",
            });
          }
        }}
      />

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal((s) => ({ ...s, isOpen: false }))}
        requiredTier={upgradeModal.requiredTier}
        featureName={upgradeModal.featureName}
      />
    </div>
  );
}
