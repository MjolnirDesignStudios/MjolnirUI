// components/Pricing.tsx — FINAL 2026 MJÖLNIR PRICING — REVENUE LIVE — NO BUILD ERRORS
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ElectricBorder from "@/components/ui/ElectricBorder";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Tier {
  name: string;
  subtitle: string;
  monthly: number;
  annual: number;
  original: number;
  description: string;
  features: string[];
  buttonText: string;
  electricColor: string;
  buttonGradient: string;
  popular?: boolean;
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
}

const tiers: Tier[] = [
  {
    name: "MjolnirUI Base",
    subtitle: "For Creators",
    monthly: 10,
    annual: 100,
    original: 149,
    description: "",
    features: [
      "MjolnirUI Base Components",
      "Basic Animations & Effects",
      "Email Support 27/7/365",
      "Community Access",
      "Lifetime Updates",
    ],
    buttonText: "Get Started",
    electricColor: "#3B82F6",
    buttonGradient: "from-blue-500 to-cyan-500",
    stripePriceIdMonthly: "price_1SdGLZFxkFUD7EnZJbUPdiP6",
    stripePriceIdAnnual: "price_1SdG59FxkFUD7EnZsjsdT2pa",
  },
  {
    name: "MjolnirUI Pro",
    subtitle: "For Professionals",
    monthly: 50,
    annual: 500,
    original: 749,
    description: "",
    features: [
      "Everything in Base",
      "Advanced GSAP Animations",
      "3D Model and Printing Forge",
      "Custom Component Requests",
      "Commercial License",
    ],
    buttonText: "Go Pro",
    electricColor: "#10B981",
    buttonGradient: "from-green-500 to-emerald-500",
    popular: true,
    stripePriceIdMonthly: "price_1SdHO8FxkFUD7EnZn7ntnR3I",
    stripePriceIdAnnual: "price_1SdHAqFxkFUD7EnZJgRjye5s",
  },
  {
    name: "MjolnirUI Elite",
    subtitle: "For Agencies",
    monthly: 250,
    annual: 2500,
    original: 7499,
    description: "",
    features: [
      "Everything in Pro",
      "Agentic AI Stack",
      "Dedicated Engineer",
      "Custom Development",
      "Source Code Access",
    ],
    buttonText: "Join Elite",
    electricColor: "#FFFF00",
    buttonGradient: "from-yellow-300 to-yellow-500",
    stripePriceIdMonthly: "price_1SdHuoFxkFUD7EnZIt8MeINJ",
    stripePriceIdAnnual: "price_1SdHpQFxkFUD7EnZq9jBzUQE",
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleStripeCheckout = async (tier: Tier) => {
    const priceId = isAnnual ? tier.stripePriceIdAnnual : tier.stripePriceIdMonthly;
    if (!priceId) return;

    setLoading(tier.name);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode: "subscription" }), // Always subscription
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto px-4 sm:px-6">
          {tiers.map((tier) => {
            const price = isAnnual ? tier.annual : tier.monthly;
            const period = isAnnual ? "year" : "month";

            return (
              <div key={tier.name} className="group relative">
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-xs font-bold z-60">
                    MOST POPULAR
                  </div>
                )}
                <ElectricBorder color={tier.electricColor} speed={1} chaos={0.12} borderRadius={24} className="absolute inset-0 z-50">
                  <div className="relative h-full p-6 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 transition-all duration-300 group-hover:border-white/20">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-heading font-black text-white">{tier.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{tier.subtitle}</p>
                    </div>

                    <div className="text-center mb-8">
                      <div className="text-5xl font-black text-white">${price}</div>
                      <div className="text-gray-500 text-sm">/{period}</div>
                      {price !== null && price !== undefined && tier.original !== undefined && price < tier.original && (
                        <div className="text-gray-600 line-through text-lg mt-2">${tier.original}</div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-10">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-gray-300 text-sm">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="relative z-50">
                      <motion.button
                        onClick={() => handleStripeCheckout(tier)}
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
                              <Zap className="animate-pulse w-6 h-6 text-emerald-400" />
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
