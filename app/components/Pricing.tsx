// components/Pricing.tsx — MJÖLNIR 4-TIER PRICING 2026
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ElectricBorder from "@/components/ui/ElectricBorder";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface Tier {
  name: string;
  subtitle: string;
  monthly: number;
  annual: number;
  description: string;
  features: string[];
  buttonText: string;
  electricColor: string;
  buttonGradient: string;
  popular?: boolean;
  isFree?: boolean;
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
}

const tiers: Tier[] = [
  {
    name: "MjolnirUI Free",
    subtitle: "For Explorers",
    monthly: 0,
    annual: 0,
    description: "",
    features: [
      "Browse Component Library",
      "Preview All Tools",
      "Community Access",
      "3 Free Components",
      "Design Token Reference",
    ],
    buttonText: "Join Free",
    electricColor: "#3B82F6",
    buttonGradient: "from-blue-600 to-blue-400",
    isFree: true,
    stripePriceIdMonthly: "",
    stripePriceIdAnnual: "",
  },
  {
    name: "MjolnirUI Base",
    subtitle: "For Creators",
    monthly: 10,
    annual: 100,
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
    buttonGradient: "from-emerald-600 to-emerald-400",
    stripePriceIdMonthly: "price_1TBIjFFxkFUD7EnZqANuPLav",
    stripePriceIdAnnual: "price_1TBIjFFxkFUD7EnZsDQ2WVgH",
  },
  {
    name: "MjolnirUI Pro",
    subtitle: "For Professionals",
    monthly: 25,
    annual: 250,
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
    stripePriceIdMonthly: "price_1TBIltFxkFUD7EnZI5cxamBR",
    stripePriceIdAnnual: "price_1TBIltFxkFUD7EnZ1DFBq6gN",
  },
  {
    name: "MjolnirUI Elite",
    subtitle: "For Agencies",
    monthly: 50,
    annual: 500,
    description: "",
    features: [
      "Everything in Pro",
      "OdinAI Design Agent",
      "Dedicated Engineer",
      "Custom Development",
      "Source Code Access",
    ],
    buttonText: "Elite Company",
    electricColor: "#F97316",
    buttonGradient: "from-orange-400 to-orange-600",
    stripePriceIdMonthly: "price_1TBIuCFxkFUD7EnZlAYMZOEO",
    stripePriceIdAnnual: "price_1TBIslFxkFUD7EnZb9TDuHYF",
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const handleFreeSignup = () => {
    router.push("/auth/signin");
  };

  const handleStripeCheckout = async (tier: Tier) => {
    // If not logged in, redirect to sign-in first
    if (!session?.user) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/#pricing')}`);
      return;
    }

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
        alert("Payment setup failed. Please sign in first, then try again.");
        setLoading(null);
        return;
      }

      window.location.href = data.url; // Use window.location for external Stripe URL
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Payment failed. Try again.");
      setLoading(null);
    }
  };

  return (
    <section id="pricing"
      className="pt-36 pb-16 scroll-mt-32 relative flex items-center justify-center overflow-hidden">
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
                  <div className="relative h-full p-6 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 transition-all duration-300 group-hover:border-white/20">
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

                    <ul className="space-y-3 mb-10">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-gray-300 text-sm">
                          <Zap className="w-4 h-4 shrink-0" style={{ color: tier.electricColor }} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="relative z-50">
                      <motion.button
                        onClick={() => tier.isFree ? handleFreeSignup() : handleStripeCheckout(tier)}
                        disabled={loading === tier.name}
                        className={cn(
                          "relative w-full py-4 rounded-2xl font-bold text-black text-xl overflow-hidden shadow-2xl",
                          "bg-linear-to-r",
                          tier.buttonGradient
                        )}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 0.7 }}
                          style={{
                            background: `radial-gradient(circle at center, ${tier.electricColor}88, transparent 70%)`,
                            filter: "blur(20px)",
                          }}
                        />
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {loading === tier.name ? (
                            <>
                              <Zap className="animate-pulse w-6 h-6" style={{ color: tier.electricColor }} />
                              Charging...
                            </>
                          ) : (
                            <>
                              <motion.span
                                initial={{ scale: 1 }}
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.3 }}
                                className="tracking-wide"
                              >
                                {tier.buttonText}
                              </motion.span>
                              <ArrowRight className="w-6 h-6" />
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
