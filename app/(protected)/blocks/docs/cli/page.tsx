// CLI Reference — Coming Soon stub
// Free tier — visible to all signed-in users
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, Clock, ArrowRight, Bell, Github, Hammer, BookOpen } from "lucide-react";

const plannedCommands = [
  {
    cmd: "mjolnirui init",
    desc: "Bootstrap MjolnirUI in an existing Next.js project — adds peer deps, cn() helper, and theme tokens.",
  },
  {
    cmd: "mjolnirui add <component>",
    desc: "Add a single component (Aurora text, Bifrost shader, etc.) with all its dependencies into app/components/.",
  },
  {
    cmd: "mjolnirui list",
    desc: "Browse the component registry from your terminal — filter by category, tier, and tech stack.",
  },
  {
    cmd: "mjolnirui upgrade",
    desc: "Pull the latest version of installed components without overwriting your local edits (3-way merge).",
  },
  {
    cmd: "mjolnirui theme",
    desc: "Switch between Asgard, Bifrost, Storm, and Valhalla preset themes — rewrites your token CSS variables.",
  },
  {
    cmd: "mjolnirui doctor",
    desc: "Diagnose your install — checks Tailwind config, peer deps, and TypeScript paths.",
  },
];

export default function CliReferencePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={18} className="text-[#FFCC11]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Get Started</span>
        </div>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h1 className="text-4xl md:text-5xl font-black text-white">CLI Reference</h1>
          <motion.span
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-[#FFCC11]/15 text-[#FFCC11] border border-[#FFCC11]/30"
          >
            Coming Soon
          </motion.span>
        </div>
        <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
          A first-class command-line interface for adding MjolnirUI components into any Next.js project — same
          ergonomics as <span className="text-white">shadcn/ui</span>, but with our component registry and themes.
        </p>
      </motion.div>

      {/* ── Coming soon banner ──────────────────────────── */}
      <section className="relative overflow-hidden bg-linear-to-br from-[#FFCC11]/8 via-zinc-900/40 to-[#00f0ff]/5 border border-[#FFCC11]/20 rounded-2xl p-8">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          background: "radial-gradient(circle at 20% 50%, #FFCC1122 0%, transparent 50%)",
        }} />
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFCC11]/20 border border-[#FFCC11]/30 flex items-center justify-center shrink-0">
            <Clock size={26} className="text-[#FFCC11]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Forging in progress</h2>
            <p className="text-sm text-gray-300 mb-3 leading-relaxed">
              The MjolnirUI CLI is on the v3 roadmap. Until then,{" "}
              <Link href="/blocks/browse" className="text-[#FFCC11] hover:underline font-semibold">copy/paste from the library</Link>{" "}
              works for every component. The CLI will accelerate adding 5+ components at once and keeping them in sync.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Target ship:</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[#00f0ff]">v3.0 · Q3 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Planned commands ────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">Planned commands</h2>
        <p className="text-sm text-gray-400 mb-5 leading-relaxed">
          A preview of the API we&apos;re building. Subject to change before launch — feedback welcome.
        </p>
        <div className="space-y-3">
          {plannedCommands.map((c, idx) => (
            <motion.div
              key={c.cmd}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5"
            >
              <code className="block text-base font-mono text-[#FFCC11] font-semibold mb-2">
                $ {c.cmd}
              </code>
              <p className="text-sm text-gray-400 leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Subscribe / track ───────────────────────────── */}
      <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Bell size={18} className="text-[#FFCC11]" />
          Get notified when it ships
        </h2>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          Pro and Elite subscribers get early access to the CLI before public release. Already on a paid tier?
          You&apos;re on the list. Otherwise, follow along on GitHub.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://github.com/MjolnirDesignStudios/MjolnirUI"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-semibold text-sm hover:border-[#FFCC11]/40 transition"
          >
            <Github size={16} />
            Watch on GitHub
            <ArrowRight size={14} className="text-gray-500 group-hover:text-[#FFCC11] group-hover:translate-x-1 transition" />
          </a>
          <Link
            href="/pricing"
            className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FFCC11] text-black font-semibold text-sm hover:bg-[#FFD700] transition"
          >
            <Hammer size={16} />
            View Pricing &amp; Tiers
          </Link>
        </div>
      </section>

      {/* ── Back ────────────────────────────────────────── */}
      <section className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/blocks/docs/install"
          className="flex-1 group inline-flex items-center justify-between gap-2 px-5 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-semibold hover:border-[#FFCC11]/40 transition"
        >
          <span className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#FFCC11]" />
            Back to Installation
          </span>
          <ArrowRight size={16} className="text-gray-500 group-hover:text-[#FFCC11] group-hover:translate-x-1 transition" />
        </Link>
        <Link
          href="/blocks/docs/mcp"
          className="flex-1 group inline-flex items-center justify-between gap-2 px-5 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-semibold hover:border-[#FFCC11]/40 transition"
        >
          <span className="flex items-center gap-2">
            <Terminal size={16} className="text-[#FFCC11]" />
            Next: MCP / OdinAI
          </span>
          <ArrowRight size={16} className="text-gray-500 group-hover:text-[#FFCC11] group-hover:translate-x-1 transition" />
        </Link>
      </section>
    </div>
  );
}
