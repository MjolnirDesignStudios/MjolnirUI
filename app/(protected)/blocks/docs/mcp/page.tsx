// MCP / AI Agent — OdinAI integration overview
// Pro tier paywall: Free/Base see upgrade screen; Pro+/Elite see full content
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Cpu, Bot, Sparkles, Lock, ArrowRight, Coins, Shield,
  Network, Code2, BookOpen, Zap, Crown, Copy, Check,
} from "lucide-react";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";
import { TierBadge } from "@/components/Dashboards/TierBadge";

/* ── Reusable code block with copy ──────────────────── */
function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group">
      <pre className="bg-black/60 border border-zinc-800 rounded-xl p-4 pr-14 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
        <code className={`language-${lang}`}>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-[#FFCC11]/40 transition opacity-0 group-hover:opacity-100"
      >
        {copied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} className="text-gray-400" />}
      </button>
    </div>
  );
}

/* ── Locked screen for free/base users ──────────────── */
function LockedView({ userTier }: { userTier: TierName }) {
  const [open, setOpen] = useState(false);
  const proConfig = getTierConfig("pro");

  return (
    <div className="max-w-3xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-linear-to-br from-zinc-900 via-black to-zinc-900 border rounded-3xl p-10 md:p-14 text-center"
        style={{ borderColor: `${proConfig.color}40` }}
      >
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 0%, ${proConfig.color}30 0%, transparent 60%)` }}
        />

        <div className="relative">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
            style={{
              backgroundColor: `${proConfig.color}20`,
              border: `1px solid ${proConfig.color}40`,
              boxShadow: `0 0 50px ${proConfig.color}30`,
            }}
          >
            <Lock size={32} style={{ color: proConfig.color }} />
          </div>

          <div className="flex items-center justify-center gap-2 mb-3">
            <Cpu size={18} className="text-gray-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">MCP / AI Agent</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            OdinAI is a <span style={{ color: proConfig.color }}>Pro</span> feature
          </h1>
          <p className="text-base text-gray-400 max-w-xl mx-auto mb-2 leading-relaxed">
            The agentic UI/UX designer + MCP-native API access is included with{" "}
            <span className="text-white font-semibold">MjolnirUI Pro</span> and{" "}
            <span className="text-white font-semibold">Elite</span>.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Your current plan: <TierBadge tier={userTier} size="sm" />
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 max-w-2xl mx-auto">
            {[
              { icon: Bot, title: "OdinAI Agent", desc: "Claude-powered design pair" },
              { icon: Network, title: "MCP Endpoint", desc: "Plug into Claude Desktop" },
              { icon: Coins, title: "1M tokens/mo", desc: "Scales with Elite" },
            ].map((perk) => (
              <div key={perk.title} className="bg-black/40 border border-zinc-800/60 rounded-xl p-4">
                <perk.icon size={20} className="text-[#FFCC11] mx-auto mb-2" />
                <h3 className="text-xs font-bold text-white mb-0.5">{perk.title}</h3>
                <p className="text-[11px] text-gray-500">{perk.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition"
            style={{ backgroundColor: proConfig.color, color: "#000" }}
          >
            <Crown size={16} />
            Upgrade to Pro
            <ArrowRight size={16} />
          </button>

          <div className="mt-6">
            <Link
              href="/blocks/docs"
              className="text-xs text-gray-500 hover:text-gray-300 transition"
            >
              ← Back to Documentation
            </Link>
          </div>
        </div>
      </motion.div>

      <UpgradeModal
        isOpen={open}
        onClose={() => setOpen(false)}
        requiredTier="pro"
        featureName="MCP / OdinAI Agent"
      />
    </div>
  );
}

/* ── Pillar card ────────────────────────────────────── */
function Pillar({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} className="text-[#FFCC11]" />
        <h3 className="text-base font-bold text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed">{children}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */
export default function McpAgentPage() {
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || "free";
  const hasProAccess = hasAccess(userTier, "pro");

  if (!hasProAccess) {
    return <LockedView userTier={userTier} />;
  }

  /* ── Pro+ view ─────────────────────────────────────── */
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Cpu size={18} className="text-[#FFCC11]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Get Started</span>
          <TierBadge tier="pro" size="sm" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          MCP &amp; OdinAI Agent
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
          OdinAI is MjolnirUI&apos;s in-house design agent — Claude-powered, MCP-native, and trained on every
          component, shader, and design token in our library. Plug it into Claude Desktop or call it directly
          from your IDE.
        </p>
      </motion.div>

      {/* What is MCP */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">What is MCP?</h2>
        <p className="text-sm text-gray-300 leading-relaxed mb-3">
          The <span className="text-white font-semibold">Model Context Protocol</span> (MCP) is an open standard
          from Anthropic that lets AI agents connect to external tools — file systems, APIs, databases, and
          design libraries — through a uniform interface.
        </p>
        <p className="text-sm text-gray-300 leading-relaxed">
          MjolnirUI ships an <span className="text-[#FFCC11] font-semibold">MCP server</span> that exposes our
          full component registry, shader presets, and design tokens to any MCP-compatible client. That means
          Claude Desktop, Cursor, Zed, and any other tool with an MCP client can <span className="text-white">add components, generate themes, or compose shaders</span> on your behalf — using the live MjolnirUI catalog.
        </p>
      </section>

      {/* Pillars */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">What you get with OdinAI</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Pillar icon={Bot} title="Agentic UI Designer">
            Hand off entire design tasks. &quot;Build me a pricing page with electric borders, aurora text, and a Bifrost shader background&quot; — OdinAI composes, previews, and exports.
          </Pillar>
          <Pillar icon={Network} title="MCP Server Endpoint">
            One config line in Claude Desktop and you&apos;re calling MjolnirUI tools natively from any chat. Component install, shader tweak, theme switch — all through Claude.
          </Pillar>
          <Pillar icon={Sparkles} title="Component-Aware Context">
            OdinAI knows every component&apos;s API, dependencies, and styling tokens. No hallucinated props, no broken imports.
          </Pillar>
          <Pillar icon={Shield} title="Sandboxed Execution">
            Runs in isolated Vercel Sandbox microVMs. Generated code is verified, type-checked, and previewed before it ever touches your repo.
          </Pillar>
        </div>
      </section>

      {/* Quickstart */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">Quickstart — connect Claude Desktop</h2>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          Add this to your <code className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-[#00f0ff] font-mono">~/.config/claude/claude_desktop_config.json</code> (macOS/Linux) or the equivalent on Windows:
        </p>
        <CodeBlock
          code={`{
  "mcpServers": {
    "mjolnirui": {
      "url": "https://mcp.mjolnirui.com/sse",
      "headers": {
        "Authorization": "Bearer <YOUR_PRO_API_KEY>"
      }
    }
  }
}`}
        />
        <p className="text-xs text-gray-500 mt-3">
          Generate your API key from{" "}
          <Link href="/blocks/account/profile" className="text-[#FFCC11] hover:underline">Account → API Keys</Link>.
          Restart Claude Desktop. OdinAI tools appear in the MCP menu.
        </p>
      </section>

      {/* Token usage */}
      <section className="bg-linear-to-br from-zinc-900/50 via-black to-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Coins size={20} className="text-[#FFCC11]" />
          Token usage &amp; quotas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="bg-black/40 border border-zinc-800/60 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pro</div>
            <div className="text-2xl font-black text-white">1M <span className="text-sm font-normal text-gray-500">tokens / mo</span></div>
            <p className="text-[11px] text-gray-500 mt-2">Claude Sonnet · 1 priority queue</p>
          </div>
          <div className="bg-black/40 border border-zinc-800/60 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Elite</div>
            <div className="text-2xl font-black text-white">5M <span className="text-sm font-normal text-gray-500">tokens / mo</span></div>
            <p className="text-[11px] text-gray-500 mt-2">Sonnet + Opus · concurrent priority</p>
          </div>
          <div className="bg-black/40 border border-zinc-800/60 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Overage</div>
            <div className="text-2xl font-black text-white">cost + 10%</div>
            <p className="text-[11px] text-gray-500 mt-2">Hard cap configurable in account</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          A <span className="text-white">token</span> is roughly 4 characters of English. Every OdinAI request
          spends input tokens (your prompt + context window) + output tokens (the agent&apos;s response). A
          typical &quot;build me a hero section&quot; round-trip uses 8k–25k tokens.
        </p>
      </section>

      {/* Roadmap */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">On the roadmap</h2>
        <ul className="space-y-2">
          {[
            "OdinAI Sandbox preview (Vercel Sandbox + live HMR)",
            "Voice mode — design via dictation, integrated with ElevenLabs",
            "Team-mode quotas with shared token pools (Elite Studios)",
            "Visual design ↔ code reconciliation (Figma round-trip)",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2 text-sm text-gray-300">
              <Zap size={14} className="text-[#FFCC11] shrink-0 mt-1" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Back */}
      <section className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/blocks/docs"
          className="flex-1 group inline-flex items-center justify-between gap-2 px-5 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-semibold hover:border-[#FFCC11]/40 transition"
        >
          <span className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#FFCC11]" />
            Back to Documentation
          </span>
          <ArrowRight size={16} className="text-gray-500 group-hover:text-[#FFCC11] group-hover:translate-x-1 transition" />
        </Link>
        <Link
          href="/blocks/account/profile"
          className="flex-1 group inline-flex items-center justify-between gap-2 px-5 py-4 rounded-xl bg-[#FFCC11] text-black font-semibold hover:bg-[#FFD700] transition"
        >
          <span className="flex items-center gap-2">
            <Code2 size={16} />
            Generate API Key
          </span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
        </Link>
      </section>
    </div>
  );
}
