# MjolnirUI Pro Launch — Promo Video Briefs

> Drop-in production specs for the MDS video editor.
> Launch target: **2026-06-01** (Pro tier public).
> Author: Sprint #46 · 2026-05-27.

All three videos share a common Brand Kit (defined at bottom) so the editor can apply consistent colors / fonts / SFX cues across all clips.

---

## Brand Kit — apply to every clip

| Token | Value | Use |
|-------|-------|-----|
| `--gold` | `#FFCC11` | Primary accent, CTAs, "MjolnirUI" wordmark, lightning |
| `--gold-bright` | `#FFD700` | Hover state, highlight strikes |
| `--cyan` | `#00f0ff` | Electric secondary, wireframe lines, glow |
| `--storm-dark` | `#020617` | Base background |
| `--storm-mid` | `#0a0a0f` | Card / panel surface |
| `--white` | `#FFFFFF` | Body text |
| `--silver` | `#a1a1aa` | Captions, supporting copy |
| `--success` | `#10B981` | "Unlocked!" moments |

**Heading font:** Satoshi (font-display)
**Body font:** Ubuntu (font-body)
**Mono / Code font:** Geist Mono

**Recurring SFX library** (use across all 3):
- `thunder-impact-low.wav` — beat 1 hammer strike / logo reveal
- `electric-zap.wav` — transition between component beats
- `whoosh-cinematic.wav` — fade-in / fade-out
- `click-soft.wav` — every text-line appearance
- `chime-success.wav` — final CTA reveal

**Wireframe components** (live URLs to record from):
- `https://www.mjolnirui.com/blocks/browse/wireframe-hammer`
- `https://www.mjolnirui.com/blocks/browse/wireframe-orb`
- `https://www.mjolnirui.com/blocks/browse/wireframe-grid`

---

# 🎬 Video 1 — "MjolnirUI Pro Launches"

**Use case:** Landing page hero embed · LinkedIn / X announcement post · email blast hero image (poster frame)
**Length:** 20 seconds
**Aspect ratios:** `16:9 (1920×1080)` for web/YouTube + `9:16 (1080×1920)` for Reels/TikTok/Shorts
**Music bed:** Silent. Sound design only.
**Captions:** Burned in, always visible (75% of social viewers watch muted).

## Storyboard

| Beat | Time | Visual | On-screen text | SFX | Transition |
|------|------|--------|----------------|-----|------------|
| 1 | 0.0 – 1.5s | Pure black. Tiny gold pinpoint appears center-frame, grows slightly. | (none) | Low ambient hum, building | — |
| 2 | 1.5 – 3.0s | Lightning bolt cracks down from top-frame into the pinpoint. **WireframeHammer** emerges from the strike, gold-tinted, rotating slowly. Storm-dark background. | (none) | `thunder-impact-low` (loud, peaks at 1.8s) | Hard cut on the strike |
| 3 | 3.0 – 6.0s | Hammer rotates 1 full revolution. Gold glow expands behind it. **Wordmark "Mjolnir" + "UI"** types in below the hammer (Mjolnir white, UI gold). | `Mjolnir` `UI` (Satoshi Black, 96pt) | `click-soft` per letter group | Fade-up |
| 4 | 6.0 – 9.0s | Hammer dissolves into a stream of gold particles that rush to fill the lower 60% of frame. The particles resolve into a **grid of 8 thumbnail tiles** — each tile is a real component preview (Bifrost shader, Particle Engine, MjolnirButton, GlassCard, NeonGlowText, StatCard, ShaderTool, BackgroundStudio). | (small label under each tile, optional) | `whoosh-cinematic` + `electric-zap` x2 | Particle flow |
| 5 | 9.0 – 13.0s | Tile grid scrolls horizontally LEFT at quick pace. New tiles appear from RIGHT. ~10 components flash past in 4 seconds. | (none) | Quick rhythmic `click-soft` per scroll tick | Continuous scroll |
| 6 | 13.0 – 16.0s | Scroll stops. Tiles compress to background blur. Big white text fades in: **"53 components."** then below: **"23 layouts."** then below: **"Asgardian tools."** (3 separate appearances over 3 seconds) | `53 components.` `23 layouts.` `Asgardian tools.` | `click-soft` x3 | Type-up |
| 7 | 16.0 – 18.5s | Lower thirds fade. Center frame: **MjolnirUI** wordmark (gold) + tagline below in silver: **"Launching 6.1"** | `Launching 6.1` (Geist Mono, 24pt, silver) | (silence) | Fade |
| 8 | 18.5 – 20.0s | Bottom-right corner: **URL slab** in gold pill — `mjolnirui.com` | `mjolnirui.com` (Satoshi Bold, 32pt, black on gold pill) | `chime-success` (soft) | Fade-out to black |

## Captions / accessibility

Burned-in caption track at the bottom-center (16:9) or bottom-third (9:16). One line per beat:
- 1.5s: *Lightning strikes Mjolnir.*
- 3.0s: *MjolnirUI*
- 9.0s: *53 premium components. 4 design tools.*
- 13.0s: *53 components · 23 layouts · Asgardian tools.*
- 16.5s: *Launching June 1, 2026.*
- 18.5s: *mjolnirui.com*

## Aspect-ratio cropping notes

- **16:9** — center-compose; tile grid in beat 4-5 reads as a horizontal strip.
- **9:16** — re-stack: hammer + wordmark in upper third, tile grid as vertical scroll in middle third, CTA in lower third. Keep text vertically centered, not pushed to one side.

---

# 🎬 Video 2 — "Built for Pro"

**Use case:** Pro tier conversion video · linked from pricing page · Reels / TikTok / Shorts feature drop
**Length:** 20 seconds
**Aspect ratios:** `9:16 (1080×1920)` vertical (primary) + `1:1 (1080×1080)` for IG feed
**Music bed:** Silent. Sound design only.
**Captions:** Burned in.

## Storyboard

| Beat | Time | Visual | On-screen text | SFX |
|------|------|--------|----------------|-----|
| 1 | 0.0 – 1.5s | Black. **WireframeOrb** materializes center — pulse rings expanding outward gold. | (none) | `whoosh-cinematic` |
| 2 | 1.5 – 3.0s | Orb shrinks to a lock icon. Lock animates from open to closed. Yellow flash. | `PRO TIER` (Satoshi Black, 64pt, gold) | `electric-zap` |
| 3 | 3.0 – 6.0s | Lock dissolves. **Shader Engine** screen-capture loop fills frame — fractal flame shader rotating. White caption strip overlays bottom: | `Shader Engine` `GPU-accelerated GLSL` | `click-soft` x2 |
| 4 | 6.0 – 9.0s | Cross-fade to **Particle Engine** capture — tsParticles atomic swarm. Same caption pattern. | `Particle Engine` `Full physics, full control` | `click-soft` x2 |
| 5 | 9.0 – 12.0s | Cross-fade to a static graphic: a parchment scroll with "COMMERCIAL LICENSE" stamped on it in gold. (Use **WireframeOrb** + scroll graphic.) | `Commercial License` `Ship to clients, paid or free` | `click-soft` x2 |
| 6 | 12.0 – 15.0s | Black background. Large gold price: **"$25"** + "/month" in silver. Below in smaller: "or $250 / year (save 17%)" | `$25` `/ month` `or $250 / year (save 17%)` | `chime-success` |
| 7 | 15.0 – 18.0s | **MjolnirUI Pro** wordmark fades in. Below in silver: **"Wield Mjolnir."** | `MjolnirUI Pro` `Wield Mjolnir.` | (silence) |
| 8 | 18.0 – 20.0s | URL slab + small "Launching 6.1" date stamp | `mjolnirui.com` `6.1.2026` | `chime-success` (soft) |

## Captions / accessibility

- 1.5s: *Pro tier unlocks the full Asgardian toolset.*
- 3.0s: *Shader Engine: GPU-accelerated GLSL.*
- 6.0s: *Particle Engine: full physics, full control.*
- 9.0s: *Commercial License: ship to clients, paid or free.*
- 12.0s: *$25 per month. Or $250 per year — save 17%.*
- 15.0s: *MjolnirUI Pro — wield Mjolnir.*
- 18.0s: *Launching June 1, 2026.*

## Cropping for 1:1

Drop beats 4 and 5 — keep it tight to 15 seconds total. Center every element.

---

# 🎬 Video 3 — "Inside the Library"

**Use case:** Pure component eye-candy · TikTok/Reels feed scroll-stopper · "what's inside" curiosity drive
**Length:** 15 seconds
**Aspect ratios:** `9:16` vertical + `1:1` square
**Music bed:** Silent. Sound design only.
**Captions:** Burned in.

## Storyboard

| Beat | Time | Visual | On-screen text | SFX |
|------|------|--------|----------------|-----|
| 1 | 0.0 – 2.0s | **WireframeGrid** scrolling toward camera. Title fades in: | `Inside MjolnirUI...` (Satoshi Bold, 56pt, white) | `whoosh-cinematic` |
| 2 | 2.0 – 4.0s | Grid morphs into the browse-page card grid. Show 4 component thumbnails (Bifrost shader, MjolnirButton, GlassCard, Particle Engine). | (component names as small labels) | `click-soft` per card appearance |
| 3 | 4.0 – 7.0s | Vertical scroll DOWN through the grid — 12 more components flash past quickly. Cards have slight motion blur. | (none) | Rhythmic `click-soft` per scroll tick |
| 4 | 7.0 – 10.0s | Continue scroll. Larger highlight cards: text effects (Glitch, Decrypt, Neon, Aurora) — each renders its actual animation. | (none) | `electric-zap` per text effect |
| 5 | 10.0 – 12.0s | Scroll halts. Big text rises from bottom: **"56 components"** in gold. Subtext below in silver: **"backgrounds · shaders · primitives · wireframes"** | `56 components` `backgrounds · shaders · primitives · wireframes` | `chime-success` |
| 6 | 12.0 – 15.0s | Camera pulls back. URL slab + "Free to browse" callout. | `mjolnirui.com` `Free to browse` | (silence + soft `chime-success`) |

## Captions / accessibility

- 0.5s: *Inside MjolnirUI...*
- 4.0s: *Scrolling through a few of our 56 premium components.*
- 10.0s: *56 components — backgrounds, shaders, primitives, wireframes.*
- 12.0s: *Free to browse at mjolnirui.com.*

---

# 📦 Delivery checklist for the editor

For each video, render:

| Video | 16:9 | 9:16 | 1:1 |
|-------|------|------|-----|
| 1 — Launches | ✓ 1920×1080 30fps | ✓ 1080×1920 30fps | — |
| 2 — Built for Pro | — | ✓ 1080×1920 30fps | ✓ 1080×1080 30fps |
| 3 — Inside Library | — | ✓ 1080×1920 30fps | ✓ 1080×1080 30fps |

**Total exports:** 7 files.

**File-naming convention:**
`mjolnirui-launch-v1-{16x9|9x16|1x1}-{date}.mp4`

**Codec / quality:**
- H.264, CRF 18, AAC audio (even though silent — most platforms reject pure-no-audio)
- Add a single -60dB low-noise track if no SFX/music

## Embedding plan

| Where | Video | Format |
|-------|-------|--------|
| Landing page hero (above-fold) | Video 1 16:9 | Autoplay, muted, loop |
| `/pricing` Pro card hover | Video 2 1:1 | Autoplay on tier-card focus |
| `/blocks/browse` empty-state | Video 3 9:16 | Click-to-play |
| LinkedIn announcement | Video 1 16:9 | Native upload |
| X / Twitter announcement | Video 1 16:9 + Video 3 9:16 thread | Native uploads |
| Instagram feed | Video 2 1:1 + Video 3 1:1 carousel | |
| Instagram Reels | Video 1 9:16 + Video 2 9:16 + Video 3 9:16 (3-day drip) | |
| TikTok | Same 3 9:16 drops | |
| YouTube Shorts | Same 3 9:16 drops | |
| Email blast | Video 1 poster frame (static jpg) + GIF preview | |

---

# 🎯 Recording the wireframe components

The 3 wireframe components in `app/components/mjolnirui/wireframes/` are deterministic per-time-T — every frame is reproducible. To capture clean frames for the MDS editor:

1. Open the live preview at `https://www.mjolnirui.com/blocks/browse/wireframe-{hammer|orb|grid}` (logged in, Free tier OK)
2. Use the customization panel (if exposed) OR pass URL query params like `?bg=transparent&speed=0.25` to control the render
3. Screen-record at **60fps** with OBS/Loom in lossless ProRes (or H.264 CRF 16)
4. Each component handles transparent backgrounds by default — record on a chroma-key green if you need to composite over arbitrary backgrounds

**Pro tip:** the wireframe Hammer's `strikeInterval` prop fires a deterministic strike. For Video 1 beat 2 (the lightning strike on the hammer), set `strikeInterval={2}` so a strike fires at t=1.84s — capture that single strike, then slow-mo by 2× in post.

---

# 🧪 QA before publishing

For each rendered video:
- [ ] Captions readable at smallest target size (mobile vertical viewport)
- [ ] No text crops at platform-specific UI overlay zones (TikTok captions, IG profile chrome, Reels share button)
- [ ] First frame is visually striking (becomes the poster / thumbnail on most platforms)
- [ ] Audio peaks below -3dB (no clipping)
- [ ] Total file size <30MB per video where possible (faster loads, autoplay-friendly)
- [ ] URL slab in final beat is human-readable for 1.5+ seconds (gives viewers time to actually read it)
