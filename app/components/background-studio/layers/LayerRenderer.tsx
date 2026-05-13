// app/components/background-studio/layers/LayerRenderer.tsx
// Switch-on-type render dispatcher. Each layer is wrapped in an absolutely-
// positioned div that owns opacity + mix-blend-mode. The inner renderer fills
// the wrapper (position: absolute; inset: 0).
"use client";

import React, { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import type {
  BackgroundLayer,
  GradientLayer,
  GradientStop,
  MeshGradientLayer,
  NoiseLayer,
  ParticlesLayer,
  ShapesLayer,
  ShapesPrimitive,
  ShaderPresetLayer,
  SolidLayer,
} from "../studioTypes";
import { findEntry } from "@/components/canvas/backgroundCatalog";

interface LayerRendererProps {
  layer: BackgroundLayer;
}

export function LayerRenderer({ layer }: LayerRendererProps) {
  if (!layer.visible) return null;

  return (
    <div
      className="absolute inset-0"
      style={{
        opacity: layer.opacity,
        mixBlendMode: layer.blendMode,
        pointerEvents: layer.type === "particles" ? "auto" : "none",
      }}
      aria-hidden="true"
    >
      <LayerBody layer={layer} />
    </div>
  );
}

function LayerBody({ layer }: { layer: BackgroundLayer }) {
  switch (layer.type) {
    case "solid":
      return <SolidLayerBody layer={layer} />;
    case "gradient":
      return <GradientLayerBody layer={layer} />;
    case "mesh-gradient":
      return <MeshGradientLayerBody layer={layer} />;
    case "noise":
      return <NoiseLayerBody layer={layer} />;
    case "shapes":
      return <ShapesLayerBody layer={layer} />;
    case "particles":
      return <ParticlesLayerBody layer={layer} />;
    case "shader-preset":
      return <ShaderPresetLayerBody layer={layer} />;
  }
}

/* ── Solid ──────────────────────────────────────────────── */
function SolidLayerBody({ layer }: { layer: SolidLayer }) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: layer.color }} />
  );
}

/* ── Gradient ───────────────────────────────────────────── */
function gradientCss(g: GradientLayer): string {
  const stops = g.stops
    .map((s: GradientStop) => `${s.color} ${(s.offset * 100).toFixed(1)}%`)
    .join(", ");
  if (g.gradientType === "linear") return `linear-gradient(${g.angleDeg}deg, ${stops})`;
  if (g.gradientType === "radial")
    return `radial-gradient(circle at ${50 + Math.cos((g.angleDeg * Math.PI) / 180) * 30}% ${
      50 + Math.sin((g.angleDeg * Math.PI) / 180) * 30
    }%, ${stops})`;
  // conic
  return `conic-gradient(from ${g.angleDeg}deg at 50% 50%, ${stops})`;
}
function GradientLayerBody({ layer }: { layer: GradientLayer }) {
  return (
    <div
      className="absolute inset-0"
      style={{ background: gradientCss(layer) }}
    />
  );
}

/* ── Mesh Gradient ──────────────────────────────────────── */
function MeshGradientLayerBody({ layer }: { layer: MeshGradientLayer }) {
  // Compose multiple radial gradients on top of a fallback color.
  const gradients = layer.anchors
    .map(
      (a) =>
        `radial-gradient(circle at ${(a.x * 100).toFixed(1)}% ${(a.y * 100).toFixed(1)}%, ${a.color} 0%, transparent ${(a.radius * 100).toFixed(1)}%)`
    )
    .join(", ");
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `${gradients}, ${layer.fallback}`,
      }}
    />
  );
}

/* ── Noise ──────────────────────────────────────────────── */
function NoiseLayerBody({ layer }: { layer: NoiseLayer }) {
  // SVG fractal noise filter; deterministic based on seed.
  const id = `noise-${layer.id}`;
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={id} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={(layer.scale / 50).toFixed(3)}
            numOctaves="2"
            seed={layer.seed}
            stitchTiles="stitch"
          />
          {layer.mode === "color" ? (
            <feColorMatrix
              type="matrix"
              values={`0 0 0 0 ${parseColorChannel(layer.tint, 0)} 0 0 0 0 ${parseColorChannel(layer.tint, 1)} 0 0 0 0 ${parseColorChannel(layer.tint, 2)} 0 0 0 1 0`}
            />
          ) : (
            <feColorMatrix type="saturate" values="0" />
          )}
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}
function parseColorChannel(hex: string, ch: 0 | 1 | 2): string {
  const m = hex.replace(/^#/, "");
  const full =
    m.length === 3 ? m.split("").map((c) => c + c).join("") : m.padEnd(6, "0");
  const v = parseInt(full.substring(ch * 2, ch * 2 + 2), 16) / 255;
  return v.toFixed(3);
}

/* ── Shapes (SVG primitives) ────────────────────────────── */
function ShapesLayerBody({ layer }: { layer: ShapesLayer }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {layer.primitives.map((p) => (
        <ShapePrimitive key={p.id} p={p} />
      ))}
    </svg>
  );
}
function ShapePrimitive({ p }: { p: ShapesPrimitive }) {
  const cx = p.x * 100;
  const cy = p.y * 100;
  const r = p.size / 2;
  const common = {
    fill: p.fill,
    stroke: p.stroke,
    strokeWidth: p.strokeWidth,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  if (p.kind === "circle") return <circle cx={cx} cy={cy} r={r} {...common} />;
  if (p.kind === "square")
    return (
      <rect
        x={cx - r}
        y={cy - r}
        width={p.size}
        height={p.size}
        transform={`rotate(${p.rotationDeg} ${cx} ${cy})`}
        {...common}
      />
    );
  if (p.kind === "line") {
    const angle = ((p.rotationDeg - 90) * Math.PI) / 180;
    const dx = (Math.cos(angle) * p.size) / 2;
    const dy = (Math.sin(angle) * p.size) / 2;
    return (
      <line
        x1={cx - dx}
        y1={cy - dy}
        x2={cx + dx}
        y2={cy + dy}
        {...common}
      />
    );
  }
  if (p.kind === "triangle" || p.kind === "polygon") {
    const sides = p.kind === "triangle" ? 3 : Math.max(3, Math.min(12, p.param ?? 6));
    return <polygon points={regularPoly(cx, cy, r, sides, p.rotationDeg - 90)} {...common} />;
  }
  if (p.kind === "star") {
    const points = Math.max(3, Math.min(10, p.param ?? 5));
    const inset = Math.max(0.2, Math.min(0.7, p.starInset ?? 0.4));
    return <polygon points={starPoints(cx, cy, r, points, inset, p.rotationDeg - 90)} {...common} />;
  }
  return null;
}
function regularPoly(cx: number, cy: number, r: number, n: number, rot: number): string {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((rot + (i * 360) / n) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}
function starPoints(cx: number, cy: number, r: number, n: number, inset: number, rot: number): string {
  const pts: string[] = [];
  const ri = r * inset;
  const total = n * 2;
  for (let i = 0; i < total; i++) {
    const rr = i % 2 === 0 ? r : ri;
    const a = ((rot + (i * 360) / total) * Math.PI) / 180;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

/* ── Particles (lazy tsparticles) ───────────────────────── */
const ParticlesRuntime = dynamic(
  () => import("./ParticlesRuntime").then((m) => ({ default: m.ParticlesRuntime })),
  { ssr: false }
);
function ParticlesLayerBody({ layer }: { layer: ParticlesLayer }) {
  return <ParticlesRuntime layer={layer} />;
}

/* ── Shader preset (lazy import from canvas catalog) ────── */
function ShaderPresetLayerBody({ layer }: { layer: ShaderPresetLayer }) {
  const entry = findEntry(layer.presetId);
  // Fallback gradient if the preset isn't in the catalog (shouldn't happen).
  const ShaderComponent = useMemo(() => {
    if (!entry) return null;
    // Reuse the canvas modal's LOADERS map indirectly — we keep the same
    // dynamic imports here.
    return dynamic(() => loadShaderPreset(entry.importKey), {
      ssr: false,
      loading: () => null,
    });
  }, [entry]);

  if (!entry) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #020617, #1e3a8a)",
        }}
      />
    );
  }
  return (
    <Suspense fallback={null}>
      <div
        className="absolute inset-0"
        style={{ background: entry.gradient }}
      >
        {ShaderComponent ? <ShaderComponent /> : null}
      </div>
    </Suspense>
  );
}

/* Local copy of the LOADERS map — kept here to avoid coupling the canvas
 * preview modal's internal map to a wider public API. Keep in sync. */
async function loadShaderPreset(
  importKey: string
): Promise<{ default: React.ComponentType<unknown> }> {
  type AnyMod = Record<string, unknown>;
  const pick = (m: AnyMod, fallbackName: string) =>
    (m.default ?? m[fallbackName]) as React.ComponentType<unknown>;

  switch (importKey) {
    case "ripple-grid":
      return import("@/components/mjolnirui/animations/ripple-grid/RippleGrid").then(
        (m) => ({ default: pick(m as AnyMod, "RippleGrid") })
      );
    case "lightning":
      return import("@/components/mjolnirui/animations/lightning/Lightning").then(
        (m) => ({ default: pick(m as AnyMod, "Lightning") })
      );
    case "aura-waves":
      return import("@/components/mjolnirui/animations/aurora/AuraWaves").then(
        (m) => ({ default: pick(m as AnyMod, "AuraWaves") })
      );
    case "accretion":
      return import("@/components/mjolnirui/backgrounds/accretion/Accretion").then(
        (m) => ({ default: pick(m as AnyMod, "Accretion") })
      );
    case "bifrost":
      return import("@/components/mjolnirui/backgrounds/bifrost/BiFrost").then(
        (m) => ({ default: pick(m as AnyMod, "BiFrost") })
      );
    case "dark-veil":
      return import("@/components/mjolnirui/backgrounds/dark-veil/DarkVeil").then(
        (m) => ({ default: pick(m as AnyMod, "DarkVeil") })
      );
    case "black-hole":
      return import("@/components/mjolnirui/animations/black-hole/BlackHole").then(
        (m) => ({ default: pick(m as AnyMod, "BlackHole") })
      );
    case "gravity-lens":
      return import("@/components/mjolnirui/backgrounds/gravity-lens/GravityLens").then(
        (m) => ({ default: pick(m as AnyMod, "GravityLens") })
      );
    case "liquid-ether":
      return import("@/components/mjolnirui/backgrounds/liquid-ether/LiquidEther").then(
        (m) => ({ default: pick(m as AnyMod, "LiquidEther") })
      );
    default:
      // Return an empty component for any preset we haven't wired yet.
      return { default: () => null };
  }
}
