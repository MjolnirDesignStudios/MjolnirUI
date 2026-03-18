// app/lib/tierConfig.ts
// Centralized tier definitions — single source of truth for colors, names, icons, price IDs.
// Import this anywhere you need tier-aware UI or logic.

import { Zap, Hammer, Crown, Shield } from "lucide-react";
import type { ComponentType } from "react";

export type TierName = 'free' | 'base' | 'pro' | 'elite';

export interface TierConfig {
  name: string;
  label: string;
  level: number; // 0=free, 1=base, 2=pro, 3=elite — for comparison
  color: string; // hex
  tailwindText: string;
  tailwindBorder: string;
  tailwindBg: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  monthlyPrice: number;
  annualPrice: number;
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
}

export const TIER_CONFIG: Record<TierName, TierConfig> = {
  free: {
    name: 'MjolnirUI Free',
    label: 'Free',
    level: 0,
    color: '#3B82F6',
    tailwindText: 'text-blue-500',
    tailwindBorder: 'border-blue-500',
    tailwindBg: 'bg-blue-500',
    icon: Zap,
    monthlyPrice: 0,
    annualPrice: 0,
    stripePriceIdMonthly: '',
    stripePriceIdAnnual: '',
  },
  base: {
    name: 'MjolnirUI Base',
    label: 'Base',
    level: 1,
    color: '#10B981',
    tailwindText: 'text-emerald-500',
    tailwindBorder: 'border-emerald-500',
    tailwindBg: 'bg-emerald-500',
    icon: Hammer,
    monthlyPrice: 10,
    annualPrice: 100,
    stripePriceIdMonthly: 'price_1TBIjFFxkFUD7EnZqANuPLav',
    stripePriceIdAnnual: 'price_1TBIjFFxkFUD7EnZsDQ2WVgH',
  },
  pro: {
    name: 'MjolnirUI Pro',
    label: 'Pro',
    level: 2,
    color: '#EAB308',
    tailwindText: 'text-yellow-500',
    tailwindBorder: 'border-yellow-500',
    tailwindBg: 'bg-yellow-500',
    icon: Crown,
    monthlyPrice: 25,
    annualPrice: 250,
    stripePriceIdMonthly: 'price_1TBIltFxkFUD7EnZI5cxamBR',
    stripePriceIdAnnual: 'price_1TBIltFxkFUD7EnZ1DFBq6gN',
  },
  elite: {
    name: 'MjolnirUI Elite',
    label: 'Elite',
    level: 3,
    color: '#F97316',
    tailwindText: 'text-orange-500',
    tailwindBorder: 'border-orange-500',
    tailwindBg: 'bg-orange-500',
    icon: Shield,
    monthlyPrice: 50,
    annualPrice: 500,
    stripePriceIdMonthly: 'price_1TBIuCFxkFUD7EnZlAYMZOEO',
    stripePriceIdAnnual: 'price_1TBIslFxkFUD7EnZb9TDuHYF',
  },
};

/** Map Stripe price ID → tier name for webhook processing */
export const PRICE_TO_TIER: Record<string, TierName> = Object.entries(TIER_CONFIG).reduce(
  (acc, [tierName, config]) => {
    if (config.stripePriceIdMonthly) acc[config.stripePriceIdMonthly] = tierName as TierName;
    if (config.stripePriceIdAnnual) acc[config.stripePriceIdAnnual] = tierName as TierName;
    return acc;
  },
  {} as Record<string, TierName>
);

/** Check if user tier meets required tier level */
export function hasAccess(userTier: TierName, requiredTier: TierName): boolean {
  return TIER_CONFIG[userTier].level >= TIER_CONFIG[requiredTier].level;
}

/** Get tier config by name, defaults to free */
export function getTierConfig(tier?: string): TierConfig {
  return TIER_CONFIG[(tier as TierName) || 'free'] || TIER_CONFIG.free;
}
