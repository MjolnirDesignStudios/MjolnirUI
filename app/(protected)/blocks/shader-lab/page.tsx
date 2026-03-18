// Asgardian Shader Lab — Pro/Elite tier
// Same React Bits-style layout as Background Studio
// Left panel: shader type, uniform sliders, GLSL editor
// Right area: full canvas shader preview
"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, RotateCcw, Share2, ExternalLink, Code2,
  Image as ImageIcon, Video, Info, Play, Pause,
} from "lucide-react";
import { hasAccess, type TierName } from "@/lib/tierConfig";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";

/* ── Shader registry ─────────────────────────────────── */
const SHADER_TYPES = [
  { id: "bifrost-tunnel", label: "Bifrost Tunnel", tier: "pro" as TierName },
  { id: "perlin-noise", label: "Perlin Noise", tier: "pro" as TierName },
  { id: "electric-field", label: "Electric Field", tier: "pro" as TierName },
  { id: "aurora-borealis", label: "Aurora Borealis", tier: "pro" as TierName },
  { id: "fractal-flame", label: "Fractal Flame", tier: "elite" as TierName },
  { id: "valhalla-gate", label: "Valhalla Gate", tier: "elite" as TierName },
  { id: "cosmic-web", label: "Cosmic Web", tier: "elite" as TierName },
] as const;

type ShaderTypeId = typeof SHADER_TYPES[number]["id"];

/* ── Reusable slider ─────────────────────────────────── */
function Slider({ label, value, min = 0, max = 1, step = 0.01, onChange }: {
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

/* ── Shader canvas placeholder ───────────────────────── */
function ShaderCanvas({ type, uniforms, playing }: {
  type: ShaderTypeId;
  uniforms: Record<string, number>;
  playing: boolean;
}) {
  // Placeholder gradient that responds to uniforms
  const hue1 = (uniforms.colorShift || 0) * 360;
  const hue2 = hue1 + 120;
  const blur = 60 + (uniforms.turbulence || 0.5) * 80;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020617]">
      {/* Animated placeholder */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(ellipse at ${30 + uniforms.depth * 40}% ${40 + uniforms.speed * 20}%,
            hsl(${hue1}, 80%, 40%) 0%,
            hsl(${hue2}, 70%, 20%) 40%,
            #020617 80%)`,
          filter: `blur(${blur}px) brightness(${uniforms.brightness})`,
        }}
      />
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(ellipse at ${70 - uniforms.depth * 30}% ${60 - uniforms.speed * 20}%,
            hsl(${hue1 + 60}, 90%, 50%) 0%,
            transparent 50%)`,
          filter: `blur(${blur * 0.8}px)`,
          opacity: 0.6,
          mixBlendMode: "screen",
        }}
      />

      {/* Type label */}
      <div className="absolute top-4 left-4">
        <span className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-sm text-gray-300">
          {SHADER_TYPES.find(t => t.id === type)?.label}
        </span>
      </div>

      {/* Play state indicator */}
      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-sm ${playing ? "text-green-400" : "text-yellow-400"}`}>
          {playing ? "● Live" : "■ Paused"}
        </span>
      </div>

      {/* Export actions */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-black/70 transition-colors">
          <ImageIcon size={14} />
          Screenshot
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-black/70 transition-colors">
          <Video size={14} />
          Record 10s
        </button>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────── */
export default function ShaderLabPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userTier = (session?.user?.tier as TierName) || "free";

  const [shaderType, setShaderType] = useState<ShaderTypeId>("bifrost-tunnel");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [showGlsl, setShowGlsl] = useState(false);

  // Uniform controls
  const [uniforms, setUniforms] = useState({
    speed: 0.30,
    turbulence: 0.50,
    depth: 0.60,
    brightness: 1.20,
    colorShift: 0.00,
  });

  const [glslCode, setGlslCode] = useState(`// Custom GLSL fragment shader
uniform float iTime;
uniform vec2 iResolution;
uniform float u_speed;
uniform float u_turbulence;

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  // Your shader code here...
  gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(iTime), 1.0);
}`);

  // Paywall: Pro minimum
  if (!hasAccess(userTier, "pro")) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <UpgradeModal
          isOpen={true}
          onClose={() => router.push("/blocks/dashboard")}
          requiredTier="pro"
          featureName="Asgardian Shader Lab"
        />
      </div>
    );
  }

  const updateUniform = (key: string, value: number) => {
    setUniforms((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setUniforms({ speed: 0.30, turbulence: 0.50, depth: 0.60, brightness: 1.20, colorShift: 0.00 });
    setPlaying(true);
  };

  const handleSelectShader = (id: ShaderTypeId, tier: TierName) => {
    if (!hasAccess(userTier, tier)) {
      setShowUpgrade(true);
      return;
    }
    setShaderType(id);
    setDropdownOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden">
      {/* ── Left Panel: Controls ─────────────────────── */}
      <div
        className="w-80 shrink-0 flex flex-col bg-zinc-950 border-r border-zinc-800/50 overflow-y-auto scrollbar-thin"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        {/* Shader type selector */}
        <div className="p-5 border-b border-zinc-800/50">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFCC11]/20 flex items-center justify-center">
                  <Code2 size={16} className="text-[#FFCC11]" />
                </div>
                <span className="font-semibold text-white">
                  {SHADER_TYPES.find(t => t.id === shaderType)?.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Info size={14} className="text-gray-500" />
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute z-50 w-full mt-2 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden"
                >
                  {SHADER_TYPES.map((t) => {
                    const locked = !hasAccess(userTier, t.tier);
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleSelectShader(t.id, t.tier)}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors
                          ${t.id === shaderType ? "bg-white/10 text-white" : locked ? "text-gray-600 hover:bg-white/5" : "text-gray-300 hover:bg-white/5 hover:text-white"}`}
                      >
                        <span>{t.label}</span>
                        {locked && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-zinc-600 text-gray-500">
                            {t.tier}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Uniform sliders */}
        <div className="flex-1 p-5 space-y-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Uniforms</div>
          <Slider label="Speed" value={uniforms.speed} min={0} max={2} step={0.01} onChange={(v) => updateUniform("speed", v)} />
          <Slider label="Turbulence" value={uniforms.turbulence} min={0} max={1} step={0.01} onChange={(v) => updateUniform("turbulence", v)} />
          <Slider label="Depth" value={uniforms.depth} min={0} max={1} step={0.01} onChange={(v) => updateUniform("depth", v)} />
          <Slider label="Brightness" value={uniforms.brightness} min={0.5} max={2} step={0.01} onChange={(v) => updateUniform("brightness", v)} />
          <Slider label="Color Shift" value={uniforms.colorShift} min={0} max={1} step={0.01} onChange={(v) => updateUniform("colorShift", v)} />

          {/* Play/Pause */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-300">Playback</span>
            <button
              onClick={() => setPlaying(!playing)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                playing
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}
            >
              {playing ? <Pause size={12} /> : <Play size={12} />}
              {playing ? "Pause" : "Play"}
            </button>
          </div>

          {/* GLSL editor toggle */}
          <div className="pt-4 border-t border-zinc-800/50">
            <button
              onClick={() => setShowGlsl(!showGlsl)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <span className="font-semibold">GLSL Editor</span>
              <ChevronDown size={14} className={`transition-transform ${showGlsl ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showGlsl && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={glslCode}
                    onChange={(e) => setGlslCode(e.target.value)}
                    className="w-full h-48 mt-2 p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-green-400
                      focus:outline-none focus:border-[#FFCC11]/50 resize-none scrollbar-thin"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
                    spellCheck={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="p-5 border-t border-zinc-800/50 space-y-3 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors">
              <Share2 size={14} />
              Share
            </button>
          </div>
          <a
            href="/blocks/docs/shaders"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ExternalLink size={14} />
            Read Full Docs
          </a>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FFCC11] text-black font-bold text-sm hover:brightness-110 transition">
            <Code2 size={16} />
            Export GLSL
          </button>
        </div>
      </div>

      {/* ── Right: Shader Canvas ─────────────────────── */}
      <div className="flex-1 relative">
        <ShaderCanvas type={shaderType} uniforms={uniforms} playing={playing} />
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        requiredTier="elite"
        featureName="Elite Shaders"
      />
    </div>
  );
}
