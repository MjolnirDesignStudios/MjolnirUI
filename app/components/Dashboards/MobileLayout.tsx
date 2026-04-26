// components/Dashboards/MobileLayout.tsx — Mobile layout wrapper that responds to sidebar position
"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./MobileSidebar";
import { MobileHeader } from "./MobileHeader";

const POSITION_KEY = "mjolnir-sidebar-position";

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState<"left" | "right">("left");

  useEffect(() => {
    const saved = localStorage.getItem(POSITION_KEY);
    if (saved === "left" || saved === "right") {
      setPosition(saved);
    }

    // Listen for cross-tab storage changes
    function handleStorage(e: StorageEvent) {
      if (e.key === POSITION_KEY && (e.newValue === "left" || e.newValue === "right")) {
        setPosition(e.newValue);
      }
    }

    // Listen for same-tab custom event dispatched by MobileSidebar
    function handlePositionChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail === "left" || detail === "right") {
        setPosition(detail);
      }
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("mjolnir-sidebar-position", handlePositionChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("mjolnir-sidebar-position", handlePositionChange);
    };
  }, []);

  return (
    <div className="flex min-h-screen">
      <MobileSidebar />
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0",
          position === "left" ? "pl-14" : "pr-14"
        )}
      >
        <MobileHeader />
        <main
          className="flex-1 p-4 bg-linear-to-br from-zinc-950/50 via-black to-zinc-950/50 overflow-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
