// Installation — set up MjolnirUI in a Next.js project
// Free tier — visible to all signed-in users
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Download, Terminal, Copy, Check, ArrowRight,
  PackageCheck, Sparkles, AlertTriangle, BookOpen,
} from "lucide-react";

/* ── Reusable code block with copy button ───────────── */
function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
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

const requirements = [
  { name: "Node.js", version: "≥ 20.x" },
  { name: "Next.js", version: "≥ 14 (15/16 recommended)" },
  { name: "React", version: "≥ 18 (19 recommended)" },
  { name: "Tailwind CSS", version: "≥ 3 (v4 recommended)" },
  { name: "TypeScript", version: "Optional but encouraged" },
];

export default function InstallationPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Download size={18} className="text-[#FFCC11]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Get Started</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Installation</h1>
        <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
          Three ways to bring MjolnirUI into your project. Pick the one that matches your workflow — they all work
          and you can mix and match later.
        </p>
      </motion.div>

      {/* ── Requirements ────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl divide-y divide-zinc-800/50">
          {requirements.map((r) => (
            <div key={r.name} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <PackageCheck size={16} className="text-[#10B981]" />
                <span className="text-sm font-semibold text-white">{r.name}</span>
              </div>
              <span className="text-sm font-mono text-gray-400">{r.version}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Method 1: CLI (coming soon) ────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">1. Install via CLI</h2>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-[#FFCC11]/15 text-[#FFCC11] border border-[#FFCC11]/30">
            Coming Soon
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-3 leading-relaxed">
          Once shipped, this will be the fastest path. Adds a single component (with all dependencies) directly
          into your project — same model as <span className="text-white">shadcn/ui</span>.
        </p>
        <CodeBlock code={`npx mjolnirui@latest add aurora-text
npx mjolnirui@latest add electric-border
npx mjolnirui@latest add bifrost`} />
        <Link
          href="/blocks/docs/cli"
          className="inline-flex items-center gap-2 mt-3 text-sm text-[#FFCC11] hover:text-[#FFD700] transition"
        >
          See the CLI Reference
          <ArrowRight size={14} />
        </Link>
      </section>

      {/* ── Method 2: Copy/paste ────────────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">2. Copy &amp; paste from the library</h2>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          Open any component in the{" "}
          <Link href="/blocks/browse" className="text-[#FFCC11] hover:underline">component library</Link>{" "}
          → click <span className="text-white">View Code</span> → paste it into your project. No install needed.
        </p>
        <ol className="space-y-3 text-sm text-gray-300 mb-4">
          <li className="flex gap-3">
            <span className="font-mono text-[#FFCC11] font-bold">01</span>
            <span>Install the component&apos;s peer dependencies (each component lists what it needs).</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-[#FFCC11] font-bold">02</span>
            <span>Drop the file into <code className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-[#00f0ff] font-mono">app/components/ui/</code>.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-[#FFCC11] font-bold">03</span>
            <span>Import and use it. Done.</span>
          </li>
        </ol>
        <CodeBlock
          lang="tsx"
          code={`import { AuroraText } from "@/components/ui/AuroraText";

export default function Page() {
  return <AuroraText>WHOSOEVER HOLDS THIS HAMMER</AuroraText>;
}`}
        />
      </section>

      {/* ── Method 3: Manual setup ──────────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">3. Manual setup (greenfield project)</h2>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          Starting from scratch? Here&apos;s the minimum stack to mirror MjolnirUI&apos;s setup.
        </p>

        <h3 className="text-base font-bold text-white mb-2">a. Bootstrap a Next.js app</h3>
        <CodeBlock code={`npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app`} />

        <h3 className="text-base font-bold text-white mb-2 mt-6">b. Install peer dependencies</h3>
        <CodeBlock code={`npm install framer-motion lucide-react clsx tailwind-merge class-variance-authority
npm install three @react-three/fiber @react-three/drei
npm install @tsparticles/react @tsparticles/slim`} />

        <h3 className="text-base font-bold text-white mb-2 mt-6">c. Add the cn() utility</h3>
        <CodeBlock
          lang="ts"
          code={`// app/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`}
        />

        <h3 className="text-base font-bold text-white mb-2 mt-6">d. Path alias</h3>
        <p className="text-sm text-gray-400 mb-2">
          MjolnirUI components import from <code className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-[#00f0ff] font-mono">@/</code> — confirm <code className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-[#00f0ff] font-mono">tsconfig.json</code> maps it to <code className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-[#00f0ff] font-mono">./app/*</code>:
        </p>
        <CodeBlock
          lang="json"
          code={`{
  "compilerOptions": {
    "paths": {
      "@/*": ["./app/*"]
    }
  }
}`}
        />
      </section>

      {/* ── Tailwind tokens ─────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">Tailwind tokens (recommended)</h2>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          MjolnirUI components use Asgardian gold and electric cyan accents. Add these to your Tailwind config so
          components render with the intended palette out of the box.
        </p>
        <CodeBlock
          lang="js"
          code={`// tailwind.config.js (or @theme in v4)
theme: {
  extend: {
    colors: {
      gold: { DEFAULT: "#FFCC11", bright: "#FFD700", bronze: "#B87333" },
      electric: "#00f0ff",
      storm: { DEFAULT: "#020617", deep: "#0a0a0f", indigo: "#0f172a" },
    },
  },
}`}
        />
      </section>

      {/* ── Gotchas ────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">Common gotchas</h2>
        <div className="space-y-3">
          {[
            { title: "Components are client-side", body: "Most MjolnirUI components rely on framer-motion or browser APIs — keep the \"use client\" directive at the top." },
            { title: "WebGL fallbacks", body: "Shader and 3D components require WebGL2. Add a graceful fallback for low-end devices using `if (!gl) return null`." },
            { title: "Mobile perf", body: "Particle counts > 150 and shader iterations > 80 hurt low-end Android. Auto-downscale via navigator.hardwareConcurrency." },
          ].map((g) => (
            <div key={g.title} className="flex gap-3 bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">{g.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{g.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Next ────────────────────────────────────────── */}
      <section className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/blocks/browse"
          className="flex-1 group inline-flex items-center justify-between gap-2 px-5 py-4 rounded-xl bg-[#FFCC11] text-black font-semibold hover:bg-[#FFD700] transition"
        >
          <span className="flex items-center gap-2">
            <Sparkles size={16} />
            Browse Components
          </span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
        </Link>
        <Link
          href="/blocks/docs/cli"
          className="flex-1 group inline-flex items-center justify-between gap-2 px-5 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-semibold hover:border-[#FFCC11]/40 transition"
        >
          <span className="flex items-center gap-2">
            <Terminal size={16} className="text-[#FFCC11]" />
            CLI Reference
          </span>
          <ArrowRight size={16} className="text-gray-500 group-hover:text-[#FFCC11] group-hover:translate-x-1 transition" />
        </Link>
        <Link
          href="/blocks/docs"
          className="flex-1 group inline-flex items-center justify-between gap-2 px-5 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-semibold hover:border-[#FFCC11]/40 transition"
        >
          <span className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#FFCC11]" />
            Back to Docs
          </span>
          <ArrowRight size={16} className="text-gray-500 group-hover:text-[#FFCC11] group-hover:translate-x-1 transition" />
        </Link>
      </section>
    </div>
  );
}
