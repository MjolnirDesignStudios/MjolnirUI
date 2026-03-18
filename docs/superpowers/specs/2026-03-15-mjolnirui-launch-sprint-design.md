# MjolnirUI Launch Sprint — Design Spec

**Date:** 2026-03-15
**Launch Target:** 2026-03-19 (Thorsday — First Day of Spring)
**Scope:** Approach A — Ship the landing page, pricing, auth, Stripe pipeline, and dashboard with full preview + tier gates.

---

## 1. Pricing Restructure

### 1.1 New 4-Tier Model

| Tier | Color | Monthly | Annual | Button CTA | Stripe |
|------|-------|---------|--------|------------|--------|
| Free | Electric Blue `#3B82F6` | $0 | — | "Join Free" | No Stripe product — signup only |
| Base | Electric Green `#10B981` | $10 | $100 | "Unlock Base" | Existing price IDs (unchanged) |
| Pro | Electric Yellow `#EAB308` | $25 | $250 | "Upgrade to Pro" | NEW price IDs needed |
| Elite | Electric Orange `#F97316` | $50 | $500 | "Elite Company" | NEW price IDs needed |

### 1.2 Stripe Changes Required (Manual)

**User action:** In Stripe Dashboard → Products:
- Keep existing Base product + prices ($10/mo, $100/yr) — IDs unchanged
- Open Pro product → Add new prices: $25/mo, $250/yr → Archive old $50/mo, $500/yr prices
- Open Elite product → Add new prices: $50/mo, $500/yr → Archive old $250/mo, $2500/yr prices
- Copy 4 new `price_` IDs for Pro and Elite

**Free tier:** No Stripe product needed. Users sign up via NextAuth (Google/GitHub), get `tier: 'free'` written to Supabase by default, and access the dashboard immediately.

### 1.3 Pricing.tsx Changes

- Add 4th tier card (Free) at position 0
- Update Pro pricing: $25/$250 with new Stripe price IDs
- Update Elite pricing: $50/$500 with new Stripe price IDs
- Free card: no `handleStripeCheckout` — instead calls `handleFreeSignup()` which redirects to `/auth/signin`
- Update electric colors: Free `#3B82F6`, Base `#10B981`, Pro `#EAB308`, Elite `#F97316`
- Update button gradients to match new color scheme
- Update CTAs: "Join Free", "Unlock Base", "Upgrade to Pro", "Elite Company"
- Move "MOST POPULAR" badge from Pro to... Pro (stays on Pro — it's the sweet spot)
- Remove `original` strikethrough prices (clean presentation)

### 1.4 Competitive Positioning

MjolnirUI differentiates from React Bits ($49 one-time), Magic UI ($49 one-time), Aceternity ($49 one-time), and Shadcn (free) by offering interactive design tools (Background Studio, Shader Engine, 3D Forge, OdinAI) as a SaaS platform, not just static components. The subscription model is justified by ongoing tooling, not code delivery alone.

- $10/mo Base undercuts $49 one-time for first 4 months while providing ongoing updates
- $25/mo Pro matches a single competitor license but delivers tools they don't have
- $50/mo Elite is positioned for agencies needing AI + dedicated support
- Free tier removes the "why pay when Shadcn is free?" objection

---

## 2. Navigation Update

### 2.1 Nav Items

Replace current nav items in `app/data/index.ts`:

```typescript
export const navItems = [
  { name: "About", link: "/#about" },
  { name: "Blocks", link: "/#blocks" },
  { name: "Pricing", link: "/#pricing" },
  { name: "Tech", link: "/#tech" },
];
```

**Changes:** `Agent` → `About`. All others remain the same.

### 2.2 Homepage Section Order

```
page.tsx scroll order:
1. ShaderBG_Type1 (Bifrost background layer)
2. Navbar (About | Blocks | Pricing | Tech)
3. Hero (THOR text reveal + 2 CTA buttons)
4. About (placeholder — glass card with Norse tagline)
5. Blocks (existing bento box — no changes)
6. Pricing (enhanced 4-tier cards)
7. Tech (new — flip cards + counters from MDS)
8. Footer (no changes)
```

### 2.3 About Section (Placeholder)

Simple glass morphism card with:
- Heading: "Forged in Asgard"
- Subtext: Norse-themed brand narrative placeholder
- Design: `bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl`
- Will be enhanced post-launch with full brand story, team, and MDS connection

---

## 3. Tech Section (New)

### 3.1 Ported from MjolnirDesignStudios.com

Three sub-sections adapted for MjolnirUI:

**A) Stats Counter Grid (4 columns):**
| Stat | Color | Border |
|------|-------|--------|
| Components Forged (80+) | Electric Blue `text-electric-400` | `border-electric-400/30` |
| Site Visitors (1500+) | Electric Green `text-emerald-400` | `border-emerald-400/30` |
| Newsletter Subscribers (dynamic from Supabase) | Electric Yellow `text-gold` | `border-yellow-400/30` |
| Users Served (17+) | Electric Orange `text-orange-400` | `border-orange-400/30` |

Counter component animates from 0 to target over 2 seconds when scrolled into view.

**B) Tech Flip Card Grid:**
- Desktop: 10 columns × 3 rows = 30 cards
- Mobile: 4 columns × 3 rows = 12 cards
- Cards flip on staggered intervals (3-7s) with random axis (X or Y)
- Fisher-Yates shuffle ensures no duplicate icons adjacent

**Color arrays (4 colors only — purple and red removed):**
```typescript
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

**Tech icon list (30 icons):**
React, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind, GSAP, Three.js, Framer Motion, Node.js, Python, Supabase, PostgreSQL, Docker, Cloudflare, Stripe, Vercel, GitHub, Claude, Figma, HubSpot, Remotion, Resend, Capacitor, Radix UI, Shadcn/ui, React Three Fiber, GLSL/WebGL, Blender

**C) Feature Cards Grid (6 cards, 3 columns):**
Lucide icons with gold gradient backgrounds, glass morphism cards. Same structure as MDS but copy adapted for MjolnirUI context (Lightning Performance, Enterprise Security, Real-time Analytics, Community Driven, Award Winning, Global Scale).

### 3.2 Files to Create

```
app/components/Tech.tsx              — Main section (Counter + Grid + Feature cards)
app/components/ui/Cards/FlipCard.tsx  — Individual flip card component
app/components/ui/Cards/TechCardGrid.tsx — Grid controller with flip logic
app/data/tech-icons.ts               — Tech stack icon definitions
```

Update `app/data/index.ts` with:
- `BIFROST_GRADIENTS` (4-color array)
- `BIFROST_GLOWS` (4-color array)
- `TechIcon` type export

---

## 4. Authentication & Free Tier Flow

### 4.1 Signup Flow

```
User clicks "Join Free" on Pricing
  → Redirects to /auth/signin
  → Signs in via Google or GitHub (NextAuth)
  → NextAuth session callback:
      1. Check if user exists in Supabase
      2. If new user: insert with tier: 'free', role: 'user'
      3. If existing user: fetch tier from Supabase
      4. Attach tier + role to session token
  → Redirect to /blocks/dashboard
  → Dashboard renders with Free tier access
```

### 4.2 Session Callback Fix

Current `nextAuthOptions.ts` session callback only sets `user.id` from token. Must be enhanced to:

**Important:** Use a `supabaseAdmin` client (service role key) for server-side tier lookups, NOT the public anon client. The anon key will be blocked by RLS policies on the users table.

```typescript
// app/lib/supabaseAdmin.ts (NEW FILE)
import { createClient } from '@supabase/supabase-js';
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // NOT the public anon key
);
```

```typescript
callbacks: {
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.sub;
      session.user.tier = token.tier || 'free';
      session.user.role = token.role || 'user';
    }
    return session;
  },
  async jwt({ token, user, trigger }) {
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
    // Allow manual session refresh after checkout (client calls update())
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

**Session refresh after checkout:** The success page (`/blocks/dashboard?upgraded=true`) must call `await update()` from `useSession()` to force a JWT refresh so the new tier appears immediately without requiring re-login.

### 4.3 Supabase Schema Requirements

Ensure `users` table has columns:
- `id` (uuid, primary key)
- `email` (text)
- `name` (text, nullable)
- `image` (text, nullable)
- `tier` (text, default: 'free') — values: 'free', 'base', 'pro', 'elite'
- `role` (text, default: 'user') — values: 'user', 'admin'
- `stripe_customer_id` (text, nullable)
- `stripe_subscription_id` (text, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 4.4 Middleware Fix

The existing middleware matches `/app/(protected)/:path*` which is incorrect — Next.js App Router URLs don't include `/app/` and route groups like `(protected)` are stripped. The middleware currently protects nothing.

**Fix:** Update matcher to actual URL paths and allow all authenticated users (including free tier):

```typescript
export const config = {
  matcher: ['/blocks/:path*', '/admin/:path*'],
};
// Middleware checks for valid JWT token (any tier).
// Unauthenticated → redirect to /auth/signin.
// Admin routes additionally check role === 'admin'.
```

---

## 5. Stripe Checkout & Webhook Routes

### 5.1 POST /api/stripe/checkout

Per Stripe best practices: use Stripe Checkout Sessions (hosted by Stripe) for the payment flow. This is the recommended 2026 approach — no custom payment forms needed.

```typescript
// app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { nextAuthOptions } from '@/lib/nextAuthOptions';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const session = await getServerSession(nextAuthOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { priceId, mode } = await req.json();

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

  // Reuse existing customer or pre-fill email for new customers
  if (userData?.stripe_customer_id) {
    checkoutParams.customer = userData.stripe_customer_id;
  } else {
    checkoutParams.customer_email = session.user.email;
  }

  const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);
  return NextResponse.json({ url: checkoutSession.url });
}
```

**Key decisions:**
- Omit `payment_method_types` entirely → Stripe auto-selects via dynamic payment methods (per user location/wallet)
- Stripe-hosted checkout (not embedded) → simplest, most secure, recommended
- Reuse existing Stripe customer if one exists (prevents duplicate customers on re-subscribe)
- `customer_email` pre-filled for new customers only
- `metadata.userId` passed through for webhook processing

### 5.2 POST /api/webhooks/stripe

**CRITICAL: Webhook signature verification is mandatory.** Without it, anyone can POST to this endpoint and upgrade their own tier.

```typescript
// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  // 1. Read raw body (NOT parsed JSON — Stripe requires raw for signature)
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 2. Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;
      // Fetch subscription to get price ID
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = sub.items.data[0].price.id;
      const tier = PRICE_TO_TIER[priceId] || 'free';
      // Update user in Supabase
      await supabaseAdmin.from('users').update({
        tier, stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
      }).eq('id', userId);
      break;
    }
    case 'customer.subscription.updated': {
      // Handles plan changes (upgrades/downgrades)
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0].price.id;
      const tier = PRICE_TO_TIER[priceId] || 'free';
      const customerId = sub.customer as string;
      await supabaseAdmin.from('users').update({ tier })
        .eq('stripe_customer_id', customerId);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      await supabaseAdmin.from('users').update({ tier: 'free' })
        .eq('stripe_customer_id', customerId);
      break;
    }
  }
  return NextResponse.json({ received: true });
}
```

**Price-to-tier mapping:**
```typescript
const PRICE_TO_TIER: Record<string, string> = {
  // Base
  'price_1SdGLZFxkFUD7EnZJbUPdiP6': 'base',  // monthly
  'price_1SdG59FxkFUD7EnZsjsdT2pa': 'base',  // annual
  // Pro (NEW IDs — user will provide after Stripe update)
  'PLACEHOLDER_PRO_MONTHLY': 'pro',
  'PLACEHOLDER_PRO_ANNUAL': 'pro',
  // Elite (NEW IDs — user will provide after Stripe update)
  'PLACEHOLDER_ELITE_MONTHLY': 'elite',
  'PLACEHOLDER_ELITE_ANNUAL': 'elite',
};
```

---

## 6. Dashboard Design

### 6.1 Architecture: Full Preview + Tiered Paywalls

All 9+ product categories visible to all users. Actual tool access gated by tier. Color-coded throughout.

**Launch scope boundary:** The dashboard for Thorsday includes the sidebar navigation with tier badges, lock/upgrade modals, and scaffold content pages. Full component documentation pages (live previews, props tables, usage guides) will be populated incrementally post-launch. The existing dashboard page content ("Lifetime Access Activated", "No subscriptions") must be fully replaced — it contradicts the new subscription model.

### 6.2 Sidebar Navigation (Sequential Design System Workflow)

Organized in the order a designer/developer/AI agent would build a project:

```
GET STARTED                          (Free — Blue)
  ├── Introduction
  ├── Installation
  ├── CLI Reference
  └── MCP / AI Agent Setup

FOUNDATION                           (Free — Blue)
  ├── Design Tokens
  ├── Typography
  ├── Color System
  └── Icons

CANVAS                               (Base/Pro — Green/Yellow)
  ├── Backgrounds                    (Base)
  ├── Shader Backgrounds             (Pro)
  └── Custom Background Studio       (Pro)

LAYOUT                               (Free/Base — Blue/Green)
  ├── Grid Systems                   (Free)
  ├── Sections                       (Base)
  └── Page Templates                 (Base)

NAVIGATION                           (Free/Base — Blue/Green)
  ├── Navbar                         (Free)
  ├── Sidebar                        (Base)
  ├── Floating Nav                   (Free)
  └── Breadcrumbs                    (Base)

COMPONENTS                           (Free/Base — Blue/Green)
  ├── Buttons                        (Free)
  ├── Cards                          (Free)
  ├── Badges                         (Free)
  ├── Inputs & Forms                 (Base)
  ├── Modals & Dialogs               (Base)
  └── Data Display                   (Base)

ANIMATION                            (Free/Base/Pro — Blue/Green/Yellow)
  ├── Text Effects                   (Free)
  ├── Transitions                    (Free)
  ├── Framer Motion                  (Base)
  ├── GSAP Animations                (Pro)
  └── Electric Effects               (Base)

3D & WEBGL                           (Base/Pro — Green/Yellow)
  ├── Animated Orbs                  (Base)
  ├── 3D Showcase                    (Pro)
  └── 3D Forge                       (Pro)

SYSTEMS                              (Base/Pro — Green/Yellow)
  ├── Authentication                 (Base)
  ├── Dashboard Builder              (Pro)
  ├── Website Tuner                  (Pro)
  └── Payments                       (Base)

AI TOOLS                             (Elite — Orange)
  ├── OdinAI Agent                   (Elite — Beta)
  └── Shader Designer                (Elite)

ACCOUNT
  ├── Profile & Tier
  ├── Billing
  └── Documentation
```

### 6.3 Tier Badge System

Each user's profile displays a color-coded badge:
- Free: Blue badge with lightning bolt icon
- Base: Green badge with hammer icon
- Pro: Yellow badge with crown icon
- Elite: Orange badge with Mjolnir icon

Sidebar items show:
- Unlocked: Normal text, tier-colored left border accent
- Locked: Dimmed text, small lock icon, tier badge showing required level
- Clicking locked item → modal: "Upgrade to [Tier] to unlock [Feature]" with CTA button linking to pricing

### 6.4 Component Display Pages

Each component/tool page includes:
- Live preview/demo
- Code block with syntax highlighting (copy button)
- CLI install command: `npx mjolnirui add [component-name]`
- Props/API documentation
- Tier badge showing access level

---

## 7. Component Registry & Distribution Model

### 7.1 Hybrid Approach (Shadcn-style CLI + NPM packages)

**For components** (Navbar, Hero, ElectricBorder, etc.):
- Shadcn-style CLI: `npx mjolnirui add electric-border`
- Copies source files directly into user's project
- Users own the code, can customize freely
- AI agents can read/modify the source directly

**For tools/engines** (OdinAI, Shader Engine):
- NPM packages: `npm i @mjolnirui/shader-engine`
- Complex runtime systems that need versioning and updates
- API stability maintained across versions

**For utilities:**
- `@mjolnirui/utils` — shared helpers (cn(), design tokens)

### 7.2 Why This is Optimal for 2026

- Copy/paste model is agent-optimal: AI can read full source, understand it, modify it
- No dependency lock-in for UI components
- NPM packages only for complex runtime systems that shouldn't be duplicated
- CLI provides discoverability: `npx mjolnirui list` shows available components + tier requirements

---

## 8. Environment Variables

### 8.0 Required Env Vars (Complete List)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # NEW — for server-side admin client

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=              # From Stripe Dashboard → Webhooks

# Resend (Email — post-launch)
RESEND_API_KEY=
```

---

## 9. Social/OG Thumbnails

### 9.1 Meta Tags

Update `app/layout.tsx` metadata:

```typescript
openGraph: {
  title: 'MjolnirUI — Premium React Component Library',
  description: 'Asgardian-grade UI/UX design system. Components, shaders, 3D tools, and AI-powered design.',
  url: 'https://www.mjolnirui.com',
  siteName: 'MjolnirUI',
  images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MjolnirUI' }],
  locale: 'en_US',
  type: 'website',
},
twitter: {
  card: 'summary_large_image',
  title: 'MjolnirUI — Premium React Component Library',
  description: 'Asgardian-grade UI/UX design system.',
  site: '@MjolnirDesignsX',
  creator: '@MjolnirDesignsX',
  images: ['/og-image.jpg'],
},
```

### 9.2 Required Assets

- `/public/og-image.jpg` — 1200×630, MjolnirUI branding with Bifrost/electric theme
- Ensure this image renders correctly on Google, iMessage, Instagram, X preview cards

---

## 10. Post-Launch Roadmap

### Monthly Enhancements
- Bug fixes, component polish, new free components
- Community feedback integration

### May 29, 2026 — Major Product Launch
- OdinAI full agent with Ralph Self-Improvement Loop (Elite)
- Shader Engine — full prompt-based GLSL design system (Pro)
- Remotion video system — social media thumbnail/content generation (Pro/Elite)
- Resend newsletter — automated email tutorial series with Meshy AI Avatar
- HubSpot CRM integration
- Lightning1/2/3 upgrade animations (RPG-style tier ceremonies)
- AI token allocation system (Pro/Elite)

### Quarterly Cadence
- Major product launches every 2-3 months
- Monthly enhancement releases between major launches

---

## 11. Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `app/api/stripe/checkout/route.ts` | Stripe Checkout Session creation |
| `app/api/webhooks/stripe/route.ts` | Stripe webhook handler (signature verification + tier updates) |
| `app/lib/supabaseAdmin.ts` | Supabase admin client (service role key for server-side ops) |
| `app/components/Tech.tsx` | Tech section (counters + flip cards + features) — full rewrite, current file is a stub |
| `app/components/ui/Cards/FlipCard.tsx` | Flip card component |
| `app/components/ui/Cards/TechCardGrid.tsx` | Flip card grid controller |
| `app/components/About.tsx` | About section placeholder |
| `app/data/tech-icons.ts` | Tech stack icon definitions |
| `.env.example` | Environment variable template |

### Modified Files
| File | Changes |
|------|---------|
| `app/components/Pricing.tsx` | 4 tiers, new colors, new prices, free tier card |
| `app/data/index.ts` | Nav items (Agent→About), BIFROST_GRADIENTS (4 colors), BIFROST_GLOWS, TechIcon type |
| `app/lib/nextAuthOptions.ts` | JWT callback for tier fetch, session callback for tier/role |
| `app/lib/subscriptionUtils.ts` | Add `isFree()` check, change default tier from `'base'` to `'free'`, add `tierLevel()` numeric comparator |
| `app/page.tsx` | Add About and Tech sections to homepage |
| `app/layout.tsx` | Enhanced OG/Twitter meta tags |
| `app/(protected)/blocks/dashboard/page.tsx` | Full preview grid with tier badges |
| `app/components/Dashboards/Sidebar.tsx` | Sequential design system workflow nav |
| `app/components/Dashboards/Header.tsx` | Tier badge display |
| `middleware.ts` | Fix matcher pattern (currently broken — protects nothing), allow all authenticated users including free tier |
| `CLAUDE.md` | Update with new pricing, tier model, sidebar structure |

---

## 12. Success Criteria (Thorsday Launch)

- [ ] Visitor can view landing page: Hero → About → Blocks → Pricing → Tech → Footer
- [ ] Visitor can click "Join Free" → sign in via Google/GitHub → land in dashboard
- [ ] Free user sees all tools in sidebar, can access Free-tier items, sees lock + badge on paid items
- [ ] Free user clicks locked item → upgrade prompt with correct tier color + CTA
- [ ] User can click "Unlock Base" → Stripe Checkout → payment → tier updated in Supabase → dashboard reflects Base access
- [ ] Same flow works for Pro and Elite
- [ ] User profile shows correct tier badge (Blue/Green/Yellow/Orange)
- [ ] Tech section flip cards animate with 4-color palette (no purple/red)
- [ ] OG/Twitter thumbnails render correctly when URL is shared (og-image.jpg exists in /public/)
- [ ] All nav links scroll to correct sections
- [ ] All 6 Stripe price IDs are real (no placeholders) and match correct products
- [ ] Stripe webhook signature verification is active (test with Stripe CLI)
- [ ] Middleware correctly protects /blocks/* and /admin/* routes
- [ ] subscriptionUtils defaults to 'free' (not 'base') for users without a tier
- [ ] Dashboard success page (?upgraded=true) triggers session refresh
