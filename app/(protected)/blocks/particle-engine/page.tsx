// Particle Engine — Pro/Elite tier
// React Bits-style interactive particle designer
// Left panel: preset gallery + control groups
// Right area: live tsparticles preview canvas
// Geometric shapes only (circle, square, triangle, polygon, star) — no image/char/emoji
"use client";

import React, { useEffect, useId, useMemo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import {
  ChevronDown, RotateCcw, Share2, Code2, Copy, Check,
  Image as ImageIcon, Info, Plus, X, Sparkles, Layers,
  Settings2, Palette, Move, MousePointer, Zap, Download,
} from "lucide-react";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
type ShapeKind = "circle" | "square" | "triangle" | "polygon" | "star";
type MoveDirection =
  | "none" | "top" | "top-right" | "right" | "bottom-right"
  | "bottom" | "bottom-left" | "left" | "top-left";
type OutMode = "bounce" | "out" | "destroy" | "none";
type HoverMode = "grab" | "bubble" | "repulse" | "connect" | "attract";
type ClickMode = "push" | "remove" | "pause" | "repulse" | "bubble" | "attract";

interface ParticleConfig {
  shapes: ShapeKind[];
  polygonSides: number;
  starPoints: number;
  count: number;
  sizeMin: number;
  sizeMax: number;
  opacityMin: number;
  opacityMax: number;
  opacityAnimate: boolean;
  speed: number;
  direction: MoveDirection;
  straight: boolean;
  outMode: OutMode;
  rotationEnable: boolean;
  rotationSpeed: number;
  rotationRandom: boolean;
  colors: string[];
  colorAnimate: boolean;
  linksEnable: boolean;
  linksDistance: number;
  linksOpacity: number;
  linksWidth: number;
  linksColor: string;
  linksTriangles: boolean;
  hoverEnable: boolean;
  hoverMode: HoverMode;
  clickEnable: boolean;
  clickMode: ClickMode;
  bgTransparent: boolean;
  bgColor: string;
  fpsLimit: number;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  tier: TierName;
  swatch: string[];
  config: ParticleConfig;
}

/* ═══════════════════════════════════════════════════════
   DEFAULT CONFIG
   ═══════════════════════════════════════════════════════ */
const DEFAULT_CONFIG: ParticleConfig = {
  shapes: ["circle"],
  polygonSides: 6,
  starPoints: 5,
  count: 120,
  sizeMin: 1,
  sizeMax: 4,
  opacityMin: 0.3,
  opacityMax: 0.9,
  opacityAnimate: true,
  speed: 1.2,
  direction: "none",
  straight: false,
  outMode: "out",
  rotationEnable: false,
  rotationSpeed: 5,
  rotationRandom: true,
  colors: ["#FFCC11", "#00f0ff"],
  colorAnimate: false,
  linksEnable: true,
  linksDistance: 140,
  linksOpacity: 0.35,
  linksWidth: 1,
  linksColor: "#ffffff",
  linksTriangles: false,
  hoverEnable: true,
  hoverMode: "grab",
  clickEnable: true,
  clickMode: "push",
  bgTransparent: true,
  bgColor: "#0a0a0f",
  fpsLimit: 120,
};

/* ═══════════════════════════════════════════════════════
   PRESETS — 12 configurations
   ═══════════════════════════════════════════════════════ */
const PRESETS: Preset[] = [
  {
    id: "starfield",
    name: "Starfield",
    description: "Drifting white pinpoints — minimalist starscape",
    tier: "pro",
    swatch: ["#ffffff", "#e5e7eb", "#94a3b8"],
    config: {
      ...DEFAULT_CONFIG,
      shapes: ["circle"],
      count: 200,
      sizeMin: 0.5, sizeMax: 2.5,
      opacityMin: 0.2, opacityMax: 0.9,
      speed: 0.3,
      colors: ["#ffffff", "#e5e7eb"],
      linksEnable: false,
    },
  },
  {
    id: "snow",
    name: "Snowfall",
    description: "Gentle falling snow with drift",
    tier: "pro",
    swatch: ["#ffffff", "#e0f2fe"],
    config: {
      ...DEFAULT_CONFIG,
      shapes: ["circle"],
      count: 150,
      sizeMin: 1, sizeMax: 5,
      speed: 1.8, direction: "bottom", straight: false,
      colors: ["#ffffff"],
      linksEnable: false,
      opacityMin: 0.5, opacityMax: 1,
    },
  },
  {
    id: "constellation",
    name: "Constellation",
    description: "Connected dot network with grab interaction",
    tier: "pro",
    swatch: ["#00f0ff", "#FFCC11"],
    config: {
      ...DEFAULT_CONFIG,
      shapes: ["circle"],
      count: 100,
      speed: 0.6,
      colors: ["#00f0ff"],
      linksEnable: true, linksDistance: 160, linksOpacity: 0.4, linksColor: "#00f0ff",
      hoverMode: "grab",
    },
  },
  {
    id: "fireflies",
    name: "Fireflies",
    description: "Pulsing golden dots in random drift",
    tier: "pro",
    swatch: ["#FFCC11", "#B87333"],
    config: {
      ...DEFAULT_CONFIG,
      shapes: ["circle"],
      count: 80,
      sizeMin: 2, sizeMax: 5,
      speed: 0.8,
      colors: ["#FFCC11", "#fde68a"],
      opacityAnimate: true, opacityMin: 0.2, opacityMax: 1,
      linksEnable: false,
      hoverMode: "bubble",
    },
  },
  {
    id: "electric-sparks",
    name: "Electric Sparks",
    description: "Bright cyan shards with repulse on hover",
    tier: "pro",
    swatch: ["#00f0ff", "#ffffff"],
    config: {
      ...DEFAULT_CONFIG,
      shapes: ["star"], starPoints: 4,
      count: 70,
      sizeMin: 1, sizeMax: 4,
      speed: 2.5, rotationEnable: true, rotationSpeed: 20,
      colors: ["#00f0ff", "#ffffff"],
      linksEnable: false,
      hoverMode: "repulse",
    },
  },
  {
    id: "cosmic-dust",
    name: "Cosmic Dust",
    description: "Multicolor haze with slow drift and glow",
    tier: "pro",
    swatch: ["#8b5cf6", "#ec4899", "#00f0ff"],
    config: {
      ...DEFAULT_CONFIG,
      shapes: ["circle"],
      count: 250,
      sizeMin: 0.3, sizeMax: 2,
      speed: 0.4,
      colors: ["#8b5cf6", "#ec4899", "#00f0ff", "#FFCC11"],
      opacityMin: 0.1, opacityMax: 0.7,
      linksEnable: false,
    },
  },
  {
    id: "polygon-mesh",
    name: "Polygon Mesh",
    description: "Hexagonal particles forming a network",
    tier: "pro",
    swatch: ["#FFCC11", "#00f0ff", "#ffffff"],
    config: {
      ...DEFAULT_CONFIG,
      shapes: ["polygon"], polygonSides: 6,
      count: 60,
      sizeMin: 3, sizeMax: 6,
      speed: 0.5,
      colors: ["#FFCC11"],
      linksEnable: true, linksDistance: 180, linksTriangles: true, linksOpacity: 0.2,
      rotationEnable: true, rotationSpeed: 8,
    },
  },
  {
    id: "matrix-shards",
    name: "Matrix Shards",
    description: "Green triangles falling vertically",
    tier: "pro",
    swatch: ["#10B981", "#065f46"],
    config: {
      ...DEFAULT_CONFIG,
      shapes: ["triangle"],
      count: 120,
      sizeMin: 2, sizeMax: 6,
      speed: 3, direction: "bottom",
      colors: ["#10B981", "#34d399"],
      linksEnable: false,
      rotationEnable: true, rotationSpeed: 12,
    },
  },
  {
    id: "bifrost-glitter",
    name: "Bifrost Glitter",
    description: "Rainbow stars across the bridge",
    tier: "pro",
    swatch: ["#FFCC11", "#00f0ff", "#8b5cf6"],
    config: {
      ...DEFAULT_CONFIG,
      shapes: ["star"], starPoints: 5,
      count: 150,
      sizeMin: 1, sizeMax: 4,
      speed: 1.2,
      colors: ["#FFCC11", "#00f0ff", "#8b5cf6", "#ec4899", "#10B981"],
      opacityAnimate: true,
      rotationEnable: true, rotationSpeed: 10,
      linksEnable: false,
    },
  },
  {
    id: "mjolnir-sparks",
    name: "Mjolnir Sparks",
    description: "Gold sparks with electric links — ELITE",
    tier: "elite",
    swatch: ["#FFCC11", "#00f0ff"],
    config: {
      ...DEFAULT_CONFIG,
      shapes: ["star", "circle"], starPoints: 6,
      count: 100,
      sizeMin: 1, sizeMax: 4,
      speed: 1.8,
      colors: ["#FFCC11", "#fde68a", "#00f0ff"],
      linksEnable: true, linksDistance: 120, linksColor: "#00f0ff", linksOpacity: 0.5,
      hoverMode: "attract",
      opacityAnimate: true,
    },
  },
  {
    id: "valhalla-ember",
    name: "Valhalla Ember",
    description: "Rising warm embers with flicker — ELITE",
    tier: "elite",
    swatch: ["#FFCC11", "#ef4444", "#B87333"],
    config: {
      ...DEFAULT_CONFIG,
      shapes: ["circle"],
      count: 180,
      sizeMin: 0.5, sizeMax: 3,
      speed: 1.8, direction: "top",
      colors: ["#FFCC11", "#ef4444", "#B87333", "#fde68a"],
      opacityAnimate: true, opacityMin: 0.2, opacityMax: 1,
      linksEnable: false,
    },
  },
  {
    id: "quantum-foam",
    name: "Quantum Foam",
    description: "Chaotic multi-shape with triangle links — ELITE",
    tier: "elite",
    swatch: ["#8b5cf6", "#00f0ff", "#ffffff"],
    config: {
      ...DEFAULT_CONFIG,
      shapes: ["circle", "polygon", "star"], polygonSides: 4, starPoints: 8,
      count: 90,
      sizeMin: 1, sizeMax: 5,
      speed: 1.2,
      colors: ["#8b5cf6", "#00f0ff", "#ffffff"],
      linksEnable: true, linksDistance: 150, linksOpacity: 0.3, linksTriangles: true,
      rotationEnable: true, rotationSpeed: 15, rotationRandom: true,
      hoverMode: "connect",
    },
  },
];

/* ═══════════════════════════════════════════════════════
   CONTROL SUB-COMPONENTS
   ═══════════════════════════════════════════════════════ */
function Slider({ label, value, min = 0, max = 100, step = 1, onChange }: {
  label: string; value: number; min?: number; max?: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-xs font-mono text-gray-400">{step < 1 ? value.toFixed(2) : value.toFixed(0)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#FFCC11]
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FFCC11]"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-[#FFCC11]' : 'bg-zinc-700'}`}
        aria-label={`Toggle ${label}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function Select<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm text-gray-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white
          focus:outline-none focus:ring-2 focus:ring-[#FFCC11]/40 focus:border-[#FFCC11]/40"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function ColorSwatchPicker({ label, colors, onChange, max = 6 }: {
  label: string; colors: string[]; onChange: (c: string[]) => void; max?: number;
}) {
  const defaults = ["#FFCC11", "#00f0ff", "#8b5cf6", "#ec4899", "#10B981", "#ef4444"];
  const removeColor = (i: number) => onChange(colors.filter((_, idx) => idx !== i));
  const addColor = () => onChange([...colors, defaults[colors.length % defaults.length]]);

  return (
    <div className="space-y-2">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        {colors.map((color, i) => (
          <div key={i} className="relative group">
            <input
              type="color" value={color}
              onChange={(e) => { const next = [...colors]; next[i] = e.target.value; onChange(next); }}
              className="w-9 h-9 rounded-lg border-2 border-zinc-700 cursor-pointer bg-transparent appearance-none
                [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
              aria-label={`Color ${i + 1}`}
            />
            {colors.length > 1 && (
              <button
                onClick={() => removeColor(i)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-600
                  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove color"
              >
                <X size={8} className="text-gray-400" />
              </button>
            )}
          </div>
        ))}
        {colors.length < max && (
          <button onClick={addColor}
            className="w-9 h-9 rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center
              text-gray-500 hover:text-white hover:border-zinc-500 transition-colors"
            aria-label="Add color"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function CollapsibleSection({ title, icon: Icon, defaultOpen = true, children }: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-800/60">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 px-1 text-left hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-200">
          <Icon size={14} className="text-[#FFCC11]" />
          {title}
        </span>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-1 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CONFIG → TSPARTICLES OPTIONS
   ═══════════════════════════════════════════════════════ */
function buildOptions(c: ParticleConfig) {
  const shapeType = c.shapes.length === 1 ? c.shapes[0] : [...c.shapes];
  return {
    background: {
      color: { value: c.bgTransparent ? "transparent" : c.bgColor },
    },
    fullScreen: { enable: false },
    fpsLimit: c.fpsLimit,
    detectRetina: true,
    interactivity: {
      events: {
        onHover: { enable: c.hoverEnable, mode: c.hoverMode },
        onClick: { enable: c.clickEnable, mode: c.clickMode },
      },
      modes: {
        grab: { distance: 160, links: { opacity: 0.6 } },
        bubble: { distance: 200, size: 8, duration: 1, opacity: 0.9 },
        repulse: { distance: 140, duration: 0.4 },
        push: { quantity: 4 },
        remove: { quantity: 2 },
        attract: { distance: 200, duration: 0.4, factor: 3 },
        connect: { distance: 120, links: { opacity: 0.4 }, radius: 100 },
      },
    },
    particles: {
      number: { value: c.count, density: { enable: true, area: 800 } },
      color: { value: c.colors, animation: c.colorAnimate ? { enable: true, speed: 20, sync: false } : undefined },
      shape: {
        type: shapeType,
        options: {
          polygon: { sides: c.polygonSides },
          star: { sides: c.starPoints },
        },
      },
      opacity: {
        value: { min: c.opacityMin, max: c.opacityMax },
        animation: c.opacityAnimate
          ? { enable: true, speed: 1.5, sync: false, startValue: "random" as const }
          : { enable: false },
      },
      size: { value: { min: c.sizeMin, max: c.sizeMax } },
      move: {
        enable: true,
        speed: { min: 0.1, max: c.speed },
        direction: c.direction,
        random: !c.straight,
        straight: c.straight,
        outModes: { default: c.outMode },
      },
      rotate: c.rotationEnable
        ? {
            value: { min: 0, max: 360 },
            direction: c.rotationRandom ? ("random" as const) : ("clockwise" as const),
            animation: { enable: true, speed: c.rotationSpeed, sync: false },
          }
        : undefined,
      links: c.linksEnable
        ? {
            enable: true,
            distance: c.linksDistance,
            color: c.linksColor,
            opacity: c.linksOpacity,
            width: c.linksWidth,
            triangles: { enable: c.linksTriangles, opacity: 0.1 },
          }
        : { enable: false },
    },
  };
}

/* ═══════════════════════════════════════════════════════
   EXPORT GENERATORS
   ═══════════════════════════════════════════════════════ */
function generateJsonExport(c: ParticleConfig): string {
  return JSON.stringify(buildOptions(c), null, 2);
}

function generateReactExport(c: ParticleConfig): string {
  const optionsStr = JSON.stringify(buildOptions(c), null, 2);
  return `"use client";
import { useEffect, useId, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function MyParticles() {
  const [ready, setReady] = useState(false);
  const id = useId();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  const options = ${optionsStr};

  return <Particles id={id} options={options} className="absolute inset-0" />;
}
`;
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
export default function ParticleEnginePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userTier = (session?.user?.tier as TierName) || "free";
  const hasParticleAccess = hasAccess(userTier, "pro");

  const [engineReady, setEngineReady] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESETS[0].id);
  const [config, setConfig] = useState<ParticleConfig>(PRESETS[0].config);
  const [upgradeModal, setUpgradeModal] = useState<{ isOpen: boolean; requiredTier: TierName; featureName: string }>({
    isOpen: false, requiredTier: "pro", featureName: "",
  });
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const particlesId = useId();

  useEffect(() => {
    if (engineReady) return;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, [engineReady]);

  const options = useMemo(() => buildOptions(config), [config]);

  const applyPreset = useCallback((preset: Preset) => {
    if (!hasAccess(userTier, preset.tier)) {
      setUpgradeModal({ isOpen: true, requiredTier: preset.tier, featureName: preset.name });
      return;
    }
    setSelectedPresetId(preset.id);
    setConfig(preset.config);
  }, [userTier]);

  const updateConfig = useCallback(<K extends keyof ParticleConfig>(key: K, value: ParticleConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetConfig = useCallback(() => {
    const current = PRESETS.find(p => p.id === selectedPresetId);
    if (current) setConfig(current.config);
  }, [selectedPresetId]);

  const doCopy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(label);
      setTimeout(() => setCopyFeedback(null), 1500);
    } catch {
      setCopyFeedback("Failed");
      setTimeout(() => setCopyFeedback(null), 1500);
    }
  }, []);

  const downloadPng = useCallback(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(`#tsparticles-${particlesId} canvas`);
    if (!canvas) {
      setCopyFeedback("Canvas not ready");
      setTimeout(() => setCopyFeedback(null), 1500);
      return;
    }
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `mjolnir-particles-${Date.now()}.png`;
    a.click();
  }, [particlesId]);

  /* ── Paywall screen for free/base users ────────────── */
  if (session && !hasParticleAccess) {
    const proTier = getTierConfig("pro");
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl text-center space-y-6 bg-linear-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-10"
          style={{ boxShadow: `0 0 80px ${proTier.color}20` }}
        >
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${proTier.color}20` }}
          >
            <Sparkles size={32} style={{ color: proTier.color }} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Particle Engine</h1>
            <p className="text-gray-400">
              The Particle Engine is a Pro-tier tool. Unlock 12 presets, 5 geometric shapes,
              full physics controls, and instant code export.
            </p>
          </div>
          <button
            onClick={() => router.push("/blocks/account/subscription")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFCC11] text-black font-semibold hover:bg-[#FFD700] transition-colors"
          >
            Upgrade to Pro
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── Main studio view ──────────────────────────────── */
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* ═════ LEFT PANEL ═════ */}
      <aside className="lg:w-[380px] w-full lg:h-full overflow-y-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        {/* Header */}
        <div className="flex items-center gap-2 pb-4 mb-2 border-b border-zinc-800/60">
          <div className="w-8 h-8 rounded-lg bg-[#FFCC11]/20 flex items-center justify-center">
            <Sparkles size={16} className="text-[#FFCC11]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Particle Engine</h2>
            <p className="text-xs text-gray-500">Asgardian-grade particles</p>
          </div>
        </div>

        {/* Preset Gallery */}
        <CollapsibleSection title="Preset Gallery" icon={Layers} defaultOpen>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map(preset => {
              const locked = !hasAccess(userTier, preset.tier);
              const tierCfg = getTierConfig(preset.tier);
              const active = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  title={preset.description}
                  className={`relative text-left p-2.5 rounded-lg border transition-all group ${
                    active
                      ? "border-[#FFCC11]/60 bg-[#FFCC11]/5"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
                  }`}
                >
                  <div className="flex gap-1 mb-1.5">
                    {preset.swatch.slice(0, 3).map((c, i) => (
                      <span key={i}
                        className="inline-block w-3 h-3 rounded-full border border-white/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-white leading-tight">{preset.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className="text-[9px] uppercase tracking-wide font-bold"
                      style={{ color: tierCfg.color }}
                    >
                      {preset.tier}
                    </span>
                    {locked && <span className="text-gray-500 text-[10px]">🔒</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </CollapsibleSection>

        {/* Shape & Count */}
        <CollapsibleSection title="Shape & Count" icon={Settings2}>
          <div className="space-y-2">
            <span className="text-sm text-gray-300">Shapes (multi-select)</span>
            <div className="grid grid-cols-3 gap-1.5">
              {(["circle", "square", "triangle", "polygon", "star"] as ShapeKind[]).map(s => {
                const on = config.shapes.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => {
                      const next = on
                        ? config.shapes.filter(x => x !== s)
                        : [...config.shapes, s];
                      if (next.length > 0) updateConfig("shapes", next);
                    }}
                    className={`py-1.5 px-2 rounded text-xs capitalize transition-colors ${
                      on ? "bg-[#FFCC11] text-black font-semibold" : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          {config.shapes.includes("polygon") && (
            <Slider label="Polygon sides" value={config.polygonSides} min={3} max={12} step={1}
              onChange={v => updateConfig("polygonSides", v)} />
          )}
          {config.shapes.includes("star") && (
            <Slider label="Star points" value={config.starPoints} min={3} max={10} step={1}
              onChange={v => updateConfig("starPoints", v)} />
          )}
          <Slider label="Particle count" value={config.count} min={10} max={600} step={10}
            onChange={v => updateConfig("count", v)} />
        </CollapsibleSection>

        {/* Size & Opacity */}
        <CollapsibleSection title="Size & Opacity" icon={Palette} defaultOpen={false}>
          <Slider label="Size min" value={config.sizeMin} min={0.1} max={10} step={0.1}
            onChange={v => updateConfig("sizeMin", Math.min(v, config.sizeMax))} />
          <Slider label="Size max" value={config.sizeMax} min={0.1} max={20} step={0.1}
            onChange={v => updateConfig("sizeMax", Math.max(v, config.sizeMin))} />
          <Slider label="Opacity min" value={config.opacityMin} min={0} max={1} step={0.05}
            onChange={v => updateConfig("opacityMin", Math.min(v, config.opacityMax))} />
          <Slider label="Opacity max" value={config.opacityMax} min={0} max={1} step={0.05}
            onChange={v => updateConfig("opacityMax", Math.max(v, config.opacityMin))} />
          <Toggle label="Animate opacity" checked={config.opacityAnimate}
            onChange={v => updateConfig("opacityAnimate", v)} />
        </CollapsibleSection>

        {/* Movement & Rotation */}
        <CollapsibleSection title="Movement & Rotation" icon={Move} defaultOpen={false}>
          <Slider label="Speed" value={config.speed} min={0} max={8} step={0.1}
            onChange={v => updateConfig("speed", v)} />
          <Select
            label="Direction"
            value={config.direction}
            options={[
              { value: "none", label: "Random" },
              { value: "top", label: "Top" },
              { value: "bottom", label: "Bottom" },
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
              { value: "top-right", label: "Top-Right" },
              { value: "top-left", label: "Top-Left" },
              { value: "bottom-right", label: "Bottom-Right" },
              { value: "bottom-left", label: "Bottom-Left" },
            ] as const}
            onChange={v => updateConfig("direction", v)}
          />
          <Toggle label="Straight path" checked={config.straight}
            onChange={v => updateConfig("straight", v)} />
          <Select
            label="Out mode"
            value={config.outMode}
            options={[
              { value: "out", label: "Out (wrap)" },
              { value: "bounce", label: "Bounce" },
              { value: "destroy", label: "Destroy" },
              { value: "none", label: "None" },
            ] as const}
            onChange={v => updateConfig("outMode", v)}
          />
          <Toggle label="Rotate particles" checked={config.rotationEnable}
            onChange={v => updateConfig("rotationEnable", v)} />
          {config.rotationEnable && (
            <>
              <Slider label="Rotation speed" value={config.rotationSpeed} min={0} max={50} step={1}
                onChange={v => updateConfig("rotationSpeed", v)} />
              <Toggle label="Random direction" checked={config.rotationRandom}
                onChange={v => updateConfig("rotationRandom", v)} />
            </>
          )}
        </CollapsibleSection>

        {/* Color & Links */}
        <CollapsibleSection title="Color & Links" icon={Palette} defaultOpen={false}>
          <ColorSwatchPicker label="Particle colors" colors={config.colors}
            onChange={v => updateConfig("colors", v)} />
          <Toggle label="HSL color animation" checked={config.colorAnimate}
            onChange={v => updateConfig("colorAnimate", v)} />
          <Toggle label="Enable links (connections)" checked={config.linksEnable}
            onChange={v => updateConfig("linksEnable", v)} />
          {config.linksEnable && (
            <>
              <Slider label="Link distance" value={config.linksDistance} min={50} max={300} step={10}
                onChange={v => updateConfig("linksDistance", v)} />
              <Slider label="Link opacity" value={config.linksOpacity} min={0} max={1} step={0.05}
                onChange={v => updateConfig("linksOpacity", v)} />
              <Slider label="Link width" value={config.linksWidth} min={0.5} max={4} step={0.5}
                onChange={v => updateConfig("linksWidth", v)} />
              <div className="space-y-2">
                <span className="text-sm text-gray-300">Link color</span>
                <input type="color" value={config.linksColor}
                  onChange={(e) => updateConfig("linksColor", e.target.value)}
                  className="w-full h-9 rounded-lg bg-transparent border border-zinc-700 cursor-pointer"
                />
              </div>
              <Toggle label="Triangulate" checked={config.linksTriangles}
                onChange={v => updateConfig("linksTriangles", v)} />
            </>
          )}
        </CollapsibleSection>

        {/* Interactivity */}
        <CollapsibleSection title="Interactivity" icon={MousePointer} defaultOpen={false}>
          <Toggle label="Hover enabled" checked={config.hoverEnable}
            onChange={v => updateConfig("hoverEnable", v)} />
          {config.hoverEnable && (
            <Select
              label="Hover mode"
              value={config.hoverMode}
              options={[
                { value: "grab", label: "Grab" },
                { value: "bubble", label: "Bubble" },
                { value: "repulse", label: "Repulse" },
                { value: "connect", label: "Connect" },
                { value: "attract", label: "Attract" },
              ] as const}
              onChange={v => updateConfig("hoverMode", v)}
            />
          )}
          <Toggle label="Click enabled" checked={config.clickEnable}
            onChange={v => updateConfig("clickEnable", v)} />
          {config.clickEnable && (
            <Select
              label="Click mode"
              value={config.clickMode}
              options={[
                { value: "push", label: "Push (add)" },
                { value: "remove", label: "Remove" },
                { value: "pause", label: "Pause" },
                { value: "repulse", label: "Repulse" },
                { value: "bubble", label: "Bubble" },
                { value: "attract", label: "Attract" },
              ] as const}
              onChange={v => updateConfig("clickMode", v)}
            />
          )}
        </CollapsibleSection>

        {/* Background */}
        <CollapsibleSection title="Background" icon={Zap} defaultOpen={false}>
          <Toggle label="Transparent background" checked={config.bgTransparent}
            onChange={v => updateConfig("bgTransparent", v)} />
          {!config.bgTransparent && (
            <div className="space-y-2">
              <span className="text-sm text-gray-300">Background color</span>
              <input type="color" value={config.bgColor}
                onChange={(e) => updateConfig("bgColor", e.target.value)}
                className="w-full h-9 rounded-lg bg-transparent border border-zinc-700 cursor-pointer"
              />
            </div>
          )}
          <Slider label="FPS limit" value={config.fpsLimit} min={30} max={120} step={10}
            onChange={v => updateConfig("fpsLimit", v)} />
        </CollapsibleSection>

        {/* Footer actions */}
        <div className="pt-4 mt-2 space-y-2">
          <button
            onClick={resetConfig}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-gray-300 transition-colors"
          >
            <RotateCcw size={14} />
            Reset to preset
          </button>
        </div>
      </aside>

      {/* ═════ RIGHT PREVIEW ═════ */}
      <section className="flex-1 relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/10">
        {/* Preview */}
        <div className="absolute inset-0" style={{ backgroundColor: config.bgTransparent ? "#0a0a0f" : config.bgColor }}>
          {engineReady && (
            <Particles
              id={`tsparticles-${particlesId}`}
              options={options}
              className="absolute inset-0"
            />
          )}
        </div>

        {/* Export toolbar */}
        <div className="absolute top-4 right-4 flex flex-wrap gap-2 z-10">
          <button
            onClick={() => doCopy(generateJsonExport(config), "JSON copied")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs text-gray-200 hover:text-white hover:border-[#FFCC11]/40 transition-colors"
          >
            {copyFeedback === "JSON copied" ? <Check size={12} /> : <Copy size={12} />}
            JSON
          </button>
          <button
            onClick={() => doCopy(generateReactExport(config), "React copied")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs text-gray-200 hover:text-white hover:border-[#FFCC11]/40 transition-colors"
          >
            {copyFeedback === "React copied" ? <Check size={12} /> : <Code2 size={12} />}
            React
          </button>
          <button
            onClick={downloadPng}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs text-gray-200 hover:text-white hover:border-[#FFCC11]/40 transition-colors"
          >
            <Download size={12} />
            PNG
          </button>
        </div>

        {/* Copy feedback toast */}
        <AnimatePresence>
          {copyFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-[#FFCC11] text-black text-xs font-semibold shadow-lg z-20"
            >
              {copyFeedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom info */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-500 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg">
          <Info size={12} />
          {config.count} particles · {config.shapes.join(", ")} · {options.fpsLimit} FPS
        </div>
      </section>

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal(p => ({ ...p, isOpen: false }))}
        requiredTier={upgradeModal.requiredTier}
        featureName={upgradeModal.featureName}
      />
    </div>
  );
}
