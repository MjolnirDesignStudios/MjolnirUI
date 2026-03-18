# MjolnirUI — User Documentation & Tutorial Plan

> This file tracks all user-facing documentation, tutorials, and guides to be built.
> OdinAI will eventually handle most user assistance, but these docs serve as the knowledge base.

## Documentation Structure

### 1. Getting Started
- [ ] Introduction — What is MjolnirUI, who it's for
- [ ] Installation — `npx mjolnirui init`, package manager setup
- [ ] CLI Reference — `npx mjolnirui add [component]`, flags, config
- [ ] MCP / AI Agent — Using OdinAI to build with MjolnirUI components

### 2. Foundation
- [ ] Design Tokens — HSL color system, CSS custom properties
- [ ] Typography — Font stack (Satoshi, Ubuntu, Geist Mono), scale
- [ ] Color System — Gold, cyan, storm palette, tier colors
- [ ] Icons — Lucide + Tabler icon usage, custom SVG icons

### 3. Component Guides (per component)
Each component page should include:
- Live interactive demo
- Props table with types and defaults
- Code snippet (copy/paste ready)
- Install command
- Tier badge (which plan it requires)
- Related components
- Performance notes (GPU usage for shader/3D components)

### 4. Studio Tools
- [ ] Background Studio — How to use the visual background customizer
- [ ] Shader Lab — GLSL uniform controls, custom shader editor
- [ ] 3D Forge — Image-to-3D model generation (Coming May 29)
- [ ] Dashboard Builder — Drag-and-drop layout designer (Coming May 29)

### 5. Integration Guides
- [ ] Next.js App Router setup
- [ ] Tailwind CSS v4 configuration
- [ ] Authentication (NextAuth + Supabase)
- [ ] Stripe subscription integration
- [ ] Dark mode / theme system

### 6. API Reference
- [ ] Component Registry API
- [ ] Tier access utilities (`hasAccess`, `getTierConfig`)
- [ ] Stripe checkout flow
- [ ] Webhook handling

## Tutorial Videos (Remotion / OdinAI)
- [ ] "Getting Started in 5 Minutes" — Quick setup walkthrough
- [ ] "Building Your First Page with MjolnirUI" — Hero + backgrounds + buttons
- [ ] "GLSL Shaders Explained" — How the Shader Lab works
- [ ] "Customizing Design Tokens" — Theming your project

## OdinAI Integration
- OdinAI will serve as the primary user assistant
- Docs serve as OdinAI's knowledge base
- Agent can generate code, answer questions, and build layouts
- Future: 3D Odin avatar for interactive chat experience

## Component Registry (34 components at launch)
See `app/lib/componentRegistry.ts` for the full registry.

### Backgrounds (16)
Color Halo, Prism, Star Field, Silky Lines, Neural Network, Atomic,
Smoke, Stars Background, Vortex, Accretion Disk, Bifrost Bridge,
Liquid Ribbons, Dark Veil, Gravity Lens, Liquid Ether, Singularity

### Animations (12)
Lightning, Matrix Rain, Ripple Grid, Atmosphere, Aura Waves,
Light Pillar, Laser Flow, Black Hole, Swirling Gas, Interactive Globe, Hyperspeed

### UI Components (7)
Electric Border, Aurora Text, Text Reveal, Gradient Text,
Shimmer Button, Flip Card, Accordion

### 3D (1)
Animated Orb
