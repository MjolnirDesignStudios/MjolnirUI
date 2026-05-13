// components/Dashboards/PortalSwitcher.tsx
// Segmented toggle between User Portal (/blocks/*) and Admin Portal (/admin/*).
// Visible only when session.user.role === 'admin'. Returns null otherwise so
// non-admin users never see any leakage of the admin surface.
"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LayoutGrid } from "lucide-react";

interface PortalSwitcherProps {
  /**
   * "toggle"    — full segmented pill (default, used in headers)
   * "menu-item" — single-line menu entry (used in dropdowns / drawer)
   */
  variant?: "toggle" | "menu-item";
  /** Called after navigating (closes parent dropdown/drawer) */
  onNavigate?: () => void;
}

export function PortalSwitcher({
  variant = "toggle",
  onNavigate,
}: PortalSwitcherProps) {
  const { data: session } = useSession();
  const pathname = usePathname() || "";
  const router = useRouter();

  // Strict admin-only — hide entirely for everyone else.
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") return null;

  const onAdmin = pathname.startsWith("/admin");
  const goTo = (target: "user" | "admin") => {
    const href = target === "admin" ? "/admin/dashboard" : "/blocks/dashboard";
    onNavigate?.();
    router.push(href);
  };

  /* ─ Menu-item variant — for dropdowns / drawer ──────── */
  if (variant === "menu-item") {
    const targetHref = onAdmin ? "/blocks/dashboard" : "/admin/dashboard";
    const Icon = onAdmin ? LayoutGrid : Shield;
    const label = onAdmin ? "Switch to User Portal" : "Switch to Admin Portal";
    return (
      <button
        onClick={() => {
          onNavigate?.();
          router.push(targetHref);
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#FFCC11] hover:bg-[#FFCC11]/10 min-h-[44px] transition-all"
      >
        <Icon size={16} />
        <span className="flex-1 text-left">{label}</span>
      </button>
    );
  }

  /* ─ Toggle variant — segmented pill ─────────────────── */
  return (
    <div
      role="group"
      aria-label="Portal switcher"
      className="inline-flex items-center rounded-xl border p-0.5"
      style={{
        backgroundColor: "rgba(255,204,17,0.08)",
        borderColor: "rgba(255,204,17,0.30)",
      }}
    >
      <PortalSegment
        active={!onAdmin}
        onClick={() => !onAdmin || goTo("user")}
        icon={LayoutGrid}
        label="User"
      />
      <PortalSegment
        active={onAdmin}
        onClick={() => onAdmin || goTo("admin")}
        icon={Shield}
        label="Admin"
      />
    </div>
  );
}

function PortalSegment({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition"
      style={{
        backgroundColor: active ? "#FFCC11" : "transparent",
        color: active ? "#000" : "#FFCC11",
        opacity: active ? 1 : 0.75,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.opacity = "0.75";
      }}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}
