// Component Studio — React Bits-style live preview + customization panel
"use client";

import React, { useState, useMemo, useCallback, useEffect, use } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, ChevronDown, RotateCcw, Copy, Check, Code2, Eye, LockKeyhole,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPONENT_REGISTRY, getComponentById, type ComponentMeta } from "@/lib/componentRegistry";
import { COMPONENT_PROPS, type PropConfig } from "@/lib/componentProps";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";
import { useFreeTrialUnlocks } from "@/lib/freeTrialUnlocks";

/* ── Dynamic component map — explicit imports for Next.js ─ */
/* eslint-disable @typescript-eslint/no-explicit-any */
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {};

const Fallback = () => <div className="flex items-center justify-center h-full text-gray-500 text-sm">Loading component...</div>;
const dyn = (loader: () => Promise<any>) => dynamic(loader, { ssr: false, loading: Fallback });

// Backgrounds
const ColorHalo = dyn(() => import("@/components/mjolnirui/backgrounds/color-halo/ColorHalo"));
const Prism = dyn(() => import("@/components/mjolnirui/backgrounds/prism/Prism"));
const SilkyLines = dyn(() => import("@/components/mjolnirui/backgrounds/silky-lines/SilkyLines"));
const StarField = dyn(() => import("@/components/mjolnirui/backgrounds/star-field/StarField").then(m => ({ default: m.StarField })));
const NeuralNet = dyn(() => import("@/components/mjolnirui/backgrounds/neural/NeuralNet").then(m => ({ default: m.NeuralNet })));
const Atomic = dyn(() => import("@/components/mjolnirui/backgrounds/atomic/Atomic"));
const Smoke = dyn(() => import("@/components/mjolnirui/backgrounds/smoke/Smoke"));
const StarsBackground = dyn(() => import("@/components/mjolnirui/backgrounds/stars/StarsBackground").then(m => ({ default: m.StarsBackground })));
const Accretion = dyn(() => import("@/components/mjolnirui/backgrounds/accretion/Accretion"));
const BiFrost = dyn(() => import("@/components/mjolnirui/backgrounds/bifrost/BiFrost"));
const DarkVeil = dyn(() => import("@/components/mjolnirui/backgrounds/dark-veil/DarkVeil"));
const Vortex = dyn(() => import("@/components/mjolnirui/backgrounds/vortex/Vortex"));
const LiquidRibbons = dyn(() => import("@/components/mjolnirui/backgrounds/liquid-ribbons/LiquidRibbons"));
const GravityLens = dyn(() => import("@/components/mjolnirui/backgrounds/gravity-lens/GravityLens"));
const LiquidEther = dyn(() => import("@/components/mjolnirui/backgrounds/liquid-ether/LiquidEther"));
const Singularity = dyn(() => import("@/components/mjolnirui/backgrounds/singularity/Singularity"));
// Animations
const Lightning = dyn(() => import("@/components/mjolnirui/animations/lightning/Lightning"));
const MatrixRain = dyn(() => import("@/components/mjolnirui/animations/matrix-rain/MatrixRain").then(m => ({ default: m.MatrixRain })));
const RippleGrid = dyn(() => import("@/components/mjolnirui/animations/ripple-grid/RippleGrid"));
const Atmosphere = dyn(() => import("@/components/mjolnirui/animations/atmosphere/Atmosphere"));
const AuraWaves = dyn(() => import("@/components/mjolnirui/animations/aurora/AuraWaves"));
const LightPillar = dyn(() => import("@/components/mjolnirui/animations/light-pillar/LightPillar"));
const BlackHole = dyn(() => import("@/components/mjolnirui/animations/black-hole/BlackHole"));
const LaserFlow = dyn(() => import("@/components/mjolnirui/animations/laser-flow/LaserFlow").then(m => ({ default: m.LaserFlow })));
const SwirlingGas = dyn(() => import("@/components/mjolnirui/animations/swirling-gas/SwirlingGas"));
const Globe = dyn(() => import("@/components/mjolnirui/animations/globe/Globe").then(m => ({ default: m.Globe })));
const Hyperspeed = dyn(() => import("@/components/mjolnirui/animations/hyperspeed/Hyperspeed"));
// UI
const ElectricBorder = dyn(() => import("@/components/ui/ElectricBorder"));
const AuroraText = dyn(() => import("@/components/ui/AuroraText").then(m => ({ default: m.AuroraText })));
const TextReveal = dyn(() => import("@/components/ui/TextReveal").then(m => ({ default: m.TextReveal })));
const GradientText = dyn(() => import("@/components/ui/GradientText"));
const ShimmerButton = dyn(() => import("@/components/Buttons/ShimmerButton"));
// FlipCard requires complex parent-managed props (icon, transform, etc.) — show demo wrapper
const FlipCardDemo = () => (
  <div className="flex items-center justify-center h-full bg-black">
    <div style={{ perspective: "800px", width: 120, height: 120 }}>
      <div style={{ width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform 450ms ease-in-out", animation: "flip-demo 3s infinite" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: "#030303", overflow: "hidden", boxShadow: "inset 0 0 0 1.5px #00f0ffcc, inset 0 0 18px -3px #00f0ffdd, inset 0 0 32px -5px #00f0ff88" }}>
          <span style={{ fontWeight: 900, color: "white", fontSize: "1.5rem" }}>⚡</span>
        </div>
      </div>
    </div>
    <style>{`@keyframes flip-demo { 0%,40% { transform: rotateY(0deg); } 50%,90% { transform: rotateY(180deg); } 100% { transform: rotateY(360deg); } }`}</style>
  </div>
);
// Accordion is empty placeholder — skip for now
const AccordionPlaceholder = () => <div className="flex items-center justify-center h-full text-gray-500 text-sm">Accordion — Coming Soon</div>;
// 3D
const AnimatedOrb = dyn(() => import("@/components/ui/AnimatedOrb"));
// Wireframes — recordable for video, also Free-tier showpieces.
const WireframeHammer = dyn(() => import("@/components/mjolnirui/wireframes/WireframeHammer").then(m => ({ default: m.WireframeHammer })));
const WireframeOrbDyn = dyn(() => import("@/components/mjolnirui/wireframes/WireframeOrb").then(m => ({ default: m.WireframeOrb })));
const WireframeGrid = dyn(() => import("@/components/mjolnirui/wireframes/WireframeGrid").then(m => ({ default: m.WireframeGrid })));

/* ── New UI primitives (Sprint A — 2026-05-27) ──────────────────── */
/* These primitives all need a parent that supplies content. We render
   them inside small demo wrappers that pass sensible Mjolnir-themed
   sample content so the preview canvas has something visual to show. */

const MjolnirButtonDemo = dyn(() =>
  import("@/components/ui/MjolnirButton").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full gap-3 flex-wrap p-6">
        <m.MjolnirButton variant="storm">Storm</m.MjolnirButton>
        <m.MjolnirButton variant="thunder">Thunder</m.MjolnirButton>
        <m.MjolnirButton variant="bifrost">Bifrost</m.MjolnirButton>
        <m.MjolnirButton variant="void">Void</m.MjolnirButton>
        <m.MjolnirButton variant="forge">Forge</m.MjolnirButton>
      </div>
    ),
  }))
);

const BadgeDemo = dyn(() =>
  import("@/components/ui/Badge").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full gap-2 flex-wrap p-6 max-w-md">
        <m.Badge variant="default">Default</m.Badge>
        <m.Badge variant="success">Active</m.Badge>
        <m.Badge variant="warning">Pending</m.Badge>
        <m.Badge variant="error">Failed</m.Badge>
        <m.Badge variant="info">Info</m.Badge>
        <m.Badge variant="electric">Electric</m.Badge>
        <m.Badge variant="gold">Gold</m.Badge>
        <m.Badge variant="forge">Forge</m.Badge>
        <m.Badge variant="bifrost">Bifrost</m.Badge>
        <m.Badge variant="pro">Pro</m.Badge>
        <m.Badge variant="elite">Elite</m.Badge>
      </div>
    ),
  }))
);

const GlassCardDemo = dyn(() =>
  import("@/components/ui/GlassCard").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-8">
        <m.GlassCard variant="storm" className="max-w-sm p-6">
          <h3 className="text-lg font-bold text-white mb-1">
            Wield the storm
          </h3>
          <p className="text-sm text-gray-400">
            Frosted glass card with mouse-tracking glow. Hover to see the
            electric trail follow your cursor.
          </p>
        </m.GlassCard>
      </div>
    ),
  }))
);

const CountUpDemo = dyn(() =>
  import("@/components/ui/CountUp").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-6xl font-black text-[#FFCC11]">
          <m.CountUp to={2026} duration={2} separator="" trigger="mount" />
        </div>
      </div>
    ),
  }))
);

const RuneLoaderDemo = dyn(() =>
  import("@/components/ui/RuneLoader").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full gap-6 flex-wrap">
        <m.RuneLoader size="md" color="electric" />
        <m.RuneLoader size="md" color="gold" />
        <m.RuneLoader size="md" color="bifrost" />
      </div>
    ),
  }))
);

const TypewriterTextDemo = dyn(() =>
  import("@/components/ui/TypewriterText").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full">
        <m.TypewriterText
          text={[
            "Forged in Asgard.",
            "Wielded by builders.",
            "Powered by lightning.",
          ]}
          className="text-3xl font-bold text-white"
        />
      </div>
    ),
  }))
);

const GlitchTextDemo = dyn(() =>
  import("@/components/ui/GlitchText").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full">
        <m.GlitchText intensity="medium" trigger="always" className="text-5xl font-black">
          MJOLNIR
        </m.GlitchText>
      </div>
    ),
  }))
);

const NeonGlowTextDemo = dyn(() =>
  import("@/components/ui/NeonGlowText").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full">
        <m.NeonGlowText className="text-5xl font-black">
          MjolnirUI
        </m.NeonGlowText>
      </div>
    ),
  }))
);

const ShinyTextDemo = dyn(() =>
  import("@/components/ui/ShinyText").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full">
        <m.ShinyText className="text-5xl font-black text-white">
          Asgardian Tech
        </m.ShinyText>
      </div>
    ),
  }))
);

const WaveTextDemo = dyn(() =>
  import("@/components/ui/WaveText").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full">
        <m.WaveText className="text-5xl font-black text-[#00f0ff]">
          BIFROST
        </m.WaveText>
      </div>
    ),
  }))
);

const DecryptTextDemo = dyn(() =>
  import("@/components/ui/DecryptText").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full">
        <m.DecryptText className="text-5xl font-black text-emerald-400 font-mono">
          UNLOCKED
        </m.DecryptText>
      </div>
    ),
  }))
);

const ColorfulTextDemo = dyn(() =>
  import("@/components/ui/TextEffects/ColorfulText").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full">
        <m.ColorfulText
          text="Rainbow Bridge"
          className="text-5xl font-black"
        />
      </div>
    ),
  }))
);

const GlowingEffectDemo = dyn(() =>
  import("@/components/ui/Animations/GlowingEffect").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-8">
        <m.GlowingEffect>
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 max-w-sm">
            <h3 className="text-lg font-bold text-white mb-1">
              Glowing wrapper
            </h3>
            <p className="text-sm text-gray-400">
              Drop this around any container to add a soft animated halo
              that follows the user&apos;s cursor.
            </p>
          </div>
        </m.GlowingEffect>
      </div>
    ),
  }))
);

const LightningEffectDemo = dyn(() =>
  import("@/components/ui/Animations/LightningEffect").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div className="relative overflow-hidden rounded-2xl bg-black border border-cyan-500/30 p-8 max-w-sm">
          <m.default />
          <h3 className="text-lg font-bold text-white mb-1 relative z-10">
            Lightning overlay
          </h3>
          <p className="text-sm text-gray-400 relative z-10">
            Branching bolts streak across any container — buttons, cards,
            emphasis blocks.
          </p>
        </div>
      </div>
    ),
  }))
);

const MjolnirInputDemo = dyn(() =>
  import("@/components/ui/MjolnirForm").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div className="w-full max-w-sm space-y-4">
          <m.MjolnirInput
            label="Display name"
            placeholder="Thor Odinson"
            required
            variant="thunder"
            helper="Visible on your public profile."
          />
          <m.MjolnirInput
            label="Email"
            type="email"
            placeholder="hello@asgard.io"
            variant="storm"
          />
          <m.MjolnirTextarea
            label="Bio"
            placeholder="Wielder of Mjolnir. Builder of UIs."
            rows={3}
            variant="bifrost"
          />
        </div>
      </div>
    ),
  }))
);

const MjolnirSelectDemo = dyn(() =>
  import("@/components/ui/MjolnirForm").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div className="w-full max-w-sm space-y-4">
          <m.MjolnirSelect
            label="Tier"
            variant="thunder"
            defaultValue="pro"
            options={[
              { label: "Free — Explorers", value: "free" },
              { label: "Base — Creators", value: "base" },
              { label: "Pro — Professionals", value: "pro" },
              { label: "Elite — Agencies (Coming Q3 2026)", value: "elite", disabled: true },
            ]}
            helper="Switch plans any time via the billing portal."
          />
          <m.MjolnirSelect
            label="Realm"
            variant="bifrost"
            placeholder="Choose your realm"
            options={[
              { label: "Asgard", value: "asgard" },
              { label: "Midgard", value: "midgard" },
              { label: "Vanaheim", value: "vanaheim" },
              { label: "Jotunheim", value: "jotunheim" },
            ]}
          />
        </div>
      </div>
    ),
  }))
);

// Modal needs to be dynamically imported but with the component type
// preserved — declare a typed dynamic shell so `<Modal {...}>` typechecks.
const MjolnirModalLazy = dyn(() =>
  import("@/components/ui/MjolnirModal").then((m) => ({ default: m.MjolnirModal }))
) as unknown as React.ComponentType<
  import("@/components/ui/MjolnirModal").MjolnirModalProps
>;

function MjolnirModalDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex items-center justify-center w-full h-full p-8">
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#FFCC11] text-black font-bold text-sm hover:bg-[#FFD700] transition"
        >
          Open Mjolnir Modal
        </button>
        <p className="text-xs text-gray-500 max-w-xs text-center">
          Backdrop click, ESC key, or the X button all close. Body scroll
          locks while the modal is open.
        </p>
        <MjolnirModalLazy
          open={open}
          onClose={() => setOpen(false)}
          variant="thunder"
          title="Forge the rune?"
          description="This will permanently bind the component to your project."
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FFCC11] text-black hover:bg-[#FFD700] transition"
              >
                Forge it
              </button>
            </div>
          }
        >
          <p className="text-gray-300">
            Mjolnir Modal supports five accent variants, four sizes, ESC-to-
            close, scroll lock, and arbitrary title / description / body /
            footer slots.
          </p>
        </MjolnirModalLazy>
      </div>
    </div>
  );
}

/* ── Charts pack (6 components, all Base tier) ──────────────── */

const SAMPLE_TIMESERIES = [
  { label: "Mon", users: 240, sessions: 178 },
  { label: "Tue", users: 312, sessions: 220 },
  { label: "Wed", users: 289, sessions: 195 },
  { label: "Thu", users: 380, sessions: 268 },
  { label: "Fri", users: 425, sessions: 304 },
  { label: "Sat", users: 198, sessions: 142 },
  { label: "Sun", users: 156, sessions: 110 },
];

const SAMPLE_TIER_BREAKDOWN = [
  { label: "Free", value: 4280 },
  { label: "Base", value: 642 },
  { label: "Pro", value: 218 },
  { label: "Elite", value: 47 },
];

const BarChartDemo = dyn(() =>
  import("@/components/ui/charts/BarChart").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-6">
        <div className="w-full max-w-2xl">
          <m.MjolnirBarChart
            data={SAMPLE_TIMESERIES}
            series={[
              { key: "users", name: "Users" },
              { key: "sessions", name: "Sessions" },
            ]}
            variant="thunder"
            height={280}
          />
        </div>
      </div>
    ),
  }))
);

const LineChartDemo = dyn(() =>
  import("@/components/ui/charts/LineChart").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-6">
        <div className="w-full max-w-2xl">
          <m.MjolnirLineChart
            data={SAMPLE_TIMESERIES}
            series={[
              { key: "users", name: "Users" },
              { key: "sessions", name: "Sessions" },
            ]}
            curve="monotone"
            height={280}
          />
        </div>
      </div>
    ),
  }))
);

const AreaChartDemo = dyn(() =>
  import("@/components/ui/charts/AreaChart").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-6">
        <div className="w-full max-w-2xl">
          <m.MjolnirAreaChart
            data={SAMPLE_TIMESERIES}
            series={[
              { key: "users", name: "Users" },
              { key: "sessions", name: "Sessions" },
            ]}
            curve="monotone"
            stacked
            height={280}
          />
        </div>
      </div>
    ),
  }))
);

const DonutChartDemo = dyn(() =>
  import("@/components/ui/charts/DonutChart").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-6">
        <div className="w-full max-w-md">
          <m.MjolnirDonutChart
            data={SAMPLE_TIER_BREAKDOWN}
            height={280}
            legendPosition="right"
            centerLabel={
              <div>
                <div className="text-3xl font-black text-white">5,187</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  Total users
                </div>
              </div>
            }
          />
        </div>
      </div>
    ),
  }))
);

const SparklineDemo = dyn(() =>
  import("@/components/ui/charts/Sparkline").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div className="w-full max-w-md grid grid-cols-1 gap-4">
          {[
            { label: "Signups", data: [12, 18, 14, 22, 28, 24, 31], variant: "thunder" as const },
            { label: "MRR ($)", data: [820, 845, 870, 910, 945, 980, 1020], variant: "storm" as const },
            { label: "Errors", data: [3, 1, 2, 0, 1, 4, 2], variant: "forge" as const },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 w-20 shrink-0">
                {row.label}
              </span>
              <div className="flex-1">
                <m.MjolnirSparkline data={row.data} variant={row.variant} height={32} />
              </div>
              <span className="text-sm font-mono text-white w-16 text-right">
                {row.data[row.data.length - 1]}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  }))
);

const RadialBarDemo = dyn(() =>
  import("@/components/ui/charts/RadialBar").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-6 gap-8 flex-wrap">
        <m.MjolnirRadialBar
          value={87}
          variant="thunder"
          size={180}
          centerLabel={
            <div>
              <div className="text-3xl font-black text-white">87</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                Perf score
              </div>
            </div>
          }
        />
        <m.MjolnirRadialBar
          value={62}
          variant="storm"
          size={180}
          centerLabel={
            <div>
              <div className="text-3xl font-black text-white">62%</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                Of goal
              </div>
            </div>
          }
        />
        <m.MjolnirRadialBar
          value={94}
          variant="bifrost"
          size={180}
          centerLabel={
            <div>
              <div className="text-3xl font-black text-white">94</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                Health
              </div>
            </div>
          }
        />
      </div>
    ),
  }))
);

/* ── Tranche 2 (2026-06-11) ──────────────────────────────────── */

const DataTableDemo = dyn(() =>
  import("@/components/ui/DataTable").then((m) => ({
    default: () => {
      const rows = [
        { id: 1, name: "Thor Odinson", email: "thor@example.test", tier: "Elite", mrr: 50, active: true },
        { id: 2, name: "Lady Sif", email: "sif@example.test", tier: "Pro", mrr: 25, active: true },
        { id: 3, name: "Loki Laufeyson", email: "loki@example.test", tier: "Pro", mrr: 25, active: false },
        { id: 4, name: "Heimdall", email: "heimdall@example.test", tier: "Base", mrr: 10, active: true },
        { id: 5, name: "Freya", email: "freya@example.test", tier: "Base", mrr: 10, active: true },
        { id: 6, name: "Balder", email: "balder@example.test", tier: "Free", mrr: 0, active: true },
      ];
      return (
        <div className="flex items-center justify-center w-full h-full p-6">
          <div className="w-full max-w-3xl">
            <m.MjolnirDataTable
              data={rows}
              columns={[
                { key: "name", header: "Name", sortable: true },
                { key: "email", header: "Email", mono: true, dim: true, sortable: true },
                { key: "tier", header: "Tier", sortable: true },
                {
                  key: "mrr",
                  header: "MRR",
                  align: "right",
                  sortable: true,
                  mono: true,
                  format: (v) => (v === 0 ? "—" : `$${v}`),
                },
                {
                  key: "active",
                  header: "Status",
                  align: "center",
                  render: (r) => (
                    <span className={r.active ? "text-emerald-400" : "text-gray-500"}>
                      {r.active ? "● Active" : "○ Idle"}
                    </span>
                  ),
                },
              ]}
              onRowClick={(r) => console.log("row clicked", r)}
            />
          </div>
        </div>
      );
    },
  }))
);

const HeatmapDemo = dyn(() =>
  import("@/components/ui/Heatmap").then((m) => ({
    default: () => {
      // Generate 1 year of sample data with deterministic-ish pattern.
      const today = new Date();
      const data: { date: string; value: number }[] = [];
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().slice(0, 10);
        // Weekday bias + monthly clusters.
        const dow = d.getDay();
        const isWeekend = dow === 0 || dow === 6;
        const seed = (d.getDate() * 7 + d.getMonth() * 13) % 17;
        const value = isWeekend ? Math.max(0, seed - 13) : Math.max(0, seed - 6 + Math.floor((i % 11) / 3));
        data.push({ date: iso, value });
      }
      return (
        <div className="flex items-center justify-center w-full h-full p-6">
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Contribution activity · last 12 months
            </div>
            <m.MjolnirHeatmap data={data} weeks={52} variant="thunder" />
          </div>
        </div>
      );
    },
  }))
);

const ProgressBarDemo = dyn(() =>
  import("@/components/ui/ProgressBar").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div className="w-full max-w-md space-y-6">
          <m.MjolnirProgressBar
            value={72}
            variant="thunder"
            label="Determinate · Project completion"
            showValue
          />
          <m.MjolnirProgressBar
            mode="indeterminate"
            variant="storm"
            label="Indeterminate · Syncing your library"
          />
          <m.MjolnirProgressBar
            mode="segmented"
            value={60}
            variant="bifrost"
            label="Segmented · Tier progress (3 of 5)"
            segments={5}
            showValue
            height={10}
          />
        </div>
      </div>
    ),
  }))
);

const SkeletonDemo = dyn(() =>
  import("@/components/ui/Skeleton").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div className="w-full max-w-md space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <m.MjolnirSkeleton shape="circle" size={40} />
              <div className="flex-1 space-y-2">
                <m.MjolnirSkeleton shape="text" w="60%" />
                <m.MjolnirSkeleton shape="text" w="40%" h={8} />
              </div>
              <m.MjolnirSkeleton shape="box" w={64} h={28} radius={8} />
            </div>
          ))}
        </div>
      </div>
    ),
  }))
);

const AvatarDemo = dyn(() =>
  import("@/components/ui/Avatar").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-8 gap-8 flex-wrap">
        <div className="flex items-end gap-4">
          <m.MjolnirAvatar name="Thor Odinson" size="xs" tier="elite" status="online" />
          <m.MjolnirAvatar name="Lady Sif" size="sm" tier="pro" status="online" />
          <m.MjolnirAvatar name="Loki" size="md" tier="pro" status="away" />
          <m.MjolnirAvatar name="Heimdall Gatekeeper" size="lg" tier="base" status="busy" />
          <m.MjolnirAvatar name="Freya" size="xl" tier="free" status="offline" />
        </div>
      </div>
    ),
  }))
);

/* ── Tranche 3 (2026-06-29) — feedback + forms ─────────────── */

function ToastDemoInner() {
  const [t, setT] = React.useState<{
    show: (m: string, opts?: any) => void;
    success: (m: string, opts?: any) => void;
    warning: (m: string, opts?: any) => void;
    error: (m: string, opts?: any) => void;
    info: (m: string, opts?: any) => void;
    thunder: (m: string, opts?: any) => void;
    storm: (m: string, opts?: any) => void;
  } | null>(null);
  const [Host, setHost] = React.useState<React.ComponentType<any> | null>(null);
  React.useEffect(() => {
    import("@/components/ui/Toast").then((m) => {
      setT(m.toast);
      setHost(() => m.MjolnirToaster);
    });
  }, []);
  return (
    <div className="flex items-center justify-center w-full h-full p-8">
      {Host && <Host position="bottom-right" />}
      <div className="grid grid-cols-2 gap-2 max-w-md">
        {t && (
          <>
            <button
              onClick={() => t.success("Palette saved", { description: "Your changes are live." })}
              className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
            >
              success()
            </button>
            <button
              onClick={() => t.warning("Approaching plan limit", { description: "3 of 5 trial unlocks used." })}
              className="px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold"
            >
              warning()
            </button>
            <button
              onClick={() => t.error("Couldn't reach Stripe", { description: "Retrying in 3s…" })}
              className="px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold"
            >
              error()
            </button>
            <button
              onClick={() => t.info("New components shipped", { description: "5 just landed in the library." })}
              className="px-3 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-bold"
            >
              info()
            </button>
            <button
              onClick={() => t.thunder("Mjolnir struck", { description: "Pro tier activated." })}
              className="col-span-2 px-3 py-2 rounded-lg bg-[#FFCC11]/15 border border-[#FFCC11]/50 text-[#FFCC11] text-xs font-bold"
            >
              thunder() — branded
            </button>
          </>
        )}
      </div>
    </div>
  );
}
const ToastDemo = ToastDemoInner;

const AlertDemo = dyn(() =>
  import("@/components/ui/Alert").then((m) => ({
    default: () => (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div className="w-full max-w-md space-y-3">
          <m.MjolnirAlert variant="success" title="Saved" />
          <m.MjolnirAlert variant="warning" title="Payment past due" dismissible>
            We tried to charge your card on June 9 and it failed.
          </m.MjolnirAlert>
          <m.MjolnirAlert
            variant="error"
            title="Connection lost"
            action={
              <button className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-200 text-xs font-bold">
                Retry
              </button>
            }
          >
            We couldn&apos;t reach the Stripe API.
          </m.MjolnirAlert>
          <m.MjolnirAlert variant="info" title="New components shipped">
            5 just landed in the library. Browse the NEW FEATURES section.
          </m.MjolnirAlert>
          <m.MjolnirAlert variant="neutral" title="Heads up" dismissible>
            Maintenance window scheduled for Sunday 2 AM ET.
          </m.MjolnirAlert>
        </div>
      </div>
    ),
  }))
);

const BannerDemo = dyn(() =>
  import("@/components/ui/Banner").then((m) => ({
    default: () => (
      <div className="w-full h-full flex flex-col gap-3 p-6">
        <m.MjolnirBanner
          variant="thunder"
          icon={<span className="text-base leading-none">🔨</span>}
          dismissible
          action={
            <a className="text-xs font-bold underline underline-offset-2 cursor-pointer">
              Read the post →
            </a>
          }
        >
          The Hammer · June 2026 is live — here&apos;s what shipped.
        </m.MjolnirBanner>
        <m.MjolnirBanner variant="storm" dismissible>
          New feature: Charts pack now available on Base + Pro tiers.
        </m.MjolnirBanner>
        <m.MjolnirBanner variant="bifrost" dismissible>
          Beta program now open for MjolnirUI Elite.
        </m.MjolnirBanner>
        <m.MjolnirBanner variant="forge" dismissible>
          Scheduled maintenance — Sunday 2 AM ET, expect ~5 minutes downtime.
        </m.MjolnirBanner>
        <m.MjolnirBanner variant="neutral" dismissible>
          Cookies notice — we use cookies to keep you signed in.
        </m.MjolnirBanner>
      </div>
    ),
  }))
);

function CheckboxDemoInner() {
  const [parent, setParent] = React.useState(false);
  const [items, setItems] = React.useState([false, false, false]);
  const [Cmp, setCmp] = React.useState<{
    Checkbox: React.ComponentType<any>;
    Group: React.ComponentType<any>;
  } | null>(null);
  React.useEffect(() => {
    import("@/components/ui/Checkbox").then((m) => {
      setCmp({ Checkbox: m.MjolnirCheckbox, Group: m.MjolnirCheckboxGroup });
    });
  }, []);
  const allChecked = items.every(Boolean);
  const someChecked = items.some(Boolean);
  React.useEffect(() => {
    setParent(allChecked);
  }, [allChecked]);
  if (!Cmp) return null;
  const { Checkbox, Group } = Cmp;
  return (
    <div className="flex items-center justify-center w-full h-full p-8">
      <div className="w-full max-w-md space-y-6">
        <Checkbox
          label="Email me about new components"
          helper="Sent every Friday with the weekly drop."
          variant="thunder"
          defaultChecked
        />
        <Checkbox
          label="Subscribe to The Hammer (monthly recap)"
          variant="storm"
          defaultChecked
        />
        <Checkbox
          label="Tier-locked feature (disabled)"
          helper="Available on Pro and above."
          disabled
        />
        <Group label="Select notifications" helper="Pick what lands in your inbox.">
          <Checkbox
            label="All"
            checked={allChecked}
            indeterminate={!allChecked && someChecked}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = e.target.checked;
              setParent(next);
              setItems([next, next, next]);
            }}
            variant="bifrost"
          />
          {["Components", "Tutorials", "Billing receipts"].map((lbl, i) => (
            <Checkbox
              key={lbl}
              label={lbl}
              checked={items[i]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setItems((s) => s.map((v, j) => (j === i ? e.target.checked : v)))
              }
              variant="bifrost"
              wrapperClassName="ml-5"
            />
          ))}
        </Group>
      </div>
    </div>
  );
}
const CheckboxDemo = CheckboxDemoInner;

function SwitchDemoInner() {
  const [vals, setVals] = React.useState({ a: true, b: false, c: true, d: false });
  const [Cmp, setCmp] = React.useState<React.ComponentType<any> | null>(null);
  React.useEffect(() => {
    import("@/components/ui/Switch").then((m) => {
      setCmp(() => m.MjolnirSwitch);
    });
  }, []);
  if (!Cmp) return null;
  const Switch = Cmp;
  return (
    <div className="flex items-center justify-center w-full h-full p-8">
      <div className="w-full max-w-md space-y-5">
        <Switch
          label="Product updates"
          description="Get notified about new components and tools."
          checked={vals.a}
          onCheckedChange={(v: boolean) => setVals({ ...vals, a: v })}
          variant="thunder"
        />
        <Switch
          label="Newsletter"
          description="Monthly Hammer post + behind-the-scenes."
          checked={vals.b}
          onCheckedChange={(v: boolean) => setVals({ ...vals, b: v })}
          variant="storm"
        />
        <Switch
          label="Beta features"
          description="Try new things before they ship to everyone."
          checked={vals.c}
          onCheckedChange={(v: boolean) => setVals({ ...vals, c: v })}
          variant="bifrost"
          size="lg"
        />
        <Switch
          label="Critical alerts"
          description="Always on — service outages and billing failures."
          checked={vals.d}
          onCheckedChange={(v: boolean) => setVals({ ...vals, d: v })}
          variant="forge"
          size="sm"
          disabled
        />
      </div>
    </div>
  );
}
const SwitchDemo = SwitchDemoInner;

const StatCardDemo = dyn(() =>
  Promise.all([
    import("@/components/ui/StatCard"),
    import("lucide-react"),
  ]).then(([mod, icons]) => ({
    default: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl p-8">
        <mod.StatCard
          label="Total Users"
          value={1247}
          icon={icons.Users}
          delta={12.4}
          deltaLabel="vs last week"
          variant="storm"
        />
        <mod.StatCard
          label="MRR"
          value="$8,420"
          icon={icons.DollarSign}
          delta={8.1}
          deltaLabel="MoM"
          variant="thunder"
          sub="58 active subs"
        />
        <mod.StatCard
          label="Components Used"
          value={49}
          icon={icons.Sparkles}
          delta={-3.2}
          deltaLabel="this hour"
          variant="bifrost"
        />
        <mod.StatCard
          label="Errors"
          value={4}
          icon={icons.AlertTriangle}
          delta={-50}
          deltaLabel="resolved"
          invertDelta
          variant="forge"
        />
      </div>
    ),
  }))
);

// Map component IDs to their dynamic imports
COMPONENT_MAP["color-halo"] = ColorHalo;
COMPONENT_MAP["prism"] = Prism;
COMPONENT_MAP["silky-lines"] = SilkyLines;
COMPONENT_MAP["star-field"] = StarField;
COMPONENT_MAP["neural-net"] = NeuralNet;
COMPONENT_MAP["atomic"] = Atomic;
COMPONENT_MAP["smoke"] = Smoke;
COMPONENT_MAP["stars-bg"] = StarsBackground;
COMPONENT_MAP["accretion"] = Accretion;
COMPONENT_MAP["bifrost"] = BiFrost;
COMPONENT_MAP["dark-veil"] = DarkVeil;
COMPONENT_MAP["vortex"] = Vortex;
COMPONENT_MAP["liquid-ribbons"] = LiquidRibbons;
COMPONENT_MAP["gravity-lens"] = GravityLens;
COMPONENT_MAP["liquid-ether"] = LiquidEther;
COMPONENT_MAP["singularity"] = Singularity;
COMPONENT_MAP["lightning"] = Lightning;
COMPONENT_MAP["matrix-rain"] = MatrixRain;
COMPONENT_MAP["ripple-grid"] = RippleGrid;
COMPONENT_MAP["atmosphere"] = Atmosphere;
COMPONENT_MAP["aura-waves"] = AuraWaves;
COMPONENT_MAP["light-pillar"] = LightPillar;
COMPONENT_MAP["black-hole"] = BlackHole;
COMPONENT_MAP["laser-flow"] = LaserFlow;
COMPONENT_MAP["swirling-gas"] = SwirlingGas;
COMPONENT_MAP["globe"] = Globe;
COMPONENT_MAP["hyperspeed"] = Hyperspeed;
COMPONENT_MAP["electric-border"] = ElectricBorder;
COMPONENT_MAP["aurora-text"] = AuroraText;
COMPONENT_MAP["text-reveal"] = TextReveal;
COMPONENT_MAP["gradient-text"] = GradientText;
COMPONENT_MAP["shimmer-button"] = ShimmerButton;
COMPONENT_MAP["flip-card"] = FlipCardDemo;
COMPONENT_MAP["accordion"] = AccordionPlaceholder;
COMPONENT_MAP["animated-orb"] = AnimatedOrb;

// Sprint A — newly registered UI primitives
COMPONENT_MAP["mjolnir-button"] = MjolnirButtonDemo;
COMPONENT_MAP["badge"] = BadgeDemo;
COMPONENT_MAP["glass-card"] = GlassCardDemo;
COMPONENT_MAP["count-up"] = CountUpDemo;
COMPONENT_MAP["rune-loader"] = RuneLoaderDemo;
COMPONENT_MAP["typewriter-text"] = TypewriterTextDemo;
COMPONENT_MAP["glitch-text"] = GlitchTextDemo;
COMPONENT_MAP["neon-glow-text"] = NeonGlowTextDemo;
COMPONENT_MAP["shiny-text"] = ShinyTextDemo;
COMPONENT_MAP["wave-text"] = WaveTextDemo;
COMPONENT_MAP["decrypt-text"] = DecryptTextDemo;
COMPONENT_MAP["colorful-text"] = ColorfulTextDemo;
COMPONENT_MAP["glowing-effect"] = GlowingEffectDemo;
COMPONENT_MAP["lightning-effect"] = LightningEffectDemo;
COMPONENT_MAP["stat-card"] = StatCardDemo;
COMPONENT_MAP["mjolnir-input"] = MjolnirInputDemo;
COMPONENT_MAP["mjolnir-select"] = MjolnirSelectDemo;
COMPONENT_MAP["mjolnir-modal"] = MjolnirModalDemo;
COMPONENT_MAP["wireframe-hammer"] = WireframeHammer;
COMPONENT_MAP["wireframe-orb"] = WireframeOrbDyn;
COMPONENT_MAP["wireframe-grid"] = WireframeGrid;
COMPONENT_MAP["bar-chart"] = BarChartDemo;
COMPONENT_MAP["line-chart"] = LineChartDemo;
COMPONENT_MAP["area-chart"] = AreaChartDemo;
COMPONENT_MAP["donut-chart"] = DonutChartDemo;
COMPONENT_MAP["sparkline"] = SparklineDemo;
COMPONENT_MAP["radial-bar"] = RadialBarDemo;
COMPONENT_MAP["data-table"] = DataTableDemo;
COMPONENT_MAP["heatmap"] = HeatmapDemo;
COMPONENT_MAP["progress-bar"] = ProgressBarDemo;
COMPONENT_MAP["skeleton"] = SkeletonDemo;
COMPONENT_MAP["avatar"] = AvatarDemo;
COMPONENT_MAP["toast"] = ToastDemo;
COMPONENT_MAP["alert"] = AlertDemo;
COMPONENT_MAP["banner"] = BannerDemo;
COMPONENT_MAP["checkbox"] = CheckboxDemo;
COMPONENT_MAP["switch"] = SwitchDemo;
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ── Controls Panel ─────────────────────────────────── */
function ControlSlider({ config, value, onChange }: {
  config: PropConfig;
  value: number;
  onChange: (v: number) => void;
}) {
  const displayVal = config.displayMultiplier
    ? (value * config.displayMultiplier).toFixed(0)
    : Number.isInteger(config.step) || (config.step && config.step >= 1)
      ? value.toFixed(0)
      : value.toFixed(2);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-300">{config.label}</label>
        <span className="text-xs font-mono text-gray-500">
          {displayVal}{config.suffix || ""}
        </span>
      </div>
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#FFCC11]"
      />
    </div>
  );
}

function ControlColor({ config, value, onChange }: {
  config: PropConfig;
  value: string | string[];
  onChange: (v: string | string[]) => void;
}) {
  if (Array.isArray(value)) {
    return (
      <div>
        <label className="text-xs font-medium text-gray-300 block mb-2">{config.label}</label>
        <div className="flex gap-2 flex-wrap">
          {value.map((c, i) => (
            <input
              key={i}
              type="color"
              value={c}
              onChange={(e) => {
                const next = [...value];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-700 bg-transparent"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-medium text-gray-300 block mb-2">{config.label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-700 bg-transparent"
        />
        <span className="text-xs font-mono text-gray-500">{value}</span>
      </div>
    </div>
  );
}

function ControlToggle({ config, value, onChange }: {
  config: PropConfig;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs font-medium text-gray-300">{config.label}</label>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          "w-10 h-5 rounded-full transition-colors relative",
          value ? "bg-[#FFCC11]" : "bg-zinc-700"
        )}
      >
        <div className={cn(
          "w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform",
          value ? "translate-x-5" : "translate-x-0.5"
        )} />
      </button>
    </div>
  );
}

function ControlSelect({ config, value, onChange }: {
  config: PropConfig;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-300 block mb-2">{config.label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs cursor-pointer focus:outline-none focus:border-[#FFCC11]/50"
      >
        {config.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ── Component Dropdown Selector ────────────────────── */
function ComponentSelector({ current, onSelect }: {
  current: ComponentMeta;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const grouped = useMemo(() => {
    const groups: Record<string, ComponentMeta[]> = {};
    COMPONENT_REGISTRY.forEach((c) => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, []);

  const categoryLabels: Record<string, string> = {
    "3d": "3D & WebGL",
    animations: "Animations",
    backgrounds: "Backgrounds",
    ui: "UI Components",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors text-white text-sm font-semibold min-w-[220px]"
      >
        <span className="flex-1 text-left">{current.name}</span>
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl z-50"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
          >
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div className="px-3 py-2.5 text-[11px] font-black text-[#FFCC11] uppercase tracking-widest sticky top-0 bg-zinc-900 border-b border-zinc-800/50">
                  {categoryLabels[cat] || cat}
                </div>
                {items.map((item) => {
                  const tierConfig = getTierConfig(item.requiredTier);
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onSelect(item.id); setOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left",
                        item.id === current.id
                          ? "bg-white/10 text-white"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <span className="flex-1">{item.name}</span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                        style={{ color: tierConfig.color, backgroundColor: `${tierConfig.color}15` }}>
                        {item.requiredTier}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STUDIO PAGE
   ═══════════════════════════════════════════════════════ */
export default function ComponentStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || "free";
  const trial = useFreeTrialUnlocks();

  const component = getComponentById(id);
  const propsConfig = COMPONENT_PROPS[id];

  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredTier: TierName;
    featureName: string;
  }>({ isOpen: false, requiredTier: "base", featureName: "" });

  /* Free-tier soft paywall — when a Free user lands on a Base-tier
     component, auto-spend one of their 5 trial unlocks (if available).
     The hook is no-op for already-unlocked components and refuses to
     unlock past the cap, so this is safe to fire on every mount. We
     wait for trial.ready so we don't double-grant on first paint. */
  useEffect(() => {
    if (!trial.ready) return;
    if (!trial.isEligible) return;
    if (!component) return;
    if (component.requiredTier !== "base") return;
    trial.tryUnlock(id);
  }, [trial.ready, trial.isEligible, component, id, trial]);

  // Build initial state from props config
  const initialValues = useMemo(() => {
    if (!propsConfig) return {};
    const vals: Record<string, unknown> = {};
    propsConfig.props.forEach((p) => {
      vals[p.key] = p.default;
    });
    // Merge hardcoded props
    if (propsConfig.hardcoded) {
      Object.entries(propsConfig.hardcoded).forEach(([k, v]) => {
        vals[k] = v;
      });
    }
    return vals;
  }, [propsConfig]);

  const [propValues, setPropValues] = useState<Record<string, unknown>>(initialValues);
  const [copied, setCopied] = useState(false);

  const updateProp = useCallback((key: string, value: unknown) => {
    setPropValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetProps = useCallback(() => {
    setPropValues(initialValues);
  }, [initialValues]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`npx mjolnirui add ${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComponentSwitch = (newId: string) => {
    router.push(`/blocks/browse/${newId}`);
  };

  // ── Not found ────────────────────────────────────────
  if (!component) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Component Not Found</h2>
          <p className="text-gray-400 mb-4">The component &ldquo;{id}&rdquo; doesn&apos;t exist in the registry.</p>
          <button onClick={() => router.push("/blocks/browse")}
            className="px-4 py-2 rounded-lg bg-[#FFCC11] text-black font-bold text-sm hover:bg-[#FFD700] transition">
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const tierConfig = getTierConfig(component.requiredTier);
  /* Effective gate logic:
       Pro / Elite gates stay strict — hasAccess decides.
       Base-tier on Free user: a trial unlock grants access. If the user
         has unlocked this exact componentId, it counts as access; if
         they've already used all 5 unlocks AND this one isn't in the
         set, lock them out the standard way.
       Free-tier items are always unlocked for everybody. */
  const isTrialAccess =
    trial.isEligible &&
    component.requiredTier === "base" &&
    trial.isComponentUnlocked(id);
  const isLocked =
    !hasAccess(userTier, component.requiredTier) && !isTrialAccess;
  const PreviewComponent = COMPONENT_MAP[id];

  return (
    <div className="h-full flex flex-col">
      {/* ── Top Bar ────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-4 px-4 py-3 border-b border-zinc-800/50">
        <button
          onClick={() => router.push("/blocks/browse")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm"
        >
          <ArrowLeft size={16} />
          <span>Browse</span>
        </button>

        <div className="w-px h-5 bg-zinc-800" />

        <ComponentSelector current={component} onSelect={handleComponentSwitch} />

        {/* Tier badge */}
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
          style={{ backgroundColor: `${tierConfig.color}20`, color: tierConfig.color, border: `1px solid ${tierConfig.color}40` }}>
          {component.requiredTier}
        </span>

        {/* Tech tags */}
        <div className="hidden md:flex items-center gap-1.5 ml-auto">
          {component.tech.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase text-gray-500 bg-zinc-900 border border-zinc-800">
              {t}
            </span>
          ))}
        </div>

        {/* Install command */}
        <button
          onClick={() => {
            if (isLocked) {
              setUpgradeModal({ isOpen: true, requiredTier: component.requiredTier, featureName: component.name });
            } else {
              handleCopy();
            }
          }}
          className={cn(
            "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-colors",
            isLocked
              ? "bg-zinc-900/50 border-zinc-800/50 text-gray-600 hover:border-zinc-700"
              : "bg-zinc-900 border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-600"
          )}
        >
          <span>npx mjolnirui add {id}</span>
          {isLocked ? (
            <LockKeyhole size={12} style={{ color: tierConfig.color }} />
          ) : copied ? (
            <Check size={12} className="text-green-400" />
          ) : (
            <Copy size={12} />
          )}
        </button>
      </div>

      {/* ── Free-trial banner — Free user on a Base-tier component ──
            Shows X of 5 unlocks used, with a prominent upgrade nudge once
            the cap is reached. Hidden once the user upgrades or for any
            non-base component. */}
      {trial.isEligible && component.requiredTier === "base" && (
        <FreeTrialBanner
          trial={trial}
          isCurrentUnlocked={isTrialAccess}
          onUpgrade={() =>
            setUpgradeModal({
              isOpen: true,
              requiredTier: "base",
              featureName: component.name,
            })
          }
        />
      )}

      {/* ── Main Content: Controls + Preview ────────── */}
      <div className="flex-1 flex min-h-0">
        {/* Left Controls Panel */}
        <div className="w-72 shrink-0 border-r border-zinc-800/50 flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
          >
            {propsConfig?.props.length ? (
              propsConfig.props.map((config) => {
                const value = propValues[config.key] ?? config.default;

                if (config.type === "range") {
                  return (
                    <ControlSlider
                      key={config.key}
                      config={config}
                      value={value as number}
                      onChange={(v) => updateProp(config.key, v)}
                    />
                  );
                }
                if (config.type === "color") {
                  return (
                    <ControlColor
                      key={config.key}
                      config={config}
                      value={value as string | string[]}
                      onChange={(v) => updateProp(config.key, v)}
                    />
                  );
                }
                if (config.type === "toggle") {
                  return (
                    <ControlToggle
                      key={config.key}
                      config={config}
                      value={value as boolean}
                      onChange={(v) => updateProp(config.key, v)}
                    />
                  );
                }
                if (config.type === "select") {
                  return (
                    <ControlSelect
                      key={config.key}
                      config={config}
                      value={value as string}
                      onChange={(v) => updateProp(config.key, v)}
                    />
                  );
                }
                return null;
              })
            ) : (
              <div className="text-center py-8">
                <Eye size={24} className="mx-auto mb-3 text-gray-600" />
                <p className="text-xs text-gray-500">This component has no customizable props yet.</p>
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="shrink-0 px-4 py-3 border-t border-zinc-800/50 space-y-2">
            <button
              onClick={resetProps}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 text-gray-400 hover:text-white hover:bg-zinc-800 transition text-xs font-medium"
            >
              <RotateCcw size={12} />
              Reset
            </button>
            <button
              onClick={() => {
                if (isLocked) {
                  setUpgradeModal({ isOpen: true, requiredTier: component.requiredTier, featureName: component.name });
                } else {
                  handleCopy();
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#FFCC11] text-black font-bold text-xs hover:bg-[#FFD700] transition"
            >
              {isLocked ? (
                <>
                  <LockKeyhole size={12} />
                  Upgrade to {component.requiredTier}
                </>
              ) : (
                <>
                  <Code2 size={12} />
                  Export Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Preview Canvas */}
        <div className="flex-1 relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            {PreviewComponent ? (
              <PreviewComponent {...propValues} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                Preview not available for this component
              </div>
            )}
          </div>

          {/* Component name watermark */}
          <div className="absolute bottom-4 left-4 text-[10px] font-mono text-gray-700 uppercase tracking-widest pointer-events-none">
            {component.id}
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal((prev) => ({ ...prev, isOpen: false }))}
        requiredTier={upgradeModal.requiredTier}
        featureName={upgradeModal.featureName}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FREE TRIAL BANNER
   Slim strip showing "X of 5 trial unlocks used" with state-aware copy:
     - Within the cap + current unlocked: green/celebratory ("unlocked!")
     - Within the cap + not-yet-unlocked: neutral progress
     - Cap reached + not unlocked: amber paywall nudge
   ═══════════════════════════════════════════════════════ */
function FreeTrialBanner({
  trial,
  isCurrentUnlocked,
  onUpgrade,
}: {
  trial: ReturnType<typeof useFreeTrialUnlocks>;
  isCurrentUnlocked: boolean;
  onUpgrade: () => void;
}) {
  const remaining = trial.MAX - trial.count;
  const atCap = !isCurrentUnlocked && !trial.canStillUnlock;

  const accent = atCap ? "#F59E0B" : isCurrentUnlocked ? "#10B981" : "#FFCC11";
  const bg = atCap
    ? "bg-amber-500/8 border-amber-500/30"
    : isCurrentUnlocked
      ? "bg-emerald-500/8 border-emerald-500/25"
      : "bg-zinc-900/50 border-zinc-800/50";

  return (
    <div
      className={`shrink-0 flex items-center gap-3 px-4 py-2 border-b ${bg}`}
    >
      <Sparkles size={13} style={{ color: accent }} />
      <div className="flex-1 min-w-0 text-xs">
        {atCap ? (
          <span className="text-amber-200">
            You&apos;ve used all <strong>5</strong> free trial unlocks. Upgrade
            to <strong>Base</strong> to unlock the rest of the library.
          </span>
        ) : isCurrentUnlocked ? (
          <span className="text-emerald-200">
            Unlocked via free trial · <strong>{remaining}</strong> of{" "}
            <strong>{trial.MAX}</strong> remaining
          </span>
        ) : (
          <span className="text-gray-400">
            Free trial · <strong>{trial.count}</strong> of{" "}
            <strong>{trial.MAX}</strong> unlocks used
          </span>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1 shrink-0">
        {Array.from({ length: trial.MAX }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition"
            style={{
              backgroundColor: i < trial.count ? accent : "#3f3f46",
              opacity: i < trial.count ? 1 : 0.6,
            }}
          />
        ))}
      </div>

      <button
        onClick={onUpgrade}
        className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition shrink-0"
        style={{
          color: accent,
          borderColor: `${accent}80`,
          background: `${accent}15`,
        }}
      >
        Upgrade
      </button>
    </div>
  );
}
