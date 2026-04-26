// Introduction — what MjolnirUI is and who it's for
// Free tier — visible to all signed-in users
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen, Sparkles, Layers, Box, Bot, Zap,
  ArrowRight, Hammer, Code2, Palette, Wand2,
} from "lucide-react";

const pillars = [
  {
    icon: Sparkles,
    title: "Component Library",
    desc: "Premium React components — Aurora text, electric borders, shimmer buttons, flip cards, and more. Copy-paste or install via CLI.",
  },
  {
    icon: Layers,
    title: "Background Studio",
    desc: "Animated gradient meshes, particle fields, aurora waves, and Perlin noise canvases. Tweak in real-time, copy code.",
  },
  {
    icon: Wand2,
    title: "Shader Tool",
    desc: "GLSL shader playground — Bifrost tunnels, electric fields, fractal flames. Live uniform sliders, code export.",
  },
  {
    icon: Box,
    title: "Particle Engine",
    desc: "tsparticles-powered designer with geometric shapes, link networks, and interactivity. Pro+.",
  },
  {
    icon: Hammer,
    title: "3D Forge",
    desc: "Image-to-3D model generation, asset preview, and printing-ready exports. Pro+.",
  },
  {
    icon: Bot,
    title: "OdinAI Agent",
    desc: "Agentic UI/UX designer powered by Claude. Calls MjolnirUI components via MCP. Elite tier.",
  },
];

const audience = [
  "Indie devs shipping startup MVPs who want premium aesthetics without writing CSS animations from scratch",
  "Design-engineers who copy from React Bits / Magic UI but want a more cohesive Asgardian / electric theme",
  "Studios building landing pages, marketing sites, and dashboards on Next.js + Tailwind",
  "Vibe-coders pairing with AI agents and want a component library the agent can actually use (MCP-native)",
];

export default function IntroductionPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* ── Hero ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} className="text-[#FFCC11]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Get Started</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Introduction</h1>
        <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
          MjolnirUI is a premium React component library and design-tool platform — built for developers who want
          their interfaces to <span className="text-white">look forged in a dying star</span>, not pulled from a
          generic boilerplate.
        </p>
      </motion.div>

      {/* ── What it is ──────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">What is MjolnirUI?</h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            MjolnirUI is the companion site to <span className="text-[#FFCC11] font-semibold">Mjolnir Design
            Studios</span> — a full-stack design platform offering React components, GLSL shader tools, particle
            designers, 3D modeling utilities, and an AI agent (OdinAI) that ties them all together.
          </p>
          <p>
            Think of it as <span className="text-white font-semibold">React Bits</span> meets{" "}
            <span className="text-white font-semibold">Magic UI</span> — but with a cohesive Norse-mythology
            aesthetic, electric/cyan accents, and Asgardian gold (#FFCC11) running through every component.
          </p>
          <p>
            Every piece is built on the same stack you&apos;re probably already using: Next.js 16, React 19,
            Tailwind CSS v4, Framer Motion, Three.js, and TypeScript end-to-end.
          </p>
        </div>
      </section>

      {/* ── Pillars ─────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">The six pillars</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pillars.map((p, idx) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <p.icon size={18} className="text-[#FFCC11]" />
                <h3 className="text-base font-bold text-white">{p.title}</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Who it's for ────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Who is it for?</h2>
        <ul className="space-y-2">
          {audience.map((line, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
              <Zap size={14} className="text-[#FFCC11] shrink-0 mt-1" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Tech stack ──────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Built on</h2>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            "Next.js 16",
            "React 19",
            "TypeScript 5",
            "Tailwind CSS v4",
            "Framer Motion 12",
            "Three.js + R3F",
            "tsparticles",
            "Radix + shadcn/ui",
            "Stripe + Supabase",
          ].map((tech) => (
            <div key={tech} className="flex items-center gap-2 text-gray-400">
              <Code2 size={14} className="text-[#00f0ff]" />
              <span>{tech}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Norse copy moment ───────────────────────────── */}
      <section className="bg-linear-to-br from-[#FFCC11]/5 via-transparent to-[#00f0ff]/5 border border-[#FFCC11]/20 rounded-2xl p-8 text-center">
        <Palette size={28} className="text-[#FFCC11] mx-auto mb-3" />
        <p className="text-base md:text-lg text-white font-semibold mb-1">
          &ldquo;Whosoever holds this hammer, if he be worthy, shall possess the power of Thor.&rdquo;
        </p>
        <p className="text-xs text-gray-500 italic">— and a really clean component library</p>
      </section>

      {/* ── Next ────────────────────────────────────────── */}
      <section className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/blocks/docs/install"
          className="flex-1 group inline-flex items-center justify-between gap-2 px-5 py-4 rounded-xl bg-[#FFCC11] text-black font-semibold hover:bg-[#FFD700] transition"
        >
          <span className="flex items-center gap-2">
            <BookOpen size={16} />
            Next: Installation
          </span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
        </Link>
        <Link
          href="/blocks/browse"
          className="flex-1 group inline-flex items-center justify-between gap-2 px-5 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-semibold hover:border-[#FFCC11]/40 transition"
        >
          <span className="flex items-center gap-2">
            <Layers size={16} className="text-[#FFCC11]" />
            Skip to the Library
          </span>
          <ArrowRight size={16} className="text-gray-500 group-hover:text-[#FFCC11] group-hover:translate-x-1 transition" />
        </Link>
      </section>
    </div>
  );
}
