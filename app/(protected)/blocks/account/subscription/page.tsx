"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Crown } from "lucide-react";
import { type TierName } from "@/lib/tierConfig";
import { TierBadge } from "@/components/Dashboards/TierBadge";
import ElectricBorder from "@/components/ui/ElectricBorder";

const tiers: {
  name: string;
  tier: TierName;
  price: string;
  period: string;
  color: string;
  features: string[];
}[] = [
  {
    name: "Free",
    tier: "free",
    price: "$0",
    period: "forever",
    color: "#3B82F6",
    features: [
      "Browse Component Library",
      "Preview All Tools",
      "Community Access",
      "3 Free Components",
      "Design Token Reference",
    ],
  },
  {
    name: "Base",
    tier: "base",
    price: "$10",
    period: "/month",
    color: "#10B981",
    features: [
      "Full Component Library",
      "Background Studio",
      "Basic Animations",
      "Electric Effects",
      "Animated Orbs",
      "Email Support 24/7",
      "Lifetime Updates",
    ],
  },
  {
    name: "Pro",
    tier: "pro",
    price: "$25",
    period: "/month",
    color: "#EAB308",
    features: [
      "Everything in Base",
      "Advanced GSAP Animations",
      "Shader Engine",
      "3D Forge Pro",
      "Dashboard Builder",
      "Custom Components",
      "Commercial License",
    ],
  },
  {
    name: "Elite",
    tier: "elite",
    price: "$50",
    period: "/month",
    color: "#F97316",
    features: [
      "Everything in Pro",
      "OdinAI Design Agent",
      "Asgardian Shader Engine",
      "3D Forge Elite",
      "Custom Development",
      "Full Source Code Access",
      "Beta Test New Features",
    ],
  },
];

const tierOrder: Record<TierName, number> = { free: 0, base: 1, pro: 2, elite: 3 };

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userTier = (session?.user?.tier as TierName) || "free";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">Your Subscription</h1>
        <p className="text-gray-400 flex items-center gap-2">
          You&apos;re currently on the <TierBadge tier={userTier} size="md" /> plan
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {tiers.map((t) => {
          const isCurrent = t.tier === userTier;
          const isHigher = tierOrder[t.tier] > tierOrder[userTier];
          const isLower = tierOrder[t.tier] < tierOrder[userTier];

          const cardContent = (
            <div
              className="relative rounded-2xl border p-6 transition-all duration-300 flex flex-col h-full"
              style={{
                borderColor: isCurrent ? `${t.color}60` : "rgba(63,63,70,0.5)",
                boxShadow: isCurrent
                  ? `0 0 30px ${t.color}30, 0 0 60px ${t.color}15`
                  : "none",
                background: isCurrent
                  ? `linear-gradient(135deg, ${t.color}08 0%, #020617 50%, ${t.color}05 100%)`
                  : "linear-gradient(135deg, rgba(24,24,27,0.5) 0%, rgba(0,0,0,1) 100%)",
              }}
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-6 right-6 h-0.5 rounded-full"
                style={{ backgroundColor: t.color }}
              />

              {/* Current Plan badge — inside card, top-right */}
              {isCurrent ? (
                <div className="flex justify-end pt-2 mb-1">
                  <div
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    style={{ backgroundColor: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}
                  >
                    <Crown size={10} /> Current Plan
                  </div>
                </div>
              ) : (
                <div className="pt-2 mb-1 h-[26px]" />
              )}

              {/* Plan name + price */}
              <div className="mb-5">
                <h3 className="text-xl font-black text-white">{t.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-black text-white">{t.price}</span>
                  <span className="text-gray-500 text-sm ml-1">{t.period}</span>
                </div>
              </div>

              {/* Features — lightning bolt icons */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Zap size={14} className="shrink-0 mt-0.5" style={{ color: t.color }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Action button */}
              {isCurrent ? (
                <div
                  className="w-full py-3 rounded-xl text-center font-bold text-sm"
                  style={{ backgroundColor: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}
                >
                  Your Current Plan
                </div>
              ) : isHigher ? (
                <button
                  onClick={() => router.push("/#pricing")}
                  className="w-full py-3 rounded-xl font-bold text-sm text-black transition-all duration-200 flex items-center justify-center gap-2 hover:brightness-125 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: t.color,
                    boxShadow: `0 4px 15px ${t.color}40`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 25px ${t.color}70, 0 0 40px ${t.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 15px ${t.color}40`;
                  }}
                >
                  <Zap size={14} /> Upgrade to {t.name}
                </button>
              ) : isLower ? (
                <button
                  className="w-full py-3 rounded-xl font-bold text-sm text-gray-500 border border-zinc-800 bg-zinc-900/50 cursor-default"
                >
                  Included in Your Plan
                </button>
              ) : null}
            </div>
          );

          return isCurrent ? (
            <ElectricBorder key={t.tier} color={t.color} speed={2} chaos={0.18} borderRadius={16} className="relative h-full">
              {cardContent}
            </ElectricBorder>
          ) : (
            <div key={t.tier} className="relative h-full">
              {cardContent}
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-500 pt-4">
        Need to cancel or change your billing? <button onClick={() => router.push("/blocks/account/support")} className="text-[#FFCC11] hover:text-[#FFD700] font-semibold transition">Contact Support</button>
      </div>
    </div>
  );
}
