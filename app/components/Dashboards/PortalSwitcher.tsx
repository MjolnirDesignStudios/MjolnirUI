// components/Dashboards/PortalSwitcher.tsx
// Renders an "Admin Portal" / "User Portal" link based on the current
// route — but only when the signed-in user has role === 'admin'.
// Used in the desktop Header, MobileHeader dropdown, and MobileDrawer.
"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Shield, LayoutGrid, ArrowRight } from "lucide-react";

interface PortalSwitcherProps {
  /** Visual style — full button for header, simple link for menus */
  variant?: "button" | "menu-item";
  /** Optional callback for when the link is clicked (close a dropdown, etc.) */
  onNavigate?: () => void;
}

export function PortalSwitcher({ variant = "button", onNavigate }: PortalSwitcherProps) {
  const { data: session } = useSession();
  const pathname = usePathname() || "";

  // Hide entirely if not admin — no leakage of admin surface for regular users.
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") return null;

  const onAdmin = pathname.startsWith("/admin");
  const targetHref = onAdmin ? "/blocks/dashboard" : "/admin/dashboard";
  const Icon = onAdmin ? LayoutGrid : Shield;
  const label = onAdmin ? "User Portal" : "Admin Portal";

  if (variant === "menu-item") {
    return (
      <Link
        href={targetHref}
        onClick={onNavigate}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#FFCC11] hover:bg-[#FFCC11]/10 min-h-[44px] transition-all"
      >
        <Icon size={16} />
        <span className="flex-1">{label}</span>
        <ArrowRight size={14} className="opacity-60" />
      </Link>
    );
  }

  return (
    <Link
      href={targetHref}
      onClick={onNavigate}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition"
      style={{
        backgroundColor: "rgba(255,204,17,0.10)",
        borderColor: "rgba(255,204,17,0.35)",
        color: "#FFCC11",
      }}
      title={`Switch to ${label}`}
    >
      <Icon size={14} />
      <span>{label}</span>
    </Link>
  );
}
