// app/components/foundation/IconBuilder.tsx
// Base+ feature: layer-based custom icon builder.
// Compose geometric primitives, tweak per-layer, export SVG, save to user assets.
"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, ChevronUp, ChevronDown, Save, Copy, Check, Loader2,
  LockKeyhole, RotateCcw, Layers, Circle as CircleIcon, Square as SquareIcon,
  Triangle as TriangleIcon, Hexagon, Star as StarIcon, Minus,
} from "lucide-react";
import {
  type IconLayer,
  type ShapeKind,
  defaultLayer,
  layerToSvgProps,
  exportSvg,
  VIEWBOX,
} from "@/lib/iconBuilder";
import type { IconConfig } from "@/lib/designAssets";
import type { TierName } from "@/lib/tierConfig";
import { hasAccess, getTierConfig } from "@/lib/tierConfig";

interface IconBuilderProps {
  userTier: TierName;
  onRequestUpgrade: (featureName: string, requiredTier: TierName) => void;
  onSaved?: () => void;
}

const SHAPES: { type: ShapeKind; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { type: "circle", label: "Circle", icon: CircleIcon },
  { type: "square", label: "Square", icon: SquareIcon },
  { type: "triangle", label: "Triangle", icon: TriangleIcon },
  { type: "polygon", label: "Polygon", icon: Hexagon },
  { type: "star", label: "Star", icon: StarIcon },
  { type: "line", label: "Line", icon: Minus },
];

export function IconBuilder({ userTier, onRequestUpgrade, onSaved }: IconBuilderProps) {
  const [layers, setLayers] = useState<IconLayer[]>([defaultLayer("circle")]);
  const [activeId, setActiveId] = useState<string>(layers[0]?.id || "");
  const [name, setName] = useState("My Custom Icon");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const canSave = hasAccess(userTier, "base");
  const baseConfig = getTierConfig("base");

  const activeLayer = layers.find((l) => l.id === activeId);

  const svgString = useMemo(() => exportSvg(layers, 100), [layers]);

  const addLayer = (type: ShapeKind) => {
    const layer = defaultLayer(type);
    setLayers((ls) => [...ls, layer]);
    setActiveId(layer.id);
  };

  const removeLayer = (id: string) => {
    setLayers((ls) => {
      const next = ls.filter((l) => l.id !== id);
      if (id === activeId && next.length > 0) setActiveId(next[next.length - 1].id);
      return next;
    });
  };

  const moveLayer = (id: string, dir: -1 | 1) => {
    setLayers((ls) => {
      const idx = ls.findIndex((l) => l.id === id);
      if (idx < 0) return ls;
      const target = idx + dir;
      if (target < 0 || target >= ls.length) return ls;
      const next = [...ls];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const updateLayer = (id: string, patch: Partial<IconLayer>) => {
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const handleReset = () => {
    const first = defaultLayer("circle");
    setLayers([first]);
    setActiveId(first.id);
    setName("My Custom Icon");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(svgString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = async () => {
    if (!canSave) {
      onRequestUpgrade("Save Custom Icon", "base");
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      const config: IconConfig = {
        svg: svgString,
        shapes: layers.map((l) => ({
          type: l.type,
          fill: l.fill,
          stroke: l.stroke,
          strokeWidth: l.strokeWidth,
          opacity: l.opacity,
          rotation: l.rotation,
          params: {
            x: l.x,
            y: l.y,
            size: l.size,
            ...(l.sides ? { sides: l.sides } : {}),
            ...(l.starInset ? { starInset: l.starInset } : {}),
          },
        })),
      };
      const res = await fetch("/api/design-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_type: "icon",
          name: name || "Untitled Icon",
          config,
        }),
      });
      if (res.status === 403) {
        const body = await res.json();
        setSaveMessage({ kind: "err", text: body.error || "Tier limit reached." });
      } else if (!res.ok) {
        setSaveMessage({
          kind: "err",
          text: "Couldn't save right now — saving is temporarily unavailable.",
        });
      } else {
        setSaveMessage({ kind: "ok", text: "Saved." });
        onSaved?.();
      }
    } catch {
      setSaveMessage({ kind: "err", text: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers size={18} className="text-[#FFCC11]" />
            Custom Icon Builder
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Compose geometric layers, tweak fill/stroke/rotation, export SVG.
          </p>
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
          style={{
            backgroundColor: `${baseConfig.color}20`,
            color: baseConfig.color,
            border: `1px solid ${baseConfig.color}40`,
          }}
        >
          Base+ to save
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* ─ Preview ──────────────────────────────────── */}
        <div className="bg-black/40 border border-zinc-800/50 rounded-xl p-6 flex items-center justify-center min-h-[280px]">
          <div className="grid grid-cols-3 gap-6 items-center">
            <PreviewSize layers={layers} px={24} label="24px" />
            <PreviewSize layers={layers} px={64} label="64px" />
            <PreviewSize layers={layers} px={128} label="128px" />
          </div>
        </div>

        {/* ─ Right rail: layer list + add buttons ─────── */}
        <div className="space-y-3">
          {/* Add buttons */}
          <div>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Add layer
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {SHAPES.map((s) => (
                <button
                  key={s.type}
                  onClick={() => addLayer(s.type)}
                  className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-[#FFCC11]/40 transition text-gray-400 hover:text-white"
                  title={`Add ${s.label}`}
                >
                  <s.icon size={14} />
                  <span className="text-[9px] font-mono uppercase tracking-wider">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layer stack */}
          <div>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Layers ({layers.length})
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
              {[...layers].reverse().map((layer) => (
                <LayerRow
                  key={layer.id}
                  layer={layer}
                  active={layer.id === activeId}
                  canMoveUp={layers[layers.length - 1].id !== layer.id}
                  canMoveDown={layers[0].id !== layer.id}
                  onSelect={() => setActiveId(layer.id)}
                  onRemove={() => removeLayer(layer.id)}
                  onMoveUp={() => moveLayer(layer.id, 1)}
                  onMoveDown={() => moveLayer(layer.id, -1)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─ Active layer controls ────────────────────────── */}
      {activeLayer && (
        <div className="bg-black/40 border border-zinc-800/50 rounded-xl p-4 space-y-3">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            Editing — {activeLayer.type}
          </div>
          <LayerControls layer={activeLayer} onUpdate={(patch) => updateLayer(activeLayer.id, patch)} />
        </div>
      )}

      {/* ─ Name + actions ───────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="flex-1 min-w-[200px] rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-[#FFCC11]/40 transition"
          placeholder="Icon name"
        />
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white border border-zinc-800 hover:border-[#FFCC11]/40 transition"
        >
          {copied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
          {copied ? "Copied SVG" : "Copy SVG"}
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition"
        >
          <RotateCcw size={14} />
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-wait"
          style={{
            backgroundColor: canSave ? "#FFCC11" : `${baseConfig.color}20`,
            color: canSave ? "#000" : baseConfig.color,
            border: canSave ? "none" : `1px solid ${baseConfig.color}40`,
          }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : canSave ? <Save size={16} /> : <LockKeyhole size={16} />}
          {saving ? "Saving…" : canSave ? "Save Icon" : "Save (Base+)"}
        </button>
        {saveMessage && (
          <span className={`text-xs ${saveMessage.kind === "ok" ? "text-[#10B981]" : "text-amber-400"}`}>
            {saveMessage.text}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Preview at one size ──────────────────────────────── */
function PreviewSize({
  layers,
  px,
  label,
}: {
  layers: IconLayer[];
  px: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <SvgRender layers={layers} size={px} />
      <span className="text-[10px] font-mono text-gray-500">{label}</span>
    </div>
  );
}

/* ── Render the layered SVG ───────────────────────────── */
function SvgRender({ layers, size }: { layers: IconLayer[]; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {layers.map((layer) => {
        const props = layerToSvgProps(layer);
        const visual = {
          fill: layer.fill,
          stroke: layer.stroke,
          strokeWidth: layer.strokeWidth,
          strokeLinejoin: "round" as const,
          strokeLinecap: "round" as const,
          opacity: layer.opacity,
        };
        const all = { ...props.attrs, ...visual };
        switch (props.kind) {
          case "circle":
            return <circle key={layer.id} {...(all as any)} />;
          case "rect":
            return <rect key={layer.id} {...(all as any)} />;
          case "polygon":
            return <polygon key={layer.id} {...(all as any)} />;
          case "line":
            return <line key={layer.id} {...(all as any)} />;
          case "path":
            return <path key={layer.id} {...(all as any)} />;
        }
      })}
    </svg>
  );
}

/* ── Layer row in the stack list ──────────────────────── */
function LayerRow({
  layer,
  active,
  canMoveUp,
  canMoveDown,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  layer: IconLayer;
  active: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <motion.div
      layout
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition ${
        active
          ? "bg-[#FFCC11]/10 border-[#FFCC11]/40"
          : "bg-zinc-950 border-zinc-800/60 hover:border-zinc-700"
      }`}
    >
      <button onClick={onSelect} className="flex-1 flex items-center gap-2 text-left min-w-0">
        <span
          className="w-4 h-4 rounded border border-zinc-700 shrink-0"
          style={{ backgroundColor: layer.fill }}
        />
        <span className="text-xs text-white capitalize truncate">{layer.type}</span>
      </button>
      <button
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Move up"
      >
        <ChevronUp size={12} />
      </button>
      <button
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Move down"
      >
        <ChevronDown size={12} />
      </button>
      <button
        onClick={onRemove}
        className="p-1 text-gray-500 hover:text-red-400"
        aria-label="Remove"
      >
        <Trash2 size={12} />
      </button>
    </motion.div>
  );
}

/* ── Active-layer controls ────────────────────────────── */
function LayerControls({
  layer,
  onUpdate,
}: {
  layer: IconLayer;
  onUpdate: (patch: Partial<IconLayer>) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Position */}
      <SliderField
        label={`X offset: ${layer.x}`}
        value={layer.x}
        min={-50}
        max={50}
        step={1}
        onChange={(v) => onUpdate({ x: v })}
      />
      <SliderField
        label={`Y offset: ${layer.y}`}
        value={layer.y}
        min={-50}
        max={50}
        step={1}
        onChange={(v) => onUpdate({ y: v })}
      />
      <SliderField
        label={`Size: ${layer.size}`}
        value={layer.size}
        min={5}
        max={100}
        step={1}
        onChange={(v) => onUpdate({ size: v })}
      />
      <SliderField
        label={`Rotation: ${layer.rotation}°`}
        value={layer.rotation}
        min={0}
        max={360}
        step={1}
        onChange={(v) => onUpdate({ rotation: v })}
      />
      <SliderField
        label={`Stroke: ${layer.strokeWidth}`}
        value={layer.strokeWidth}
        min={0}
        max={20}
        step={0.5}
        onChange={(v) => onUpdate({ strokeWidth: v })}
      />
      <SliderField
        label={`Opacity: ${layer.opacity.toFixed(2)}`}
        value={layer.opacity}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => onUpdate({ opacity: v })}
      />

      {/* Polygon / Star specific */}
      {layer.type === "polygon" && (
        <SliderField
          label={`Sides: ${layer.sides ?? 6}`}
          value={layer.sides ?? 6}
          min={3}
          max={12}
          step={1}
          onChange={(v) => onUpdate({ sides: v })}
        />
      )}
      {layer.type === "star" && (
        <>
          <SliderField
            label={`Points: ${layer.sides ?? 5}`}
            value={layer.sides ?? 5}
            min={3}
            max={10}
            step={1}
            onChange={(v) => onUpdate({ sides: v })}
          />
          <SliderField
            label={`Inset: ${(layer.starInset ?? 0.4).toFixed(2)}`}
            value={layer.starInset ?? 0.4}
            min={0.2}
            max={0.7}
            step={0.05}
            onChange={(v) => onUpdate({ starInset: v })}
          />
        </>
      )}

      {/* Colors */}
      <ColorField
        label="Fill"
        value={layer.fill === "none" ? "#000000" : layer.fill}
        canBeNone
        currentlyNone={layer.fill === "none"}
        onChange={(v) => onUpdate({ fill: v })}
        onToggleNone={(none) => onUpdate({ fill: none ? "none" : "#FFCC11" })}
      />
      <ColorField
        label="Stroke"
        value={layer.stroke}
        onChange={(v) => onUpdate({ stroke: v })}
      />
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="text-[10px] font-mono text-gray-400 mb-1">{label}</div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#FFCC11]
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FFCC11]"
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  canBeNone,
  currentlyNone,
  onToggleNone,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  canBeNone?: boolean;
  currentlyNone?: boolean;
  onToggleNone?: (none: boolean) => void;
}) {
  return (
    <div>
      <div className="text-[10px] font-mono text-gray-400 mb-1">{label}</div>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          disabled={currentlyNone}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="w-9 h-7 rounded-md border border-zinc-700 cursor-pointer bg-transparent appearance-none disabled:opacity-40
            [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none"
        />
        <input
          type="text"
          value={currentlyNone ? "none" : value}
          disabled={currentlyNone}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 rounded-md bg-zinc-950 border border-zinc-800 px-2 py-1 text-[11px] font-mono text-white outline-none disabled:opacity-40"
        />
        {canBeNone && (
          <button
            onClick={() => onToggleNone?.(!currentlyNone)}
            className={`text-[10px] font-mono px-2 py-1 rounded-md border transition ${
              currentlyNone
                ? "bg-[#FFCC11]/15 border-[#FFCC11]/40 text-[#FFCC11]"
                : "bg-zinc-950 border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-700"
            }`}
            title="Toggle no fill"
          >
            none
          </button>
        )}
      </div>
    </div>
  );
}
