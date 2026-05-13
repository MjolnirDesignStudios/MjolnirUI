// app/components/background-studio/StudioInspector.tsx
// Right panel — config controls for the currently-selected layer.
// Switches on layer.type. Every change dispatches PATCH_LAYER.
"use client";

import React from "react";
import type {
  BackgroundLayer,
  BlendMode,
  GradientLayer,
  MeshAnchor,
  MeshGradientLayer,
  NoiseLayer,
  ParticlesLayer,
  ShaderPresetLayer,
  ShapesLayer,
  ShapesPrimitive,
  SolidLayer,
} from "./studioTypes";
import { BACKGROUND_CATALOG } from "@/components/canvas/backgroundCatalog";
import { nextLayerId } from "./studioTypes";
import { Trash2 } from "lucide-react";

interface StudioInspectorProps {
  layer: BackgroundLayer | null;
  onPatch: (id: string, patch: Partial<BackgroundLayer>) => void;
  onRename: (id: string, name: string) => void;
}

const BLEND_MODES: BlendMode[] = [
  "normal",
  "screen",
  "multiply",
  "overlay",
  "soft-light",
  "hard-light",
  "difference",
  "color-dodge",
];

export function StudioInspector({ layer, onPatch, onRename }: StudioInspectorProps) {
  if (!layer) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 text-center text-xs text-gray-500">
        Select a layer to edit its settings.
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 space-y-4">
      <header>
        <Label>Layer name</Label>
        <input
          type="text"
          value={layer.name}
          onChange={(e) => onRename(layer.id, e.target.value)}
          maxLength={60}
          disabled={layer.locked}
          className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#FFCC11]/40 transition disabled:opacity-50"
        />
      </header>

      <Group title="Common">
        <Slider
          label={`Opacity: ${(layer.opacity * 100).toFixed(0)}%`}
          value={layer.opacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => onPatch(layer.id, { opacity: v })}
          disabled={layer.locked}
        />
        <SelectField
          label="Blend mode"
          value={layer.blendMode}
          options={BLEND_MODES.map((m) => ({ value: m, label: m }))}
          onChange={(v) => onPatch(layer.id, { blendMode: v as BlendMode })}
          disabled={layer.locked}
        />
      </Group>

      <Group title="Layer-specific">
        {layer.type === "solid" && <SolidInspector layer={layer} onPatch={onPatch} />}
        {layer.type === "gradient" && (
          <GradientInspector layer={layer} onPatch={onPatch} />
        )}
        {layer.type === "mesh-gradient" && (
          <MeshGradientInspector layer={layer} onPatch={onPatch} />
        )}
        {layer.type === "noise" && <NoiseInspector layer={layer} onPatch={onPatch} />}
        {layer.type === "particles" && (
          <ParticlesInspector layer={layer} onPatch={onPatch} />
        )}
        {layer.type === "shapes" && <ShapesInspector layer={layer} onPatch={onPatch} />}
        {layer.type === "shader-preset" && (
          <ShaderPresetInspector layer={layer} onPatch={onPatch} />
        )}
      </Group>
    </div>
  );
}

/* ── Shared field primitives ────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
      {children}
    </div>
  );
}
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-[9px] font-bold uppercase tracking-wider text-gray-600">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  disabled?: boolean;
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
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#FFCC11]
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#FFCC11]
          disabled:opacity-50"
      />
    </div>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#FFCC11]/40 transition disabled:opacity-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value.startsWith("#") ? value.slice(0, 7) : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          disabled={disabled}
          className="w-8 h-7 rounded-md border border-zinc-700 cursor-pointer bg-transparent appearance-none disabled:opacity-50
            [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 min-w-0 rounded-md bg-zinc-950 border border-zinc-800 px-2 py-1 text-[11px] font-mono text-white outline-none disabled:opacity-50"
        />
      </div>
    </div>
  );
}

/* ── Per-type inspectors ────────────────────────────────── */
type PatchFn<L extends BackgroundLayer> = (id: string, patch: Partial<L>) => void;

function SolidInspector({
  layer,
  onPatch,
}: {
  layer: SolidLayer;
  onPatch: PatchFn<BackgroundLayer>;
}) {
  return (
    <ColorField
      label="Color"
      value={layer.color}
      onChange={(v) => onPatch(layer.id, { color: v } as Partial<SolidLayer>)}
      disabled={layer.locked}
    />
  );
}

function GradientInspector({
  layer,
  onPatch,
}: {
  layer: GradientLayer;
  onPatch: PatchFn<BackgroundLayer>;
}) {
  const setStops = (stops: GradientLayer["stops"]) =>
    onPatch(layer.id, { stops } as Partial<GradientLayer>);
  return (
    <>
      <SelectField
        label="Type"
        value={layer.gradientType}
        options={[
          { value: "linear", label: "Linear" },
          { value: "radial", label: "Radial" },
          { value: "conic", label: "Conic" },
        ]}
        onChange={(v) =>
          onPatch(layer.id, { gradientType: v as GradientLayer["gradientType"] } as Partial<GradientLayer>)
        }
        disabled={layer.locked}
      />
      <Slider
        label={`Angle: ${layer.angleDeg}°`}
        value={layer.angleDeg}
        min={0}
        max={360}
        step={1}
        onChange={(v) => onPatch(layer.id, { angleDeg: v } as Partial<GradientLayer>)}
        disabled={layer.locked}
      />
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Stops</Label>
          <button
            disabled={layer.stops.length >= 6 || layer.locked}
            onClick={() =>
              setStops([
                ...layer.stops,
                { offset: 0.5, color: "#FFCC11" },
              ])
            }
            className="text-[10px] text-[#FFCC11] hover:underline disabled:opacity-40 disabled:no-underline"
          >
            + add
          </button>
        </div>
        {layer.stops.map((stop, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              type="color"
              value={stop.color}
              onChange={(e) => {
                const next = [...layer.stops];
                next[i] = { ...stop, color: e.target.value.toUpperCase() };
                setStops(next);
              }}
              disabled={layer.locked}
              className="w-7 h-7 rounded border border-zinc-700 shrink-0
                [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none"
            />
            <input
              type="range"
              value={stop.offset}
              min={0}
              max={1}
              step={0.01}
              disabled={layer.locked}
              onChange={(e) => {
                const next = [...layer.stops];
                next[i] = { ...stop, offset: parseFloat(e.target.value) };
                setStops(next);
              }}
              className="flex-1 h-1 bg-zinc-700 rounded-full appearance-none accent-[#FFCC11]
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#FFCC11]"
            />
            <button
              onClick={() => setStops(layer.stops.filter((_, j) => j !== i))}
              disabled={layer.stops.length <= 2 || layer.locked}
              className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-30"
              aria-label="Remove stop"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function MeshGradientInspector({
  layer,
  onPatch,
}: {
  layer: MeshGradientLayer;
  onPatch: PatchFn<BackgroundLayer>;
}) {
  const setAnchors = (anchors: MeshAnchor[]) =>
    onPatch(layer.id, { anchors } as Partial<MeshGradientLayer>);
  return (
    <>
      <ColorField
        label="Fallback"
        value={layer.fallback}
        onChange={(v) => onPatch(layer.id, { fallback: v } as Partial<MeshGradientLayer>)}
        disabled={layer.locked}
      />
      <div className="flex items-center justify-between">
        <Label>Anchors ({layer.anchors.length}/6)</Label>
        <button
          disabled={layer.anchors.length >= 6 || layer.locked}
          onClick={() =>
            setAnchors([
              ...layer.anchors,
              { id: nextLayerId(), x: 0.5, y: 0.5, color: "#FFCC11", radius: 0.4 },
            ])
          }
          className="text-[10px] text-[#FFCC11] hover:underline disabled:opacity-40"
        >
          + add anchor
        </button>
      </div>
      {layer.anchors.map((a, i) => (
        <div key={a.id} className="rounded-lg border border-zinc-800/60 p-2 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] text-gray-500">Anchor {i + 1}</div>
            <button
              onClick={() => setAnchors(layer.anchors.filter((_, j) => j !== i))}
              disabled={layer.anchors.length <= 3 || layer.locked}
              className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-30"
              aria-label="Remove anchor"
            >
              <Trash2 size={10} />
            </button>
          </div>
          <ColorField
            label="Color"
            value={a.color}
            onChange={(v) => {
              const next = [...layer.anchors];
              next[i] = { ...a, color: v };
              setAnchors(next);
            }}
            disabled={layer.locked}
          />
          <div className="grid grid-cols-3 gap-1.5">
            <Slider
              label={`X: ${(a.x * 100).toFixed(0)}%`}
              value={a.x}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => {
                const next = [...layer.anchors];
                next[i] = { ...a, x: v };
                setAnchors(next);
              }}
              disabled={layer.locked}
            />
            <Slider
              label={`Y: ${(a.y * 100).toFixed(0)}%`}
              value={a.y}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => {
                const next = [...layer.anchors];
                next[i] = { ...a, y: v };
                setAnchors(next);
              }}
              disabled={layer.locked}
            />
            <Slider
              label={`R: ${(a.radius * 100).toFixed(0)}%`}
              value={a.radius}
              min={0.1}
              max={1}
              step={0.01}
              onChange={(v) => {
                const next = [...layer.anchors];
                next[i] = { ...a, radius: v };
                setAnchors(next);
              }}
              disabled={layer.locked}
            />
          </div>
        </div>
      ))}
    </>
  );
}

function NoiseInspector({
  layer,
  onPatch,
}: {
  layer: NoiseLayer;
  onPatch: PatchFn<BackgroundLayer>;
}) {
  return (
    <>
      <SelectField
        label="Mode"
        value={layer.mode}
        options={[
          { value: "monochrome", label: "Monochrome" },
          { value: "color", label: "Color" },
        ]}
        onChange={(v) =>
          onPatch(layer.id, { mode: v as NoiseLayer["mode"] } as Partial<NoiseLayer>)
        }
        disabled={layer.locked}
      />
      {layer.mode === "color" && (
        <ColorField
          label="Tint"
          value={layer.tint}
          onChange={(v) => onPatch(layer.id, { tint: v } as Partial<NoiseLayer>)}
          disabled={layer.locked}
        />
      )}
      <Slider
        label={`Scale: ${layer.scale}`}
        value={layer.scale}
        min={1}
        max={16}
        step={1}
        onChange={(v) => onPatch(layer.id, { scale: v } as Partial<NoiseLayer>)}
        disabled={layer.locked}
      />
      <button
        onClick={() =>
          onPatch(layer.id, { seed: Math.floor(Math.random() * 1e9) } as Partial<NoiseLayer>)
        }
        disabled={layer.locked}
        className="w-full text-[10px] uppercase tracking-wider text-gray-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-md py-1 transition disabled:opacity-50"
      >
        Randomize seed
      </button>
    </>
  );
}

function ParticlesInspector({
  layer,
  onPatch,
}: {
  layer: ParticlesLayer;
  onPatch: PatchFn<BackgroundLayer>;
}) {
  const setColors = (colors: string[]) =>
    onPatch(layer.id, { colors } as Partial<ParticlesLayer>);
  return (
    <>
      <SelectField
        label="Shape"
        value={layer.shape}
        options={[
          { value: "circle", label: "Circle" },
          { value: "square", label: "Square" },
          { value: "triangle", label: "Triangle" },
          { value: "polygon", label: "Polygon" },
          { value: "star", label: "Star" },
        ]}
        onChange={(v) =>
          onPatch(layer.id, { shape: v as ParticlesLayer["shape"] } as Partial<ParticlesLayer>)
        }
        disabled={layer.locked}
      />
      {(layer.shape === "polygon" || layer.shape === "star") && (
        <Slider
          label={`${layer.shape === "polygon" ? "Sides" : "Points"}: ${layer.shapeParam ?? (layer.shape === "polygon" ? 6 : 5)}`}
          value={layer.shapeParam ?? (layer.shape === "polygon" ? 6 : 5)}
          min={layer.shape === "polygon" ? 3 : 4}
          max={layer.shape === "polygon" ? 12 : 10}
          step={1}
          onChange={(v) => onPatch(layer.id, { shapeParam: v } as Partial<ParticlesLayer>)}
          disabled={layer.locked}
        />
      )}
      <Slider
        label={`Count: ${layer.count}`}
        value={layer.count}
        min={10}
        max={500}
        step={5}
        onChange={(v) => onPatch(layer.id, { count: v } as Partial<ParticlesLayer>)}
        disabled={layer.locked}
      />
      <div className="grid grid-cols-2 gap-2">
        <Slider
          label={`Size min: ${layer.sizeMin}`}
          value={layer.sizeMin}
          min={0.5}
          max={20}
          step={0.5}
          onChange={(v) => onPatch(layer.id, { sizeMin: v } as Partial<ParticlesLayer>)}
          disabled={layer.locked}
        />
        <Slider
          label={`Size max: ${layer.sizeMax}`}
          value={layer.sizeMax}
          min={0.5}
          max={20}
          step={0.5}
          onChange={(v) => onPatch(layer.id, { sizeMax: v } as Partial<ParticlesLayer>)}
          disabled={layer.locked}
        />
      </div>
      <Slider
        label={`Speed: ${layer.speed.toFixed(1)}`}
        value={layer.speed}
        min={0}
        max={6}
        step={0.1}
        onChange={(v) => onPatch(layer.id, { speed: v } as Partial<ParticlesLayer>)}
        disabled={layer.locked}
      />
      <SelectField
        label="Hover"
        value={layer.hoverInteraction}
        options={[
          { value: "none", label: "None" },
          { value: "grab", label: "Grab" },
          { value: "repulse", label: "Repulse" },
          { value: "bubble", label: "Bubble" },
        ]}
        onChange={(v) =>
          onPatch(layer.id, {
            hoverInteraction: v as ParticlesLayer["hoverInteraction"],
          } as Partial<ParticlesLayer>)
        }
        disabled={layer.locked}
      />
      <div className="space-y-1.5">
        <Label>Colors ({layer.colors.length}/6)</Label>
        {layer.colors.map((c, i) => (
          <div key={i} className="flex gap-1.5">
            <input
              type="color"
              value={c}
              onChange={(e) => {
                const next = [...layer.colors];
                next[i] = e.target.value.toUpperCase();
                setColors(next);
              }}
              disabled={layer.locked}
              className="w-7 h-7 rounded border border-zinc-700 shrink-0
                [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none"
            />
            <button
              onClick={() => setColors(layer.colors.filter((_, j) => j !== i))}
              disabled={layer.colors.length <= 1 || layer.locked}
              className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-30"
              aria-label="Remove color"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setColors([...layer.colors, "#FFCC11"])}
          disabled={layer.colors.length >= 6 || layer.locked}
          className="text-[10px] text-[#FFCC11] hover:underline disabled:opacity-40"
        >
          + add color
        </button>
      </div>
      <div className="flex items-center justify-between">
        <Label>Links</Label>
        <button
          onClick={() =>
            onPatch(layer.id, { linksEnabled: !layer.linksEnabled } as Partial<ParticlesLayer>)
          }
          disabled={layer.locked}
          className={`text-[10px] px-2 py-0.5 rounded border ${
            layer.linksEnabled
              ? "bg-[#FFCC11]/20 border-[#FFCC11]/40 text-[#FFCC11]"
              : "bg-zinc-900 border-zinc-800 text-gray-500"
          } disabled:opacity-50`}
        >
          {layer.linksEnabled ? "Enabled" : "Disabled"}
        </button>
      </div>
    </>
  );
}

function ShapesInspector({
  layer,
  onPatch,
}: {
  layer: ShapesLayer;
  onPatch: PatchFn<BackgroundLayer>;
}) {
  const setPrimitives = (primitives: ShapesPrimitive[]) =>
    onPatch(layer.id, { primitives } as Partial<ShapesLayer>);

  const addPrimitive = (kind: ShapesPrimitive["kind"]) => {
    const fresh: ShapesPrimitive = {
      id: nextLayerId(),
      kind,
      x: 0.5,
      y: 0.5,
      size: 25,
      rotationDeg: 0,
      fill: kind === "line" ? "none" : "#FFCC1140",
      stroke: "#FFCC11",
      strokeWidth: 2,
      ...(kind === "polygon" ? { param: 6 } : {}),
      ...(kind === "star" ? { param: 5, starInset: 0.4 } : {}),
    };
    setPrimitives([...layer.primitives, fresh]);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {(
          ["circle", "square", "triangle", "polygon", "star", "line"] as const
        ).map((k) => (
          <button
            key={k}
            onClick={() => addPrimitive(k)}
            disabled={layer.primitives.length >= 12 || layer.locked}
            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-700 transition disabled:opacity-40"
          >
            + {k}
          </button>
        ))}
      </div>

      {layer.primitives.map((p, i) => (
        <details key={p.id} className="rounded-lg border border-zinc-800/60 p-2">
          <summary className="text-xs text-white cursor-pointer flex items-center justify-between">
            <span className="capitalize">
              {p.kind} {i + 1}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                setPrimitives(layer.primitives.filter((_, j) => j !== i));
              }}
              disabled={layer.locked}
              className="p-1 text-gray-500 hover:text-red-400"
            >
              <Trash2 size={10} />
            </button>
          </summary>
          <div className="space-y-1.5 mt-2">
            <div className="grid grid-cols-2 gap-1.5">
              <Slider
                label={`X: ${(p.x * 100).toFixed(0)}%`}
                value={p.x}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => {
                  const next = [...layer.primitives];
                  next[i] = { ...p, x: v };
                  setPrimitives(next);
                }}
                disabled={layer.locked}
              />
              <Slider
                label={`Y: ${(p.y * 100).toFixed(0)}%`}
                value={p.y}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => {
                  const next = [...layer.primitives];
                  next[i] = { ...p, y: v };
                  setPrimitives(next);
                }}
                disabled={layer.locked}
              />
            </div>
            <Slider
              label={`Size: ${p.size}`}
              value={p.size}
              min={1}
              max={100}
              step={1}
              onChange={(v) => {
                const next = [...layer.primitives];
                next[i] = { ...p, size: v };
                setPrimitives(next);
              }}
              disabled={layer.locked}
            />
            <Slider
              label={`Rotation: ${p.rotationDeg}°`}
              value={p.rotationDeg}
              min={0}
              max={360}
              step={1}
              onChange={(v) => {
                const next = [...layer.primitives];
                next[i] = { ...p, rotationDeg: v };
                setPrimitives(next);
              }}
              disabled={layer.locked}
            />
            <Slider
              label={`Stroke width: ${p.strokeWidth}`}
              value={p.strokeWidth}
              min={0}
              max={10}
              step={0.5}
              onChange={(v) => {
                const next = [...layer.primitives];
                next[i] = { ...p, strokeWidth: v };
                setPrimitives(next);
              }}
              disabled={layer.locked}
            />
            <ColorField
              label="Fill"
              value={p.fill === "none" ? "#000000" : p.fill}
              onChange={(v) => {
                const next = [...layer.primitives];
                next[i] = { ...p, fill: v };
                setPrimitives(next);
              }}
              disabled={layer.locked}
            />
            <ColorField
              label="Stroke"
              value={p.stroke}
              onChange={(v) => {
                const next = [...layer.primitives];
                next[i] = { ...p, stroke: v };
                setPrimitives(next);
              }}
              disabled={layer.locked}
            />
          </div>
        </details>
      ))}
    </>
  );
}

function ShaderPresetInspector({
  layer,
  onPatch,
}: {
  layer: ShaderPresetLayer;
  onPatch: PatchFn<BackgroundLayer>;
}) {
  // Only show shaders, not the entire catalog
  const shaderEntries = BACKGROUND_CATALOG.filter((c) => c.bucket === "shader");
  return (
    <>
      <SelectField
        label="Shader preset"
        value={layer.presetId}
        options={shaderEntries.map((c) => ({
          value: c.id,
          label: `${c.name} (${c.requiredTier})`,
        }))}
        onChange={(v) =>
          onPatch(layer.id, { presetId: v } as Partial<ShaderPresetLayer>)
        }
        disabled={layer.locked}
      />
      <p className="text-[10px] text-gray-500 leading-relaxed">
        Shaders are rendered at native resolution and may be heavy on lower-end
        devices. Try lowering opacity or combining with a solid fallback layer.
      </p>
    </>
  );
}
