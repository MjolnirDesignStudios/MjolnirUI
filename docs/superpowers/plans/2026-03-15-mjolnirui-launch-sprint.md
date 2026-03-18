# MjolnirUI Launch Sprint Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship MjolnirUI.com landing page with 4-tier pricing, Stripe payment pipeline, free-tier auth flow, and tiered dashboard by Thorsday March 19, 2026.

**Architecture:** Next.js App Router with NextAuth JWT sessions, Supabase for user/tier persistence, Stripe Checkout Sessions for payments, and a tiered dashboard sidebar following atomic design system workflow order. Landing page sections: Hero → About → Blocks → Pricing → Tech → Footer.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion 12, NextAuth v4, Supabase, Stripe, Lucide icons

**Spec:** `docs/superpowers/specs/2026-03-15-mjolnirui-launch-sprint-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `app/lib/supabaseAdmin.ts` | Supabase client with service role key for server-side operations |
| `app/lib/tierConfig.ts` | Centralized tier definitions: colors, names, levels, price IDs, icons |
| `app/components/About.tsx` | Placeholder About section (glass card) |
| `app/components/Tech.tsx` | Tech showcase: counters + flip card grid + feature cards |
| `app/components/ui/Cards/FlipCard.tsx` | Individual flip card with edge-glow animation |
| `app/components/ui/Cards/TechCardGrid.tsx` | Flip card grid controller with staggered flip logic |
| `app/data/tech-icons.ts` | Tech stack icon definitions (30 icons) |
| `app/api/stripe/checkout/route.ts` | Stripe Checkout Session creation |
| `app/api/webhooks/stripe/route.ts` | Stripe webhook handler with signature verification |
| `app/components/Dashboards/TierBadge.tsx` | Reusable tier badge component (color-coded) |
| `app/components/Dashboards/UpgradeModal.tsx` | Tier upgrade prompt modal |
| `.env.example` | Environment variable template |

### Modified Files
| File | Changes |
|------|---------|
| `app/data/index.ts` | Nav items (Agent→About), add BIFROST_GRADIENTS, BIFROST_GLOWS, TechIcon type |
| `app/lib/subscriptionUtils.ts` | Add isFree(), tierLevel(), fix default 'base'→'free' |
| `app/lib/nextAuthOptions.ts` | JWT callback for tier fetch, session callback for tier/role |
| `middleware.ts` | Fix broken matcher, protect /blocks/* and /admin/* |
| `app/components/Pricing.tsx` | 4 tiers with new colors, prices, free tier card |
| `app/page.tsx` | Add About and Tech sections |
| `app/layout.tsx` | Enhanced OG/Twitter meta tags |
| `app/components/Dashboards/Sidebar.tsx` | Sequential design system workflow navigation |
| `app/components/Dashboards/Header.tsx` | Tier badge in header |
| `app/(protected)/blocks/dashboard/page.tsx` | Full preview grid with tier gates |

---

## Chunk 1: Foundation — Data, Utils, Config

### Task 1: Update data/index.ts — Nav Items + Bifrost Colors

**Files:**
- Modify: `app/data/index.ts`

- [ ] **Step 1: Update nav items**

Change `Agent` to `About` in the navItems array:

```typescript
export const navItems = [
  { name: "About", link: "/#about" },
  { name: "Blocks", link: "/#blocks" },
  { name: "Pricing", link: "/#pricing" },
  { name: "Tech", link: "/#tech" },
];
```

- [ ] **Step 2: Add TechIcon type and Bifrost color arrays**

Add these exports to the end of `app/data/index.ts`:

```typescript
import type { ComponentType } from "react";

export type TechIcon = {
  name: string;
  svgPath?: string;
  reactIcon?: ComponentType<{ size?: number; color?: string; className?: string }>;
  initials?: string;
};

/**
 * Four Bifrost gradient CSS strings — Electric Blue, Green, Gold, Orange.
 * Purple and Red removed for MjolnirUI's 4-tier color system.
 */
export const BIFROST_GRADIENTS: string[] = [
  "radial-gradient(ellipse at center, #0a0a0a 15%, #0a3a5c 55%, #0EA5E9 80%, #2563EB 100%)", // Electric Blue
  "radial-gradient(ellipse at center, #0a0a0a 15%, #063a28 55%, #10B981 80%, #16A34A 100%)", // Electric Green
  "radial-gradient(ellipse at center, #0a0a0a 15%, #3d2e00 55%, #EAB308 80%, #D4AF37 100%)", // Electric Gold
  "radial-gradient(ellipse at center, #0a0a0a 15%, #3d1800 55%, #F97316 80%, #EA580C 100%)", // Electric Orange
];

export const BIFROST_GLOWS: string[] = [
  "#0EA5E930", // Blue
  "#10B98130", // Green
  "#EAB30830", // Gold
  "#F9731630", // Orange
];
```

- [ ] **Step 3: Verify build**

Run: `npm run build` (or `npm run dev` and check for errors)
Expected: No import errors, no type errors

- [ ] **Step 4: Commit**

```bash
git add app/data/index.ts
git commit -m "feat: update nav items and add Bifrost color system for 4-tier model"
```

---

### Task 2: Create tierConfig.ts — Centralized Tier Definitions

**Files:**
- Create: `app/lib/tierConfig.ts`

- [ ] **Step 1: Create the tier config file**

```typescript
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
    stripePriceIdMonthly: 'price_1SdGLZFxkFUD7EnZJbUPdiP6',
    stripePriceIdAnnual: 'price_1SdG59FxkFUD7EnZsjsdT2pa',
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
    // PLACEHOLDER — replace with real Stripe price IDs
    stripePriceIdMonthly: 'PLACEHOLDER_PRO_MONTHLY',
    stripePriceIdAnnual: 'PLACEHOLDER_PRO_ANNUAL',
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
    // PLACEHOLDER — replace with real Stripe price IDs
    stripePriceIdMonthly: 'PLACEHOLDER_ELITE_MONTHLY',
    stripePriceIdAnnual: 'PLACEHOLDER_ELITE_ANNUAL',
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
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/tierConfig.ts
git commit -m "feat: add centralized tier config with colors, prices, and access control"
```

---

### Task 3: Update subscriptionUtils.ts — Fix Default Tier

**Files:**
- Modify: `app/lib/subscriptionUtils.ts`

- [ ] **Step 1: Read current file and update**

The current file defaults to `'base'` when tier is missing. Change the default to `'free'` and add new utilities:

```typescript
// app/lib/subscriptionUtils.ts
import { type TierName, TIER_CONFIG, hasAccess } from './tierConfig';

interface UserWithTier {
  tier?: string;
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function getUserTier(user: UserWithTier | null | undefined): TierName {
  if (!user || !user.tier) return 'free'; // CHANGED from 'base' to 'free'
  return (user.tier as TierName) || 'free';
}

export function isFree(user: UserWithTier | null | undefined): boolean {
  return getUserTier(user) === 'free';
}

export function isBase(user: UserWithTier | null | undefined): boolean {
  return hasAccess(getUserTier(user), 'base');
}

export function isPro(user: UserWithTier | null | undefined): boolean {
  return hasAccess(getUserTier(user), 'pro');
}

export function isElite(user: UserWithTier | null | undefined): boolean {
  return hasAccess(getUserTier(user), 'elite');
}

/** Numeric tier level for comparisons: free=0, base=1, pro=2, elite=3 */
export function tierLevel(user: UserWithTier | null | undefined): number {
  return TIER_CONFIG[getUserTier(user)].level;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: No errors — existing imports of isPro/isElite/isBase still work

- [ ] **Step 3: Commit**

```bash
git add app/lib/subscriptionUtils.ts
git commit -m "fix: change default tier from 'base' to 'free', add isFree() and tierLevel()"
```

---

### Task 4: Create supabaseAdmin.ts

**Files:**
- Create: `app/lib/supabaseAdmin.ts`

- [ ] **Step 1: Create admin client**

```typescript
// app/lib/supabaseAdmin.ts
// Server-side Supabase client using service role key.
// Use this for JWT callbacks, webhook handlers, and any server-side user data operations.
// NEVER import this in client components or expose the service role key.
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/supabaseAdmin.ts
git commit -m "feat: add Supabase admin client for server-side operations"
```

---

### Task 5: Create .env.example

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Create env template**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend (Email — post-launch)
RESEND_API_KEY=
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add .env.example with all required environment variables"
```

---

## Chunk 2: Landing Page — About, Pricing, Tech

### Task 6: Create About.tsx Placeholder

**Files:**
- Create: `app/components/About.tsx`

- [ ] **Step 1: Create placeholder component**

```typescript
// app/components/About.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Hammer } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-20 relative">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-yellow-600/20 rounded-xl flex items-center justify-center">
              <Hammer className="w-8 h-8 text-gold" />
            </div>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Forged in <span className="text-gold">Asgard</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            MjolnirUI is the premium companion design system to{" "}
            <a
              href="https://mjolnirdesignstudios.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric-400 hover:text-electric-300 transition-colors"
            >
              Mjolnir Design Studios
            </a>
            . A weapon to destroy... or a tool to build.
          </p>
          <p className="text-lg text-gray-500 mt-4 italic">
            &ldquo;Asgardian Tech Forged in Valhalla&rdquo;
          </p>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/About.tsx
git commit -m "feat: add About section placeholder with glass morphism card"
```

---

### Task 7: Rewrite Pricing.tsx — 4-Tier Model

**Files:**
- Modify: `app/components/Pricing.tsx`

- [ ] **Step 1: Read the current Pricing.tsx**

Read `app/components/Pricing.tsx` to understand the current structure (3 tiers, handleStripeCheckout, ElectricBorder cards, monthly/annual toggle).

- [ ] **Step 2: Rewrite with 4 tiers**

Key changes from current file:
- Add Free tier at index 0 with no Stripe interaction
- Update Pro: $25/$250, color `#EAB308`, gradient `from-yellow-400 to-yellow-600`
- Update Elite: $50/$500, color `#F97316`, gradient `from-orange-400 to-orange-600`
- Free tier button calls `handleFreeSignup()` → redirects to `/auth/signin`
- Remove `original` strikethrough prices
- Update CTAs: "Join Free", "Unlock Base", "Upgrade to Pro", "Elite Company"
- Import `TIER_CONFIG` from `@/lib/tierConfig` for price IDs (or keep inline for now since user will provide IDs)

The tiers array becomes:

```typescript
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
    ],
    buttonText: "Join Free",
    electricColor: "#3B82F6",
    buttonGradient: "from-blue-400 to-blue-600",
    stripePriceIdMonthly: "",
    stripePriceIdAnnual: "",
    isFree: true,
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
    buttonGradient: "from-emerald-400 to-emerald-600",
    stripePriceIdMonthly: "price_1SdGLZFxkFUD7EnZJbUPdiP6",
    stripePriceIdAnnual: "price_1SdG59FxkFUD7EnZsjsdT2pa",
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
    stripePriceIdMonthly: "PLACEHOLDER_PRO_MONTHLY",
    stripePriceIdAnnual: "PLACEHOLDER_PRO_ANNUAL",
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
    stripePriceIdMonthly: "PLACEHOLDER_ELITE_MONTHLY",
    stripePriceIdAnnual: "PLACEHOLDER_ELITE_ANNUAL",
  },
];
```

- [ ] **Step 3: Add `isFree` to Tier interface and handleFreeSignup**

Add to the Tier interface:
```typescript
isFree?: boolean;
```

Add handler function:
```typescript
const handleFreeSignup = () => {
  router.push("/auth/signin");
};
```

In the button onClick, check `tier.isFree`:
```typescript
onClick={() => tier.isFree ? handleFreeSignup() : handleStripeCheckout(tier)}
```

For the Free tier card, hide the monthly/annual toggle price display — show "Free Forever" instead.

- [ ] **Step 4: Update grid layout for 4 cards**

Change grid from `lg:grid-cols-3` to `lg:grid-cols-4` and adjust gap/padding for the tighter layout. On mobile, keep `grid-cols-1`, on tablet `sm:grid-cols-2`.

- [ ] **Step 5: Verify build and visual**

Run: `npm run dev`
Expected: 4 pricing cards render — Blue (Free), Green (Base), Yellow (Pro), Orange (Elite)

- [ ] **Step 6: Commit**

```bash
git add app/components/Pricing.tsx
git commit -m "feat: restructure pricing to 4 tiers (Free/Base/Pro/Elite) with new colors and prices"
```

---

### Task 8: Create Tech Stack Icons Data

**Files:**
- Create: `app/data/tech-icons.ts`

- [ ] **Step 1: Create icon definitions**

```typescript
// app/data/tech-icons.ts
// Client-only — DO NOT import from server components or API routes.
import type { TechIcon } from "@/data/index";

export const techStackIcons: TechIcon[] = [
  // Core Web
  { name: "React",            svgPath: "/Icons/Technologies/react.svg" },
  { name: "Next.js",          svgPath: "/Icons/Technologies/nextjs.svg" },
  { name: "TypeScript",       svgPath: "/Icons/Technologies/typescript.svg" },
  { name: "JavaScript",       svgPath: "/Icons/Technologies/javascript.svg" },
  { name: "HTML5",            svgPath: "/Icons/Technologies/html.svg" },
  { name: "CSS3",             svgPath: "/Icons/Technologies/css.svg" },
  { name: "Tailwind",         svgPath: "/Icons/Technologies/tailwind.svg" },
  // Animation / 3D
  { name: "GSAP",             svgPath: "/Icons/Technologies/gsap.svg" },
  { name: "Three.js",         svgPath: "/Icons/Technologies/threejs.svg" },
  { name: "Framer Motion",    svgPath: "/Icons/Technologies/framer-motion.svg" },
  { name: "Blender",          svgPath: "/Icons/Technologies/blender.svg" },
  // Backend / Runtime
  { name: "Node.js",          svgPath: "/Icons/Technologies/nodejs.svg" },
  { name: "Python",           svgPath: "/Icons/Technologies/python.svg" },
  // Data / Infra
  { name: "Supabase",         svgPath: "/Icons/Technologies/supabase.svg" },
  { name: "PostgreSQL",       svgPath: "/Icons/Technologies/postgresql.svg" },
  { name: "Docker",           svgPath: "/Icons/Technologies/docker.svg" },
  { name: "Cloudflare",       svgPath: "/Icons/Technologies/cloudflare.svg" },
  // Payments
  { name: "Stripe",           svgPath: "/Icons/Technologies/stripe.svg" },
  // Platform / Hosting
  { name: "Vercel",           svgPath: "/Icons/Technologies/vercel.svg" },
  { name: "GitHub",           svgPath: "/Icons/Technologies/github.svg" },
  // AI
  { name: "Claude",           svgPath: "/Icons/Technologies/claude.svg" },
  // SaaS / Tools
  { name: "Figma",            svgPath: "/Icons/Technologies/figma.svg" },
  { name: "HubSpot",          svgPath: "/Icons/Technologies/hubspot.svg" },
  // MjolnirUI Stack
  { name: "Remotion",         svgPath: "/Icons/Technologies/remotion.svg" },
  { name: "Resend",           svgPath: "/Icons/Technologies/resend.svg" },
  { name: "Capacitor",        svgPath: "/Icons/Technologies/capacitor.svg" },
  { name: "Radix UI",         svgPath: "/Icons/Technologies/radix.svg" },
  { name: "Shadcn/ui",        svgPath: "/Icons/Technologies/shadcn.svg" },
  { name: "React Three Fiber", svgPath: "/Icons/Technologies/r3f.svg" },
  { name: "GLSL/WebGL",       svgPath: "/Icons/Technologies/webgl.svg" },
];
```

**Note:** SVG files must be added to `/public/Icons/Technologies/` by the user. Missing SVGs will render as broken images — the FlipCard component handles this gracefully with the `initials` fallback, so add `initials` properties for any icons that don't have SVGs yet.

- [ ] **Step 2: Commit**

```bash
git add app/data/tech-icons.ts
git commit -m "feat: add 30 tech stack icon definitions for flip card grid"
```

---

### Task 9: Create FlipCard.tsx

**Files:**
- Create: `app/components/ui/Cards/FlipCard.tsx`

- [ ] **Step 1: Create the flip card component**

Port directly from MDS version. The component is presentation-only — receives all state via props from TechCardGrid. Key adaptation: uses MjolnirUI's 4-color palette (no purple/red).

```typescript
// app/components/ui/Cards/FlipCard.tsx
"use client";
import React from "react";
import type { TechIcon } from "@/data/index";

export type FlipCardProps = {
  icon: TechIcon;
  gradient: string;
  glowColor: string;
  flipAxis: "X" | "Y";
  flipDirection: 1 | -1;
  isFlipping: boolean;
  transform: string;
  transitionEnabled: boolean;
};

export function FlipCard({
  icon,
  gradient: _gradient,
  glowColor,
  isFlipping,
  flipAxis,
  flipDirection,
  transform,
  transitionEnabled,
}: FlipCardProps) {
  const baseColor = glowColor.slice(0, 7);

  const renderIcon = () => {
    if (icon.svgPath) {
      return (
        <img
          src={icon.svgPath}
          width={48}
          height={48}
          alt={icon.name}
          style={{
            filter: "brightness(0) invert(1)",
            objectFit: "contain",
            width: 48,
            height: 48,
          }}
        />
      );
    }
    if (icon.reactIcon) {
      const Icon = icon.reactIcon;
      return <Icon size={48} color="white" />;
    }
    if (icon.initials) {
      const fontSize = icon.initials.length <= 2 ? "1.5rem" : "1.1rem";
      return (
        <span style={{ fontWeight: 900, color: "white", fontSize, letterSpacing: "-0.02em" }}>
          {icon.initials}
        </span>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        perspective: "800px",
        aspectRatio: "1 / 1",
        pointerEvents: isFlipping ? "none" : "auto",
      }}
      data-flip-axis={flipAxis}
      data-flip-direction={flipDirection}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: transitionEnabled ? "transform 300ms ease-in-out" : "none",
          transform,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            background: "#030303",
            boxShadow: [
              `inset 0 0 0 1.5px ${baseColor}cc`,
              `inset 0 0 18px -3px  ${baseColor}dd`,
              `inset 0 0 32px -5px  ${baseColor}88`,
            ].join(", "),
          }}
        >
          {renderIcon()}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/ui/Cards/FlipCard.tsx
git commit -m "feat: add FlipCard component with edge-glow animation"
```

---

### Task 10: Create TechCardGrid.tsx

**Files:**
- Create: `app/components/ui/Cards/TechCardGrid.tsx`

- [ ] **Step 1: Create the grid controller**

Port from MDS version — this is the complex animation controller. Key adaptations:
- Import from `@/data/index` (not `@/data/index` with different path)
- Import `techStackIcons` from `@/data/tech-icons`
- Uses 4-color BIFROST arrays instead of 6

The full component is ~200 lines. Port the entire `TechCardGrid` component from the MDS codebase (provided by user in conversation) with these import changes:

```typescript
import { FlipCard } from "./FlipCard";
import { BIFROST_GRADIENTS, BIFROST_GLOWS, type TechIcon } from "@/data/index";
import { techStackIcons } from "@/data/tech-icons";
```

And update `randomGradientIndex()` to use the 4-element array (already handled since it uses `BIFROST_GRADIENTS.length`).

- [ ] **Step 2: Commit**

```bash
git add app/components/ui/Cards/TechCardGrid.tsx
git commit -m "feat: add TechCardGrid with staggered flip animation controller"
```

---

### Task 11: Create Tech.tsx

**Files:**
- Create (overwrite stub): `app/components/Tech.tsx`

- [ ] **Step 1: Write the Tech section**

Port from MDS version with these adaptations:
- Import `supabaseClient` from `@/lib/supabaseClient` (not `@/lib/supabase/client`)
- Use 4 electric colors for the stats counter grid (Blue, Green, Gold, Orange)
- Import `TechCardGrid` from `@/components/ui/Cards/TechCardGrid`
- Remove the `bg-gradient-to-b from-neutral-950 via-purple-950/10` background (we have Bifrost shader behind)
- Use `bg-transparent` or very subtle dark gradient instead

Counter stats:
1. Components Forged: 80+, Electric Blue
2. Site Visitors: 1500+, Electric Green
3. Newsletter Subscribers: dynamic from Supabase, Electric Gold
4. Users Served: 17+, Electric Orange

Feature cards: Keep all 6 (Lightning Performance, Enterprise Security, Real-time Analytics, Community Driven, Award Winning, Global Scale) with gold gradient icon backgrounds.

- [ ] **Step 2: Verify build**

Run: `npm run dev`
Expected: Tech section renders with counters, flip cards, and feature cards

- [ ] **Step 3: Commit**

```bash
git add app/components/Tech.tsx
git commit -m "feat: add Tech section with animated counters, flip card grid, and feature cards"
```

---

### Task 12: Update page.tsx — Add About + Tech Sections

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add imports and sections**

Add these imports:
```typescript
import About from '@/components/About';
import Tech from '@/components/Tech';
```

Insert `<About />` between `<Hero />` and `<Blocks />`.
Insert `<Tech />` between `<Pricing />` and `<Footer />`.

Final order inside the content div:
```tsx
<Hero />
<About />
<Blocks />
<Pricing />
<Tech />
<Footer />
```

- [ ] **Step 2: Verify all sections render**

Run: `npm run dev`
Expected: Scroll through Hero → About → Blocks → Pricing → Tech → Footer. Nav links scroll to correct anchors.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add About and Tech sections to homepage, reorder layout"
```

---

## Chunk 3: Auth & Stripe Pipeline

### Task 13: Fix middleware.ts

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Read current middleware**

Read `middleware.ts` — currently matches `/app/(protected)/:path*` which is broken.

- [ ] **Step 2: Fix the matcher and auth logic**

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // All /blocks/* routes require authentication (any tier, including free)
  if (pathname.startsWith('/blocks')) {
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Admin routes require admin role
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/blocks/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/blocks/:path*', '/admin/:path*'],
};
```

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "fix: middleware route matcher — protect /blocks/* and /admin/* with correct URL patterns"
```

---

### Task 14: Update nextAuthOptions.ts — Tier Sync

**Files:**
- Modify: `app/lib/nextAuthOptions.ts`

- [ ] **Step 1: Read current file**

Read `app/lib/nextAuthOptions.ts` — currently only sets `user.id` in session callback.

- [ ] **Step 2: Add JWT callback with tier fetch and session refresh**

Add import at top:
```typescript
import { supabaseAdmin } from './supabaseAdmin';
```

Replace the callbacks object with:
```typescript
callbacks: {
  async session({ session, token }: { session: Session; token: any }) {
    if (session.user) {
      session.user.id = token.sub;
      session.user.tier = token.tier || 'free';
      session.user.role = token.role || 'user';
    }
    return session;
  },
  async jwt({ token, user, trigger }: { token: any; user?: any; trigger?: string }) {
    // Fetch tier on first login
    if (user) {
      const { data } = await supabaseAdmin
        .from('users')
        .select('tier, role')
        .eq('id', token.sub)
        .single();
      token.tier = data?.tier || 'free';
      token.role = data?.role || 'user';
    }
    // Allow manual session refresh after checkout
    if (trigger === 'update') {
      const { data } = await supabaseAdmin
        .from('users')
        .select('tier, role')
        .eq('id', token.sub)
        .single();
      token.tier = data?.tier || 'free';
      token.role = data?.role || 'user';
    }
    return token;
  },
},
```

Also update the Session type declaration to include tier and role (already present but verify).

- [ ] **Step 3: Commit**

```bash
git add app/lib/nextAuthOptions.ts
git commit -m "feat: add JWT tier sync from Supabase with session refresh support"
```

---

### Task 15: Create Stripe Checkout Route

**Files:**
- Create: `app/api/stripe/checkout/route.ts`

- [ ] **Step 1: Create the checkout route**

```typescript
// app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { nextAuthOptions } from '@/lib/nextAuthOptions';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(nextAuthOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { priceId, mode } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    // Check for existing Stripe customer to avoid duplicates
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: mode || 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/blocks/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/#pricing`,
      metadata: { userId: session.user.id },
    };

    if (userData?.stripe_customer_id) {
      checkoutParams.customer = userData.stripe_customer_id;
    } else {
      checkoutParams.customer_email = session.user.email;
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/stripe/checkout/route.ts
git commit -m "feat: add Stripe Checkout Session route with customer deduplication"
```

---

### Task 16: Create Stripe Webhook Route

**Files:**
- Create: `app/api/webhooks/stripe/route.ts`

- [ ] **Step 1: Create the webhook handler**

```typescript
// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { PRICE_TO_TIER } from '@/lib/tierConfig';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) {
          console.error('No userId in checkout session metadata');
          break;
        }
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items.data[0].price.id;
        const tier = PRICE_TO_TIER[priceId] || 'free';

        await supabaseAdmin.from('users').update({
          tier,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);

        console.log(`User ${userId} upgraded to ${tier}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0].price.id;
        const tier = PRICE_TO_TIER[priceId] || 'free';
        const customerId = sub.customer as string;

        await supabaseAdmin.from('users').update({
          tier,
          updated_at: new Date().toISOString(),
        }).eq('stripe_customer_id', customerId);

        console.log(`Subscription updated: customer ${customerId} → ${tier}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabaseAdmin.from('users').update({
          tier: 'free',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        }).eq('stripe_customer_id', customerId);

        console.log(`Subscription cancelled: customer ${customerId} → free`);
        break;
      }
    }
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/webhooks/stripe/route.ts
git commit -m "feat: add Stripe webhook handler with signature verification and tier sync"
```

---

## Chunk 4: Dashboard — Sidebar, Header, Tier Gates

### Task 17: Create TierBadge Component

**Files:**
- Create: `app/components/Dashboards/TierBadge.tsx`

- [ ] **Step 1: Create reusable tier badge**

```typescript
// app/components/Dashboards/TierBadge.tsx
"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { getTierConfig, type TierName } from "@/lib/tierConfig";

interface TierBadgeProps {
  tier: TierName;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function TierBadge({ tier, size = "md", showIcon = true, className }: TierBadgeProps) {
  const config = getTierConfig(tier);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  const iconSizes = { sm: 12, md: 14, lg: 16 };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold border",
        config.tailwindBorder,
        config.tailwindText,
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${config.color}15`,
        borderColor: `${config.color}40`,
      }}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/Dashboards/TierBadge.tsx
git commit -m "feat: add reusable TierBadge component with color-coded tier display"
```

---

### Task 18: Create UpgradeModal Component

**Files:**
- Create: `app/components/Dashboards/UpgradeModal.tsx`

- [ ] **Step 1: Create upgrade prompt modal**

```typescript
// app/components/Dashboards/UpgradeModal.tsx
"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap } from "lucide-react";
import { getTierConfig, type TierName } from "@/lib/tierConfig";
import { TierBadge } from "./TierBadge";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: TierName;
  featureName: string;
}

export function UpgradeModal({ isOpen, onClose, requiredTier, featureName }: UpgradeModalProps) {
  const config = getTierConfig(requiredTier);
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full mx-4 bg-black/80 backdrop-blur-xl border rounded-2xl p-8"
            style={{ borderColor: `${config.color}40` }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X size={20} />
            </button>

            <div className="text-center">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Zap size={32} style={{ color: config.color }} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Unlock {featureName}
              </h3>

              <p className="text-gray-400 mb-4">
                This feature requires{" "}
                <TierBadge tier={requiredTier} size="sm" /> or higher.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onClose();
                  router.push("/#pricing");
                }}
                className="w-full py-3 rounded-xl font-bold text-black text-lg"
                style={{ backgroundColor: config.color }}
              >
                Upgrade to {config.label}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/Dashboards/UpgradeModal.tsx
git commit -m "feat: add UpgradeModal component for tiered paywall prompts"
```

---

### Task 19: Rewrite Dashboard Sidebar

**Files:**
- Modify: `app/components/Dashboards/Sidebar.tsx`

- [ ] **Step 1: Read current Sidebar.tsx**

Read the current file (309 lines) — has HoverSidebar with 6 nav items.

- [ ] **Step 2: Rewrite with sequential design system workflow**

This is a full rewrite. The new sidebar should:
- Use the sequential workflow order from the spec (Get Started → Foundation → Canvas → ... → AI Tools → Account)
- Show section headers as category labels
- Each item shows: icon, name, tier badge (if locked), lock icon (if locked)
- Locked items have dimmed text and trigger UpgradeModal on click
- Unlocked items navigate to their route
- Uses `useSession()` to get current user tier
- Collapsible sections (optional for launch — can be always-expanded)
- User profile section at bottom with TierBadge

Define sidebar nav data structure:
```typescript
type SidebarItem = {
  name: string;
  href: string;
  icon: ComponentType;
  requiredTier: TierName;
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};
```

Build the sidebar sections array matching the spec's sequential order, then render with tier-aware lock/unlock logic.

- [ ] **Step 3: Verify sidebar renders**

Run: `npm run dev`, navigate to `/blocks/dashboard`
Expected: Sidebar shows all sections with tier-colored badges and lock icons

- [ ] **Step 4: Commit**

```bash
git add app/components/Dashboards/Sidebar.tsx
git commit -m "feat: rewrite sidebar with sequential design system workflow and tier gates"
```

---

### Task 20: Update Dashboard Header

**Files:**
- Modify: `app/components/Dashboards/Header.tsx`

- [ ] **Step 1: Read current Header.tsx**

Read `app/components/Dashboards/Header.tsx` (17 lines) — simple header with Upgrade/Sign Out buttons.

- [ ] **Step 2: Add tier badge to header**

Add `useSession()` hook, extract tier, display `<TierBadge />` next to the user's name. Keep Upgrade and Sign Out buttons.

```typescript
import { useSession } from "next-auth/react";
import { TierBadge } from "./TierBadge";
import { type TierName } from "@/lib/tierConfig";
```

- [ ] **Step 3: Commit**

```bash
git add app/components/Dashboards/Header.tsx
git commit -m "feat: add tier badge display to dashboard header"
```

---

### Task 21: Rewrite Dashboard Page

**Files:**
- Modify: `app/(protected)/blocks/dashboard/page.tsx`

- [ ] **Step 1: Read current dashboard page**

Read current file — contains "Lifetime Access Activated" copy that contradicts the subscription model.

- [ ] **Step 2: Rewrite with tier-aware welcome and feature grid**

Replace entire content with:
- Welcome header with user name and tier badge
- Session refresh on `?upgraded=true` query param (calls `update()` from useSession)
- Grid of feature cards showing all product categories
- Each card shows: icon, name, description, tier badge, lock overlay if locked
- Unlocked cards link to their tool page (placeholder routes for now)
- Locked cards trigger UpgradeModal

```typescript
"use client";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TierBadge } from "@/components/Dashboards/TierBadge";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";
import { hasAccess, type TierName } from "@/lib/tierConfig";
// ... feature grid with tier gates
```

The feature grid should show cards for each sidebar section category with representative icons and brief descriptions. Cards are click-to-expand navigation items.

- [ ] **Step 3: Verify dashboard renders for free user**

Run: `npm run dev`, sign in, navigate to dashboard
Expected: Welcome message with Free tier badge, grid of features, locked items show upgrade modal on click

- [ ] **Step 4: Commit**

```bash
git add "app/(protected)/blocks/dashboard/page.tsx"
git commit -m "feat: rewrite dashboard with tier-aware welcome, feature grid, and upgrade prompts"
```

---

## Chunk 5: Polish — Meta Tags, CLAUDE.md, Verification

### Task 22: Update layout.tsx — OG Meta Tags

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Read current layout.tsx metadata**

Read the metadata section of `app/layout.tsx`.

- [ ] **Step 2: Update OG and Twitter meta tags**

Update the metadata export to include:

```typescript
openGraph: {
  title: 'MjolnirUI — Premium React Component Library',
  description: 'Asgardian-grade UI/UX design system. Components, shaders, 3D tools, and AI-powered design.',
  url: 'https://www.mjolnirui.com',
  siteName: 'MjolnirUI',
  images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MjolnirUI — Premium React Component Library' }],
  locale: 'en_US',
  type: 'website',
},
twitter: {
  card: 'summary_large_image',
  title: 'MjolnirUI — Premium React Component Library',
  description: 'Asgardian-grade UI/UX design system. Components, shaders, 3D tools, and AI-powered design.',
  site: '@MjolnirDesignsX',
  creator: '@MjolnirDesignsX',
  images: ['/og-image.jpg'],
},
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: enhance OG and Twitter meta tags for social sharing"
```

---

### Task 23: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md with new pricing, tier model, and sidebar structure**

Key updates:
- Change pricing table to 4 tiers: Free $0, Base $10/$100, Pro $25/$250, Elite $50/$500
- Update tier colors: Blue (Free), Green (Base), Yellow (Pro), Orange (Elite)
- Add tier config reference (`app/lib/tierConfig.ts`)
- Document sequential sidebar workflow
- Update Critical Gaps section (mark Stripe checkout + webhook as implemented)
- Add new env var: `SUPABASE_SERVICE_ROLE_KEY`
- Document `supabaseAdmin.ts` in architecture

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with 4-tier model, new pricing, and sidebar structure"
```

---

### Task 24: Build Verification

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Build succeeds with no errors. Warnings about missing SVGs are acceptable (user is adding them).

- [ ] **Step 2: Run dev server and test landing page**

```bash
npm run dev
```

Test checklist:
- [ ] Hero section renders with THOR text and 2 CTA buttons
- [ ] About section renders below Hero with glass card
- [ ] Blocks section renders (bento box, unchanged)
- [ ] Pricing shows 4 cards: Free (blue), Base (green), Pro (yellow), Elite (orange)
- [ ] Monthly/Annual toggle works on all 4 cards
- [ ] "Join Free" redirects to /auth/signin
- [ ] Tech section renders with counters and flip cards (4 colors only)
- [ ] Nav links scroll to correct sections
- [ ] Footer renders

- [ ] **Step 3: Test auth flow**

- [ ] Sign in via Google or GitHub
- [ ] Redirected to /blocks/dashboard
- [ ] Dashboard shows welcome with Free tier badge
- [ ] Sidebar shows all sections with tier badges and lock icons
- [ ] Clicking locked item shows UpgradeModal with correct tier color
- [ ] Sign out works

- [ ] **Step 4: Verify Stripe checkout (requires real Stripe price IDs)**

- [ ] Click "Unlock Base" → redirected to Stripe Checkout
- [ ] After payment → redirected to dashboard with `?upgraded=true`
- [ ] Tier badge updates to Base (green)

**Note:** Stripe webhook testing requires either:
- `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (Stripe CLI)
- Or deploying to a public URL with webhook configured in Stripe Dashboard

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: launch sprint complete — MjolnirUI ready for Thorsday"
```
