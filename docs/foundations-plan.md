# Foundations Pages Plan — Free/Base Shells First

**Decisions locked:**
- Build order: my call (proposed: Color → Typography → Tokens → Icons)
- Ship Free/Base now, OdinAI Pro/Elite layer comes later
- Per-user Supabase schema for saved assets (v1)
- **Theme model: Asgard Dark (default) + Asgard Light + user saves.** No Bifrost/Storm/Valhalla theme variants (see clarification below).

---

## Theme model clarification — why only Asgard

An earlier draft of this plan referenced 4 preset themes: Asgard, Bifrost, Storm, Valhalla. **Those are not themes.** They're scattered Norse vocabulary across the codebase serving different purposes:

| Name | What it actually is | Where it lives |
|---|---|---|
| **Asgard** | Implicit brand identity (gold #FFCC11 + cyan #00f0ff + dark) — the brand itself | `app/globals.css` (default tokens), CLAUDE.md aesthetic |
| **Storm** | A single dark gradient utility class | `globals.css` → `.storm-gradient` |
| **Bifrost** | A visual effect family (rainbow gradients, shaders, animations) | `globals.css` BIFROST sections, `BifrostGradients.tsx`, Bifrost shader/background components |
| **Valhalla** | Marketing copy + one shader name ("Valhalla Gates") | Hero copy, one shader component |

None of these are full token-system theme variants (a complete swap of color/type/spacing tokens). Treating them as such would be inventing themes that don't exist.

**What we ship instead:**
- **Asgard Dark** — the default brand (current `globals.css`)
- **Asgard Light** — auto-generated light variant of the brand
- **User-saved themes** — created via Color + Typography pages

If a "Bifrost theme" or similar makes sense later, it ships as a *decoration layer* (rainbow accents on top of the brand) — not a fork of base tokens.

## Build order — rationale

```
1. Color System         → highest standalone value, no dependencies, fastest ship
2. Typography           → pairs with Color (test colors with real type)
3. Design Tokens        → consumes Color + Type choices into unified export
4. Icons                → most engineering scope, least dependency on others
```

Color first because:
- Contrast checker is useful for *every* user immediately
- 4-step ramp generator works without any AI
- Saves a palette → biggest "I made something" moment for free trial

Tokens third (not first) because without saved Color + Type, the tokens page is just "view defaults + export" — thin without the upstream pages feeding it.

---

## 1. Color System — Phase 1 (~4 hours)

**Route:** `/blocks/foundation/colors`

### Free tier
- Browse 4 default palettes: Asgard Dark, Asgard Light, Bifrost Dark, Storm Dark
- Each palette shows full HSL/HEX/RGB swatches
- Click to copy any value
- **Contrast checker** — paste 2 hex codes → live WCAG ratio + AA/AAA badges

### Base tier
- **4-step ramp generator** — one brand hex → outputs 50/100/200/300/.../900 with HSL math
- **Dark/light auto-pair** — input dark mode palette, get suggested light variant
- **Export panel** — CSS custom properties, Tailwind config, `tokens.json` (W3C spec), Figma tokens
- **Save palettes** — up to 3 per user (Supabase)

### Pro/Elite shell (upgrade gate, no OdinAI yet)
- Locked panel: "OdinAI Color Architect — describe your brand, get a full WCAG-validated palette across 20 component contexts. Coming soon."

---

## 2. Typography — Phase 2 (~3 hours)

**Route:** `/blocks/foundation/typography`

### Free tier
- 30 curated font pairs (display + body) — Inter/Geist/Satoshi/Ubuntu families + serif partners
- Live preview pane — type any text, see it rendered in the pair
- Copy `<link>` and `font-family` CSS

### Base tier
- **Type scale generator** — modular ratio picker (1.2 / 1.25 / 1.333 / 1.5 / 1.618 golden), generates xs/sm/base/lg/xl/.../9xl
- Sliders for line-height, letter-spacing, font-weight defaults per scale step
- Export as Tailwind config / CSS custom properties
- **Save type systems** — up to 3 per user (Supabase)

### Pro/Elite shell
- Locked panel: "OdinAI Font Stylist — describe your brand voice, get 3 paired stacks with rationale. Coming soon."

---

## 3. Design Tokens — Phase 3 (~3 hours)

**Route:** `/blocks/foundation/tokens`

### Free tier
- View MjolnirUI's default tokens (Asgard theme — HSL CSS vars from `globals.css`)
- Live token reference panel: color, spacing, typography, radii, shadows, motion durations
- Click any token to copy the CSS var name or computed value

### Base tier
- **Compose** — pick a saved Color palette + saved Type system → preview them as a unified token set across 6 demo components (button, card, badge, input, modal-header, alert)
- **Toggle Asgard Dark ↔ Asgard Light** — the brand in both modes (Light is auto-generated from Dark on first view; Pro will get OdinAI to refine it)
- **Export panel** — `globals.css`, `tailwind.config.ts`, `tokens.json` (W3C spec), Figma tokens JSON
- **Save token sets** — up to 3 per user (Supabase)

### Pro/Elite shell
- Locked panel: "OdinAI Token Generator — describe your brand, get a full WCAG-validated token system in 30 seconds. Coming soon."

---

## 4. Icons — Phase 4 (~5 hours, biggest)

**Route:** `/blocks/foundation/icons`

### Free tier
- Browse Lucide + Tabler icon libraries (both already installed)
- Search/filter by name and category
- Click an icon → copy SVG, copy `<Icon name="..." />` snippet, copy import statement
- Size + stroke width preview controls

### Base tier
- **Custom icon builder** — composable canvas with basic shapes (circle, square, polygon, line, path, star)
- Layer system: combine 2-4 shapes, ordered top-to-bottom
- Per-shape: fill, stroke, stroke-width, opacity, rotation, position
- Export SVG (cleaned, optimized)
- **Save icons** — up to 5 per user (Supabase)

### Pro/Elite shell
- Locked panel: "OdinAI Icon Wizard — describe an icon, get 4 SVG variants. Logo Studio. Coming with OdinAI."

> **Note on Logo Diffusion:** I'm intentionally *not* cloning that. Their edge is a fine-tuned diffusion model — multi-month/$50k+ ML project. What we *can* ship when OdinAI lands: SVG-composition icons via Claude. Better quality through constraints, not raster generation. Real raster logos integrate via 3rd-party API (Flux/Midjourney) later.

---

## Supabase schema — per-user, single table

```sql
create table user_design_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_type text not null check (asset_type in (
    'color_palette', 'type_system', 'token_set', 'icon'
  )),
  name text not null,
  config jsonb not null,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_user_design_assets_user on user_design_assets(user_id);
create index idx_user_design_assets_type on user_design_assets(user_id, asset_type);

-- Row Level Security — users only see/edit their own
alter table user_design_assets enable row level security;

create policy "Users can view their own assets" on user_design_assets
  for select using (auth.uid() = user_id);
create policy "Users can insert their own assets" on user_design_assets
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own assets" on user_design_assets
  for update using (auth.uid() = user_id);
create policy "Users can delete their own assets" on user_design_assets
  for delete using (auth.uid() = user_id);
```

**Tier limits enforced at API layer (not in Supabase):**
| Tier | Saved palettes | Type systems | Token sets | Custom icons |
|---|---|---|---|---|
| Free | 0 (read-only) | 0 | 0 | 0 |
| Base | 3 | 3 | 3 | 5 |
| Pro | 10 | 10 | 10 | 25 |
| Elite | unlimited | unlimited | unlimited | unlimited |

`config` jsonb shape varies by `asset_type`. Type-safety enforced in TypeScript helpers in `app/lib/designAssets.ts` (new file).

---

## File scaffold

```
app/
├── (protected)/blocks/foundation/
│   ├── layout.tsx                  # Dashboard chrome (mirrors docs/layout.tsx)
│   ├── colors/page.tsx             # Phase 1
│   ├── typography/page.tsx         # Phase 2
│   ├── tokens/page.tsx             # Phase 3
│   └── icons/page.tsx              # Phase 4
├── api/design-assets/
│   ├── route.ts                    # GET (list), POST (create)
│   └── [id]/route.ts               # GET (one), PATCH (update), DELETE
├── components/foundation/
│   ├── ContrastChecker.tsx         # Phase 1
│   ├── RampGenerator.tsx           # Phase 1
│   ├── PaletteCard.tsx             # Phase 1
│   ├── TypePairCard.tsx            # Phase 2
│   ├── ScaleGenerator.tsx          # Phase 2
│   ├── TokenViewer.tsx             # Phase 3
│   ├── TokenComposer.tsx           # Phase 3
│   ├── IconBrowser.tsx             # Phase 4
│   └── IconBuilder.tsx             # Phase 4
└── lib/
    ├── designAssets.ts             # CRUD helpers, tier-limit enforcement
    ├── colorMath.ts                # WCAG, HSL ramps, contrast ratio
    └── typeScale.ts                # modular scale generator
```

---

## Migration to apply (Supabase SQL editor)

Single migration file `supabase/migrations/2026-04-27_design_assets.sql` with the schema + RLS above. I'll generate it and you paste it into the Supabase SQL editor.

---

## Build sequence — proposed

| Phase | Title | Dur. | Ship to prod after? |
|---|---|---|---|
| 0 | Supabase migration + foundation/layout.tsx + API routes | 1 hr | yes |
| 1 | **Colors page** (free + base + saved palettes wired) | 4 hr | yes |
| 2 | **Typography page** (free + base + saved type systems) | 3 hr | yes |
| 3 | **Tokens page** (consumes saved Color + Type) | 3 hr | yes |
| 4 | **Icons page** — Free (Lucide/Tabler browser) | 2 hr | yes |
| 5 | **Icons page** — Base (custom builder) | 3 hr | yes |

Total: ~16 hours of work, shippable in 6 commits over a day or two of focused sessions.

After all 4 ship, we layer OdinAI Pro/Elite features on top — agent-generated palettes, font stacks, token systems, and icons. The Pro/Elite *shell* placeholders ship with the Free/Base build, so the upgrade UX is in place from day 1.

---

## Resolved questions (kept for reference)

- **Q: Do Bifrost/Storm/Valhalla preset themes exist?** A: No — they're effect names, not theme variants. Replaced with Asgard Dark + Asgard Light. See "Theme model clarification" above.
- **Q: Tier save limits?** A: Free 0 / Base 3 / Pro 10 / Elite ∞ — confirmed.
- **Q: Asset type names?** A: `color_palette`, `type_system`, `token_set`, `icon` — confirmed.
- **Q: Per-user vs per-project storage?** A: Per-user for v1.
