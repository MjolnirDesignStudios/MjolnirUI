// app/components/background-studio/studioTypes.ts
// Discriminated union for every layer the Background Studio supports.
// Saved verbatim into user_design_assets.config.layers as a jsonb array.
//
// IMPORTANT: bumping the schema in a backward-incompatible way?
// Increment SCHEMA_VERSION and add a migrator. Existing rows must keep loading.

export const SCHEMA_VERSION = 1;

export type LayerType =
  | "solid"
  | "gradient"
  | "mesh-gradient"
  | "noise"
  | "particles"
  | "shapes"
  | "shader-preset";

export type BlendMode =
  | "normal"
  | "screen"
  | "multiply"
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "difference"
  | "color-dodge";

/** Properties shared by every layer regardless of type. */
export interface BaseLayer {
  /** Stable id (uuid v4 OR `layer-<timestamp>-<n>`) */
  id: string;
  type: LayerType;
  /** User-editable label shown in the rail */
  name: string;
  /** Eye toggle — when false the layer is skipped during render */
  visible: boolean;
  /** Lock prevents accidental edits from the inspector */
  locked: boolean;
  /** 0..1 — applied to the layer's wrapper div via inline style */
  opacity: number;
  /** CSS mix-blend-mode applied to the wrapper div */
  blendMode: BlendMode;
}

/* ═══════════════════════════════════════════════════════
   PER-TYPE CONFIG SHAPES
   ═══════════════════════════════════════════════════════ */

export interface SolidLayer extends BaseLayer {
  type: "solid";
  color: string; // hex
}

export type GradientType = "linear" | "radial" | "conic";
export interface GradientStop {
  offset: number; // 0..1
  color: string; // hex (with optional alpha as #RRGGBBAA)
}
export interface GradientLayer extends BaseLayer {
  type: "gradient";
  gradientType: GradientType;
  /** For linear: 0..360°. For radial: percentage of position (kept as angle for UI simplicity). */
  angleDeg: number;
  stops: GradientStop[]; // length 2..6
}

export interface MeshAnchor {
  id: string;
  /** 0..1 viewport position */
  x: number;
  y: number;
  color: string; // hex
  /** 0..1 falloff radius — relative to canvas diagonal */
  radius: number;
}
export interface MeshGradientLayer extends BaseLayer {
  type: "mesh-gradient";
  /** 3..6 anchors blended via additive radial gradients */
  anchors: MeshAnchor[];
  /** Background color visible where no anchor reaches */
  fallback: string;
}

export interface NoiseLayer extends BaseLayer {
  type: "noise";
  /** Random seed (deterministic noise pattern) */
  seed: number;
  /** 1..16 — visual grain density */
  scale: number;
  /** "monochrome" produces grayscale noise; "color" uses the tint */
  mode: "monochrome" | "color";
  /** Used when mode === "color" */
  tint: string;
}

export type ParticleShapeKind =
  | "circle"
  | "square"
  | "triangle"
  | "polygon"
  | "star";

export interface ParticlesLayer extends BaseLayer {
  type: "particles";
  shape: ParticleShapeKind;
  /** Polygon sides 3-12; Star points 5-10 */
  shapeParam?: number;
  /** 10..500 */
  count: number;
  sizeMin: number;
  sizeMax: number;
  /** 0..6 */
  speed: number;
  direction:
    | "none"
    | "top"
    | "top-right"
    | "right"
    | "bottom-right"
    | "bottom"
    | "bottom-left"
    | "left"
    | "top-left";
  outMode: "bounce" | "out" | "destroy";
  /** Up to 6 colors, particles cycle through them */
  colors: string[];
  linksEnabled: boolean;
  linksDistance?: number;
  linksColor?: string;
  hoverInteraction: "none" | "grab" | "repulse" | "bubble";
}

export type ShapesPrimitiveKind =
  | "circle"
  | "square"
  | "triangle"
  | "polygon"
  | "star"
  | "line";

export interface ShapesPrimitive {
  id: string;
  kind: ShapesPrimitiveKind;
  /** Viewport-relative center 0..1 */
  x: number;
  y: number;
  /** Size as % of canvas min-dimension (1..100) */
  size: number;
  rotationDeg: number;
  fill: string; // hex, or "none"
  stroke: string;
  strokeWidth: number;
  /** Polygon sides / Star points / unused for others */
  param?: number;
  /** Star inset 0.2..0.7 — only used when kind === "star" */
  starInset?: number;
}
export interface ShapesLayer extends BaseLayer {
  type: "shapes";
  primitives: ShapesPrimitive[];
}

export interface ShaderPresetLayer extends BaseLayer {
  type: "shader-preset";
  /** ID into app/components/canvas/backgroundCatalog.ts BACKGROUND_CATALOG */
  presetId: string;
  /** Optional override params — interpreted per-component (most accept none for v1) */
  params?: Record<string, number | string>;
}

/* ═══════════════════════════════════════════════════════
   UNION + GUARDS
   ═══════════════════════════════════════════════════════ */

export type BackgroundLayer =
  | SolidLayer
  | GradientLayer
  | MeshGradientLayer
  | NoiseLayer
  | ParticlesLayer
  | ShapesLayer
  | ShaderPresetLayer;

export interface StudioState {
  name: string;
  canvasAspect: "16/9" | "1/1" | "9/16" | "4/3" | "21/9";
  layers: BackgroundLayer[];
  activeLayerId: string | null;
  schemaVersion: number;
  /** True when the user has made changes since last save */
  dirty: boolean;
}

/* ═══════════════════════════════════════════════════════
   FACTORIES — typed defaults per layer type
   ═══════════════════════════════════════════════════════ */

let layerCounter = 0;
export function nextLayerId(): string {
  layerCounter += 1;
  return `layer-${Date.now().toString(36)}-${layerCounter}`;
}

const BASE = (type: LayerType, name: string): BaseLayer => ({
  id: nextLayerId(),
  type,
  name,
  visible: true,
  locked: false,
  opacity: 1,
  blendMode: "normal",
});

export function makeSolid(color = "#0F172A"): SolidLayer {
  return { ...BASE("solid", "Solid"), type: "solid", color };
}

export function makeGradient(): GradientLayer {
  return {
    ...BASE("gradient", "Gradient"),
    type: "gradient",
    gradientType: "linear",
    angleDeg: 135,
    stops: [
      { offset: 0, color: "#FFCC11" },
      { offset: 1, color: "#00F0FF" },
    ],
  };
}

export function makeMeshGradient(): MeshGradientLayer {
  return {
    ...BASE("mesh-gradient", "Mesh"),
    type: "mesh-gradient",
    anchors: [
      { id: nextLayerId(), x: 0.2, y: 0.3, color: "#FFCC11", radius: 0.55 },
      { id: nextLayerId(), x: 0.75, y: 0.65, color: "#00F0FF", radius: 0.5 },
      { id: nextLayerId(), x: 0.55, y: 0.15, color: "#7C3AED", radius: 0.45 },
    ],
    fallback: "#020617",
  };
}

export function makeNoise(): NoiseLayer {
  return {
    ...BASE("noise", "Noise"),
    type: "noise",
    seed: Math.floor(Math.random() * 1e9),
    scale: 6,
    mode: "monochrome",
    tint: "#FFFFFF",
    opacity: 0.15,
    blendMode: "overlay",
  };
}

export function makeParticles(): ParticlesLayer {
  return {
    ...BASE("particles", "Particles"),
    type: "particles",
    shape: "circle",
    count: 80,
    sizeMin: 1,
    sizeMax: 4,
    speed: 1.5,
    direction: "none",
    outMode: "bounce",
    colors: ["#FFCC11", "#00F0FF"],
    linksEnabled: true,
    linksDistance: 140,
    linksColor: "#FFCC11",
    hoverInteraction: "grab",
  };
}

export function makeShapes(): ShapesLayer {
  return {
    ...BASE("shapes", "Shapes"),
    type: "shapes",
    primitives: [
      {
        id: nextLayerId(),
        kind: "circle",
        x: 0.5,
        y: 0.5,
        size: 30,
        rotationDeg: 0,
        fill: "#FFCC1140",
        stroke: "#FFCC11",
        strokeWidth: 2,
      },
    ],
  };
}

export function makeShaderPreset(presetId: string): ShaderPresetLayer {
  return {
    ...BASE("shader-preset", "Shader"),
    type: "shader-preset",
    presetId,
    opacity: 1,
  };
}

/* ═══════════════════════════════════════════════════════
   PRESET STARTING STATES
   ═══════════════════════════════════════════════════════ */

export function emptyState(): StudioState {
  return {
    name: "Untitled Background",
    canvasAspect: "16/9",
    layers: [],
    activeLayerId: null,
    schemaVersion: SCHEMA_VERSION,
    dirty: false,
  };
}

export function starterState(): StudioState {
  const solid = makeSolid("#020617");
  const mesh = makeMeshGradient();
  return {
    name: "Asgard Starter",
    canvasAspect: "16/9",
    layers: [solid, mesh],
    activeLayerId: mesh.id,
    schemaVersion: SCHEMA_VERSION,
    dirty: false,
  };
}
