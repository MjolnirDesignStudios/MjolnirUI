# MjolnirUI v2 Build Plan

**Status:** Post soft-launch iteration (v2)
**Soft launch:** commit `577a92e` (2026-03)
**Planning date:** 2026-04-20

## Objective

Three parallel tracks, hardest first:

1. **Track A — 3D Particle Design Tool** (Pro/Elite) — new, clone-and-improve of [particles.casberry.in](https://particles.casberry.in/), geometric shapes only
2. **Track B — Shader Tool enhancement** (mixed tier) — reach React-Bits + Framer Phase-1 parity; promote some shaders to free
3. **Track C — Animated Text route** (free) — wire existing 3 components into `/blocks/animation/text`, fix broken dashboard link

Plus: dashboard card additions, route mismatch fix.

---

## Assumptions & open course-correction points

I could not scrape casberry.in (403 / archive blocked). I'm designing from deep tsparticles knowledge instead. **User should course-correct on any of these during build:**

| Assumption | Rationale |
|---|---|
| Casberry is built on `@tsparticles/engine` + `@tsparticles/react` | Industry standard, matches "Particles" feel, already in our `package.json` |
| "Geometric shapes" = circle, square, triangle, polygon (n-sided), star (n-pointed) | Standard geometric primitives |
| Excluded non-geometric = image, char (glyph), text, emoji | These are image/text-rendered particles, not geometric |
| Casberry exports JSON config + possibly React snippet | Standard for tsparticles configurators |
| Casberry has preset gallery | Industry norm; we'll ship ≥12 presets |

---

## Track A — 3D Particle Design Tool (hardest, lead)

### Route
`/blocks/particle-lab` (new, protected, Pro+)

### Tech
- `@tsparticles/react` + `@tsparticles/slim` (already installed)
- Same left-panel-controls + right-canvas-preview UI as [background-studio/page.tsx](../app/(protected)/blocks/background-studio/page.tsx)
- Custom `UpgradeModal` gate at page entry for free/base users

### Shapes (geometric only)
| Shape | Config knobs |
|---|---|
| Circle | size, stroke width/color |
| Square | size, rotation, stroke |
| Triangle | size, rotation, stroke |
| Polygon | size, **sides (3–12)**, rotation, stroke |
| Star | size, **points (5–10)**, inset, rotation, stroke |

Multi-shape mode: enable 2+ shapes, weighted by percentage.

### Global controls (left panel, collapsible sections)
1. **Count & Density** — count slider (10–1000), density area
2. **Size** — min/max, random on/off
3. **Opacity** — min/max, random, pulse animation toggle
4. **Movement** — speed, direction (random / top / bottom / left / right / none / outside / outside-top etc.), straight vs. curved, enable, outMode (bounce / out / destroy / split)
5. **Collisions** — enable, mode (bounce / absorb / destroy)
6. **Rotation** — enable, speed, direction (clockwise / counter / random)
7. **Color** — primary array (up to 6), random, HSL animation toggle
8. **Links (connections)** — enable, distance, opacity, width, color, triangles toggle
9. **Interactivity** — hover (grab / bubble / repulse / connect / attract), click (push / remove / pause / repulse / bubble / attract)
10. **Background** — transparent / solid / gradient (reuses color picker)

### Preset gallery (12 shipped)
- Free preview (locked for free users, teaser in upgrade modal): Starfield, Snow
- Pro (8): Constellation, Fireflies, Cosmic Dust, Electric Sparks, Matrix Shards, Polygon Mesh, Bifrost Glitter, Aurora Particles
- Elite (4): Mjolnir Sparks, Asgardian Swarm, Valhalla Ember, Quantum Foam

### Export (Pro+)
- **Copy JSON config** — tsparticles options object
- **Copy React snippet** — full `<Particles />` component with imports
- **Copy standalone HTML** — embeddable `<script>` tag bundle
- **PNG frame capture** — canvas `.toDataURL()` download
- **MP4 clip capture** — Phase 2, requires Remotion plumbing (skip v2 launch)

### Dashboard wiring
- Add "Particle Studio" card → Pro tier → `/blocks/particle-lab`
- Use `Sparkles` or a custom particle icon
- Position between "Background Studio" and "Electric Effects"

### Gotchas
- Mobile perf — particles count > 150 on low-end Android tanks; add auto-downscale on `navigator.hardwareConcurrency < 4`
- `prefers-reduced-motion` — offer static seed preview
- Hydration — `<Particles />` must be lazy/client-only to avoid SSR mismatches

---

## Track B — Shader Tool enhancement

### Route
- **Fix route mismatch**: dashboard card "Shader Engine" currently points to `/blocks/canvas/shaders` but actual page is `/blocks/shader-lab`. Decision: keep `/blocks/shader-lab` (already shipped), update dashboard link.

### Current state
- [shader-lab/page.tsx](../app/(protected)/blocks/shader-lab/page.tsx) — 341 lines, functional but minimal
- Uniform sliders + dropdown shader picker + canvas preview
- Missing vs. background-studio (991 lines): preset gallery grid, toggle controls, color pickers, code export, GLSL viewer

### Phase-1 enhancements (this build — React-Bits parity)
1. **Preset grid** — replace dropdown with visual thumbnail grid (match [browse/page.tsx](../app/(protected)/blocks/browse/page.tsx) pattern)
2. **GLSL viewer** — read-only CodeMirror/Prism pane showing fragment shader source with copy button
3. **Parameter polish** — color pickers for shader colors, toggles for bloom/grain, dropdowns for render modes
4. **Export actions** — copy GLSL, copy React component, download PNG frame
5. **Tier split** — promote these to free (loss-leaders):
   - `perlin-noise` → free
   - `electric-field` → free
   (Rationale: perlin-noise is textbook tutorial shader; electric-field already exists in multiple free tutorials. Keep `bifrost-tunnel`, `aurora-borealis` as Pro gateway; all elite shaders stay elite.)

### Phase-2 (deferred post-v2)
- Node-based shader graph editor (Framer parity) — weeks of work, use ReactFlow + custom GLSL codegen
- Shader compositing (layer multiple shaders)
- User-uploaded textures as samplers

### Dashboard
- Fix `href: "/blocks/canvas/shaders"` → `href: "/blocks/shader-lab"` at [dashboard/page.tsx:32](../app/(protected)/blocks/dashboard/page.tsx:32)
- Remove `comingSoon: true` since the tool exists

---

## Track C — Animated Text route

### Route
`/blocks/animation/text` (new, free tier — no auth gate beyond being a `(protected)` dashboard page)

### Components wired
- [AuroraText](../app/components/ui/AuroraText.tsx) — flowing aurora gradient
- [GradientText](../app/components/ui/GradientText.tsx) — directional gradient flow
- [TextReveal](../app/components/ui/TextReveal.tsx) — character-by-character reveal

### Page shape
- Same left-panel + right-preview template as background-studio / shader-lab
- Per-component controls:
  - **AuroraText**: color stops (3–6), animation speed, blur amount, text input
  - **GradientText**: gradient colors (2–4), direction (0–360°), speed, yoyo toggle, text input
  - **TextReveal**: delay, stagger, blur amount, direction (top/bottom/left/right), loop toggle, text input
- Shared: font size, font weight, custom font picker (Satoshi / Ubuntu / Geist Mono — project fonts)
- **Export**: copy React snippet, copy HTML+CSS

### Dashboard
- Fix [dashboard/page.tsx:28](../app/(protected)/blocks/dashboard/page.tsx:28):
  - `href: "/blocks/animation/text"` — already correct
  - Remove `comingSoon: true`

---

## Cross-cutting items

### Save/share (deferred to v3)
Not in this build. Supabase `user_presets` table + permalink system is its own mini-project. Noted for v3 roadmap.

### CLI install (`npx mjolnirui add <id>`) (deferred to v3)
React-Bits differentiator. The dashboard copy promises it. Too much scope for v2 alongside the 3 tracks. Create a GitHub issue and set expectation.

### SEO per-preset URLs (deferred)
Index-per-preset pages (`/shaders/bifrost`, `/particles/constellation`). v3. Requires route refactor.

### Mobile perf mode (this build, lightweight)
For particle tool + shader tool: detect `navigator.hardwareConcurrency < 4` → auto-reduce particle count / shader iterations. Single util function `app/lib/perfMode.ts`.

---

## Build sequence

### Phase 1 — scaffold & unblock (parallel, ~30 min)
- [ ] Create `/blocks/particle-lab/page.tsx` stub
- [ ] Create `/blocks/animation/text/page.tsx` stub
- [ ] Fix dashboard route mismatch + add Particle Studio card
- [ ] Add new component category `"text"` to [componentRegistry.ts](../app/lib/componentRegistry.ts) (optional — current `"ui"` already holds them)

### Phase 2 — Track A Particle Tool (deepest, ~2 hrs)
- [ ] Port background-studio skeleton to particle-lab
- [ ] Build shape registry + config builder function
- [ ] Wire tsparticles engine init + `<Particles />` component
- [ ] Build all control groups (count, size, movement, colors, links, interactivity)
- [ ] Build preset gallery (12 presets, JSON configs)
- [ ] Wire export actions (JSON / React / HTML / PNG)
- [ ] Upgrade gate for free/base users

### Phase 3 — Track B Shader enhancement (~1 hr, parallel subagent)
- [ ] Preset thumbnail grid replaces dropdown
- [ ] GLSL source viewer pane
- [ ] Color pickers + toggles
- [ ] Export actions (GLSL / React / PNG)
- [ ] Tier split (perlin-noise, electric-field → free)

### Phase 4 — Track C Animated Text (~45 min, parallel subagent)
- [ ] Page scaffold with 3-tab/3-section layout per component
- [ ] Wire AuroraText with controls
- [ ] Wire GradientText with controls
- [ ] Wire TextReveal with controls
- [ ] Export actions (React / HTML+CSS)

### Phase 5 — verification
- [ ] Start dev server, verify all 3 routes render
- [ ] Verify paywall gates on Particle + Pro shaders
- [ ] Mobile viewport check
- [ ] Lint + typecheck

---

## Out of scope (explicit)
- Save/load user presets (v3)
- CLI install story (v3)
- Per-preset SEO pages (v3)
- Shader node editor / Framer parity (v3)
- Remotion MP4 export (v3)
- Supabase migrations
- HubSpot integration
- OG image generation
