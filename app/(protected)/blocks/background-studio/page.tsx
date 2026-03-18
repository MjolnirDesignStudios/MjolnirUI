// Background Studio — React Bits-style interactive background previewer
// Left panel: type selector, sliders, color pickers, toggles
// Right area: full canvas live preview with real animated backgrounds
// Base tier: Color Bends, Gradient Mesh, Aurora, Particles, Waves
// Pro tier: Noise Field, Bifrost Tunnel, Electric Storm
// Elite tier: Nebula, Valhalla
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, RotateCcw, Share2, ExternalLink, Code2,
  Image as ImageIcon, Video, Info, Plus, X, Copy, Check,
} from "lucide-react";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";

/* ── Background type registry ────────────────────────── */
const BACKGROUND_TYPES = [
  { id: "color-bends",    label: "Color Bends",    tier: "base" as TierName, description: "Smooth animated gradient blobs with organic motion" },
  { id: "gradient-mesh",  label: "Gradient Mesh",  tier: "base" as TierName, description: "Multi-point mesh gradient with flowing transitions" },
  { id: "aurora",         label: "Aurora",          tier: "base" as TierName, description: "Northern lights shimmer with wave distortion" },
  { id: "particles",      label: "Particles",       tier: "base" as TierName, description: "Floating particle field with depth and glow" },
  { id: "waves",          label: "Waves",           tier: "base" as TierName, description: "Layered sine waves with gradient fills" },
  { id: "noise-field",    label: "Noise Field",     tier: "pro" as TierName,  description: "Perlin noise displacement with organic flow" },
  { id: "bifrost",        label: "Bifrost Tunnel",  tier: "pro" as TierName,  description: "Rainbow fractal tunnel with depth illusion" },
  { id: "electric-storm", label: "Electric Storm",  tier: "pro" as TierName,  description: "Lightning arcs with electric glow effects" },
  { id: "nebula",         label: "Nebula",          tier: "elite" as TierName, description: "Deep space nebula with star particles" },
  { id: "valhalla",       label: "Valhalla Gates",  tier: "elite" as TierName, description: "Golden portal effect with ethereal mist" },
] as const;

type BgTypeId = typeof BACKGROUND_TYPES[number]["id"];

/* ── Slider ──────────────────────────────────────────── */
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

/* ── Toggle ──────────────────────────────────────────── */
function Toggle({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-[#FFCC11]' : 'bg-zinc-700'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

/* ── Color picker ────────────────────────────────────── */
function ColorPicker({ colors, onChange }: {
  colors: string[]; onChange: (colors: string[]) => void;
}) {
  const removeColor = (index: number) => onChange(colors.filter((_, i) => i !== index));
  const addColor = () => {
    const defaults = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#00f0ff", "#FFCC11"];
    onChange([...colors, defaults[colors.length % defaults.length]]);
  };

  return (
    <div className="space-y-2">
      <span className="text-sm text-gray-300">Colors</span>
      <div className="flex items-center gap-2 flex-wrap">
        {colors.map((color, i) => (
          <div key={i} className="relative group">
            <input
              type="color" value={color}
              onChange={(e) => { const next = [...colors]; next[i] = e.target.value; onChange(next); }}
              className="w-10 h-10 rounded-lg border-2 border-zinc-700 cursor-pointer bg-transparent appearance-none
                [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
            />
            <button
              onClick={() => removeColor(i)}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-600
                flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={8} className="text-gray-400" />
            </button>
          </div>
        ))}
        {colors.length < 6 && (
          <button onClick={addColor}
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


/* ═══════════════════════════════════════════════════════
   BACKGROUND RENDERERS — real animated backgrounds
   ═══════════════════════════════════════════════════════ */

/* ── Color Bends: Animated gradient blobs ────────────── */
function ColorBendsRenderer({ colors, speed, scale }: { colors: string[]; speed: number; scale: number }) {
  const c1 = colors[0] || "#6366f1";
  const c2 = colors[1] || "#ec4899";
  const c3 = colors[2] || "#10b981";
  const dur = Math.max(2, 12 - speed * 10);
  const sz = 40 + scale * 60;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617]">
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(${sz}% ${sz}% at 20% 30%, ${c1}cc 0%, transparent 70%),
          radial-gradient(${sz}% ${sz}% at 80% 20%, ${c2}cc 0%, transparent 70%),
          radial-gradient(${sz}% ${sz}% at 50% 80%, ${c3}cc 0%, transparent 70%)
        `,
        filter: `blur(${60 - scale * 30}px)`,
        animation: `colorBendsFloat ${dur}s ease-in-out infinite alternate`,
      }} />
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(${sz * 0.8}% ${sz * 0.8}% at 70% 60%, ${c1}80 0%, transparent 60%),
          radial-gradient(${sz * 0.8}% ${sz * 0.8}% at 30% 70%, ${c2}80 0%, transparent 60%)
        `,
        filter: `blur(${80 - scale * 40}px)`,
        animation: `colorBendsFloat ${dur * 1.3}s ease-in-out infinite alternate-reverse`,
      }} />
      <style>{`
        @keyframes colorBendsFloat {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5%, -3%) scale(1.05); }
          66% { transform: translate(-3%, 5%) scale(0.95); }
          100% { transform: translate(2%, 2%) scale(1.02); }
        }
      `}</style>
    </div>
  );
}

/* ── Gradient Mesh: Multi-point flowing mesh ─────────── */
function GradientMeshRenderer({ colors, speed, scale }: { colors: string[]; speed: number; scale: number }) {
  const c1 = colors[0] || "#6366f1";
  const c2 = colors[1] || "#ec4899";
  const c3 = colors[2] || "#10b981";
  const c4 = colors[3] || "#f59e0b";
  const dur = Math.max(3, 15 - speed * 12);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617]">
      {[
        { x: "10%", y: "20%", color: c1, delay: 0 },
        { x: "80%", y: "15%", color: c2, delay: dur * 0.25 },
        { x: "50%", y: "75%", color: c3, delay: dur * 0.5 },
        { x: "25%", y: "60%", color: c4, delay: dur * 0.75 },
        { x: "70%", y: "50%", color: c1, delay: dur * 0.15 },
      ].map((blob, i) => (
        <div key={i} className="absolute" style={{
          left: blob.x, top: blob.y,
          width: `${30 + scale * 40}%`, height: `${30 + scale * 40}%`,
          background: `radial-gradient(circle, ${blob.color}aa 0%, transparent 70%)`,
          filter: "blur(60px)",
          transform: "translate(-50%, -50%)",
          animation: `meshFloat${i} ${dur}s ease-in-out ${blob.delay}s infinite alternate`,
        }} />
      ))}
      <style>{`
        @keyframes meshFloat0 { 0% { transform: translate(-50%, -50%) scale(1); } 100% { transform: translate(-40%, -60%) scale(1.2); } }
        @keyframes meshFloat1 { 0% { transform: translate(-50%, -50%) scale(1.1); } 100% { transform: translate(-60%, -40%) scale(0.9); } }
        @keyframes meshFloat2 { 0% { transform: translate(-50%, -50%) scale(0.9); } 100% { transform: translate(-45%, -55%) scale(1.15); } }
        @keyframes meshFloat3 { 0% { transform: translate(-50%, -50%) scale(1); } 100% { transform: translate(-55%, -45%) scale(1.1); } }
        @keyframes meshFloat4 { 0% { transform: translate(-50%, -50%) scale(1.05); } 100% { transform: translate(-48%, -52%) scale(0.95); } }
      `}</style>
    </div>
  );
}

/* ── Aurora: Northern lights ─────────────────────────── */
function AuroraRenderer({ colors, speed, scale }: { colors: string[]; speed: number; scale: number }) {
  const c1 = colors[0] || "#00f0ff";
  const c2 = colors[1] || "#6366f1";
  const c3 = colors[2] || "#10b981";
  const dur = Math.max(3, 10 - speed * 8);
  const height = 30 + scale * 40;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617]">
      {/* Stars */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(1px 1px at 20% 30%, white 50%, transparent 100%), radial-gradient(1px 1px at 40% 70%, white 50%, transparent 100%), radial-gradient(1px 1px at 60% 20%, white 50%, transparent 100%), radial-gradient(1px 1px at 80% 60%, white 50%, transparent 100%), radial-gradient(1px 1px at 10% 80%, white 50%, transparent 100%), radial-gradient(1px 1px at 90% 40%, white 50%, transparent 100%), radial-gradient(1px 1px at 50% 50%, white 50%, transparent 100%), radial-gradient(1px 1px at 30% 90%, white 50%, transparent 100%)",
        opacity: 0.4,
      }} />
      {/* Aurora bands */}
      {[c1, c2, c3].map((color, i) => (
        <div key={i} className="absolute left-0 right-0" style={{
          top: `${15 + i * 10}%`,
          height: `${height}%`,
          background: `linear-gradient(180deg, transparent 0%, ${color}40 30%, ${color}80 50%, ${color}40 70%, transparent 100%)`,
          filter: "blur(30px)",
          animation: `auroraWave ${dur + i * 2}s ease-in-out infinite alternate`,
          animationDelay: `${i * -dur / 3}s`,
          transform: "skewY(-3deg)",
        }} />
      ))}
      <style>{`
        @keyframes auroraWave {
          0% { transform: skewY(-3deg) translateX(-5%) scaleY(0.8); opacity: 0.6; }
          25% { transform: skewY(-1deg) translateX(3%) scaleY(1.1); opacity: 0.9; }
          50% { transform: skewY(2deg) translateX(-2%) scaleY(0.9); opacity: 0.7; }
          75% { transform: skewY(-2deg) translateX(4%) scaleY(1.05); opacity: 0.85; }
          100% { transform: skewY(1deg) translateX(-3%) scaleY(1); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}

/* ── Particles: Canvas particle system ───────────────── */
function ParticlesRenderer({ colors, speed, scale }: { colors: string[]; speed: number; scale: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; alpha: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.floor(60 + scale * 140);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    if (particlesRef.current.length !== count) {
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
        size: 1 + Math.random() * 3 * scale,
        color: colors[Math.floor(Math.random() * colors.length)] || "#00f0ff",
        alpha: 0.3 + Math.random() * 0.7,
      }));
    }

    const animate = () => {
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      ctx.clearRect(0, 0, cw, ch);

      particlesRef.current.forEach((p) => {
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        if (p.x < 0) p.x = cw;
        if (p.x > cw) p.x = 0;
        if (p.y < 0) p.y = ch;
        if (p.y > ch) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grad.addColorStop(0, p.color + "40");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.5;
        ctx.fill();
      });

      // Connection lines
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = colors[0] || "#00f0ff";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x;
          const dy = particlesRef.current[i].y - particlesRef.current[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 * scale) {
            ctx.beginPath();
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [colors, speed, scale]);

  return (
    <div className="absolute inset-0 bg-[#020617]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

/* ── Waves: Layered sine waves ───────────────────────── */
function WavesRenderer({ colors, speed, scale }: { colors: string[]; speed: number; scale: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, w, h);

      timeRef.current += 0.01 * speed;
      const numWaves = Math.max(3, Math.floor(scale * 6));

      for (let wave = 0; wave < numWaves; wave++) {
        const color = colors[wave % colors.length] || "#00f0ff";
        const amplitude = (30 + wave * 15) * scale;
        const frequency = 0.003 + wave * 0.001;
        const yOffset = h * (0.3 + (wave / numWaves) * 0.5);
        const phase = timeRef.current * (1 + wave * 0.3);

        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 2) {
          const y = yOffset + Math.sin(x * frequency + phase) * amplitude
            + Math.sin(x * frequency * 2.5 + phase * 0.7) * amplitude * 0.3;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, yOffset - amplitude, 0, h);
        grad.addColorStop(0, color + "60");
        grad.addColorStop(0.5, color + "20");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [colors, speed, scale]);

  return (
    <div className="absolute inset-0 bg-[#020617]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

/* ── Noise Field (Pro): Perlin-like noise ────────────── */
function NoiseFieldRenderer({ colors, speed, scale }: { colors: string[]; speed: number; scale: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 0.5; // Lower res for performance
      canvas.height = canvas.offsetHeight * 0.5;
    };
    resize();
    window.addEventListener("resize", resize);

    // Simple noise function
    const noise = (x: number, y: number, t: number) => {
      return (Math.sin(x * 0.02 + t) * Math.cos(y * 0.03 - t * 0.7)
        + Math.sin((x + y) * 0.015 + t * 1.3) * 0.5
        + Math.cos(x * 0.01 - y * 0.02 + t * 0.5) * 0.3) / 1.8;
    };

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      timeRef.current += 0.008 * speed;
      const t = timeRef.current;

      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      const step = Math.max(1, Math.floor(3 - scale * 2));

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const n = (noise(x * scale, y * scale, t) + 1) * 0.5;
          const colorIdx = Math.floor(n * (colors.length - 1));
          const hex = colors[Math.min(colorIdx, colors.length - 1)] || "#6366f1";

          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          const brightness = 0.3 + n * 0.7;

          for (let dy = 0; dy < step && y + dy < h; dy++) {
            for (let dx = 0; dx < step && x + dx < w; dx++) {
              const idx = ((y + dy) * w + (x + dx)) * 4;
              data[idx] = r * brightness;
              data[idx + 1] = g * brightness;
              data[idx + 2] = b * brightness;
              data[idx + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [colors, speed, scale]);

  return (
    <div className="absolute inset-0 bg-[#020617]">
      <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: "auto" }} />
    </div>
  );
}

/* ── Bifrost Tunnel (Pro): Fractal tunnel ────────────── */
function BifrostRenderer({ colors, speed, scale }: { colors: string[]; speed: number; scale: number }) {
  const dur = Math.max(4, 16 - speed * 12);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617]">
      {/* Concentric rings */}
      {Array.from({ length: 8 }, (_, i) => {
        const hue = (i * 45 + Date.now() * 0.01) % 360;
        const size = 20 + i * 12 * scale;
        return (
          <div key={i} className="absolute inset-0 flex items-center justify-center" style={{
            animation: `bifrostPulse ${dur + i}s ease-in-out infinite`,
            animationDelay: `${i * -dur / 8}s`,
          }}>
            <div style={{
              width: `${size}%`, height: `${size}%`,
              borderRadius: "50%",
              border: `2px solid ${colors[i % colors.length] || `hsl(${hue}, 80%, 60%)`}`,
              opacity: 0.4 - i * 0.04,
              boxShadow: `0 0 30px ${colors[i % colors.length] || `hsl(${hue}, 80%, 60%)`}40,
                inset 0 0 30px ${colors[i % colors.length] || `hsl(${hue}, 80%, 60%)`}20`,
            }} />
          </div>
        );
      })}
      {/* Center glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{
          width: "15%", height: "15%", borderRadius: "50%",
          background: `radial-gradient(circle, ${colors[0] || "#00f0ff"}60 0%, transparent 70%)`,
          filter: "blur(20px)",
          animation: `bifrostGlow ${dur * 0.5}s ease-in-out infinite alternate`,
        }} />
      </div>
      <style>{`
        @keyframes bifrostPulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
          50% { transform: scale(1.1) rotate(180deg); opacity: 0.6; }
        }
        @keyframes bifrostGlow {
          0% { transform: scale(1); filter: blur(20px) brightness(1); }
          100% { transform: scale(1.3); filter: blur(30px) brightness(1.5); }
        }
      `}</style>
    </div>
  );
}

/* ── Electric Storm (Pro): Lightning arcs ────────────── */
function ElectricStormRenderer({ colors, speed, scale }: { colors: string[]; speed: number; scale: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const drawLightning = (x1: number, y1: number, x2: number, y2: number, depth: number) => {
      if (depth === 0) {
        ctx.lineTo(x2, y2);
        return;
      }
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 60 * scale;
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 60 * scale;
      drawLightning(x1, y1, mx, my, depth - 1);
      drawLightning(mx, my, x2, y2, depth - 1);
    };

    let lastStrike = 0;
    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      // Fade previous frame
      ctx.fillStyle = "rgba(2, 6, 23, 0.15)";
      ctx.fillRect(0, 0, w, h);

      const now = Date.now();
      if (now - lastStrike > Math.max(200, 2000 - speed * 1800)) {
        lastStrike = now;
        const numBolts = 1 + Math.floor(Math.random() * 3 * scale);

        for (let b = 0; b < numBolts; b++) {
          const color = colors[b % colors.length] || "#00f0ff";
          const startX = Math.random() * w;
          const endX = startX + (Math.random() - 0.5) * w * 0.5;

          ctx.beginPath();
          ctx.moveTo(startX, 0);
          drawLightning(startX, 0, endX, h, 5);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1 + Math.random() * 2;
          ctx.shadowColor = color;
          ctx.shadowBlur = 20;
          ctx.stroke();

          // Flash glow
          ctx.beginPath();
          ctx.moveTo(startX, 0);
          drawLightning(startX, 0, endX, h, 4);
          ctx.strokeStyle = color + "40";
          ctx.lineWidth = 6;
          ctx.shadowBlur = 40;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    // Initial clear
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [colors, speed, scale]);

  return (
    <div className="absolute inset-0 bg-[#020617]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

/* ── Nebula (Elite): Deep space ──────────────────────── */
function NebulaRenderer({ colors, speed, scale }: { colors: string[]; speed: number; scale: number }) {
  const c1 = colors[0] || "#6366f1";
  const c2 = colors[1] || "#ec4899";
  const c3 = colors[2] || "#f59e0b";
  const dur = Math.max(5, 20 - speed * 15);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617]">
      {/* Star field */}
      <div className="absolute inset-0" style={{
        background: Array.from({ length: 50 }, () =>
          `radial-gradient(${Math.random() > 0.8 ? 2 : 1}px ${Math.random() > 0.8 ? 2 : 1}px at ${Math.random() * 100}% ${Math.random() * 100}%, white ${Math.random() > 0.5 ? '80%' : '50%'}, transparent 100%)`
        ).join(", "),
        opacity: 0.6,
      }} />
      {/* Nebula clouds */}
      <div className="absolute inset-[-20%]" style={{
        background: `
          radial-gradient(50% 50% at 30% 40%, ${c1}50 0%, transparent 70%),
          radial-gradient(40% 60% at 70% 30%, ${c2}40 0%, transparent 70%),
          radial-gradient(60% 40% at 50% 70%, ${c3}30 0%, transparent 70%)
        `,
        filter: "blur(40px)",
        animation: `nebulaFloat ${dur}s ease-in-out infinite alternate`,
      }} />
      <div className="absolute inset-[-10%]" style={{
        background: `
          radial-gradient(30% 30% at 60% 50%, ${c1}30 0%, transparent 60%),
          radial-gradient(40% 30% at 30% 60%, ${c2}20 0%, transparent 60%)
        `,
        filter: "blur(60px)",
        animation: `nebulaFloat ${dur * 1.5}s ease-in-out infinite alternate-reverse`,
        mixBlendMode: "screen",
      }} />
      {/* Dust lane */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(135deg, transparent 30%, rgba(0,0,0,0.6) 50%, transparent 70%)`,
        animation: `nebulaDust ${dur * 2}s ease-in-out infinite alternate`,
      }} />
      <style>{`
        @keyframes nebulaFloat {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          100% { transform: translate(3%, -2%) rotate(5deg) scale(1.05); }
        }
        @keyframes nebulaDust {
          0% { opacity: 0.3; transform: rotate(0deg); }
          100% { opacity: 0.5; transform: rotate(3deg); }
        }
      `}</style>
    </div>
  );
}

/* ── Valhalla Gates (Elite): Golden portal ───────────── */
function ValhallaRenderer({ colors, speed, scale }: { colors: string[]; speed: number; scale: number }) {
  const gold = colors[0] || "#FFCC11";
  const cyan = colors[1] || "#00f0ff";
  const dur = Math.max(4, 14 - speed * 10);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617]">
      {/* Mist base */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse at 50% 100%, ${gold}15 0%, transparent 60%)`,
      }} />
      {/* Gate arches */}
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="absolute inset-0 flex items-end justify-center" style={{
          animation: `valhallaGate ${dur}s ease-in-out infinite`,
          animationDelay: `${i * -dur / 5}s`,
        }}>
          <div style={{
            width: `${30 + i * 10 * scale}%`,
            height: `${60 + i * 5}%`,
            borderRadius: "50% 50% 0 0",
            border: `1px solid ${gold}${Math.floor(50 - i * 8).toString(16).padStart(2, '0')}`,
            boxShadow: `0 0 ${20 + i * 10}px ${gold}20, inset 0 0 ${20 + i * 10}px ${gold}10`,
          }} />
        </div>
      ))}
      {/* Center light beam */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{
        width: "8%", height: "100%",
        background: `linear-gradient(0deg, ${gold}40 0%, ${gold}10 40%, transparent 80%)`,
        filter: "blur(20px)",
        animation: `valhallaBeam ${dur * 0.6}s ease-in-out infinite alternate`,
      }} />
      {/* Floating particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <div key={`p${i}`} className="absolute" style={{
          left: `${20 + Math.random() * 60}%`,
          bottom: `${Math.random() * 80}%`,
          width: "3px", height: "3px", borderRadius: "50%",
          backgroundColor: i % 3 === 0 ? cyan : gold,
          opacity: 0.4 + Math.random() * 0.4,
          animation: `valhallaParticle ${3 + Math.random() * 4}s ease-in-out infinite`,
          animationDelay: `${Math.random() * -5}s`,
        }} />
      ))}
      <style>{`
        @keyframes valhallaGate {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 0.7; transform: scaleY(1.02); }
        }
        @keyframes valhallaBeam {
          0% { opacity: 0.3; transform: translateX(-50%) scaleX(1); }
          100% { opacity: 0.6; transform: translateX(-50%) scaleX(1.3); }
        }
        @keyframes valhallaParticle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.5); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   CANVAS PREVIEW ROUTER
   ═══════════════════════════════════════════════════════ */
function CanvasPreview({ type, speed, scale, colors }: {
  type: BgTypeId; speed: number; scale: number; colors: string[];
}) {
  const renderers: Record<BgTypeId, React.ReactNode> = {
    "color-bends":    <ColorBendsRenderer colors={colors} speed={speed} scale={scale} />,
    "gradient-mesh":  <GradientMeshRenderer colors={colors} speed={speed} scale={scale} />,
    "aurora":         <AuroraRenderer colors={colors} speed={speed} scale={scale} />,
    "particles":      <ParticlesRenderer colors={colors} speed={speed} scale={scale} />,
    "waves":          <WavesRenderer colors={colors} speed={speed} scale={scale} />,
    "noise-field":    <NoiseFieldRenderer colors={colors} speed={speed} scale={scale} />,
    "bifrost":        <BifrostRenderer colors={colors} speed={speed} scale={scale} />,
    "electric-storm": <ElectricStormRenderer colors={colors} speed={speed} scale={scale} />,
    "nebula":         <NebulaRenderer colors={colors} speed={speed} scale={scale} />,
    "valhalla":       <ValhallaRenderer colors={colors} speed={speed} scale={scale} />,
  };

  return (
    <div className="relative w-full h-full">
      {renderers[type]}

      {/* Type label overlay */}
      <div className="absolute top-4 left-4 z-10">
        <span className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-sm text-gray-300">
          {BACKGROUND_TYPES.find(t => t.id === type)?.label}
        </span>
      </div>

      {/* Description overlay */}
      <div className="absolute top-4 right-4 z-10">
        <span className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-xs text-gray-400 max-w-xs">
          {BACKGROUND_TYPES.find(t => t.id === type)?.description}
        </span>
      </div>

      {/* Export actions */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
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


/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
export default function BackgroundStudioPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userTier = (session?.user?.tier as TierName) || "free";

  const [bgType, setBgType] = useState<BgTypeId>("color-bends");
  const [speed, setSpeed] = useState(0.50);
  const [scale, setScale] = useState(0.60);
  const [colors, setColors] = useState(["#6366f1", "#ec4899", "#10b981"]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeTier, setUpgradeTier] = useState<TierName>("pro");
  const [copied, setCopied] = useState(false);

  // Paywall — Base tier minimum
  if (!hasAccess(userTier, "base")) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <UpgradeModal
          isOpen={true}
          onClose={() => router.push("/blocks/dashboard")}
          requiredTier="base"
          featureName="Background Studio"
        />
      </div>
    );
  }

  const handleSelectType = (id: BgTypeId, tier: TierName) => {
    if (!hasAccess(userTier, tier)) {
      setUpgradeTier(tier);
      setShowUpgrade(true);
      return;
    }
    setBgType(id);
    setDropdownOpen(false);
  };

  const handleReset = () => {
    setSpeed(0.50);
    setScale(0.60);
    setColors(["#6366f1", "#ec4899", "#10b981"]);
  };

  const handleCopyCSS = () => {
    const css = `/* MjolnirUI Background: ${BACKGROUND_TYPES.find(t => t.id === bgType)?.label} */
/* Colors: ${colors.join(", ")} | Speed: ${speed} | Scale: ${scale} */
/* Install: npx mjolnirui add background-${bgType} */`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedType = BACKGROUND_TYPES.find(t => t.id === bgType);
  const selectedTierConfig = getTierConfig(selectedType?.tier || "base");

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden">
      {/* ── Left Panel: Controls ─────────────────────── */}
      <div
        className="w-80 shrink-0 flex flex-col bg-zinc-950 border-r border-zinc-800/50 overflow-y-auto scrollbar-thin"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/50">
          <h2 className="text-lg font-bold text-white mb-1">Background Studio</h2>
          <p className="text-xs text-gray-500">Select a background type and customize</p>
        </div>

        {/* Type selector dropdown */}
        <div className="p-5 border-b border-zinc-800/50">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Background Type</div>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-700
                bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${selectedTierConfig.color}20` }}>
                  <Code2 size={16} style={{ color: selectedTierConfig.color }} />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-white text-sm block">{selectedType?.label}</span>
                  <span className="text-[10px] uppercase font-bold" style={{ color: selectedTierConfig.color }}>
                    {selectedType?.tier}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute z-50 w-full mt-2 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden max-h-72 overflow-y-auto"
                >
                  {BACKGROUND_TYPES.map((t) => {
                    const locked = !hasAccess(userTier, t.tier);
                    const tierCfg = getTierConfig(t.tier);
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleSelectType(t.id, t.tier)}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors
                          ${t.id === bgType ? "bg-white/10 text-white" : locked ? "text-gray-600 hover:bg-white/5" : "text-gray-300 hover:bg-white/5 hover:text-white"}`}
                      >
                        <div>
                          <span className="block">{t.label}</span>
                          <span className="text-[10px] text-gray-500">{t.description}</span>
                        </div>
                        {locked ? (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border text-gray-500"
                            style={{ borderColor: `${tierCfg.color}40`, color: tierCfg.color }}>
                            {t.tier}
                          </span>
                        ) : t.id === bgType ? (
                          <Check size={14} className="text-[#FFCC11]" />
                        ) : null}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Customization controls */}
        <div className="flex-1 p-5 space-y-6">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customize</div>
          <Slider label="Speed" value={speed} min={0.05} max={1} step={0.01} onChange={setSpeed} />
          <Slider label="Intensity" value={scale} min={0.2} max={1} step={0.01} onChange={setScale} />
          <ColorPicker colors={colors} onChange={setColors} />
        </div>

        {/* Bottom actions */}
        <div className="p-5 border-t border-zinc-800/50 space-y-3 shrink-0">
          <div className="flex gap-2">
            <button onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                bg-zinc-900 border border-zinc-700 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors">
              <RotateCcw size={14} /> Reset
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                bg-zinc-900 border border-zinc-700 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors">
              <Share2 size={14} /> Share
            </button>
          </div>
          <button onClick={handleCopyCSS}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              bg-zinc-900 border border-zinc-700 text-sm text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors">
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Install Command"}
          </button>
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
              bg-[#FFCC11] text-black font-bold text-sm hover:brightness-110 transition">
            <Code2 size={16} /> Export Code
          </button>
        </div>
      </div>

      {/* ── Right: Canvas Preview ────────────────────── */}
      <div className="flex-1 relative">
        <CanvasPreview type={bgType} speed={speed} scale={scale} colors={colors} />
      </div>

      {/* Upgrade modal */}
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        requiredTier={upgradeTier}
        featureName="Premium Backgrounds"
      />
    </div>
  );
}
