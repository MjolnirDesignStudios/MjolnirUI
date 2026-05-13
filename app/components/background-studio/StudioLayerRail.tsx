// app/components/background-studio/StudioLayerRail.tsx
// Left rail: layer-type add menu + the stack of active layers.
// Click to select; eye toggle; lock toggle; reorder; duplicate; delete.
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown,
  Trash2, Copy, Square, Diamond, Hexagon, Sparkles, Layers,
  Palette, Zap, Image,
} from "lucide-react";
import type { BackgroundLayer, LayerType } from "./studioTypes";

interface StudioLayerRailProps {
  layers: BackgroundLayer[];
  activeId: string | null;
  maxLayers: number;
  onAdd: (type: LayerType) => void;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onToggleVisible: (id: string) => void;
  onToggleLocked: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}

const LAYER_TYPES: Array<{
  type: LayerType;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    style?: React.CSSProperties;
  }>;
  description: string;
}> = [
  { type: "solid", label: "Solid", icon: Square, description: "Single flat color" },
  { type: "gradient", label: "Gradient", icon: Diamond, description: "Linear / radial / conic" },
  { type: "mesh-gradient", label: "Mesh", icon: Palette, description: "Multi-anchor blob gradient" },
  { type: "noise", label: "Noise", icon: Image, description: "Fractal texture" },
  { type: "particles", label: "Particles", icon: Sparkles, description: "tsparticles primitives" },
  { type: "shapes", label: "Shapes", icon: Hexagon, description: "SVG primitives" },
  { type: "shader-preset", label: "Shader", icon: Zap, description: "GLSL preset from catalog" },
];

const TYPE_META: Record<
  LayerType,
  {
    icon: React.ComponentType<{
      size?: number;
      className?: string;
      style?: React.CSSProperties;
    }>;
    color: string;
  }
> = {
  solid: { icon: Square, color: "#FFCC11" },
  gradient: { icon: Diamond, color: "#00f0ff" },
  "mesh-gradient": { icon: Palette, color: "#7C3AED" },
  noise: { icon: Image, color: "#94A3B8" },
  particles: { icon: Sparkles, color: "#10B981" },
  shapes: { icon: Hexagon, color: "#F97316" },
  "shader-preset": { icon: Zap, color: "#EF4444" },
};

export function StudioLayerRail({
  layers,
  activeId,
  maxLayers,
  onAdd,
  onSelect,
  onMove,
  onToggleVisible,
  onToggleLocked,
  onDuplicate,
  onRemove,
}: StudioLayerRailProps) {
  const [addOpen, setAddOpen] = useState(false);
  const atMax = layers.length >= maxLayers;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Add layer */}
      <div className="relative">
        <button
          onClick={() => setAddOpen((v) => !v)}
          disabled={atMax}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#FFCC11] text-black hover:bg-[#FFD700] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          {atMax ? `Layer limit (${maxLayers})` : "Add layer"}
        </button>
        <AnimatePresence>
          {addOpen && !atMax && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 right-0 mt-2 z-10 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden"
            >
              {LAYER_TYPES.map(({ type, label, icon: Icon, description }) => {
                const meta = TYPE_META[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setAddOpen(false);
                      onAdd(type);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 transition border-b border-zinc-800/40 last:border-0"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${meta.color}20`, border: `1px solid ${meta.color}40` }}
                    >
                      <Icon size={13} style={{ color: meta.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{label}</div>
                      <div className="text-[10px] text-gray-500 truncate">{description}</div>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Layer stack — top of list renders on TOP visually */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 px-1">
          Layers ({layers.length}/{maxLayers})
        </div>
        <div
          className="flex flex-col-reverse gap-1 max-h-[60vh] overflow-y-auto pr-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {layers.map((layer) => {
            const meta = TYPE_META[layer.type];
            const Icon = meta.icon;
            const isActive = layer.id === activeId;
            return (
              <motion.div
                key={layer.id}
                layout
                className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg border text-sm transition ${
                  isActive
                    ? "bg-[#FFCC11]/10 border-[#FFCC11]/40"
                    : "bg-zinc-950 border-zinc-800/60 hover:border-zinc-700"
                }`}
              >
                <button
                  onClick={() => onSelect(layer.id)}
                  className="flex-1 flex items-center gap-2 min-w-0 text-left"
                >
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${meta.color}20` }}
                  >
                    <Icon size={11} style={{ color: meta.color }} />
                  </span>
                  <span
                    className={`flex-1 truncate text-xs ${
                      layer.visible ? "text-white" : "text-gray-600 line-through"
                    }`}
                  >
                    {layer.name}
                  </span>
                </button>

                {/* Hover-only actions on desktop, always visible on mobile */}
                <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition">
                  <RailIconButton
                    onClick={() => onToggleVisible(layer.id)}
                    aria-label={layer.visible ? "Hide" : "Show"}
                  >
                    {layer.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                  </RailIconButton>
                  <RailIconButton
                    onClick={() => onToggleLocked(layer.id)}
                    aria-label={layer.locked ? "Unlock" : "Lock"}
                  >
                    {layer.locked ? <Lock size={10} /> : <Unlock size={10} />}
                  </RailIconButton>
                  <RailIconButton onClick={() => onMove(layer.id, 1)} aria-label="Move up">
                    <ChevronUp size={10} />
                  </RailIconButton>
                  <RailIconButton onClick={() => onMove(layer.id, -1)} aria-label="Move down">
                    <ChevronDown size={10} />
                  </RailIconButton>
                  <RailIconButton onClick={() => onDuplicate(layer.id)} aria-label="Duplicate">
                    <Copy size={10} />
                  </RailIconButton>
                  <RailIconButton
                    onClick={() => onRemove(layer.id)}
                    aria-label="Delete"
                    danger
                  >
                    <Trash2 size={10} />
                  </RailIconButton>
                </div>
              </motion.div>
            );
          })}

          {layers.length === 0 && (
            <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-zinc-800 rounded-lg">
              <Layers size={20} className="mx-auto mb-2 text-gray-700" />
              No layers yet.<br />Click <span className="text-[#FFCC11]">Add layer</span> to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RailIconButton({
  onClick,
  children,
  danger,
  ...rest
}: {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  "aria-label": string;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-1 rounded transition ${
        danger
          ? "text-gray-500 hover:text-red-400 hover:bg-red-500/10"
          : "text-gray-500 hover:text-white hover:bg-white/5"
      }`}
      {...rest}
    >
      {children}
    </button>
  );
}
