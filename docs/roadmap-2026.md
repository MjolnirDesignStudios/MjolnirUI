# MjolnirUI · Post-Launch Roadmap
> _Last updated: 2026-05-29 · Launch day · 56 components · Pro live_

This is the operating doc for the weekly + monthly cadence going forward. Use it as a planning template, a commitment log, and a retrospective lens.

---

## Cadence model

A sustainable rhythm for a solo dev (or small team) running both MjolnirUI and Mjolnir Design Studios:

| Frequency | Type | Target shipping day | Scope |
|-----------|------|---------------------|-------|
| **Weekly** | Drop | **Friday AM** | 2-4 small components, bug fixes, copy polish, 1 docs improvement |
| **Monthly** | Major release | **First Friday of month** | New category, new tool, or premium feature beta. Marketing push. |
| **Quarterly** | Strategic pivot | Last week of quarter | Pricing review, tier reshuffle, roadmap re-scope |

Every **Friday is "ship day"** — small drops weekly, big drops monthly. Users learn to expect the cadence; you learn to plan to it.

The **NEW FEATURES sidebar section** (auto-derived from `NEW_LAUNCHES` in `app/components/Dashboards/Sidebar.tsx`) surfaces each drop for 10 days, then items fade naturally. This means a weekly drop is visible to 1.5 cohorts of weekly returners before it settles into permanent navigation.

---

## Weekly drop template

For every Friday drop, fill this out before you start coding (5 minutes — save yourself days of scope creep):

```markdown
## Week of <ISO date>

### Theme
<one sentence: "Loaders + Tooltips" or "Animation polish week">

### Shipping
- [ ] <Component name> (Free / Base / Pro / Elite) — <1-sentence why>
- [ ] <Component name>
- [ ] <Bug fix>: <description>
- [ ] <Docs improvement>

### NEW_LAUNCHES updates
- Add: <component-id with releasedAt>
- Remove: <expired items if you want to manually clean — optional, they auto-expire>

### Marketing
- [ ] Social: <1 post per platform — X, LinkedIn, IG, TikTok>
- [ ] Newsletter blurb (if monthly newsletter is live)
- [ ] Add to CHANGELOG.md

### Skip / defer
<things you considered but pushed — keep this list, you'll feel less FOMO>
```

---

## Monthly major release template

Drop the first Friday of each month. Bigger scope, bigger marketing push:

```markdown
## <Month Year> — "<Theme>"

### Goal
<one sentence — "Ship 3D Forge beta to Pro tier" or "Complete the data category">

### Major deliverables
1. <Big thing>
2. <Big thing>
3. <Big thing>

### Supporting weekly drops
- Week 1: launch the major thing
- Week 2: polish + bug fixes from launch
- Week 3: small component drop in adjacent category
- Week 4: docs / content / video

### Marketing campaign
- [ ] Promo video (use docs/promo-video-briefs.md template)
- [ ] Landing page hero update (if applicable)
- [ ] Newsletter feature
- [ ] Social mini-thread (X, LinkedIn 3-post series)
- [ ] Update CLAUDE.md feature list

### Pricing-page implications
- [ ] Move any "Coming Soon" chips that are no longer accurate
- [ ] Re-verify all bullets reflect actual ship state

### Retro question (end of month)
- Did we hit the goal?
- What surprised us?
- What's the #1 thing for next month?
```

---

## 90-day concrete plan

### 🗓 June 2026 — "Charts & Data"

**Theme:** Complete the missing data-display category that any dashboard needs. Plus stabilize the launch.

| Week | Friday | Drop |
|------|--------|------|
| 1 — 6/5 | **MAJOR** | BarChart · LineChart · DonutChart (Base tier, all 3 powered by recharts). Promo Video 1 ("Pro Launches") cut + posted. |
| 2 — 6/12 | Weekly | DataTable · Sparkline · ProgressBar. Launch bug-fix sweep from week 1. |
| 3 — 6/19 | Weekly | Heatmap · KPI Group · Metric Spotlight. **MDS subscriber email blast** announcing cross-grant. |
| 4 — 6/26 | Weekly | Polish: GSAP Animations beta (Pro). Move "Advanced GSAP" off the Coming Soon chip. |

**Stretch:** Custom Component Requests intake form (`/blocks/requests`) — moves Pro feature off Coming Soon.

**Metric target:** 50 free signups · 10 paid conversions · MRR $250+

---

### 🗓 July 2026 — "3D Forge Beta"

**Theme:** Pro tier's marquee Coming-Soon feature ships as beta.

| Week | Friday | Drop |
|------|--------|------|
| 1 — 7/3 | **MAJOR** | 3D Forge MVP: Meshy API integration, image→3D model viewer, basic save/share. Flip "3D Forge" chip from Coming Soon to "Beta". Promo Video 2 ("Built for Pro") cut + posted. |
| 2 — 7/10 | Weekly | Three.js scene library (Particles+, Globe variants, Hyperspeed presets). |
| 3 — 7/17 | Weekly | Form components (DatePicker, FileUpload, Combobox). |
| 4 — 7/24 | Weekly | Notification Toast + Alert variants. 3D Forge polish from week 1 feedback. |

**Metric target:** 100 free signups · 20 paid conversions · MRR $500+

---

### 🗓 August 2026 — "OdinAI Approach"

**Theme:** Lay the groundwork for Elite tier's marquee feature (OdinAI Agent). Build buzz; pre-orders for Elite.

| Week | Friday | Drop |
|------|--------|------|
| 1 — 8/7 | **MAJOR** | OdinAI Agent v0 (Elite preview): chat interface, basic "generate me a component" flow using AI SDK. Pre-order list opens for Elite tier. |
| 2 — 8/14 | Weekly | Docs overhaul: full-text search, code-sample playgrounds, MDX-based tutorials. |
| 3 — 8/21 | Weekly | Theme builder (Base): custom palette → exportable Tailwind config. |
| 4 — 8/28 | Weekly | Component composition recipes (Pro): "build a pricing page in 5 minutes" etc. |

**Metric target:** 200 free signups · 40 paid conversions · MRR $1,000+ · 30 Elite pre-orders

---

### 🗓 September 2026 — "Elite GA"

**Theme:** Flip Elite tier from "Coming Q3 2026" to live. OdinAI Agent GA.

| Week | Friday | Drop |
|------|--------|------|
| 1 — 9/4 | **MAJOR** | OdinAI Agent GA · End-to-End Design service onboarding · Source Code Access for Elite subscribers (private GitHub invite flow). Remove the COMING Q3 2026 badge from Pricing.tsx. |

**Beyond September** — open territory. Q4 themes to consider:
- Mobile-app component category (Capacitor-native components)
- Remotion video tooling (already in the package.json from day 0)
- HubSpot CRM integration for paid-customer ops
- Dashboard Builder (the original Pro feature, deferred from launch)
- Public API for component metadata (registry as a service)

---

## Metrics dashboard

Track these every Friday afternoon (5-minute weekly retro):

| Metric | Source | Target trajectory |
|--------|--------|-------------------|
| New signups (week) | `/admin/dashboard` Total Users delta | June: ~10/wk → Sep: ~50/wk |
| Free → Paid conversion (week) | `/admin/dashboard` conversion % | Hold above 8% |
| MRR | `/admin/dashboard` MRR card (Stripe-sourced) | $250 → $500 → $1k → $2k |
| Most-popular tools (week) | `/admin/dashboard` Popular Tools panel | Use to guide next month's drops |
| Free-trial unlock rate | Supabase: `select avg(free_unlocks_count) from next_auth.users where tier='free'` | If avg < 2, soft paywall isn't compelling — tweak Base tier copy |
| MDS cross-grants (week) | `select count(*) from next_auth.users where mds_grant=true and mds_granted_at > now() - interval '7 days'` | Marketing signal for MDS subscriber engagement |
| GitHub stars (week) | github.com/MjolnirDesignStudios/MjolnirUI | Vanity but useful as social proof |

---

## Marketing rotation

Don't overload one channel. Rotate hard pushes:

| Week of month | Primary push |
|---------------|--------------|
| Week 1 (major release) | LinkedIn long-form post + Twitter/X thread + IG Reel + YouTube Short |
| Week 2 | TikTok showcase (use Video 3 template from `docs/promo-video-briefs.md`) |
| Week 3 | Newsletter / blog deep-dive on the month's theme |
| Week 4 | Founder POV / behind-the-scenes / Q&A on X Spaces or LinkedIn Live |

---

## Retro questions (end of every month)

Open `docs/retros/<YYYY-MM>.md` and answer in writing:

1. Did we hit the monthly goal? Why / why not?
2. Which component was most popular this month? (check Popular Tools panel)
3. Which Pro feature is dragging — should we re-scope or kill?
4. What broke unexpectedly? (Stripe webhook, signups, perf)
5. What's the #1 thing for next month?
6. Are we trending toward the metric target? If not, what's the lever?

Saved retros become next year's roadmap baseline.

---

## Triage rules (when things compete)

When you have to choose between two items in a week:

1. **Money path > everything.** A broken Stripe webhook beats a missing component.
2. **Existing paying customers > new feature for non-payers.** Pro renewals are worth more than Free signup growth.
3. **Polish > new build.** A great Card beats a stubby Modal AND a stubby Chart.
4. **Ship over plan.** Half a polished component shipped Friday > a perfect one shipped never.
5. **Marketing during a feature drop > marketing after.** Promo Video 1 belongs in week 1 of the month, not week 3.

---

## Auto-triggers worth setting up later

When the cadence is stable (~Month 3), consider automating:

- **Monthly newsletter** — fires on the 1st via Resend + uses the same Welcome email infra
- **Friday "what shipped this week" digest** — auto-pulled from `NEW_LAUNCHES` deltas + GitHub commits
- **MDS subscriber upgrade email** — fires when `mds_grant` becomes true, points them at mjolnirui.com
- **Retro reminder** — a Vercel Cron that posts to the admin dashboard "month's almost over, write retro"

Not launch-critical. Add when the rhythm is real and you want leverage.

---

## Sustainability check

If at any point a weekly drop becomes a slog, **skip it**. Two reasons:

1. **Burnout is the only thing that kills the cadence.** Better to ship 3 weeks/month than 4 forever.
2. **Empty weeks are fine.** Your "NEW FEATURES" section just won't refresh — users notice, but they wait.

The cadence serves the product. Not the other way around.
