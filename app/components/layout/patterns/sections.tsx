// app/components/layout/patterns/sections.tsx
// Live preview components for each section pattern in the LAYOUT_CATALOG.
"use client";

import React from "react";
import {
  Zap, Sparkles, Shield, Cpu, Check, Star, Quote, Hammer,
  TrendingUp, Users, Clock, Globe,
} from "lucide-react";

/* ── Hero — Centered ─────────────────────────────────────── */
export function HeroCentered() {
  return (
    <section className="text-center py-24 px-6 max-w-4xl mx-auto">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFCC11]/15 border border-[#FFCC11]/30 text-[#FFCC11] text-xs font-semibold uppercase tracking-wider mb-6">
        <Sparkles size={12} /> New: OdinAI is live
      </span>
      <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
        Build something <span className="text-[#FFCC11]">Asgardian</span>
      </h1>
      <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
        Premium React components, GLSL shaders, and an agentic UI designer — all in one
        place. Set up in 60 seconds, ship in days.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <button className="px-6 py-3 rounded-xl bg-[#FFCC11] text-black font-bold hover:bg-[#FFD700] transition">
          Get started
        </button>
        <button className="px-6 py-3 rounded-xl border border-zinc-700 text-white font-bold hover:border-zinc-500 transition">
          Live demo
        </button>
      </div>
    </section>
  );
}

/* ── Hero — Split ────────────────────────────────────────── */
export function HeroSplit() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20 px-6 max-w-6xl mx-auto">
      <div>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/30 text-[#00f0ff] text-[10px] font-semibold uppercase tracking-wider mb-5">
          <Zap size={11} /> Forged in Asgard
        </span>
        <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
          Built for builders
        </h1>
        <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
          Drop-in components that actually look like a designer made them. No template
          smell, no dependency soup.
        </p>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-xl bg-[#FFCC11] text-black font-bold">
            Start free
          </button>
          <button className="px-6 py-3 rounded-xl border border-zinc-700 text-white font-bold">
            Browse library
          </button>
        </div>
      </div>
      <div className="aspect-square rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-30" style={{
          background: "radial-gradient(circle at 30% 30%, #FFCC11 0%, transparent 50%), radial-gradient(circle at 70% 70%, #00f0ff 0%, transparent 50%)",
        }} />
        <Hammer size={64} className="text-[#FFCC11]/50" />
      </div>
    </section>
  );
}

/* ── Hero — Full Bleed ───────────────────────────────────── */
export function HeroFullBleed() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient stand-in */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, #7C3AED 0%, #1e1b4b 40%, #020617 80%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
      <div className="relative text-center px-6 max-w-3xl">
        <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-4 text-white">
          MJOLNIR
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-lg leading-relaxed mb-8">
          Whosoever holds this hammer, if they be worthy, shall possess the power of
          shipping great UI.
        </p>
        <button className="px-8 py-3.5 rounded-xl bg-[#FFCC11] text-black font-bold text-lg hover:bg-[#FFD700] transition">
          Claim your power
        </button>
      </div>
    </section>
  );
}

/* ── Features — 3 Column ─────────────────────────────────── */
const FEATURES = [
  {
    icon: Zap,
    title: "Lightning fast",
    body: "Pure CSS where possible. Lazy-loaded shaders. Zero bloat, zero compromises.",
  },
  {
    icon: Shield,
    title: "Type-safe end to end",
    body: "TypeScript discriminated unions. Compile-time guarantees, runtime safety.",
  },
  {
    icon: Cpu,
    title: "AI-augmented",
    body: "OdinAI composes layouts, palettes, and entire pages from natural language.",
  },
];
export function FeaturesThreeCol() {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-black mb-3">Why MjolnirUI</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          The three reasons developers stay after the free trial.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-[#FFCC11]/30 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FFCC11]/15 border border-[#FFCC11]/30 flex items-center justify-center mb-4">
              <f.icon size={20} className="text-[#FFCC11]" />
            </div>
            <h3 className="text-lg font-bold mb-2">{f.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Features — Bento ────────────────────────────────────── */
export function FeaturesBento() {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-5xl font-black mb-8 text-center">Everything you need</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-3 md:h-[440px]">
        <div className="md:row-span-2 rounded-2xl border border-[#FFCC11]/30 bg-gradient-to-br from-[#FFCC11]/10 to-transparent p-6 flex flex-col justify-between">
          <Hammer size={32} className="text-[#FFCC11]" />
          <div>
            <h3 className="text-2xl font-bold mb-2">Component Library</h3>
            <p className="text-sm text-gray-400">90+ premium React components ready to ship.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <Sparkles size={18} className="text-[#00f0ff] mb-3" />
          <h3 className="font-bold mb-1">Shader Engine</h3>
          <p className="text-xs text-gray-400">GLSL backgrounds with live uniforms.</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <Cpu size={18} className="text-[#10B981] mb-3" />
          <h3 className="font-bold mb-1">OdinAI</h3>
          <p className="text-xs text-gray-400">Agentic UI designer.</p>
        </div>
        <div className="md:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold mb-1">Token system</h3>
            <p className="text-xs text-gray-400">Export to CSS, Tailwind, W3C JSON, Figma.</p>
          </div>
          <Zap size={28} className="text-[#FFCC11]" />
        </div>
      </div>
    </section>
  );
}

/* ── Pricing — 3 Tier ────────────────────────────────────── */
const TIERS = [
  { name: "Base", price: 10, features: ["Component library", "Background Studio", "Email support"], featured: false, color: "#10B981" },
  { name: "Pro", price: 25, features: ["Everything in Base", "Shader Tool + Engine", "OdinAI access", "Commercial license"], featured: true, color: "#FFCC11" },
  { name: "Elite", price: 50, features: ["Everything in Pro", "Source code access", "Priority support", "Unlimited saves"], featured: false, color: "#F97316" },
];
export function PricingThreeTier() {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-black mb-3">Simple pricing</h2>
        <p className="text-gray-400">Upgrade any time. Cancel any time.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className="rounded-2xl border p-6 flex flex-col"
            style={{
              borderColor: t.featured ? t.color : "rgba(63,63,70,0.6)",
              transform: t.featured ? "scale(1.03)" : undefined,
              backgroundColor: t.featured ? `${t.color}08` : "transparent",
            }}
          >
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">{t.name}</div>
            <div className="text-4xl font-black mb-1" style={{ color: t.color }}>
              ${t.price}
              <span className="text-sm text-gray-500 font-normal">/mo</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-400 my-6 flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={14} className="text-[#10B981] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className="w-full px-4 py-2.5 rounded-xl font-bold transition"
              style={{
                backgroundColor: t.featured ? t.color : "transparent",
                color: t.featured ? "#000" : t.color,
                border: t.featured ? "none" : `1px solid ${t.color}40`,
              }}
            >
              Choose {t.name}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Testimonials — Grid ─────────────────────────────────── */
const TESTIMONIALS = [
  { id: 1, quote: "Shipped my landing page in 4 hours. The aurora text alone is worth the Pro upgrade.", name: "Riley Chen", role: "Indie hacker" },
  { id: 2, quote: "The shader catalog is unreal. Better than React Bits, with a more cohesive aesthetic.", name: "Sam Petrov", role: "Design engineer" },
  { id: 3, quote: "OdinAI generated three pricing variants for me. Picked the best, tweaked it, done.", name: "Avery Olsen", role: "Founder, Forge" },
];
export function TestimonialsGrid() {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-5xl font-black text-center mb-12">What people say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
          >
            <Quote size={20} className="text-[#FFCC11] mb-3 opacity-40" />
            <blockquote className="text-sm text-gray-300 leading-relaxed mb-5">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFCC11] to-[#00f0ff]" />
              <div>
                <div className="text-sm font-bold">{t.name}</div>
                <div className="text-xs text-gray-500">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ── CTA Banner ──────────────────────────────────────────── */
export function CtaBanner() {
  return (
    <section className="px-6 py-12 max-w-6xl mx-auto">
      <div className="rounded-3xl bg-gradient-to-br from-[#FFCC11] via-[#FFD700] to-[#F97316] text-black p-12 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-3">Ready to build?</h2>
        <p className="text-black/80 mb-6 max-w-xl mx-auto">
          Start free, no credit card. Upgrade when you ship.
        </p>
        <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-black text-white font-bold text-lg hover:bg-zinc-900 transition">
          Get started <Star size={16} />
        </button>
      </div>
    </section>
  );
}

/* ── Stats — 4 Up ────────────────────────────────────────── */
const STATS = [
  { value: "90+", label: "Components", icon: Hammer },
  { value: "12K", label: "Active users", icon: Users },
  { value: "99.99%", label: "Uptime", icon: TrendingUp },
  { value: "<2s", label: "First paint", icon: Clock },
];
export function StatsFourUp() {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <s.icon size={20} className="text-[#FFCC11] mx-auto mb-2 opacity-60" />
            <div className="text-4xl md:text-5xl font-black text-[#FFCC11] tabular-nums">
              {s.value}
            </div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── FAQ ─────────────────────────────────────────────────── */
const FAQ = [
  { q: "How do I install MjolnirUI?", a: "Sign up, pick a tier, and use the CLI (npx mjolnirui add) or copy-paste from the library." },
  { q: "Can I use components in commercial projects?", a: "Pro and Elite tiers include a commercial license. Free and Base are for personal use." },
  { q: "Do you support Next.js 15+?", a: "Yes — every component targets React 19 + Next.js 16+. Older versions work but aren't officially supported." },
  { q: "How does OdinAI billing work?", a: "Each Pro+ plan includes a monthly token quota. Overage bills at cost + 10%, capped at your configured limit." },
];
export function FaqAccordion() {
  return (
    <section className="max-w-3xl mx-auto py-20 px-6">
      <h2 className="text-3xl md:text-5xl font-black mb-8 text-center">FAQ</h2>
      <div className="space-y-3">
        {FAQ.map((q) => (
          <details
            key={q.q}
            className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 open:border-[#FFCC11]/30 transition"
          >
            <summary className="cursor-pointer font-semibold flex items-center justify-between gap-3">
              <span>{q.q}</span>
              <span className="text-[#FFCC11] text-xl group-open:rotate-45 transition shrink-0">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">{q.a}</p>
          </details>
        ))}
      </div>
      <div className="mt-8 text-center text-xs text-gray-500 flex items-center gap-2 justify-center">
        <Globe size={12} /> Still have questions? Email support@mjolnirdesignstudios.com
      </div>
    </section>
  );
}
