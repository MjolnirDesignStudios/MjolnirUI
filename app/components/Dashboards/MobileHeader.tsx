// components/Dashboards/MobileHeader.tsx
// Sticky top bar for mobile: hamburger (left) + logo + tier badge + avatar (right).
// Owns the open/close state for MobileDrawer; takes drawer toggles as props
// from MobileLayout so a single drawer instance is shared.
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronUp, Menu } from "lucide-react";
import { getTierConfig, type TierName } from "@/lib/tierConfig";
import { TierBadge } from "./TierBadge";
import { PortalSwitcher } from "./PortalSwitcher";

interface MobileHeaderProps {
  onOpenDrawer: () => void;
}

export function MobileHeader({ onOpenDrawer }: MobileHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const userTier = (session?.user?.tier as TierName) || "free";
  const tierConfig = getTierConfig(userTier);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || session?.user?.email || "User";
  const initial = userName.charAt(0).toUpperCase();

  // Close avatar menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2 py-3 px-4 border-b border-zinc-800/50 bg-black/80 backdrop-blur-lg md:hidden">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onOpenDrawer}
          className="flex items-center justify-center w-10 h-10 -ml-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition shrink-0"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
        <img
          src="/logos/MjolnirUI.png"
          alt="MjolnirUI"
          className="h-7 object-contain shrink-0"
        />
        <div className="hidden xs:block">
          <TierBadge tier={userTier} size="sm" />
        </div>
      </div>

      {/* Right: avatar */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all border border-white/10 hover:border-white/20"
          style={{
            backgroundColor: `${tierConfig.color}20`,
            color: tierConfig.color,
          }}
          aria-label="Account menu"
        >
          {initial}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-56 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-semibold text-white truncate">
                  {userName}
                </p>
                <div className="mt-1.5">
                  <TierBadge tier={userTier} size="sm" />
                </div>
              </div>

              <div className="p-2 space-y-1">
                {/* Admin-only portal switcher */}
                <PortalSwitcher
                  variant="menu-item"
                  onNavigate={() => setMenuOpen(false)}
                />

                {userTier === "free" && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/#pricing");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold min-h-[44px] transition-all bg-gradient-to-r from-cyan-500 to-emerald-500 text-black hover:brightness-110"
                  >
                    <ChevronUp size={16} />
                    Upgrade Plan
                  </button>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 min-h-[44px] transition-all"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
