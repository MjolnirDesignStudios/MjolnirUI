// app/components/layout/layoutCatalog.ts
// Registry powering /blocks/layout/grids, /sections, /templates.
// Each entry exposes:
//   - metadata (id, name, description, tier, tags)
//   - importKey to drive a dynamic-import map in LayoutPreviewModal
//   - code snippet (string) for the copy-to-clipboard UX
//
// The pattern matches app/components/canvas/backgroundCatalog.ts so the gallery
// UX is consistent across the dashboard.

import type { TierName } from "@/lib/tierConfig";

export type LayoutBucket = "grids" | "sections" | "templates";

export interface LayoutCatalogEntry {
  id: string;
  name: string;
  description: string;
  bucket: LayoutBucket;
  requiredTier: TierName;
  /** Search tags + UI badges */
  tags: string[];
  /** Dynamic-import key, resolved in LayoutPreviewModal */
  importKey: string;
  /** Themed gradient for the card placeholder */
  gradient: string;
  /** Copy-paste-ready JSX snippet */
  code: string;
  isNew?: boolean;
  isPopular?: boolean;
}

/* ═══════════════════════════════════════════════════════
   GRIDS (8)
   ═══════════════════════════════════════════════════════ */

const GRID_ENTRIES: LayoutCatalogEntry[] = [
  {
    id: "grid-two-col",
    name: "Two Column",
    description: "Classic 50/50 split that stacks on mobile. The bread and butter of every landing page.",
    bucket: "grids",
    requiredTier: "free",
    tags: ["responsive", "tailwind"],
    importKey: "grid-two-col",
    gradient: "linear-gradient(90deg, #FFCC11 50%, #00f0ff 50%)",
    code: `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="rounded-2xl bg-zinc-900 p-6">…</div>
  <div className="rounded-2xl bg-zinc-900 p-6">…</div>
</div>`,
  },
  {
    id: "grid-three-col",
    name: "Three Column",
    description: "Equal thirds. Stacks 1→2→3 across breakpoints. Perfect for feature cards.",
    bucket: "grids",
    requiredTier: "free",
    tags: ["responsive", "tailwind"],
    importKey: "grid-three-col",
    gradient: "linear-gradient(90deg, #FFCC11 33%, #00f0ff 33%, #00f0ff 66%, #10B981 66%)",
    code: `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
  {items.map((it) => (
    <div key={it.id} className="rounded-2xl bg-zinc-900 p-6">{it.title}</div>
  ))}
</div>`,
  },
  {
    id: "grid-four-col",
    name: "Four Column",
    description: "Quarter splits. Best for dense stat grids or icon clouds.",
    bucket: "grids",
    requiredTier: "free",
    tags: ["responsive", "tailwind"],
    importKey: "grid-four-col",
    gradient: "linear-gradient(90deg, #FFCC11 25%, #00f0ff 25%, #00f0ff 50%, #10B981 50%, #10B981 75%, #7C3AED 75%)",
    code: `<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {items.map((it) => (
    <div key={it.id} className="rounded-2xl bg-zinc-900 p-5">{it.title}</div>
  ))}
</div>`,
  },
  {
    id: "grid-asymmetric",
    name: "Asymmetric 2/3 + 1/3",
    description: "Featured content + sidebar. Stacks on mobile, splits 2:1 on desktop.",
    bucket: "grids",
    requiredTier: "free",
    tags: ["responsive", "feature"],
    importKey: "grid-asymmetric",
    gradient: "linear-gradient(90deg, #FFCC11 66%, #7C3AED 66%)",
    code: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2 rounded-2xl bg-zinc-900 p-6">Featured</div>
  <div className="rounded-2xl bg-zinc-900 p-6">Sidebar</div>
</div>`,
  },
  {
    id: "grid-masonry",
    name: "Masonry",
    description: "Variable-height items packed via CSS columns. Pinterest-style without JS.",
    bucket: "grids",
    requiredTier: "free",
    tags: ["css-columns", "variable-height"],
    importKey: "grid-masonry",
    gradient: "linear-gradient(135deg, #FFCC11 0%, #00f0ff 25%, #10B981 50%, #7C3AED 75%, #F97316 100%)",
    isPopular: true,
    code: `<div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
  {items.map((it) => (
    <div key={it.id} className="break-inside-avoid rounded-2xl bg-zinc-900 p-5">
      {it.body}
    </div>
  ))}
</div>`,
  },
  {
    id: "grid-bento",
    name: "Bento Grid",
    description: "Asymmetric featured tiles à la Apple keynote. Featured center + corners.",
    bucket: "grids",
    requiredTier: "free",
    tags: ["asymmetric", "featured"],
    importKey: "grid-bento",
    gradient:
      "conic-gradient(from 45deg at 50% 50%, #FFCC11 0deg, #00f0ff 90deg, #10B981 180deg, #7C3AED 270deg, #FFCC11 360deg)",
    isPopular: true,
    code: `<div className="grid grid-cols-1 sm:grid-cols-3 grid-rows-3 gap-3 sm:h-[500px]">
  <div className="sm:col-span-2 sm:row-span-2 rounded-2xl bg-zinc-900 p-6">Headliner</div>
  <div className="rounded-2xl bg-zinc-900 p-5">Side A</div>
  <div className="rounded-2xl bg-zinc-900 p-5">Side B</div>
  <div className="sm:col-span-2 rounded-2xl bg-zinc-900 p-5">Wide footer</div>
  <div className="rounded-2xl bg-zinc-900 p-5">Tail</div>
</div>`,
  },
  {
    id: "grid-auto-fit",
    name: "Responsive Auto-Fit",
    description: "Container-aware grid that adjusts column count based on width. No breakpoints needed.",
    bucket: "grids",
    requiredTier: "free",
    tags: ["modern-css", "minmax"],
    importKey: "grid-auto-fit",
    gradient: "linear-gradient(135deg, #020617 0%, #1e3a8a 50%, #00f0ff 100%)",
    isNew: true,
    code: `<div
  className="grid gap-4"
  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
>
  {items.map((it) => (
    <div key={it.id} className="rounded-2xl bg-zinc-900 p-5">{it.title}</div>
  ))}
</div>`,
  },
  {
    id: "grid-holy-grail",
    name: "Holy Grail",
    description: "Header + footer + 3-column main (nav, content, aside). The classic full-app layout.",
    bucket: "grids",
    requiredTier: "free",
    tags: ["app-shell", "full-page"],
    importKey: "grid-holy-grail",
    gradient: "linear-gradient(180deg, #FFCC11 0%, #020617 30%, #020617 70%, #FFCC11 100%)",
    code: `<div className="min-h-screen grid grid-rows-[auto_1fr_auto] grid-cols-1 lg:grid-cols-[200px_1fr_240px]">
  <header className="lg:col-span-3 border-b border-zinc-800 p-4">Top bar</header>
  <nav className="border-r border-zinc-800 p-4">Nav</nav>
  <main className="p-6">Content</main>
  <aside className="border-l border-zinc-800 p-4">Aside</aside>
  <footer className="lg:col-span-3 border-t border-zinc-800 p-4">Footer</footer>
</div>`,
  },
];

/* ═══════════════════════════════════════════════════════
   SECTIONS (10)
   ═══════════════════════════════════════════════════════ */

const SECTION_ENTRIES: LayoutCatalogEntry[] = [
  {
    id: "section-hero-centered",
    name: "Hero — Centered",
    description: "Big centered headline + subhead + CTA stack. The most-used hero on the web.",
    bucket: "sections",
    requiredTier: "base",
    tags: ["hero", "above-fold"],
    importKey: "section-hero-centered",
    gradient: "radial-gradient(circle at 50% 30%, #FFCC11 0%, #020617 60%)",
    isPopular: true,
    code: `<section className="text-center py-24 px-6">
  <h1 className="text-5xl md:text-7xl font-black mb-4">Build something <span className="text-[#FFCC11]">Asgardian</span></h1>
  <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">A subhead that sells the dream in two sentences max.</p>
  <div className="flex gap-3 justify-center">
    <a className="px-6 py-3 rounded-xl bg-[#FFCC11] text-black font-bold">Get started</a>
    <a className="px-6 py-3 rounded-xl border border-zinc-700">Live demo</a>
  </div>
</section>`,
  },
  {
    id: "section-hero-split",
    name: "Hero — Split",
    description: "Text left, visual right. Best when you have a hero image, screenshot, or animation to feature.",
    bucket: "sections",
    requiredTier: "base",
    tags: ["hero", "split"],
    importKey: "section-hero-split",
    gradient: "linear-gradient(90deg, #020617 0%, #020617 50%, #FFCC11 50%, #00f0ff 100%)",
    code: `<section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20 px-6">
  <div>
    <h1 className="text-4xl md:text-6xl font-black mb-4">Forged for builders</h1>
    <p className="text-gray-400 mb-6">Set up in 60 seconds, ship in days.</p>
    <a className="px-6 py-3 rounded-xl bg-[#FFCC11] text-black font-bold">Start free</a>
  </div>
  <div className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800" />
</section>`,
  },
  {
    id: "section-hero-fullbleed",
    name: "Hero — Full Bleed",
    description: "Background video/image with overlay + centered copy. Maximum drama.",
    bucket: "sections",
    requiredTier: "base",
    tags: ["hero", "full-bleed"],
    importKey: "section-hero-fullbleed",
    gradient: "radial-gradient(circle at center, #7C3AED 0%, #020617 80%)",
    code: `<section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
  <div className="absolute inset-0 bg-zinc-900" />
  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
  <div className="relative text-center px-6">
    <h1 className="text-5xl md:text-8xl font-black tracking-tight">Mjolnir</h1>
    <p className="text-gray-300 mt-4 max-w-xl mx-auto">Whosoever holds this hammer.</p>
  </div>
</section>`,
  },
  {
    id: "section-features-three",
    name: "Features — 3 Column",
    description: "Three feature cards with icon + heading + body. The classic feature trio.",
    bucket: "sections",
    requiredTier: "base",
    tags: ["features", "marketing"],
    importKey: "section-features-three",
    gradient: "linear-gradient(90deg, #FFCC11 33%, #00f0ff 33%, #00f0ff 66%, #10B981 66%)",
    code: `<section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-20 px-6">
  {features.map((f) => (
    <div key={f.title} className="rounded-2xl border border-zinc-800 p-6">
      <div className="w-12 h-12 rounded-xl bg-[#FFCC11]/15 mb-4" />
      <h3 className="text-xl font-bold mb-2">{f.title}</h3>
      <p className="text-gray-400">{f.body}</p>
    </div>
  ))}
</section>`,
  },
  {
    id: "section-features-bento",
    name: "Features — Bento",
    description: "Asymmetric feature grid with one headliner tile + supporting cards. Linear-style.",
    bucket: "sections",
    requiredTier: "base",
    tags: ["features", "bento"],
    importKey: "section-features-bento",
    gradient:
      "conic-gradient(from 45deg at 50% 50%, #FFCC11 0deg, #00f0ff 120deg, #10B981 240deg, #FFCC11 360deg)",
    isPopular: true,
    code: `<section className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-4 py-20 px-6 md:h-[480px]">
  <div className="md:row-span-2 rounded-2xl border border-zinc-800 p-6">Hero feature</div>
  <div className="rounded-2xl border border-zinc-800 p-6">Feature B</div>
  <div className="rounded-2xl border border-zinc-800 p-6">Feature C</div>
  <div className="rounded-2xl border border-zinc-800 p-6">Feature D</div>
  <div className="rounded-2xl border border-zinc-800 p-6">Feature E</div>
</section>`,
  },
  {
    id: "section-pricing",
    name: "Pricing — 3 Tier",
    description: "Three pricing cards with featured middle tier. Per-tier color accents.",
    bucket: "sections",
    requiredTier: "base",
    tags: ["pricing", "saas"],
    importKey: "section-pricing",
    gradient: "linear-gradient(90deg, #3B82F6 0%, #FFCC11 50%, #F97316 100%)",
    isPopular: true,
    code: `<section className="grid grid-cols-1 md:grid-cols-3 gap-4 py-20 px-6">
  {tiers.map((t) => (
    <div key={t.name} className={\`rounded-2xl border p-6 \${t.featured ? "border-[#FFCC11] scale-[1.02]" : "border-zinc-800"}\`}>
      <div className="text-xs uppercase text-gray-400 mb-2">{t.name}</div>
      <div className="text-4xl font-black mb-1">\${t.price}<span className="text-sm text-gray-500">/mo</span></div>
      <ul className="space-y-2 text-sm text-gray-400 my-6">
        {t.features.map((f) => <li key={f}>✓ {f}</li>)}
      </ul>
      <a className={\`block text-center px-4 py-2.5 rounded-xl font-semibold \${t.featured ? "bg-[#FFCC11] text-black" : "border border-zinc-700"}\`}>Choose {t.name}</a>
    </div>
  ))}
</section>`,
  },
  {
    id: "section-testimonials",
    name: "Testimonials — Grid",
    description: "3×2 quote grid with avatars + names. Social proof without a carousel.",
    bucket: "sections",
    requiredTier: "base",
    tags: ["testimonials", "social-proof"],
    importKey: "section-testimonials",
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #020617 60%)",
    code: `<section className="py-20 px-6">
  <h2 className="text-3xl md:text-5xl font-black text-center mb-12">What people say</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {testimonials.map((t) => (
      <figure key={t.id} className="rounded-2xl border border-zinc-800 p-6">
        <blockquote className="text-sm text-gray-300 mb-4">"{t.quote}"</blockquote>
        <figcaption className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-800" />
          <div>
            <div className="text-sm font-bold">{t.name}</div>
            <div className="text-xs text-gray-500">{t.role}</div>
          </div>
        </figcaption>
      </figure>
    ))}
  </div>
</section>`,
  },
  {
    id: "section-cta",
    name: "CTA Banner",
    description: "Full-bleed colorful CTA strip with headline + button. Drop above the footer.",
    bucket: "sections",
    requiredTier: "base",
    tags: ["cta", "conversion"],
    importKey: "section-cta",
    gradient: "linear-gradient(90deg, #FFCC11 0%, #F97316 50%, #FFCC11 100%)",
    code: `<section className="my-20 mx-6 rounded-3xl bg-gradient-to-br from-[#FFCC11] to-[#F97316] text-black p-12 text-center">
  <h2 className="text-4xl md:text-5xl font-black mb-3">Ready to build?</h2>
  <p className="text-black/80 mb-6">Start free, no credit card.</p>
  <a className="inline-block px-6 py-3 rounded-xl bg-black text-white font-bold">Get started</a>
</section>`,
  },
  {
    id: "section-stats",
    name: "Stats — 4 Up",
    description: "Four big numbers in a row. Use for retention/uptime/customers/throughput claims.",
    bucket: "sections",
    requiredTier: "base",
    tags: ["stats", "credibility"],
    importKey: "section-stats",
    gradient: "linear-gradient(180deg, #020617 0%, #1e3a8a 100%)",
    code: `<section className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-20 px-6 text-center">
  {stats.map((s) => (
    <div key={s.label}>
      <div className="text-4xl md:text-5xl font-black text-[#FFCC11]">{s.value}</div>
      <div className="text-sm text-gray-400 mt-1">{s.label}</div>
    </div>
  ))}
</section>`,
  },
  {
    id: "section-faq",
    name: "FAQ — Accordion",
    description: "Single-column accordion with disclosure summary/details. Native HTML, zero JS.",
    bucket: "sections",
    requiredTier: "base",
    tags: ["faq", "native-html"],
    importKey: "section-faq",
    gradient: "linear-gradient(180deg, #18181b 0%, #020617 100%)",
    code: `<section className="max-w-3xl mx-auto py-20 px-6">
  <h2 className="text-3xl md:text-5xl font-black mb-8">FAQ</h2>
  <div className="space-y-3">
    {faqs.map((q) => (
      <details key={q.q} className="group rounded-2xl border border-zinc-800 p-5">
        <summary className="cursor-pointer font-semibold flex justify-between">
          {q.q}<span className="text-[#FFCC11] group-open:rotate-45 transition">+</span>
        </summary>
        <p className="mt-3 text-gray-400">{q.a}</p>
      </details>
    ))}
  </div>
</section>`,
  },
];

/* ═══════════════════════════════════════════════════════
   PAGE TEMPLATES (5)
   ═══════════════════════════════════════════════════════ */

const TEMPLATE_ENTRIES: LayoutCatalogEntry[] = [
  {
    id: "template-saas-landing",
    name: "SaaS Landing",
    description: "Hero · Features · Pricing · CTA · Footer. The canonical SaaS landing page.",
    bucket: "templates",
    requiredTier: "base",
    tags: ["landing", "saas"],
    importKey: "template-saas-landing",
    gradient: "linear-gradient(135deg, #020617 0%, #1e3a8a 50%, #FFCC11 100%)",
    isPopular: true,
    code: `// SaaS landing — composes Hero (split), Features (bento), Pricing, CTA, Footer
// Drop into app/page.tsx and customize copy + assets.
export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}`,
  },
  {
    id: "template-agency",
    name: "Agency Portfolio",
    description: "Hero · Services · Case study grid · Team · Contact. Boutique agency template.",
    bucket: "templates",
    requiredTier: "base",
    tags: ["portfolio", "agency"],
    importKey: "template-agency",
    gradient: "linear-gradient(135deg, #18181b 0%, #be185d 50%, #FFCC11 100%)",
    code: `// Agency portfolio — Hero, Services, Case grid, Team, Contact
export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <AgencyHero />
      <ServiceGrid />
      <CaseStudies />
      <TeamGrid />
      <ContactSection />
    </main>
  );
}`,
  },
  {
    id: "template-dashboard",
    name: "Dashboard Shell",
    description: "Sidebar + topbar + main + widget grid. Drop-in app-shell for admin tools.",
    bucket: "templates",
    requiredTier: "base",
    tags: ["app-shell", "dashboard"],
    importKey: "template-dashboard",
    gradient: "linear-gradient(90deg, #18181b 200px, #020617 200px)",
    code: `// Dashboard shell — sidebar nav + topbar + widget grid
export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <WidgetGrid />
        </main>
      </div>
    </div>
  );
}`,
  },
  {
    id: "template-auth",
    name: "Auth Pages",
    description: "Sign-in / sign-up / reset password — split layout with brand panel + form.",
    bucket: "templates",
    requiredTier: "base",
    tags: ["auth", "forms"],
    importKey: "template-auth",
    gradient: "linear-gradient(90deg, #FFCC11 50%, #020617 50%)",
    code: `// Auth shell — left brand panel + right form. Works for sign-in / sign-up / reset.
export default function SignInPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <BrandPanel />
      <SignInForm />
    </div>
  );
}`,
  },
  {
    id: "template-docs",
    name: "Documentation Site",
    description: "Sidebar TOC + main content + right outline (Stripe-style docs).",
    bucket: "templates",
    requiredTier: "base",
    tags: ["docs", "content"],
    importKey: "template-docs",
    gradient: "linear-gradient(180deg, #FFCC11 0%, #020617 25%)",
    code: `// Docs template — three-column app shell (toc / content / outline)
export default function DocsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_220px] min-h-screen">
      <DocsToc />
      <article className="prose prose-invert max-w-3xl mx-auto px-6 py-10" />
      <DocsOutline />
    </div>
  );
}`,
  },
];

/* ═══════════════════════════════════════════════════════
   COMBINED CATALOG + LOOKUPS
   ═══════════════════════════════════════════════════════ */

export const LAYOUT_CATALOG: LayoutCatalogEntry[] = [
  ...GRID_ENTRIES,
  ...SECTION_ENTRIES,
  ...TEMPLATE_ENTRIES,
];

export function getByBucket(bucket: LayoutBucket): LayoutCatalogEntry[] {
  return LAYOUT_CATALOG.filter((e) => e.bucket === bucket);
}

export function findLayoutEntry(id: string): LayoutCatalogEntry | undefined {
  return LAYOUT_CATALOG.find((e) => e.id === id);
}
