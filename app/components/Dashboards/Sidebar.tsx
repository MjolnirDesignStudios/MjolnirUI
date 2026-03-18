// components/Dashboards/Sidebar.tsx — Sequential Design System Workflow
"use client";
import React, { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { TierBadge } from "./TierBadge";
import { UpgradeModal } from "./UpgradeModal";

type SidebarItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  requiredTier: TierName;
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

const sidebarSections: SidebarSection[] = [
  {
    title: "GET STARTED",
    items: [
      { name: "Introduction", href: "/blocks/docs/intro", icon: BookOpen, requiredTier: "free" },
      { name: "Installation", href: "/blocks/docs/install", icon: Download, requiredTier: "free" },
      { name: "CLI Reference", href: "/blocks/docs/cli", icon: Terminal, requiredTier: "free" },
      { name: "MCP / AI Agent", href: "/blocks/docs/mcp", icon: Cpu, requiredTier: "free" },
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
      { name: "Background Studio", href: "/blocks/canvas/studio", icon: Layers, requiredTier: "pro" },
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
    items: [
      { name: "Buttons", href: "/blocks/components/buttons", icon: MousePointer, requiredTier: "free" },
      { name: "Cards", href: "/blocks/components/cards", icon: CreditCard, requiredTier: "free" },
      { name: "Badges", href: "/blocks/components/badges", icon: Tag, requiredTier: "free" },
      { name: "Inputs & Forms", href: "/blocks/components/inputs", icon: FormInput, requiredTier: "base" },
      { name: "Modals & Dialogs", href: "/blocks/components/modals", icon: MessageSquare, requiredTier: "base" },
      { name: "Data Display", href: "/blocks/components/data", icon: BarChart3, requiredTier: "base" },
    ],
  },
  {
    title: "ANIMATION",
    items: [
      { name: "Text Effects", href: "/blocks/animation/text", icon: AlignLeft, requiredTier: "free" },
      { name: "Transitions", href: "/blocks/animation/transitions", icon: ArrowRightLeft, requiredTier: "free" },
      { name: "Framer Motion", href: "/blocks/animation/framer", icon: Clapperboard, requiredTier: "base" },
      { name: "GSAP Animations", href: "/blocks/animation/gsap", icon: Wand2, requiredTier: "pro" },
      { name: "Electric Effects", href: "/blocks/animation/electric", icon: Zap, requiredTier: "base" },
    ],
  },
  {
    title: "3D & WEBGL",
    items: [
      { name: "Animated Orbs", href: "/blocks/3d/orbs", icon: Orbit, requiredTier: "base" },
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
      { name: "Shader Designer", href: "/blocks/ai/shader", icon: Code2, requiredTier: "elite" },
    ],
  },
];

const accountItems: SidebarItem[] = [
  { name: "Profile & Tier", href: "/blocks/account/profile", icon: User, requiredTier: "free" },
  { name: "Billing", href: "/blocks/account/billing", icon: Receipt, requiredTier: "free" },
  { name: "Documentation", href: "/blocks/docs", icon: HelpCircle, requiredTier: "free" },
];

export function MjolnirSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userTier = (session?.user?.tier as TierName) || 'free';

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sidebarSections.map(s => s.title))
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
      <aside className="w-64 bg-linear-to-br from-zinc-900 via-black to-zinc-950 border-r border-zinc-800/50 min-h-screen flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className="p-6 pb-4">
          <Link href="/" className="font-black text-2xl bg-linear-to-r from-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            MjolnirUI
          </Link>
          <div className="mt-2">
            <TierBadge tier={userTier} size="sm" />
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 pb-4 space-y-1">
          {/* Dashboard Home */}
          <Link
            href="/blocks/dashboard"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all mb-2",
              pathname === "/blocks/dashboard"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <LayoutGrid size={16} />
            <span>Dashboard</span>
          </Link>

          {sidebarSections.map((section) => {
            const isExpanded = expandedSections.has(section.title);
            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
                >
                  {section.title}
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
            <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              ACCOUNT
            </div>
            <div className="space-y-0.5">
              {accountItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
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
