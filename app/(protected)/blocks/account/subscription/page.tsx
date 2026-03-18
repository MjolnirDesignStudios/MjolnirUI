"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { getTierConfig, TIER_CONFIG, type TierName } from "@/lib/tierConfig";
import { Zap, Crown } from "lucide-react";
import ElectricBorder from "@/components/ui/ElectricBorder";

const tierFeatures: Record<TierName, string[]> = {
  free: [
    "Browse Component Library",
    "Preview All Tools",
    "Community Access",
    "3 Free Components",
    "Design Token Reference",
  ],
  base: [
    "Full Component Library",
    "Background Studio",
    "Basic Animations",
    "Electric Effects",
    "Animated Orbs",
    "Email Support 24/7",
    "Lifetime Updates",
  ],
  pro: [
    "Everything in Base",
    "Advanced GSAP Animations",
    "Shader Engine",
    "3D Forge Pro",
    "Dashboard Builder",
    "Custom Components",
    "Commercial License",
  ],
  elite: [
    "Everything in Pro",
    "OdinAI Design Agent",
    "Asgardian Shader Engine",
    "3D Forge Elite",
    "Custom Development",
    "Full Source Code Access",
    "Beta Test New Features",
  ],
};

const tierOrder: TierName[] = ["free", "base", "pro", "elite"];

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || "free";
  const userLevel = getTierConfig(userTier).level;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">Your Subscription</h1>
        <p className="text-gray-400 flex items-center gap-2">
          You&apos;re currently on the{" "}
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{
              backgroundColor: `${getTierConfig(userTier).color}20`,
              color: getTierConfig(userTier).color,
              border: `1px solid ${getTierConfig(userTier).color}40`,
            }}
          >
            {getTierConfig(userTier).label}
          </span>{" "}
          plan
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {tierOrder.map((tierName) => {
          const config = TIER_CONFIG[tierName];
          const features = tierFeatures[tierName];
          const isCurrent = tierName === userTier;
          const tierLevel = config.level;
          const isUpgrade = tierLevel > userLevel;
          const isDowngrade = tierLevel < userLevel;

          const cardContent = (
            <div
              className="relative rounded-2xl border p-6 transition-all duration-300 flex flex-col h-full"
              style={{
                borderColor: isCurrent ? `${config.color}60` : "rgba(63,63,70,0.5)",
                boxShadow: isCurrent
                  ? `0 0 30px ${config.color}30, 0 0 60px ${config.color}15`
                  : "none",
                background: isCurrent
                  ? `linear-gradient(135deg, ${config.color}08 0%, #020617 50%, ${config.color}05 100%)`
                  : "linear-gradient(135deg, rgba(24,24,27,0.5) 0%, rgba(0,0,0,1) 100%)",
              }}
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-6 right-6 h-0.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />

              {/* Current badge — inside card, top-right */}
              {isCurrent && (
                <div className="flex justify-end mb-1 pt-1">
                  <div
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    style={{
                      backgroundColor: `${config.color}20`,
                      color: config.color,
                      border: `1px solid ${config.color}40`,
                    }}
                  >
                    <Crown size={10} /> Current Plan
                  </div>
                </div>
              )}

              {/* Plan name + price */}
              <div className={`mb-5 ${isCurrent ? "pt-0" : "pt-2"}`}>
                <h3 className="text-xl font-black text-white">{config.label}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-black text-white">
                    ${config.monthlyPrice}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">
                    {config.monthlyPrice === 0 ? "forever" : "/month"}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Zap size={14} className="shrink-0 mt-0.5" style={{ color: config.color }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Action button */}
              {isCurrent ? (
                <div
                  className="w-full py-3 rounded-xl text-center font-bold text-sm"
                  style={{
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                    border: `1px solid ${config.color}30`,
                  }}
                >
                  Your Current Plan
                </div>
              ) : isUpgrade ? (
                <a
                  href="/#pricing"
                  className="w-full py-3 rounded-xl font-bold text-sm text-black transition-all duration-200 flex items-center justify-center gap-2 hover:brightness-125 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: config.color,
                    boxShadow: `0 4px 15px ${config.color}40`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 25px ${config.color}70, 0 0 40px ${config.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 15px ${config.color}40`;
                  }}
                >
                  Upgrade to {config.label}
                </a>
              ) : isDowngrade ? (
                <div className="w-full py-3 rounded-xl font-bold text-sm text-gray-500 border border-zinc-800 bg-zinc-900/50 text-center">
                  Included in Your Plan
                </div>
              ) : null}
            </div>
          );

          return isCurrent ? (
            <ElectricBorder
              key={tierName}
              color={config.color}
              speed={2}
              chaos={0.18}
              borderRadius={16}
              className="relative h-full"
            >
              {cardContent}
            </ElectricBorder>
          ) : (
            <div key={tierName} className="relative h-full">
              {cardContent}
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-500 pt-4">
        Need to cancel or change your billing?{" "}
        <a
          href="/blocks/account/support"
          className="text-[#FFCC11] hover:text-[#FFD700] font-semibold transition"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
