# MjolnirUI — CLAUDE.md

## Project Overview

**MjolnirUI.com** is a premium React component library and UI/UX design tool platform — companion site to MjolnirDesignStudios.com. Think React Bits / Magic UI but with a Norse mythology / electric design theme branded around Mjolnir Design Studios.

**Launch Target:** March 19, 2026 (Thorsday — First Day of Spring)

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, CSS custom properties (HSL design tokens)
- **Animation:** Framer Motion 12, GSAP (planned), react-spring
- **3D/WebGL:** Three.js 0.182, React Three Fiber 9, Drei 10, postprocessing
- **Auth:** NextAuth v4 (JWT strategy) with Google + GitHub OAuth, Supabase Adapter
- **Database:** Supabase (shared org with MjolnirDesignStudios.com)
- **Payments:** Stripe (shared account with MjolnirDesignStudios.com)
- **Email:** React Email + Resend
- **Video:** Remotion 4 (social media content generation)
- **Mobile:** Capacitor (Android + iOS shells)
- **CRM:** HubSpot (shared with MjolnirDesignStudios.com — not yet integrated)
- **UI Primitives:** Radix UI, Shadcn/ui (new-york style), Lucide + Tabler icons

## Brand & Design System

### Theme: "Thunder Reborn" — Norse Mythology + Electric Design

**Color Palette:**
- Gold: `#FFCC11` (primary brand), `#FFD700`, `#B87333` (bronze)
- Electric/Cyan: `#00f0ff` (accent, glows, borders)
- Storm (dark): `#020617`, `#0a0a0f`, `#0f172a` (backgrounds)
- Silver: grayscale palette for text hierarchy
- Tier colors: Blue `#3B82F6` (Base), Green `#10B981` (Pro), Yellow `#FFFF00` (Elite)

**Typography:**
- Headings: Satoshi (font-heading, font-display)
- Body: Ubuntu (font-body)
- Code: Geist Mono (font-mono)

**Design Tokens:** HSL-based CSS custom properties in `globals.css`, dark mode default (class-based)

**Key Visual Effects:**
- Bifrost shader background (GLSL fractal tunnel with perlin noise) — landing page
- Electric border (canvas-based perlin noise animated borders) — pricing cards
- Aurora text gradient animation — hero "THOR!" text
- Shimmer button variants (gold, silver, bronze, primary, emerald)
- Glass morphism (`backdrop-blur-xl`, `bg-black/40`, `border-white/10`)
- Logo glow effect (`box-shadow: 0 0 80px #00f0ff`)

**Norse Copy/Voice:**
- "WHOSOEVER HOLDS THIS HAMMER... IF HE BE WORTHY, SHALL POSSESS THE POWER OF THOR!"
- "Mjolnir, forged in the heart of a dying star..."
- "A weapon to destroy... Or a tool to build! ~ODIN"
- "Asgardian Tech Forged in Valhalla"
- Use "Thorsday" for Thursday

## Architecture

### Directory Structure
```
app/
├── page.tsx                          # Homepage: ShaderBG + Navbar + Hero + Blocks + Pricing + Footer
├── layout.tsx                        # Root layout (fonts, metadata)
├── globals.css                       # Design tokens, animations, utility classes
├── provider.tsx                      # SessionProvider + ThemeProvider
├── (protected)/                      # Auth-gated routes (middleware.ts)
│   ├── admin/dashboard/              # Admin dashboard
│   └── blocks/dashboard/             # Component library dashboard
├── api/
│   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   └── generate-ui/route.ts          # UI generation endpoint (stub)
├── auth/signin/                      # Sign-in page
├── components/
│   ├── Navigation/                   # Navbar (V0-V2), FloatingNav, Sidebar
│   ├── Dashboards/                   # Dashboard, Header, Sidebar
│   ├── Buttons/                      # Button, ShimmerButton
│   ├── ui/                           # ElectricBorder, AuroraText, TextReveal, GradientText, AnimatedOrb
│   ├── Hero.tsx, Blocks.tsx, Pricing.tsx, Footer.tsx, Tech.tsx
│   └── ShaderBG_Type1.tsx, ShaderBG_Type2.tsx, ShaderBackground.tsx
├── lib/
│   ├── nextAuthOptions.ts            # Auth config (Google, GitHub, Supabase adapter)
│   ├── supabaseClient.ts             # Supabase client init
│   ├── subscriptionUtils.ts          # Tier checks (isPro, isElite, isBase)
│   ├── paywall.tsx                   # Paywall gating component
│   ├── protectedRoute.tsx            # Client-side route protection
│   ├── userUtils.ts                  # getUserInfo helper
│   ├── adminUtils.ts                 # isAdmin check
│   ├── dashboardUtils.ts             # useDashboardComponents hook
│   ├── componentRegistry.ts          # Component metadata registry
│   └── utils.ts                      # cn() class merger
├── data/index.ts                     # Nav items, footer links, social links
└── webgl-showcase/                   # WebGL demo scenes
```

### Path Alias
`@/*` → `./app/*`

## Core Features (Product Offerings)

### Shipped / In-Progress
1. **Component Libraries** — Premium React components with ElectricBorder, ShimmerButton, AuroraText, TextReveal, GradientText, AnimatedOrb
2. **Shader Engine Tool** — GLSL shader backgrounds (Bifrost tunnel, perlin noise), ShaderBG_Type1/Type2
3. **3D Animations** — React Three Fiber scenes, AnimatedOrb, WebGL showcase

### To Build / Enhance
4. **3D Modeler Tool** — 3D model viewer/editor (referenced in Pro tier as "3D Model and Printing Forge")
5. **Background Studio** — Customizable background generator using shader engine
6. **Dashboard Designer** — Visual dashboard builder for users
7. **Icon/Logo Design Studio** — SVG icon/logo creation tool
8. **Website Tuner** — Site optimization/theming tool
9. **Remotion Video Tool** — Social media video generation for MjolnirDesignStudios promotion + potential user-facing feature

## Subscription Tiers & Stripe Integration

| Tier | Color | Monthly | Annual | Stripe Monthly ID | Stripe Annual ID |
|------|-------|---------|--------|-------------------|------------------|
| Free | Blue `#3B82F6` | $0 | — | N/A | N/A |
| Base | Green `#10B981` | $10 | $100 | `price_1TBIjFFxkFUD7EnZqANuPLav` | `price_1TBIjFFxkFUD7EnZsDQ2WVgH` |
| Pro | Yellow `#EAB308` | $25 | $250 | `price_1TBIltFxkFUD7EnZI5cxamBR` | `price_1TBIltFxkFUD7EnZ1DFBq6gN` |
| Elite | Orange `#F97316` | $50 | $500 | `price_1TBIuCFxkFUD7EnZlAYMZOEO` | `price_1TBIslFxkFUD7EnZb9TDuHYF` |

**Tier Config:** Centralized in `app/lib/tierConfig.ts` — colors, price IDs, access levels, icons.

**Tier Access Model:**
- Free: Browse library, preview tools, 3 free components, community access
- Base: Full component library, backgrounds, animations, email support
- Pro: + GSAP, Shader Engine, 3D Forge, Dashboard Builder, commercial license
- Elite: + OdinAI Agent, Shader Designer, dedicated engineer, source code access

## Authentication Flow

- NextAuth v4 with JWT strategy
- Providers: Google, GitHub (Twitter ready but commented out)
- Supabase adapter for user persistence
- Session extends `next-auth` with `tier` and `role` fields
- Middleware protects `/(protected)/*` routes
- Paywall component gates content by tier

## Environment Variables Required

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_KEY=

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
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend (Email)
RESEND_API_KEY=
```

## Critical Gaps (Pre-Launch)

### Implemented ✅
1. ~~`/api/stripe/checkout` route~~ — **DONE** (Stripe Checkout Sessions)
2. ~~Stripe webhook handler~~ — **DONE** (`/api/webhooks/stripe` with signature verification)
3. ~~Dashboard product display~~ — **DONE** (Tier-aware feature grid with upgrade modals)
4. ~~User tier sync~~ — **DONE** (JWT callback fetches tier from Supabase)
5. ~~`.env.example`~~ — **DONE**
6. ~~Middleware fix~~ — **DONE** (Protects `/blocks/*` and `/admin/*`)

### Still Needed
7. ~~Real Stripe price IDs for Pro/Elite~~ — **DONE** (all 6 IDs live)
8. **OG image** (`/public/og-image.jpg`) — 1200×630 MjolnirUI branding image
9. **SVG tech icons** — 30 icons needed in `/public/Icons/Technologies/`
10. **Supabase schema** — Ensure `users` table has `tier`, `role`, `stripe_customer_id`, `stripe_subscription_id` columns
11. **HubSpot integration** — Not implemented, shared account ready
12. **Account management page** — Route exists in sidebar but page not built
13. **Remotion video pipeline** — Packages installed, no components built

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Code Conventions

- **Components:** PascalCase files, `"use client"` directive for client components
- **Styling:** Tailwind utility-first, `cn()` helper for conditional classes (clsx + tailwind-merge)
- **Variants:** class-variance-authority (CVA) for component variant systems
- **Animations:** Framer Motion for UI transitions, Three.js/GLSL for shader backgrounds
- **Imports:** Use `@/` path alias (maps to `app/`)
- **Dark mode:** Default and primary — design for dark-first
- **Glass morphism:** `bg-black/40 backdrop-blur-xl border border-white/10` pattern
- **Electric accents:** `#00f0ff` glow effects on hover/focus states

## Accessibility Guidelines

- Use semantic HTML (`nav`, `section`, `footer`, `main`)
- Include `aria-label` on icon-only buttons
- Support `focus-visible` ring styles (already in globals.css)
- Maintain contrast ratios against dark storm backgrounds
- Provide `alt` text for all images
- Keyboard navigable — all interactive elements focusable

## Animation System Architecture

### Framer Motion (UI Transitions)
- Page section enter animations (`initial/animate` with `y` offset + `opacity`)
- Interactive states (`whileHover`, `whileTap` with spring physics)
- Scroll-based navbar show/hide (`useScroll`, `useMotionValueEvent`)
- Staggered text reveals (character-by-character with blur)

### Three.js / GLSL (Background Shaders)
- Bifrost tunnel: perlin noise turbulence, additive blending, rainbow color shifts
- Uniforms: `iTime`, `iResolution`, `u_speed`, `u_turbulence`, `u_depth`, `u_brightness`, `u_colorShift`
- Performance: reduced iterations on mobile, `requestAnimationFrame` loop
- Canvas-based electric borders with perlin noise displacement

### GSAP (Planned)
- Pro tier feature — advanced scroll-triggered animations
- Timeline-based complex sequences

## Integration Points

- **Supabase:** Auth adapter, user data, component metadata storage
- **Stripe:** Subscription checkout, webhook-driven tier updates
- **HubSpot:** Contact management, deal tracking (shared CRM — TODO)
- **Resend:** Transactional emails (welcome, receipts, tier upgrades)
- **Remotion:** Video generation for social media marketing content
- **Capacitor:** iOS/Android native app shells wrapping the web app
