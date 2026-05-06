// components/Dashboards/MobileLayout.tsx
// New mobile architecture (Day 1 redesign):
// - No more permanent 56px icon rail eating viewport width
// - Sticky top header with hamburger trigger
// - Slide-in MobileDrawer overlay for navigation
// - overflow-x-hidden at every level to prevent horizontal scroll bleed
// - Children render full-width inside a padded main container
"use client";

import React, { useState } from "react";
import { MobileDrawer } from "./MobileDrawer";
import { MobileHeader } from "./MobileHeader";

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    // w-full + overflow-x-hidden prevents any descendant from causing
    // horizontal page scroll. This was the root cause of cards "spilling out".
    <div className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      <MobileHeader onOpenDrawer={() => setDrawerOpen(true)} />
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main
        className="flex-1 w-full overflow-x-hidden bg-linear-to-br from-zinc-950/50 via-black to-zinc-950/50 px-4 py-5"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        {children}
      </main>
    </div>
  );
}
