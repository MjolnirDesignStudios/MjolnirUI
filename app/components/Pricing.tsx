// components/Pricing.tsx — MJÖLNIR 4-TIER PRICING 2026
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ElectricBorder from "@/components/ui/ElectricBorder";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TIER_CONFIG, type TierName } from "@/lib/tierConfig";

/**
 * Marketing copy for each tier. Price IDs, monthly/annual amounts, and
 * canonical tier names are pulled from TIER_CONFIG so this file never
 * drifts out of sync with the rest of the app.
 */
interface TierCopy {
  tierKey: TierName;
  subtitle: string;
  description: string;
  features: string[];
  buttonText: string;
  electricColor: string;
  buttonGradient: string;
  popular?: boolean;
  isFree?: boolean;
}

interface Tier extends TierCopy {
  /** Display name from TIER_CONFIG (e.g. "MjolnirUI Pro") */
  name: string;
  /** Monthly USD from TIER_CONFIG */
  monthly: number;
  /** Annual USD from TIER_CONFIG */
  annual: number;
  /** Stripe price IDs from TIER_CONFIG (empty for free) */
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
}

const tierCopy: TierCopy[] = [
  {
    tierKey: "free",
    subtitle: "For Explorers",
    description: "",
    features: [
      "Browse Component Library",
      "Preview All Tools",
      "Community Access",
      "3 Free Components",
      "Lifetime Updates",
    ],
    buttonText: "Join Free",
    electricColor: "#3B82F6",
    buttonGradient: "from-blue-400 to-blue-600",
    isFree: true,
  },
  {
    tierKey: "base",
    subtitle: "For Creators",
    description: "",
    features: [
      "Full Component Library",
      "Basic Animations & Effects",
      "Background Studio",
      "Email Support 24/7",
      "Lifetime Updates",
    ],
    buttonText: "Unlock Base",
    electricColor: "#10B981",
    buttonGradient: "from-emerald-400 to-emerald-600",
  },
  {
    tierKey: "pro",
    subtitle: "For Professionals",
    description: "",
    features: [
      "Everything in Base",
      "Advanced GSAP Animations",
      "3D Forge & Shader Engine",
      "Custom Component Requests",
      "Commercial License",
    ],
    buttonText: "Upgrade to Pro",
    electricColor: "#EAB308",
    buttonGradient: "from-yellow-400 to-yellow-600",
    popular: true,
  },
  {
    tierKey: "elite",
    subtitle: "For Agencies",
    description: "",
    features: [
      "Everything in Pro",
      "OdinAI Design Agent",
      "End-to-End Design",
      "Custom Development",
      "Source Code Access",
    ],
    buttonText: "Elite Company",
    electricColor: "#F97316",
    buttonGradient: "from-orange-400 to-orange-600",
  },
];

// Merge marketing copy with the canonical config in TIER_CONFIG. Single
// source of truth for prices + Stripe IDs.
const tiers: Tier[] = tierCopy.map((copy) => {
  const cfg = TIER_CONFIG[copy.tierKey];
  return {
    ...copy,
    name: cfg.name,
    monthly: cfg.monthlyPrice,
    annual: cfg.annualPrice,
    stripePriceIdMonthly: cfg.stripePriceIdMonthly,
    stripePriceIdAnnual: cfg.stripePriceIdAnnual,
  };
});

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleFreeSignup = () => {
    router.push("/auth/signin");
  };

  const handleStripeCheckout = async (tier: Tier) => {
    const priceId = isAnnual ? tier.stripePriceIdAnnual : tier.stripePriceIdMonthly;
    if (!priceId) return;

    setLoading(tier.name);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode: "subscription" }),
      });

      const data = await res.json();

      if (!data.url) {
        console.error("Stripe error:", data);
        alert("Payment setup failed. See console.");
        setLoading(null);
        return;
      }

      router.push(data.url);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Payment failed. Try again.");
      setLoading(null);
    }
  };

  return (
    <section id="pricing"
      className="py-16 relative flex items-center justify-center overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="heading text-silver-100 text-5xl lg:text-5xl font-bold text-center mb-4">
            Our Pricing: We Accept All Forms of <span className="text-gold">Gold!</span>
          </h1>
          <p className="mt-6 text-xl text-gray-400">All plans include lifetime updates</p>
        </motion.div>

        <div className="flex justify-center mb-16">
          <div className="bg-zinc-900/60 backdrop-blur border border-white/10 rounded-full p-1.5 flex items-center">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn("px-8 py-3 rounded-full font-bold transition-all", !isAnnual ? "bg-emerald-500 text-black" : "text-gray-400")}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn("px-8 py-3 rounded-full font-bold transition-all", isAnnual ? "bg-emerald-500 text-black" : "text-gray-400")}
            >
              Annual <span className="text-xs opacity-70 ml-1">(Save 20%)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 max-w-7xl mx-auto px-4 sm:px-6">
          {tiers.map((tier) => {
            const price = isAnnual ? tier.annual : tier.monthly;
            const period = isAnnual ? "year" : "month";

            return (
              <div key={tier.name} className="group relative">
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-full text-xs font-bold z-60">
                    MOST POPULAR
                  </div>
                )}
                <ElectricBorder color={tier.electricColor} speed={1} chaos={0.12} borderRadius={24} className="absolute inset-0 z-50">
                  <div className="relative h-full p-6 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 transition-all duration-300 group-hover:border-white/20 flex flex-col">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl lg:text-3xl font-heading font-black text-white">{tier.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{tier.subtitle}</p>
                    </div>

                    <div className="text-center mb-8">
                      {tier.isFree ? (
                        <>
                          <div className="text-5xl font-black text-white">Free</div>
                          <div className="text-gray-500 text-sm">Forever</div>
                        </>
                      ) : (
                        <>
                          <div className="text-5xl font-black text-white">${price}</div>
                          <div className="text-gray-500 text-sm">/{period}</div>
                        </>
                      )}
                    </div>

                    <ul className="space-y-3 mb-10 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-gray-300 text-sm">
                          <Zap className="w-4 h-4 shrink-0" style={{ color: tier.electricColor }} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="relative z-50 mt-auto">
                      <motion.button
                        onClick={() => tier.isFree ? handleFreeSignup() : handleStripeCheckout(tier)}
                        disabled={loading === tier.name}
                        className={cn(
                          "group/btn relative w-full py-4 rounded-2xl font-bold text-black text-xl overflow-hidden",
                          "bg-linear-to-r",
                          tier.buttonGradient,
                          "shadow-[0_4px_0_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.25)]",
                          "hover:shadow-[0_6px_0_rgba(0,0,0,0.3),0_12px_32px_rgba(0,0,0,0.3)]",
                          "hover:translate-y-[-2px]",
                          "active:shadow-[0_1px_0_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2)]",
                          "active:translate-y-[1px]",
                          "transition-all duration-200"
                        )}
                      >
                        {/* Shimmer sweep on hover */}
                        <div
                          className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out"
                          style={{
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                          }}
                        />
                        {/* Subtle top highlight */}
                        <div className="absolute inset-x-0 top-0 h-px bg-white/30 rounded-t-2xl" />
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {loading === tier.name ? (
                            <>
                              <Zap className="animate-pulse w-5 h-5" />
                              Charging...
                            </>
                          ) : (
                            <>
                              <span className="tracking-wide">{tier.buttonText}</span>
                              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                            </>
                          )}
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </ElectricBorder>
              </div>
            );
          })}
        </div>

        {/* Trusted Payments */}
        <div className="mt-20 text-center">
          <p className="text-gray-500 mb-6 text-lg">Trusted Payment Services</p>
          <div className="flex items-center justify-center lg:gap-8 gap-4 flex-wrap">
            <Image src="/Icons/bitcoin-64.svg" alt="Bitcoin" width={48} height={48} />
            <Image src="/Icons/cash-app-64.svg" alt="CashApp" width={56} height={56} />
            <Image src="/Icons/coinbase-64.svg" alt="Coinbase" width={56} height={56} />
            <Image src="/Icons/stripe-64.svg" alt="Stripe" width={42} height={42} />
            <Image src="/Icons/uphold-64.svg" alt="Uphold" width={46} height={46} />
            <Image src="/Icons/venmo-64.svg" alt="Venmo" width={42} height={42} />
          </div>
        </div>
      </div>
    </section>
  );
}
