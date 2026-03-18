// Dashboard Home — Tier-aware welcome + feature grid
"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles, Image, Layers, MousePointer, Palette,
  Box, Hammer, Bot, Code2, Wrench, Gauge, Zap,
  LockKeyhole,
} from "lucide-react";
import { TierBadge } from "@/components/Dashboards/TierBadge";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";

type FeatureCard = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>;
  requiredTier: TierName;
  href: string;
  comingSoon?: boolean;
};

const featureCards: FeatureCard[] = [
  { title: "Component Library", description: "Premium React components with copy/paste and CLI install", icon: MousePointer, requiredTier: "free", href: "/blocks/browse" },
  { title: "Design Tokens", description: "HSL color system, typography scale, and spacing tokens", icon: Palette, requiredTier: "free", href: "/blocks/foundation/tokens", comingSoon: true },
  { title: "Text & Transitions", description: "Aurora text, reveal animations, and electric effects", icon: Sparkles, requiredTier: "free", href: "/blocks/animation/text", comingSoon: true },
  { title: "Background Studio", description: "Gradient backgrounds, mesh patterns, and animated canvases", icon: Image, requiredTier: "base", href: "/blocks/background-studio" },
  { title: "Electric Effects", description: "Glowing borders, spark animations, and neon accents", icon: Zap, requiredTier: "base", href: "/blocks/animation/electric", comingSoon: true },
  { title: "Animated Orbs", description: "React Three Fiber 3D orb scenes with custom shaders", icon: Box, requiredTier: "base", href: "/blocks/3d/orbs", comingSoon: true },
  { title: "Shader Engine", description: "GLSL/WebGL shader backgrounds with real-time controls", icon: Layers, requiredTier: "pro", href: "/blocks/canvas/shaders", comingSoon: true },
  { title: "3D Forge", description: "Image-to-3D model generation powered by Meshy API", icon: Hammer, requiredTier: "pro", href: "/blocks/3d/forge", comingSoon: true },
  { title: "Dashboard Builder", description: "Visual dashboard designer with drag-and-drop layouts", icon: Gauge, requiredTier: "pro", href: "/blocks/systems/dashboard", comingSoon: true },
  { title: "Website Tuner", description: "Theme optimizer and site performance analyzer", icon: Wrench, requiredTier: "pro", href: "/blocks/systems/tuner", comingSoon: true },
  { title: "OdinAI Agent", description: "Agentic AI UI/UX designer with Ralph Self-Improvement Loop", icon: Bot, requiredTier: "elite", href: "/blocks/ai/odinai", comingSoon: true },
  { title: "Shader Designer", description: "Prompt-based GLSL shader generation system", icon: Code2, requiredTier: "elite", href: "/blocks/ai/shader", comingSoon: true },
];

export default function DashboardHome() {
  return (
    <Suspense fallback={<div className="animate-pulse text-gray-500 p-12 text-center">Loading dashboard…</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userTier = (session?.user?.tier as TierName) || 'free';

  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: 'base', featureName: '' });

  // Refresh session after successful checkout
  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      update(); // Force JWT refresh to pick up new tier from Supabase
    }
  }, [searchParams, update]);

  const handleCardClick = (card: FeatureCard) => {
    if (!hasAccess(userTier, card.requiredTier)) {
      setUpgradeModal({
        isOpen: true,
        requiredTier: card.requiredTier,
        featureName: card.title,
      });
      return;
    }
    router.push(card.href);
  };

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black mb-3 text-white">
          Welcome{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-lg text-gray-400 flex items-center gap-3">
          Your design arsenal awaits. You&apos;re currently on the{" "}
          <TierBadge tier={userTier} size="md" /> plan.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {featureCards.map((card, index) => {
          const isLocked = !hasAccess(userTier, card.requiredTier);
          const tierConfig = getTierConfig(card.requiredTier);

          return (
            <motion.button
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => handleCardClick(card)}
              className="relative text-left overflow-hidden bg-linear-to-br from-zinc-900 to-black border rounded-2xl p-6 transition-all duration-300 group flex flex-col min-h-[220px]"
              style={{
                borderColor: isLocked ? 'rgba(63,63,70,0.5)' : `${tierConfig.color}30`,
                ['--glow-color' as string]: tierConfig.color,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 25px ${tierConfig.color}40, 0 0 50px ${tierConfig.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Tier badge */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${tierConfig.color}20` }}
                >
                  <card.icon size={20} style={{ color: tierConfig.color }} />
                </div>
                <div className="flex items-center gap-2">
                  {isLocked && <LockKeyhole size={14} className="text-gray-500" />}
                  <TierBadge tier={card.requiredTier} size="sm" showIcon={false} />
                </div>
              </div>

              <h3 className={`text-lg font-bold mb-1 ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                {card.title}
              </h3>
              <p className={`text-sm flex-1 ${isLocked ? 'text-gray-600' : 'text-gray-400'}`}>
                {card.description}
              </p>

              {/* Coming Soon badge for in-development Pro/Elite features */}
              {card.comingSoon && (
                <motion.span
                  className="inline-flex items-center mt-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    backgroundColor: `${tierConfig.color}15`,
                    color: tierConfig.color,
                    border: `1px solid ${tierConfig.color}30`,
                  }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  Coming Soon — 2026
                </motion.span>
              )}

              {/* Locked overlay shimmer */}
              {isLocked && (
                <div className="absolute inset-0 bg-black/20 rounded-2xl" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Quick Stats / CTA */}
      <div className="bg-linear-to-br from-zinc-900/50 via-black to-zinc-900/50 border border-zinc-800/50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          {userTier === 'free' ? 'Unlock the Full Arsenal' : 'Your Design Arsenal'}
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          {userTier === 'free'
            ? 'Upgrade to Base to access the full component library, Background Studio, and electric effects.'
            : 'Browse the sidebar to explore all your unlocked tools and components.'
          }
        </p>
      </div>

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal(prev => ({ ...prev, isOpen: false }))}
        requiredTier={upgradeModal.requiredTier}
        featureName={upgradeModal.featureName}
      />
    </div>
  );
}
