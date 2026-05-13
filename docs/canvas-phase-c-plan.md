# Canvas Phase C — Background Studio Rewrite

**Status:** Planning. Build begins next session.
**Plan date:** 2026-05-13
**Phases A + B shipped:** commit `11ca450` (Backgrounds + Shader Backgrounds galleries).

## Problem statement

`/blocks/background-studio` currently exists at 991 lines but operates on a
**single-background-at-a-time** model: pick one preset, tweak its sliders, see
it animate. Useful but not a *studio*. The user's vision:

> The studio will be the most complex part, where we give the user the
> ability to add shapes, particles, and the capabilities to create their own
> unique designs.

That means a **layered composer**, not a preset picker. Layers stack on top of
each other, each is independently configurable, the user "designs" their own
background by composing several primitives.

## Mental model

Adapt the pattern that already works in `IconBuilder.tsx`:

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER — name, tier badge, save / export / copy actions    │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────┐ ┌─────────────────────────────────┐   │
│ │ LEFT RAIL         │ │ CANVAS PREVIEW                  │   │
│ │  + Add layer ▾    │ │                                 │   │
│ │     · Solid       │ │   live render of all layers,    │   │
│ │     · Gradient    │ │   stacked back→front            │   │
│ │     · Mesh        │ │                                 │   │
│ │     · Noise       │ │                                 │   │
│ │     · Particles   │ │                                 │   │
│ │     · Shader      │ │                                 │   │
│ │     · Shapes      │ │                                 │   │
│ │  ─ Layer stack    │ │                                 │   │
│ │     [≡] Mesh      │ └─────────────────────────────────┘   │
│ │     [≡] Particles │ ┌─────────────────────────────────┐   │
│ │     [≡] Solid     │ │ INSPECTOR (selected layer)      │   │
│ │   (reorder / del) │ │  - opacity, blend mode          │   │
│ │                   │ │  - per-type controls            │   │
│ └───────────────────┘ └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Layer types (v1 scope)

Each layer is a discriminated union — the `inspector` shape depends on `type`:

| Type | What it is | Inspector knobs |
|---|---|---|
| **solid** | Single flat color | color picker |
| **gradient** | Linear / radial gradient | direction (0–360°), stops (2–4) |
| **mesh-gradient** | Multi-anchor blob gradient | 3–5 color anchors with x/y positions |
| **noise** | Perlin/simplex CSS or canvas noise | seed, scale, opacity |
| **particles** | tsparticles instance, geometric shapes only | count, size, speed, color (reuses Particle Engine logic) |
| **shader-preset** | One of the GLSL backgrounds from the catalog | pick from dropdown (bucket=`shader`), parameters |
| **shapes** | Layered geometric primitives | reuses IconBuilder shapes — circle/square/triangle/polygon/star/line — for hero-style background ornaments |

Every layer also has shared properties:
- `id: string` — uuid
- `type: LayerType` — discriminator
- `name: string` — user-editable label
- `visible: boolean` — eye toggle
- `locked: boolean` — prevents accidental edits
- `opacity: 0..1`
- `blendMode` — CSS `mix-blend-mode` (normal, screen, multiply, overlay, soft-light)
- `config: T` — type-specific knobs

## Persistence

Reuses the existing `user_design_assets` table with:
- `asset_type: 'background_set'` (NEW value; needs check constraint update via migration)
- `config: { name, canvasAspect, layers: BackgroundLayer[] }`

The migration is small but **mandatory before shipping save**.

Tier limits (mirror the rest):
- Free: 0 saves
- Base: 3 saves
- Pro: 10 saves
- Elite: unlimited

## Export formats

Per user's vision, the studio should produce shippable artifacts:

1. **React component** — exports a typed `<UserBackground />` component the user can copy into their project. Layer stack → JSX with appropriate library imports (tsparticles, three.js, etc.).
2. **CSS-only when possible** — for solid/gradient/mesh/noise-only stacks, export pure CSS. No JS needed.
3. **PNG snapshot** — canvas-to-blob capture at user-selected resolution (1080p / 4K).
4. **Project JSON** — the raw layer stack, importable into another browser via paste.

## File scaffold

```
app/(protected)/blocks/background-studio/
├── page.tsx                         # ← REWRITE
└── (existing 991-line file becomes the v1 baseline)

app/components/background-studio/
├── studioTypes.ts                   # Layer discriminated union types
├── studioReducer.ts                 # State management (useReducer)
├── StudioCanvas.tsx                 # Live preview, layered renderer
├── StudioLayerRail.tsx              # Left rail: add + stack list
├── StudioInspector.tsx              # Per-layer config panel
├── StudioExportMenu.tsx             # React / CSS / PNG / JSON export
└── layers/
    ├── SolidLayer.tsx
    ├── GradientLayer.tsx
    ├── MeshGradientLayer.tsx
    ├── NoiseLayer.tsx
    ├── ParticlesLayer.tsx           # Wraps existing tsparticles config
    ├── ShaderPresetLayer.tsx        # Wraps a catalog entry from canvas/backgroundCatalog
    └── ShapesLayer.tsx              # Reuses IconBuilder shape math
```

## Migration (apply via Supabase MCP next session)

```sql
alter table public.user_design_assets
  drop constraint user_design_assets_asset_type_check,
  add constraint user_design_assets_asset_type_check
  check (asset_type in (
    'color_palette',
    'type_system',
    'token_set',
    'icon',
    'background_set'   -- NEW
  ));
```

## Build sequence (next session, ~6–8 hours)

| Step | What | Effort |
|---|---|---|
| 0 | Migration (constraint update for `background_set`) | 5 min |
| 1 | studioTypes.ts + studioReducer.ts (state machine) | 45 min |
| 2 | StudioCanvas.tsx — layered renderer w/ blend modes | 1 hr |
| 3 | StudioLayerRail.tsx — add menu + reorder + visibility | 45 min |
| 4 | Solid + Gradient + MeshGradient layers + inspectors | 1 hr |
| 5 | Noise + Shapes layers (reuse IconBuilder math) | 1 hr |
| 6 | Particles layer (wrap tsparticles, reduced from Particle Engine) | 1 hr |
| 7 | ShaderPreset layer (pick from catalog, params) | 45 min |
| 8 | StudioExportMenu — React + CSS + PNG + JSON | 1 hr |
| 9 | Save flow + tier-limit enforcement (API layer reuse) | 30 min |

## Risks / open questions

- **PNG capture across heterogeneous layers** (tsparticles canvas + WebGL three.js + CSS gradients) — need to composite via `html2canvas` or `dom-to-image`, both have shader-stage gotchas. Acceptable v1: capture the visible CSS+canvas part, warn that shader layers may not snapshot.
- **Performance ceiling** — running 5 layers (particles + shader + mesh + …) simultaneously in a single page is heavy. Cap at 8 layers max. Document `prefers-reduced-motion` opt-out.
- **Mobile UX** — left-rail + canvas + inspector doesn't fit on a 375px phone. Plan: tab layout on mobile (Layers tab | Canvas tab | Inspector tab) instead of side-by-side.

## Out of scope for Phase C v1

- AI-assisted background generation (OdinAI integration — future)
- Animation curves / timeline scrubbing
- Importing/forking another user's saved background
- Sharing via permalink

## Sign-off needed before build

Confirm the layer-type list above is the right scope before next session. The biggest variable: **whether `shapes` and `shader-preset` layers are v1 or deferred**. Removing those drops scope by ~2 hours.
