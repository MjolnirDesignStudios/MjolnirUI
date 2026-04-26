// Documentation Hub — index page for the GET STARTED section
// Free tier — visible to all signed-in users
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen, Download, Terminal, Cpu, Sparkles, Bot,
  ArrowRight, Coins, Layers, Zap, ShieldCheck,
} from "lucide-react";

type DocCard = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
};

const sections: DocCard[] = [
  {
    title: "Introduction",
    description: "What MjolnirUI is, who it's for, and how it fits into your workflow.",
    href: "/blocks/docs/intro",
    icon: BookOpen,
  },
  {
    title: "Installation",
    description: "Set up MjolnirUI in a Next.js project — copy/paste, manual install, and CLI options.",
    href: "/blocks/docs/install",
    icon: Download,
  },
  {
    title: "CLI Reference",
    description: "Add components straight from your terminal. Coming soon.",
    href: "/blocks/docs/cli",
    icon: Terminal,
    badge: "Coming Soon",
  },
  {
    title: "MCP / AI Agent",
    description: "OdinAI — agentic UI/UX designer with MCP support. Pro tier and above.",
    href: "/blocks/docs/mcp",
    icon: Cpu,
    badge: "Pro",
  },
];

const procedural = [
  { step: "01", title: "Sign up & pick a tier", desc: "Free, Base, Pro, or Elite — upgrade any time from your account." },
  { step: "02", title: "Install MjolnirUI", desc: "Add it to a Next.js + Tailwind project. CLI, copy/paste, or manual." },
  { step: "03", title: "Browse the library", desc: "Backgrounds, animations, text effects, shaders, particles, and more." },
  { step: "04", title: "Compose & export", desc: "Tweak in studio tools, copy code, drop into your app." },
  { step: "05", title: "(Pro+) Call OdinAI", desc: "Hand off design tasks to the agent via MCP — Claude under the hood." },
];

export default function DocumentationHub() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* ── Header ───────────────────────────────────────── */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Documentation</h1>
        <p className="text-lg text-gray-400 max-w-2xl">
          Everything you need to ship Asgardian-grade interfaces with MjolnirUI — install, components, and the OdinAI agent.
        </p>
      </div>

      {/* ── Quick links grid ─────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sections.map((card, idx) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Link
                href={card.href}
                className="group relative block bg-linear-to-br from-zinc-900 to-black border border-zinc-800/60 hover:border-[#FFCC11]/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,204,17,0.12)]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFCC11]/10 border border-[#FFCC11]/20 flex items-center justify-center shrink-0 group-hover:bg-[#FFCC11]/20 transition">
                    <card.icon size={22} className="text-[#FFCC11]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">{card.title}</h3>
                      {card.badge && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFCC11]/15 text-[#FFCC11] border border-[#FFCC11]/30">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{card.description}</p>
                  </div>
                  <ArrowRight size={18} className="text-gray-600 group-hover:text-[#FFCC11] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Procedural outline ───────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">How it works — 5-minute path</h2>
        <ol className="space-y-3">
          {procedural.map((p) => (
            <li
              key={p.step}
              className="flex items-start gap-4 bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4"
            >
              <span className="font-mono text-2xl font-black text-[#FFCC11]/60 shrink-0">{p.step}</span>
              <div>
                <h3 className="text-base font-semibold text-white">{p.title}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{p.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Token usage primer ───────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Token Usage Primer</h2>
        <div className="bg-linear-to-br from-zinc-900/50 via-black to-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6 md:p-8 space-y-5">
          <div className="flex items-start gap-4">
            <Coins size={22} className="text-[#FFCC11] shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-bold text-white mb-1">What is a token?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                When you call <span className="text-white font-semibold">OdinAI</span> (Pro+), the agent uses
                Anthropic&apos;s Claude under the hood. <span className="text-white">Tokens</span> are the
                billing unit for AI usage — roughly 4 characters of English ≈ 1 token. Each request consumes
                <span className="text-white"> input tokens</span> (your prompt + context) and
                <span className="text-white"> output tokens</span> (Claude&apos;s response).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-black/40 border border-zinc-800/60 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot size={16} className="text-[#FFCC11]" />
                <h4 className="text-sm font-bold text-white">OdinAI (Pro+)</h4>
              </div>
              <p className="text-xs text-gray-400">
                Each tier includes a monthly token quota. Pro: 1M tokens/month. Elite: 5M tokens/month + priority queue.
              </p>
            </div>
            <div className="bg-black/40 border border-zinc-800/60 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-[#FFCC11]" />
                <h4 className="text-sm font-bold text-white">Claude Models</h4>
              </div>
              <p className="text-xs text-gray-400">
                Pro defaults to Claude Sonnet (balanced). Elite can opt into Opus for deep reasoning. Token cost varies by model.
              </p>
            </div>
            <div className="bg-black/40 border border-zinc-800/60 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-[#FFCC11]" />
                <h4 className="text-sm font-bold text-white">Overage</h4>
              </div>
              <p className="text-xs text-gray-400">
                Beyond your monthly quota, additional tokens bill at cost + 10%. Hard cap configurable from your account.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/blocks/docs/mcp"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#FFCC11] hover:text-[#FFD700] transition"
            >
              Learn more about OdinAI &amp; MCP
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────── */}
      <section className="text-center bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-8">
        <Layers size={28} className="text-[#FFCC11] mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-2">Ready to build?</h3>
        <p className="text-sm text-gray-400 mb-4 max-w-md mx-auto">
          Skip the docs and dive straight into the component library.
        </p>
        <Link
          href="/blocks/browse"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFCC11] text-black font-semibold text-sm hover:bg-[#FFD700] transition"
        >
          <Zap size={16} />
          Open Component Library
        </Link>
      </section>
    </div>
  );
}
