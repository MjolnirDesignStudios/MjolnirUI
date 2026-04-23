// Animated Text Playground — showcase for AuroraText, GradientText, TextReveal
// Left panel: type tabs, shared typography controls, per-component controls
// Right area: large live preview
// Bottom: export actions (Copy React, Copy HTML+CSS, Reset)
// Free tier — no paywall gate, but mirrors the `(protected)` session pattern.
"use client";
import React, { useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, Copy, Check, Code2, Plus, X,
  Sparkles, Waves as WavesIcon, Type as TypeIcon, FileCode2,
} from "lucide-react";
import { AuroraText } from "@/components/ui/AuroraText";
import GradientText from "@/components/ui/GradientText";
import { TextReveal } from "@/components/ui/TextReveal";
import type { TierName } from "@/lib/tierConfig";

/* ═══════════════════════════════════════════════════════
   TYPES & REGISTRY
   ═══════════════════════════════════════════════════════ */

type ComponentId = "aurora" | "gradient" | "reveal";

const COMPONENT_TYPES: {
  id: ComponentId;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "aurora",   label: "Aurora Text",   description: "Flowing aurora gradient animation across the text fill", icon: Sparkles },
  { id: "gradient", label: "Gradient Text", description: "Directional gradient flow with optional yoyo loop",       icon: WavesIcon },
  { id: "reveal",   label: "Text Reveal",   description: "Per-character or per-word entrance reveal animation",     icon: TypeIcon  },
];

const FONT_OPTIONS = [
  { id: "font-heading", label: "Satoshi",    cssVar: "var(--font-heading, 'Satoshi', system-ui, sans-serif)" },
  { id: "font-body",    label: "Ubuntu",     cssVar: "var(--font-body, 'Ubuntu', system-ui, sans-serif)"    },
  { id: "font-mono",    label: "Geist Mono", cssVar: "var(--font-mono, 'Geist Mono', ui-monospace, monospace)" },
] as const;
type FontId = typeof FONT_OPTIONS[number]["id"];

const WEIGHT_OPTIONS = [400, 600, 700, 900] as const;

const REVEAL_DIRECTIONS = [
  { id: "top",    label: "Top",    animation: "blurInUp"   as const },
  { id: "bottom", label: "Bottom", animation: "blurInUp"   as const }, // framer reuses blurInUp; direction flag toggles Y sign via style
  { id: "left",   label: "Left",   animation: "blurInLeft" as const },
  { id: "right",  label: "Right",  animation: "fadeInLeft" as const },
] as const;
type RevealDirectionId = typeof REVEAL_DIRECTIONS[number]["id"];

const GRADIENT_DIRECTIONS = [
  { id: "horizontal", label: "Horizontal" },
  { id: "vertical",   label: "Vertical"   },
  { id: "diagonal",   label: "Diagonal"   },
] as const;
type GradientDirectionId = typeof GRADIENT_DIRECTIONS[number]["id"];

/* ═══════════════════════════════════════════════════════
   SHARED CONTROL COMPONENTS (copied from background-studio)
   ═══════════════════════════════════════════════════════ */

function Slider({ label, value, min = 0, max = 100, step = 1, onChange }: {
  label: string; value: number; min?: number; max?: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm font-mono text-gray-400">{value.toFixed(step < 1 ? 2 : 0)}</span>
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
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative ${checked ? "bg-[#FFCC11]" : "bg-zinc-700"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function ColorPicker({ colors, onChange, min = 2, max = 6 }: {
  colors: string[]; onChange: (colors: string[]) => void; min?: number; max?: number;
}) {
  const removeColor = (index: number) => {
    if (colors.length <= min) return;
    onChange(colors.filter((_, i) => i !== index));
  };
  const addColor = () => {
    const defaults = ["#FFCC11", "#00f0ff", "#ec4899", "#10b981", "#f59e0b", "#6366f1"];
    onChange([...colors, defaults[colors.length % defaults.length]]);
  };

  return (
    <div className="space-y-2">
      <span className="text-sm text-gray-300">Colors</span>
      <div className="flex items-center gap-2 flex-wrap">
        {colors.map((color, i) => (
          <div key={i} className="relative group">
            <input
              type="color" value={color} aria-label={`Color ${i + 1}`}
              onChange={(e) => { const next = [...colors]; next[i] = e.target.value; onChange(next); }}
              className="w-10 h-10 rounded-lg border-2 border-zinc-700 cursor-pointer bg-transparent appearance-none
                [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
            />
            {colors.length > min && (
              <button
                type="button"
                aria-label={`Remove color ${i + 1}`}
                onClick={() => removeColor(i)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-600
                  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={8} className="text-gray-400" />
              </button>
            )}
          </div>
        ))}
        {colors.length < max && (
          <button
            type="button"
            aria-label="Add color"
            onClick={addColor}
            className="w-10 h-10 rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center
              text-gray-500 hover:text-white hover:border-zinc-500 transition-colors"
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function Select<T extends string | number>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[] | { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button
            key={String(o.id)}
            type="button"
            onClick={() => onChange(o.id)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors
              ${o.id === value
                ? "bg-[#FFCC11]/15 border-[#FFCC11]/60 text-white"
                : "bg-zinc-900 border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-500"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */

const DEFAULT_TEXT = "Mjolnir Unleashed";

interface AuroraState   { colors: string[]; speed: number; blur: number }
interface GradientState { colors: string[]; speed: number; direction: GradientDirectionId; yoyo: boolean }
interface RevealState   { delay: number; stagger: number; blur: number; direction: RevealDirectionId; loop: boolean; by: "character" | "word" }

const DEFAULTS = {
  aurora:   { colors: ["#FFCC11", "#FFA500", "#FFD700", "#B87333"], speed: 1,   blur: 0 }   as AuroraState,
  gradient: { colors: ["#FFCC11", "#00f0ff", "#ec4899"],             speed: 8,   direction: "horizontal" as GradientDirectionId, yoyo: true } as GradientState,
  reveal:   { delay: 0, stagger: 0.75, blur: 8, direction: "left" as RevealDirectionId, loop: false, by: "character" }             as RevealState,
};

export default function AnimatedTextPlaygroundPage() {
  // Session kept for consistency with other protected routes (tier not used — free access).
  useSession();

  const [componentId, setComponentId] = useState<ComponentId>("aurora");

  // Shared typography
  const [text, setText] = useState(DEFAULT_TEXT);
  const [fontId, setFontId] = useState<FontId>("font-heading");
  const [fontSize, setFontSize] = useState(72);
  const [fontWeight, setFontWeight] = useState<number>(900);

  // Per-component state
  const [aurora, setAurora]     = useState<AuroraState>(DEFAULTS.aurora);
  const [gradient, setGradient] = useState<GradientState>(DEFAULTS.gradient);
  const [reveal, setReveal]     = useState<RevealState>(DEFAULTS.reveal);

  // Reveal loop forces remount of TextReveal on key bump
  const [revealKey, setRevealKey] = useState(0);
  const loopTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    if (loopTimerRef.current) {
      clearInterval(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    if (componentId === "reveal" && reveal.loop) {
      const cycleMs = Math.max(1500, (reveal.delay + reveal.stagger) * 1000 + 800);
      loopTimerRef.current = setInterval(() => setRevealKey((k) => k + 1), cycleMs);
    }
    return () => {
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);
    };
  }, [componentId, reveal.loop, reveal.delay, reveal.stagger]);

  const [copiedKind, setCopiedKind] = useState<"react" | "html" | null>(null);

  const handleReset = () => {
    setText(DEFAULT_TEXT);
    setFontId("font-heading");
    setFontSize(72);
    setFontWeight(900);
    setAurora(DEFAULTS.aurora);
    setGradient(DEFAULTS.gradient);
    setReveal(DEFAULTS.reveal);
    setRevealKey((k) => k + 1);
  };

  /* ── Snippet builders ────────────────────────────── */

  const reactSnippet = useMemo(() => {
    const safe = text.replace(/`/g, "\\`");
    if (componentId === "aurora") {
      return `import { AuroraText } from "@/components/ui/AuroraText";

export function Demo() {
  return (
    <AuroraText
      colors={${JSON.stringify(aurora.colors)}}
      speed={${aurora.speed}}
      className="font-${fontId.replace("font-", "")}"
    >
      {\`${safe}\`}
    </AuroraText>
  );
}`;
    }
    if (componentId === "gradient") {
      return `import GradientText from "@/components/ui/GradientText";

export function Demo() {
  return (
    <GradientText
      colors={${JSON.stringify(gradient.colors)}}
      animationSpeed={${gradient.speed}}
      direction="${gradient.direction}"
      yoyo={${gradient.yoyo}}
      className="font-${fontId.replace("font-", "")}"
    >
      {\`${safe}\`}
    </GradientText>
  );
}`;
    }
    // reveal
    const revealCfg = REVEAL_DIRECTIONS.find((d) => d.id === reveal.direction)!;
    return `import { TextReveal } from "@/components/ui/TextReveal";

export function Demo() {
  return (
    <TextReveal
      delay={${reveal.delay}}
      duration={${reveal.stagger}}
      by="${reveal.by}"
      animation="${revealCfg.animation}"
      className="font-${fontId.replace("font-", "")}"
    >
      {\`${safe}\`}
    </TextReveal>
  );
}`;
  }, [componentId, text, fontId, aurora, gradient, reveal]);

  const htmlSnippet = useMemo(() => {
    const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const fontCss = FONT_OPTIONS.find((f) => f.id === fontId)!.cssVar;
    const baseStyle = `font-family:${fontCss};font-size:${fontSize}px;font-weight:${fontWeight};`;

    if (componentId === "aurora") {
      const gradientCss = `linear-gradient(270deg, ${aurora.colors.join(", ")}, ${aurora.colors[0]})`;
      const duration = (6 / Math.max(0.01, aurora.speed)).toFixed(2);
      return `<!-- MjolnirUI Aurora Text -->
<style>
  .mj-aurora {
    ${baseStyle}
    background-image: ${gradientCss};
    background-size: 300% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: blur(${aurora.blur}px);
    animation: mj-aurora-flow ${duration}s linear infinite;
  }
  @keyframes mj-aurora-flow {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
</style>
<span class="mj-aurora">${safeText}</span>`;
    }

    if (componentId === "gradient") {
      const angle = gradient.direction === "horizontal" ? "to right"
        : gradient.direction === "vertical" ? "to bottom" : "to bottom right";
      const stops = [...gradient.colors, gradient.colors[0]].join(", ");
      const size = gradient.direction === "horizontal" ? "300% 100%"
        : gradient.direction === "vertical" ? "100% 300%" : "300% 300%";
      const dur = gradient.speed.toFixed(2);
      const iter = gradient.yoyo ? "infinite alternate" : "infinite";
      return `<!-- MjolnirUI Gradient Text -->
<style>
  .mj-gradient {
    ${baseStyle}
    background-image: linear-gradient(${angle}, ${stops});
    background-size: ${size};
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: mj-gradient-flow ${dur}s ease ${iter};
  }
  @keyframes mj-gradient-flow {
    0%   { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
</style>
<span class="mj-gradient">${safeText}</span>`;
    }

    // reveal — static fallback (animation is per-char Framer Motion; HTML uses simple CSS keyframes)
    const axis = reveal.direction === "top" ? "translateY(-40px)"
      : reveal.direction === "bottom" ? "translateY(40px)"
      : reveal.direction === "right" ? "translateX(40px)"
      : "translateX(-40px)";
    return `<!-- MjolnirUI Text Reveal (CSS approximation) -->
<style>
  .mj-reveal { ${baseStyle} display: inline-block; }
  .mj-reveal > span {
    display: inline-block;
    opacity: 0;
    filter: blur(${reveal.blur}px);
    transform: ${axis};
    animation: mj-reveal-in ${reveal.stagger}s ease-out forwards;
  }
  @keyframes mj-reveal-in {
    to { opacity: 1; filter: blur(0); transform: translate(0,0); }
  }
</style>
<span class="mj-reveal">
${safeText.split("").map((c, i) =>
  `  <span style="animation-delay:${(reveal.delay + i * (reveal.stagger / Math.max(1, safeText.length))).toFixed(3)}s">${c === " " ? "&nbsp;" : c}</span>`
).join("\n")}
</span>`;
  }, [componentId, text, fontId, fontSize, fontWeight, aurora, gradient, reveal]);

  const handleCopy = (kind: "react" | "html") => {
    const snippet = kind === "react" ? reactSnippet : htmlSnippet;
    navigator.clipboard.writeText(snippet);
    setCopiedKind(kind);
    setTimeout(() => setCopiedKind(null), 1800);
  };

  /* ── Preview element ─────────────────────────────── */

  const previewFont = FONT_OPTIONS.find((f) => f.id === fontId)!.cssVar;
  const previewBaseStyle: React.CSSProperties = {
    fontFamily: previewFont,
    fontSize: `${fontSize}px`,
    fontWeight,
    lineHeight: 1.1,
  };

  const previewNode = (() => {
    if (componentId === "aurora") {
      return (
        <span
          style={{
            ...previewBaseStyle,
            filter: aurora.blur > 0 ? `blur(${aurora.blur}px)` : undefined,
            display: "inline-block",
          }}
        >
          <AuroraText colors={aurora.colors} speed={aurora.speed}>
            {text || "\u00A0"}
          </AuroraText>
        </span>
      );
    }
    if (componentId === "gradient") {
      return (
        <div style={previewBaseStyle}>
          <GradientText
            colors={gradient.colors}
            animationSpeed={gradient.speed}
            direction={gradient.direction}
            yoyo={gradient.yoyo}
          >
            {text || "\u00A0"}
          </GradientText>
        </div>
      );
    }
    // reveal
    const revealCfg = REVEAL_DIRECTIONS.find((d) => d.id === reveal.direction)!;
    return (
      <span style={{ ...previewBaseStyle, color: "white", display: "inline-block" }}>
        <TextReveal
          key={revealKey}
          delay={reveal.delay}
          duration={reveal.stagger}
          by={reveal.by}
          animation={revealCfg.animation}
        >
          {text || " "}
        </TextReveal>
      </span>
    );
  })();

  /* ── Render ──────────────────────────────────────── */

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden">
      {/* ── Left Panel: Controls ──────────────────── */}
      <div
        className="w-80 shrink-0 flex flex-col bg-zinc-950 border-r border-zinc-800/50 overflow-y-auto scrollbar-thin"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/50">
          <h2 className="text-lg font-bold text-white mb-1">Animated Text</h2>
          <p className="text-xs text-gray-500">Live playground for MjolnirUI text effects</p>
        </div>

        {/* Component tabs */}
        <div className="p-5 border-b border-zinc-800/50">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Component</div>
          <div className="grid grid-cols-3 gap-2">
            {COMPONENT_TYPES.map((t) => {
              const Icon = t.icon;
              const active = t.id === componentId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setComponentId(t.id)}
                  className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-semibold transition-colors
                    ${active
                      ? "bg-[#FFCC11]/15 border-[#FFCC11]/60 text-white"
                      : "bg-zinc-900 border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-500"}`}
                >
                  <Icon size={18} className={active ? "text-[#FFCC11]" : undefined} />
                  <span className="leading-tight text-center">{t.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-gray-500 leading-relaxed">
            {COMPONENT_TYPES.find((t) => t.id === componentId)?.description}
          </p>
        </div>

        {/* Shared typography */}
        <div className="p-5 border-b border-zinc-800/50 space-y-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Typography</div>

          <div className="space-y-2">
            <label htmlFor="mj-text-input" className="text-sm text-gray-300">Text</label>
            <input
              id="mj-text-input"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Mjolnir Unleashed"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white
                focus:outline-none focus:border-[#FFCC11]/60 focus:ring-1 focus:ring-[#FFCC11]/30"
            />
          </div>

          <Select<FontId>
            label="Font"
            value={fontId}
            options={FONT_OPTIONS.map((f) => ({ id: f.id, label: f.label }))}
            onChange={setFontId}
          />

          <Slider label="Font Size" value={fontSize} min={24} max={128} step={1} onChange={setFontSize} />

          <Select<number>
            label="Font Weight"
            value={fontWeight}
            options={WEIGHT_OPTIONS.map((w) => ({ id: w, label: String(w) }))}
            onChange={setFontWeight}
          />
        </div>

        {/* Per-component controls */}
        <div className="flex-1 p-5 space-y-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {COMPONENT_TYPES.find((t) => t.id === componentId)?.label} Options
          </div>

          {componentId === "aurora" && (
            <>
              <ColorPicker colors={aurora.colors} onChange={(c) => setAurora({ ...aurora, colors: c })} min={3} max={6} />
              <Slider label="Speed"       value={aurora.speed} min={0.1} max={4}  step={0.1} onChange={(v) => setAurora({ ...aurora, speed: v })} />
              <Slider label="Blur (px)"   value={aurora.blur}  min={0}   max={12} step={0.5} onChange={(v) => setAurora({ ...aurora, blur: v })} />
            </>
          )}

          {componentId === "gradient" && (
            <>
              <ColorPicker colors={gradient.colors} onChange={(c) => setGradient({ ...gradient, colors: c })} min={2} max={4} />
              <Select<GradientDirectionId>
                label="Direction"
                value={gradient.direction}
                options={GRADIENT_DIRECTIONS.map((d) => ({ id: d.id, label: d.label }))}
                onChange={(v) => setGradient({ ...gradient, direction: v })}
              />
              <Slider label="Speed (s)" value={gradient.speed} min={1} max={20} step={0.5} onChange={(v) => setGradient({ ...gradient, speed: v })} />
              <Toggle label="Yoyo Loop" checked={gradient.yoyo} onChange={(v) => setGradient({ ...gradient, yoyo: v })} />
            </>
          )}

          {componentId === "reveal" && (
            <>
              <Slider label="Delay (s)"        value={reveal.delay}   min={0}   max={3}  step={0.05} onChange={(v) => setReveal({ ...reveal, delay: v })} />
              <Slider label="Stagger Dur (s)"  value={reveal.stagger} min={0.2} max={3}  step={0.05} onChange={(v) => setReveal({ ...reveal, stagger: v })} />
              <Slider label="Blur (px)"        value={reveal.blur}    min={0}   max={20} step={1}    onChange={(v) => setReveal({ ...reveal, blur: v })} />
              <Select<RevealDirectionId>
                label="Direction"
                value={reveal.direction}
                options={REVEAL_DIRECTIONS.map((d) => ({ id: d.id, label: d.label }))}
                onChange={(v) => setReveal({ ...reveal, direction: v })}
              />
              <Select<"character" | "word">
                label="Split"
                value={reveal.by}
                options={[{ id: "character", label: "Character" }, { id: "word", label: "Word" }]}
                onChange={(v) => setReveal({ ...reveal, by: v })}
              />
              <Toggle label="Loop" checked={reveal.loop} onChange={(v) => setReveal({ ...reveal, loop: v })} />
              <button
                type="button"
                onClick={() => setRevealKey((k) => k + 1)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                  bg-zinc-900 border border-zinc-700 text-xs text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <RotateCcw size={12} /> Replay Animation
              </button>
            </>
          )}
        </div>

        {/* Bottom actions */}
        <div className="p-5 border-t border-zinc-800/50 space-y-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              bg-zinc-900 border border-zinc-700 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw size={14} /> Reset
          </button>

          <button
            type="button"
            onClick={() => handleCopy("html")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              bg-zinc-900 border border-zinc-700 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {copiedKind === "html" ? <Check size={14} className="text-green-400" /> : <FileCode2 size={14} />}
            {copiedKind === "html" ? "Copied HTML+CSS" : "Copy HTML + CSS"}
          </button>

          <button
            type="button"
            onClick={() => handleCopy("react")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
              bg-[#FFCC11] text-black font-bold text-sm hover:brightness-110 transition"
          >
            {copiedKind === "react" ? <Check size={16} /> : <Code2 size={16} />}
            {copiedKind === "react" ? "Copied React Snippet" : "Copy React Snippet"}
          </button>
        </div>
      </div>

      {/* ── Right: Preview ────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Subtle backdrop */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 40%, rgba(0,240,255,0.08) 0%, transparent 70%), radial-gradient(50% 60% at 30% 70%, rgba(255,204,17,0.06) 0%, transparent 70%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="relative w-full max-w-5xl min-h-[50vh] rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center px-8 py-16 shadow-[0_0_80px_rgba(0,240,255,0.06)]">
            {/* Label */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-xs text-gray-300">
                {COMPONENT_TYPES.find((t) => t.id === componentId)?.label}
              </span>
            </div>

            {/* Static tag */}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] uppercase tracking-wider font-bold" style={{ color: "#3B82F6" }}>
                Free
              </span>
            </div>

            {/* Live preview */}
            <AnimatePresence mode="wait">
              <motion.div
                key={componentId + String(revealKey)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="text-center max-w-full break-words"
                style={{ color: "white" }}
              >
                {previewNode}
              </motion.div>
            </AnimatePresence>

            {/* Footer hint */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] text-gray-500">
              <span>Adjust controls on the left — changes update live.</span>
              <span className="font-mono">
                {fontSize}px · {fontWeight} · {FONT_OPTIONS.find((f) => f.id === fontId)?.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ensure TierName import isn't tree-shaken to an unused warning when the page later
// gates features behind tiers; keep reference stable for future gating.
export type { TierName };
