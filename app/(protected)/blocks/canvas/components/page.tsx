"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MjolnirButton } from "@/components/ui/MjolnirButton";
import { GlassCard, GlassCardHeader, GlassCardContent, GlassCardFooter } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { RuneLoader } from "@/components/ui/RuneLoader";
import {
  Zap,
  Shield,
  Flame,
  Sparkles,
  Star,
  ArrowRight,
  Check,
  AlertTriangle,
  Info,
  X,
  Crown,
  Swords,
  Eye,
  Download,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

/* ─────── Section wrapper ─────── */
function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h2 className="heading-2 text-white">{title}</h2>
        <p className="text-zinc-400 mt-1 text-sm">{description}</p>
      </div>
      {children}
    </motion.section>
  );
}

/* ─────── Page ─────── */
export default function ComponentShowcasePage() {
  const [loadingBtn, setLoadingBtn] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/blocks/dashboard"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Component Library</h1>
              <p className="text-xs text-zinc-500">MjolnirUI Design System Preview</p>
            </div>
          </div>
          <Badge variant="electric" glow>
            <Zap className="w-3 h-3" /> v0.1.0
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">
        {/* ────────── MJOLNIR BUTTON ────────── */}
        <Section
          title="MjolnirButton"
          description="Signature button with lightning strike effect on click. 5 variants, 4 sizes, loading state, icon slots."
        >
          {/* Variants */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Variants</h3>
            <div className="flex flex-wrap gap-4">
              <MjolnirButton variant="storm" icon={<Zap className="w-4 h-4" />}>
                Storm
              </MjolnirButton>
              <MjolnirButton variant="thunder" icon={<Sparkles className="w-4 h-4" />}>
                Thunder
              </MjolnirButton>
              <MjolnirButton variant="bifrost" icon={<Star className="w-4 h-4" />}>
                Bifrost
              </MjolnirButton>
              <MjolnirButton variant="forge" icon={<Flame className="w-4 h-4" />}>
                Forge
              </MjolnirButton>
              <MjolnirButton variant="void" icon={<Eye className="w-4 h-4" />}>
                Void
              </MjolnirButton>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Sizes</h3>
            <div className="flex flex-wrap items-end gap-4">
              <MjolnirButton size="sm">Small</MjolnirButton>
              <MjolnirButton size="md">Medium</MjolnirButton>
              <MjolnirButton size="lg">Large</MjolnirButton>
              <MjolnirButton size="xl">Extra Large</MjolnirButton>
            </div>
          </div>

          {/* States */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">States</h3>
            <div className="flex flex-wrap gap-4">
              <MjolnirButton
                loading={loadingBtn}
                onClick={() => {
                  setLoadingBtn(true);
                  setTimeout(() => setLoadingBtn(false), 2000);
                }}
              >
                {loadingBtn ? "Forging..." : "Click to Load"}
              </MjolnirButton>
              <MjolnirButton disabled>Disabled</MjolnirButton>
              <MjolnirButton variant="thunder" iconRight={<ArrowRight className="w-4 h-4" />}>
                With Right Icon
              </MjolnirButton>
              <MjolnirButton strike={false} variant="void">
                No Lightning
              </MjolnirButton>
            </div>
          </div>
        </Section>

        {/* ────────── GLASS CARD ────────── */}
        <Section
          title="GlassCard"
          description="Glass morphism card with mouse-tracking glow, accent lines, and 5 variant themes. Not a shadcn Card reskin — this tracks your cursor."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Storm */}
            <GlassCard variant="storm">
              <GlassCardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <Shield className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Storm Shield</h3>
                    <p className="text-xs text-zinc-500">Defense System</p>
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-sm text-zinc-400">
                  Hover over this card — the glow follows your cursor. Each variant has its own color signature.
                </p>
              </GlassCardContent>
              <GlassCardFooter>
                <Badge variant="electric" size="xs" pulse>Active</Badge>
                <span className="text-xs text-zinc-500">Tier: Free</span>
              </GlassCardFooter>
            </GlassCard>

            {/* Gold */}
            <GlassCard variant="gold">
              <GlassCardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Crown className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Odin&apos;s Vault</h3>
                    <p className="text-xs text-zinc-500">Premium Assets</p>
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-sm text-zinc-400">
                  Gold variant for premium content and highlighted features. The accent line at top shifts on hover.
                </p>
              </GlassCardContent>
              <GlassCardFooter>
                <Badge variant="gold" size="xs" glow>Elite</Badge>
                <span className="text-xs text-zinc-500">12 assets</span>
              </GlassCardFooter>
            </GlassCard>

            {/* Bifrost */}
            <GlassCard variant="bifrost">
              <GlassCardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Bifrost Bridge</h3>
                    <p className="text-xs text-zinc-500">Cross-realm Access</p>
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-sm text-zinc-400">
                  Prismatic rainbow accent line. Perfect for featured content, integrations, or cross-platform features.
                </p>
              </GlassCardContent>
              <GlassCardFooter>
                <Badge variant="bifrost" size="xs">Connected</Badge>
                <span className="text-xs text-zinc-500">3 realms</span>
              </GlassCardFooter>
            </GlassCard>

            {/* Ember — Interactive */}
            <GlassCard variant="ember" onClick={() => alert("Card clicked!")} hoverLift>
              <GlassCardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Flame className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Clickable Card</h3>
                    <p className="text-xs text-zinc-500">Click me!</p>
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-sm text-zinc-400">
                  This card has an onClick handler — notice the cursor change and hover lift.
                </p>
              </GlassCardContent>
            </GlassCard>

            {/* Void — Minimal */}
            <GlassCard variant="void" accentLine={false}>
              <GlassCardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Eye className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Void Card</h3>
                    <p className="text-xs text-zinc-500">Minimal variant</p>
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-sm text-zinc-400">
                  Ultra-subtle. No accent line. Works for secondary content or dense dashboard grids.
                </p>
              </GlassCardContent>
            </GlassCard>

            {/* No glow tracking */}
            <GlassCard variant="storm" trackGlow={false} hoverLift={false}>
              <GlassCardHeader>
                <h3 className="font-semibold text-white">Static Card</h3>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-sm text-zinc-400">
                  Glow tracking disabled. Use for dense layouts where cursor tracking would be distracting.
                </p>
              </GlassCardContent>
            </GlassCard>
          </div>
        </Section>

        {/* ────────── BADGE ────────── */}
        <Section
          title="Badge"
          description="Status badges with glow effects, pulse indicators, and tier variants. 15 variants, 4 sizes."
        >
          {/* Status Badges */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Status</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="success" icon={<Check className="w-3 h-3" />}>Success</Badge>
              <Badge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>Warning</Badge>
              <Badge variant="error" icon={<X className="w-3 h-3" />}>Error</Badge>
              <Badge variant="info" icon={<Info className="w-3 h-3" />}>Info</Badge>
            </div>
          </div>

          {/* Brand Badges */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Brand</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="electric" glow icon={<Zap className="w-3 h-3" />}>Electric</Badge>
              <Badge variant="gold" glow icon={<Crown className="w-3 h-3" />}>Gold</Badge>
              <Badge variant="forge" glow icon={<Flame className="w-3 h-3" />}>Forge</Badge>
              <Badge variant="bifrost" glow icon={<Sparkles className="w-3 h-3" />}>Bifrost</Badge>
            </div>
          </div>

          {/* Tier Badges */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Subscription Tiers</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="free" size="md">Free</Badge>
              <Badge variant="base" size="md" icon={<Shield className="w-3 h-3" />}>Base</Badge>
              <Badge variant="pro" size="md" icon={<Swords className="w-3 h-3" />}>Pro</Badge>
              <Badge variant="elite" size="md" glow icon={<Crown className="w-3 h-3" />}>Elite</Badge>
            </div>
          </div>

          {/* Pulse + Sizes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Pulse & Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success" pulse size="xs">Live</Badge>
              <Badge variant="electric" pulse size="sm">Streaming</Badge>
              <Badge variant="warning" pulse size="md">Building</Badge>
              <Badge variant="error" pulse size="lg">Incident</Badge>
            </div>
          </div>

          {/* Removable */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Removable Tags</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="electric" removable onRemove={() => {}}>React</Badge>
              <Badge variant="gold" removable onRemove={() => {}}>Three.js</Badge>
              <Badge variant="bifrost" removable onRemove={() => {}}>GLSL</Badge>
              <Badge variant="default" removable onRemove={() => {}}>TypeScript</Badge>
            </div>
          </div>
        </Section>

        {/* ────────── RUNE LOADER ────────── */}
        <Section
          title="RuneLoader"
          description="Norse rune-based loading spinner with 8 Elder Futhark glyphs. Rotating ring, pulsing glow, optional label."
        >
          {/* All runes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Rune Glyphs</h3>
            <div className="flex flex-wrap gap-8 items-end">
              <div className="flex flex-col items-center gap-2">
                <RuneLoader rune="thurisaz" color="electric" size="md" label="Thor" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <RuneLoader rune="ansuz" color="gold" size="md" label="Odin" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <RuneLoader rune="fehu" color="forge" size="md" label="Wealth" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <RuneLoader rune="algiz" color="bifrost" size="md" label="Shield" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <RuneLoader rune="tiwaz" color="white" size="md" label="Victory" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <RuneLoader rune="kenaz" color="electric" size="md" label="Torch" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <RuneLoader rune="uruz" color="gold" size="md" label="Strength" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <RuneLoader rune="raido" color="forge" size="md" label="Journey" />
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Sizes</h3>
            <div className="flex flex-wrap gap-8 items-end">
              <RuneLoader size="sm" label="Small" />
              <RuneLoader size="md" label="Medium" />
              <RuneLoader size="lg" label="Large" />
              <RuneLoader size="xl" label="Extra Large" />
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Colors</h3>
            <div className="flex flex-wrap gap-8 items-end">
              <RuneLoader color="electric" size="lg" label="Electric" />
              <RuneLoader color="gold" size="lg" label="Gold" />
              <RuneLoader color="forge" size="lg" label="Forge" />
              <RuneLoader color="bifrost" size="lg" label="Bifrost" />
              <RuneLoader color="white" size="lg" label="White" />
            </div>
          </div>

          {/* Inline usage */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Inline Usage</h3>
            <GlassCard variant="storm">
              <GlassCardContent className="flex items-center gap-4 py-6">
                <RuneLoader size="sm" spin pulse={false} />
                <span className="text-sm text-zinc-300">Forging your components... This may take a moment.</span>
              </GlassCardContent>
            </GlassCard>
          </div>
        </Section>

        {/* ────────── COMPOSITION EXAMPLE ────────── */}
        <Section
          title="Composition"
          description="All 4 components working together in a real-world layout."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard variant="gold">
              <GlassCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <Download className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Shader Engine Pro</h3>
                      <p className="text-xs text-zinc-400">Advanced GLSL shader toolkit</p>
                    </div>
                  </div>
                  <Badge variant="pro" glow>Pro</Badge>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-sm text-zinc-400 mb-4">
                  Create stunning WebGL backgrounds with our visual shader editor.
                  Includes 50+ presets and real-time GLSL compilation.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="default" size="xs">WebGL</Badge>
                  <Badge variant="default" size="xs">GLSL</Badge>
                  <Badge variant="default" size="xs">Three.js</Badge>
                  <Badge variant="default" size="xs">React</Badge>
                </div>
              </GlassCardContent>
              <GlassCardFooter>
                <MjolnirButton variant="thunder" size="sm" icon={<Zap className="w-4 h-4" />}>
                  Install Component
                </MjolnirButton>
                <MjolnirButton variant="void" size="sm">
                  Preview
                </MjolnirButton>
              </GlassCardFooter>
            </GlassCard>

            <GlassCard variant="storm">
              <GlassCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <Shield className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Auth Guard</h3>
                      <p className="text-xs text-zinc-400">Route protection system</p>
                    </div>
                  </div>
                  <Badge variant="success" pulse size="xs">Live</Badge>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-sm text-zinc-400 mb-4">
                  Drop-in auth middleware with tier-based access control,
                  OAuth providers, and session management.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="default" size="xs">NextAuth</Badge>
                  <Badge variant="default" size="xs">OAuth</Badge>
                  <Badge variant="default" size="xs">JWT</Badge>
                  <Badge variant="default" size="xs">RBAC</Badge>
                </div>
              </GlassCardContent>
              <GlassCardFooter>
                <MjolnirButton variant="storm" size="sm" icon={<Zap className="w-4 h-4" />}>
                  Install Component
                </MjolnirButton>
                <MjolnirButton variant="void" size="sm">
                  Preview
                </MjolnirButton>
              </GlassCardFooter>
            </GlassCard>
          </div>
        </Section>
      </div>
    </div>
  );
}
