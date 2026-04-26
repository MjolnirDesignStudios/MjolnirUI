"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const LiquidMetal = dynamic(
  () => import("@/components/Shaders/LiquidMetal"),
  { ssr: false }
);

export default function LiquidMetalPage() {
  const [speed, setSpeed] = useState(0.15);
  const [metallic, setMetallic] = useState(1.0);
  const [turbulence, setTurbulence] = useState(1.0);
  const [showControls, setShowControls] = useState(true);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Shader fills the viewport */}
      <LiquidMetal
        speed={speed}
        metallic={metallic}
        turbulence={turbulence}
        interactive
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-4">
        <Link
          href="/blocks/dashboard"
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-emerald-400/70 border border-emerald-400/20 rounded bg-emerald-400/5">
            Free
          </span>
          <button
            onClick={() => setShowControls(!showControls)}
            className="text-white/40 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider"
          >
            {showControls ? "Hide" : "Show"} Controls
          </button>
        </div>
      </div>

      {/* Shader label */}
      <div className="absolute bottom-5 left-6 z-10 pointer-events-none select-none">
        <h1 className="font-mono text-[11px] tracking-[0.15em] uppercase text-white/30">
          Liquid Metal
        </h1>
        <p className="font-mono text-[10px] tracking-wider text-white/15 mt-1">
          Domain-warped simplex noise · Interactive
        </p>
      </div>

      {/* Controls panel */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute bottom-5 right-5 z-10 w-64 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg p-4 space-y-4"
        >
          <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 mb-3">
            Parameters
          </h2>

          <label className="block">
            <span className="flex justify-between text-[11px] font-mono text-white/50 mb-1">
              <span>Speed</span>
              <span>{speed.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min="0.02"
              max="0.5"
              step="0.01"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
          </label>

          <label className="block">
            <span className="flex justify-between text-[11px] font-mono text-white/50 mb-1">
              <span>Metallic</span>
              <span>{metallic.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min="0"
              max="2.0"
              step="0.05"
              value={metallic}
              onChange={(e) => setMetallic(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
          </label>

          <label className="block">
            <span className="flex justify-between text-[11px] font-mono text-white/50 mb-1">
              <span>Turbulence</span>
              <span>{turbulence.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.05"
              value={turbulence}
              onChange={(e) => setTurbulence(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
          </label>

          <p className="text-[10px] font-mono text-white/20 pt-1">
            Move your mouse to interact
          </p>
        </motion.div>
      )}
    </div>
  );
}
