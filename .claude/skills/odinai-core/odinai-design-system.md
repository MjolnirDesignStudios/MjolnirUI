---
name: odinai-design-system
description: Use when generating UI components, layouts, or design system elements for MjolnirUI. Enforces brand consistency, tier-aware design, and Norse mythology theme.
---

# OdinAI Design System — MjolnirUI

## Brand Identity
- **Theme:** "Thunder Reborn" — Norse Mythology + Electric Design
- **Voice:** Bold, mythological, empowering ("Forged in Asgard", "Wield the power of Mjolnir")
- **Dark-first:** All designs start from dark backgrounds

## Color System (Tier-Coordinated)
| Tier | Color | Hex | Usage |
|------|-------|-----|-------|
| Free | Blue | #3B82F6 | Entry-level components, free badges |
| Base | Green | #10B981 | Standard components, base badges |
| Pro | Yellow | #EAB308 | Advanced tools, pro badges |
| Elite | Orange | #F97316 | Premium AI tools, elite badges |

### Accent Colors
- Electric Cyan: `#00f0ff` — glows, borders, hover states
- Gold: `#FFCC11` — primary brand, headings, CTAs
- Storm backgrounds: `#020617`, `#0a0a0f`, `#0f172a`

## Component Patterns

### Glass Morphism (Standard Card)
```tsx
className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl"
```

### Electric Glow (Hover State)
```tsx
style={{ boxShadow: `0 0 20px ${tierColor}40, inset 0 0 20px ${tierColor}10` }}
```

### Tier Badge
```tsx
<TierBadge tier="pro" size="sm" />
```

### Gradient Text
```tsx
className="bg-linear-to-r from-white via-cyan-300 to-emerald-400 bg-clip-text text-transparent"
```

## Typography
- Headings: Satoshi (font-heading)
- Body: Ubuntu (font-body)
- Code: Geist Mono (font-mono)

## Animation Principles
1. **Entrance:** Fade up with slight y-offset (opacity 0→1, y 20→0)
2. **Hover:** Scale 1.02 with spring physics
3. **Transitions:** 300-400ms ease-out
4. **Stagger:** 50-100ms between sibling elements
5. **Scroll-triggered:** IntersectionObserver, animate once on enter

## Accessibility
- Semantic HTML (nav, section, main, footer)
- `aria-label` on icon-only buttons
- `focus-visible` ring styles
- Maintain contrast against dark backgrounds
- Keyboard navigable — all interactive elements focusable

## File Conventions
- PascalCase component files
- `"use client"` directive for client components
- `@/` path alias (maps to `app/`)
- `cn()` helper for conditional classes (clsx + tailwind-merge)
- CVA for component variant systems
