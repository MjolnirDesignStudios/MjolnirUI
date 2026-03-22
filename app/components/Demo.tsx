// components/Demo.tsx — "Wield the Power of MjolnirUI!" — Dashboard Demo Preview
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  Palette,
  Box,
  Sparkles,
  Zap,
  ChevronRight,
} from "lucide-react";

// ─── Fake mini-chart bars ────────────────────────────────────────────────────
function MiniChart({ color, heights }: { color: string; heights: number[] }) {
  return (
    <div className="flex items-end gap-[3px] h-10">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
          viewport={{ once: true }}
          className="w-[6px] rounded-full"
          style={{ background: color, opacity: 0.8 }}
        />
      ))}
    </div>
  );
}

// ─── Dashboard Demo ──────────────────────────────────────────────────────────
function DashboardDemo() {
  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Layers, label: "Components", active: false },
    { icon: Palette, label: "Design Tokens", active: false },
    { icon: Box, label: "3D Forge", active: false },
    { icon: Sparkles, label: "Animations", active: false },
    { icon: Zap, label: "Shader Engine", active: false },
  ];

  const stats = [
    { label: "Components", value: "80+", change: "+12", color: "#3B82F6", heights: [40, 55, 45, 70, 60, 80, 75, 90, 85, 95] },
    { label: "Active Users", value: "1.2k", change: "+18%", color: "#10B981", heights: [30, 45, 50, 40, 65, 55, 70, 80, 75, 88] },
    { label: "Page Views", value: "8.4k", change: "+24%", color: "#EAB308", heights: [50, 35, 60, 55, 45, 70, 65, 80, 90, 85] },
  ];

  const components = [
    { name: "ShimmerButton", tier: "Free", color: "#3B82F6" },
    { name: "ElectricBorder", tier: "Base", color: "#10B981" },
    { name: "AuroraText", tier: "Base", color: "#10B981" },
    { name: "BifrostShader", tier: "Pro", color: "#EAB308" },
    { name: "AnimatedOrb", tier: "Pro", color: "#EAB308" },
  ];

  return (
    <div className="flex h-full overflow-hidden rounded-2xl">
      {/* Sidebar */}
      <div className="hidden sm:flex flex-col w-48 lg:w-52 border-r border-white/5 bg-black/30 py-4 px-3 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold/30 to-yellow-600/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-gold" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">MjolnirUI</span>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1">
          {sidebarItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
              viewport={{ once: true }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                item.active
                  ? "bg-white/8 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 lg:p-5 overflow-hidden">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-4"
        >
          <div>
            <h3 className="text-sm font-bold text-white">Welcome back, Builder</h3>
            <p className="text-[11px] text-gray-500">Your design system at a glance</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
              Pro
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold/20 to-orange-600/20 border border-white/10" />
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5 lg:gap-3 mb-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-xl bg-white/[0.03] border border-white/5 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-500">{stat.label}</span>
                <span className="text-[9px] font-medium" style={{ color: stat.color }}>
                  {stat.change}
                </span>
              </div>
              <div className="text-lg lg:text-xl font-black text-white mb-2">{stat.value}</div>
              <MiniChart color={stat.color} heights={stat.heights} />
            </motion.div>
          ))}
        </div>

        {/* Component list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          viewport={{ once: true }}
          className="rounded-xl bg-white/[0.03] border border-white/5 p-3"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white">Popular Components</span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1 cursor-pointer hover:text-gray-400">
              View all <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {components.map((comp, i) => (
              <motion.div
                key={comp.name}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + i * 0.06 }}
                viewport={{ once: true }}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: comp.color }}
                  />
                  <span className="text-xs text-gray-300">{comp.name}</span>
                </div>
                <span
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    color: comp.color,
                    background: `${comp.color}15`,
                  }}
                >
                  {comp.tier}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Demo Section ───────────────────────────────────────────────────────────
export default function Demo() {
  return (
    <section id="demo" className="py-12 sm:py-16 relative">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Access our Components Dashboard
          </h2>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">
            <span className="text-gold">Powered by </span>
            <span
              className="bg-linear-to-r from-gray-300 via-gold via-50% to-emerald-400 bg-clip-text text-transparent font-black"
              style={{
                backgroundSize: "200% 100%",
                animation: "animate-shimmer 3s ease-in-out infinite",
              }}
            >
              OdinAI
            </span>
          </p>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 mt-4 max-w-2xl mx-auto">
            MjolnirUI&apos;s dashboard is designed with creators and developers in mind.
          </p>
        </motion.div>

        {/* Glass Card with Dashboard Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Liquid glass container */}
          <div
            className="relative w-full rounded-3xl"
            style={{
              background: "rgba(255, 255, 255, 0.01)",
              backgroundBlendMode: "luminosity",
              backdropFilter: "blur(4px)",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Gradient border */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                padding: "1.4px",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%)",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />

            {/* Dashboard demo */}
            <div className="relative w-full h-[340px] sm:h-[380px] lg:h-[420px]">
              <DashboardDemo />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
