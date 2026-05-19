// app/components/layout/patterns/templates.tsx
// Full-page templates — each is a composition of section primitives rendered
// inside a constrained scrollable container in the preview modal.
"use client";

import React from "react";
import {
  Zap, Sparkles, Cpu, Star, Search, Menu, User,
  LayoutDashboard, BarChart3, Settings, ChevronRight,
  BookOpen, FileText, Hash, Hammer,
} from "lucide-react";

/* ────────────────────────────────────────────────────────
   1. SaaS Landing
   ──────────────────────────────────────────────────────── */
export function SaasLandingTemplate() {
  return (
    <div className="bg-black text-white">
      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-2 font-black">
          <Hammer size={16} className="text-[#FFCC11]" /> Mjolnir
        </div>
        <nav className="hidden md:flex items-center gap-5 text-sm text-gray-400">
          <span>Features</span>
          <span>Pricing</span>
          <span>Docs</span>
        </nav>
        <button className="text-xs px-3 py-1.5 rounded-lg bg-[#FFCC11] text-black font-bold">
          Sign in
        </button>
      </header>

      {/* Hero */}
      <section className="text-center py-16 px-6">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFCC11]/15 border border-[#FFCC11]/30 text-[#FFCC11] text-xs font-semibold uppercase tracking-wider mb-5">
          <Sparkles size={11} /> New: AI agent
        </span>
        <h1 className="text-4xl md:text-6xl font-black mb-3">Ship faster than Thor</h1>
        <p className="text-gray-400 max-w-xl mx-auto mb-6">
          The component library + AI designer that does the heavy lifting.
        </p>
        <button className="px-5 py-2.5 rounded-xl bg-[#FFCC11] text-black font-bold">
          Start free
        </button>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 px-6 pb-12">
        {[
          { icon: Zap, title: "Fast", body: "Pure CSS where possible." },
          { icon: Sparkles, title: "Polished", body: "Designer-grade aesthetics out of the box." },
          { icon: Cpu, title: "AI-augmented", body: "OdinAI composes layouts from a brief." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-zinc-800 p-5">
            <f.icon size={18} className="text-[#FFCC11] mb-2" />
            <div className="font-bold">{f.title}</div>
            <div className="text-xs text-gray-400 mt-1">{f.body}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="px-6 pb-12">
        <div className="rounded-3xl bg-gradient-to-br from-[#FFCC11] to-[#F97316] text-black p-8 text-center">
          <h3 className="text-2xl font-black mb-2">Ready when you are</h3>
          <button className="px-5 py-2.5 rounded-xl bg-black text-white font-bold text-sm">
            Sign up
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-zinc-800/60 text-center text-xs text-gray-500">
        © 2026 Mjolnir Design Studios
      </footer>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   2. Agency Portfolio
   ──────────────────────────────────────────────────────── */
export function AgencyTemplate() {
  return (
    <div className="bg-zinc-950 text-white">
      <header className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60">
        <div className="font-black tracking-tight">RAVEN STUDIO</div>
        <nav className="hidden md:flex gap-5 text-xs uppercase tracking-wider text-gray-400">
          <span>Work</span>
          <span>Services</span>
          <span>About</span>
          <span>Contact</span>
        </nav>
      </header>

      <section className="px-6 py-16 max-w-4xl">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Design studio · Brooklyn</div>
        <h1 className="text-5xl md:text-7xl font-black leading-none mb-6">
          We make<br />
          <span className="italic font-serif text-[#be185d]">brands</span> that move
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl">
          Founded 2024. 18 clients shipped. Specializing in editorial product brands and
          motion-first storytelling.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-16">
        {[
          { name: "Case 01 — Stripe", color: "#FFCC11" },
          { name: "Case 02 — Notion", color: "#00f0ff" },
          { name: "Case 03 — Linear", color: "#7C3AED" },
          { name: "Case 04 — Vercel", color: "#10B981" },
        ].map((c) => (
          <div
            key={c.name}
            className="aspect-video rounded-2xl border border-zinc-800 relative overflow-hidden flex items-end p-5"
            style={{
              background: `linear-gradient(135deg, ${c.color}30 0%, #020617 70%)`,
            }}
          >
            <div className="text-sm font-bold">{c.name}</div>
          </div>
        ))}
      </section>

      <section className="px-6 py-12 border-t border-zinc-800/60">
        <div className="text-xs uppercase text-gray-500 tracking-wider mb-4">Team</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Riley", "Sam", "Avery", "Jordan"].map((n) => (
            <div key={n} className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-gray-500">
              {n}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   3. Dashboard Shell
   ──────────────────────────────────────────────────────── */
export function DashboardTemplate() {
  return (
    <div className="flex bg-black text-white min-h-[600px]">
      {/* Sidebar */}
      <aside className="w-44 border-r border-zinc-800/60 p-3 flex flex-col gap-1">
        <div className="font-black tracking-tight mb-4 px-2">Mjolnir</div>
        {[
          { icon: LayoutDashboard, label: "Overview", active: true },
          { icon: BarChart3, label: "Analytics" },
          { icon: User, label: "Users" },
          { icon: Settings, label: "Settings" },
        ].map((it) => (
          <div
            key={it.label}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              it.active ? "bg-white/10 text-white" : "text-gray-400"
            }`}
          >
            <it.icon size={13} /> {it.label}
          </div>
        ))}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-gray-500 w-64">
            <Search size={11} /> Search…
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#FFCC11]/20 border border-[#FFCC11]/40" />
          </div>
        </header>

        {/* Widget grid */}
        <main className="flex-1 p-6 grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-min">
          {[
            { label: "Revenue", value: "$12.4k", tone: "#10B981" },
            { label: "Users", value: "2,847", tone: "#00f0ff" },
            { label: "Conv.", value: "4.3%", tone: "#FFCC11" },
            { label: "Churn", value: "1.1%", tone: "#F97316" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-zinc-800 p-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{s.label}</div>
              <div className="text-2xl font-black" style={{ color: s.tone }}>{s.value}</div>
            </div>
          ))}
          <div className="col-span-2 lg:col-span-4 rounded-2xl border border-zinc-800 p-4 h-40 flex items-end gap-1.5">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-[#FFCC11]/40 rounded-t-sm"
                style={{ height: `${20 + Math.sin(i) * 30 + (i % 5) * 8}%` }}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   4. Auth Split
   ──────────────────────────────────────────────────────── */
export function AuthTemplate() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] bg-black text-white">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-[#FFCC11] via-[#F97316] to-[#be185d]">
        <div className="text-black font-black text-xl tracking-tight">MJOLNIR</div>
        <blockquote className="text-black/80 italic max-w-sm">
          &ldquo;The fastest way to ship a component library that doesn&apos;t look
          like every other component library.&rdquo;
          <footer className="not-italic font-bold mt-2 text-sm">— Sam P, Forge</footer>
        </blockquote>
        <div className="text-black/60 text-xs">© 2026 Mjolnir Design Studios</div>
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, rgba(0,0,0,0.4) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Form */}
      <div className="flex flex-col justify-center p-8 lg:p-16 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-black mb-2">Welcome back</h1>
        <p className="text-sm text-gray-400 mb-8">Sign in to continue building.</p>

        <div className="space-y-3 mb-4">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-sm font-semibold hover:border-zinc-500 transition">
            Continue with Google
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-sm font-semibold hover:border-zinc-500 transition">
            Continue with GitHub
          </button>
        </div>

        <div className="text-center text-xs text-gray-500 my-3">— or —</div>

        <input
          type="email"
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm outline-none focus:border-[#FFCC11]/40 mb-3"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm outline-none focus:border-[#FFCC11]/40 mb-4"
        />
        <button className="w-full px-4 py-2.5 rounded-xl bg-[#FFCC11] text-black font-bold text-sm">
          Sign in
        </button>

        <div className="text-xs text-gray-500 mt-6 text-center">
          New here? <span className="text-[#FFCC11]">Create an account</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   5. Documentation Site
   ──────────────────────────────────────────────────────── */
export function DocsTemplate() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] min-h-[600px] bg-black text-white">
      {/* TOC */}
      <aside className="hidden lg:block border-r border-zinc-800/60 p-4 text-xs">
        <div className="font-bold uppercase tracking-wider text-gray-500 mb-3">Get started</div>
        <ul className="space-y-2 mb-5">
          {["Introduction", "Installation", "CLI Reference", "MCP Agent"].map((t, i) => (
            <li
              key={t}
              className={`flex items-center gap-2 ${
                i === 0 ? "text-[#FFCC11]" : "text-gray-400"
              }`}
            >
              <BookOpen size={11} /> {t}
            </li>
          ))}
        </ul>
        <div className="font-bold uppercase tracking-wider text-gray-500 mb-3">Foundation</div>
        <ul className="space-y-2">
          {["Colors", "Typography", "Tokens", "Icons"].map((t) => (
            <li key={t} className="flex items-center gap-2 text-gray-400">
              <FileText size={11} /> {t}
            </li>
          ))}
        </ul>
      </aside>

      {/* Article */}
      <article className="px-6 lg:px-12 py-10">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          Get Started › Introduction
        </div>
        <h1 className="text-3xl md:text-5xl font-black mb-4">Introduction</h1>
        <p className="text-gray-400 leading-relaxed mb-4">
          MjolnirUI is a premium React component library with built-in design tools
          and AI assistance. This guide walks you through the philosophy and the
          quickest path to shipping.
        </p>
        <h2 className="text-xl font-bold mt-8 mb-3">Philosophy</h2>
        <p className="text-gray-400 leading-relaxed mb-4">
          Components should look like a designer made them. APIs should look like a
          senior engineer wrote them. The library does both.
        </p>
        <h2 className="text-xl font-bold mt-8 mb-3">Quickstart</h2>
        <pre className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-xs font-mono text-[#FFCC11] overflow-x-auto mb-6">
          <code>npx mjolnirui@latest add aurora-text</code>
        </pre>
        <div className="flex items-center justify-between text-xs text-gray-500 pt-6 border-t border-zinc-800/60">
          <span>← Last page</span>
          <span className="flex items-center gap-1 text-[#FFCC11]">
            Installation <ChevronRight size={11} />
          </span>
        </div>
      </article>

      {/* Outline */}
      <aside className="hidden lg:block border-l border-zinc-800/60 p-4 text-xs">
        <div className="font-bold uppercase tracking-wider text-gray-500 mb-3">
          On this page
        </div>
        <ul className="space-y-2">
          {["Philosophy", "Quickstart", "Tech stack", "Tier model"].map((t, i) => (
            <li
              key={t}
              className={`flex items-center gap-2 ${
                i === 0 ? "text-white" : "text-gray-500"
              }`}
            >
              <Hash size={10} /> {t}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
