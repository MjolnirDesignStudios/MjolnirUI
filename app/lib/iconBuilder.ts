// app/lib/iconBuilder.ts
// SVG path math for the custom icon builder.
// All shapes operate on a 100×100 viewBox with center at (50, 50).
// Each layer has a center offset (x, y), size, rotation, and shape-specific params.

export type ShapeKind = "circle" | "square" | "triangle" | "polygon" | "star" | "line";

export interface IconLayer {
  id: string;
  type: ShapeKind;
  /** Offset from canvas center in viewBox units (-50 to 50) */
  x: number;
  y: number;
  /** Size in viewBox units (0-100) */
  size: number;
  /** Rotation in degrees */
  rotation: number;
  /** Fill color (hex), or "none" */
  fill: string;
  /** Stroke color (hex) */
  stroke: string;
  /** Stroke width in viewBox units */
  strokeWidth: number;
  /** Opacity 0..1 */
  opacity: number;
  /** Shape-specific: polygon sides 3-12, star points 5-10 */
  sides?: number;
  /** Star inset 0.2..0.6 */
  starInset?: number;
}

export const VIEWBOX = 100;
export const CENTER = 50;

let layerIdCounter = 0;
export function nextLayerId(): string {
  layerIdCounter += 1;
  return `layer-${Date.now().toString(36)}-${layerIdCounter}`;
}

/* ═══════════════════════════════════════════════════════
   SHAPE → SVG ELEMENT
   Each function returns a JSX-ready prop object describing the shape.
   The component reads `kind` and renders appropriate <circle>/<rect>/etc.
   ═══════════════════════════════════════════════════════ */

export interface SvgShapeProps {
  kind: "circle" | "rect" | "polygon" | "line" | "path";
  attrs: Record<string, string | number>;
}

/** Convert a layer to its SVG primitive props */
export function layerToSvgProps(layer: IconLayer): SvgShapeProps {
  const cx = CENTER + layer.x;
  const cy = CENTER + layer.y;
  const half = layer.size / 2;

  switch (layer.type) {
    case "circle":
      return {
        kind: "circle",
        attrs: {
          cx,
          cy,
          r: half,
        },
      };

    case "square":
      return {
        kind: "rect",
        attrs: {
          x: cx - half,
          y: cy - half,
          width: layer.size,
          height: layer.size,
          transform: `rotate(${layer.rotation} ${cx} ${cy})`,
        },
      };

    case "triangle":
      return {
        kind: "polygon",
        attrs: {
          points: regularPolygonPoints(cx, cy, half, 3, layer.rotation - 90),
        },
      };

    case "polygon": {
      const sides = clamp(layer.sides ?? 6, 3, 12);
      return {
        kind: "polygon",
        attrs: {
          points: regularPolygonPoints(cx, cy, half, sides, layer.rotation - 90),
        },
      };
    }

    case "star": {
      const points = clamp(layer.sides ?? 5, 3, 10);
      const inset = clamp(layer.starInset ?? 0.4, 0.2, 0.7);
      return {
        kind: "polygon",
        attrs: {
          points: starPoints(cx, cy, half, points, inset, layer.rotation - 90),
        },
      };
    }

    case "line": {
      // Line = 2 endpoints based on size, with rotation.
      const angle = ((layer.rotation - 90) * Math.PI) / 180;
      const dx = (Math.cos(angle) * layer.size) / 2;
      const dy = (Math.sin(angle) * layer.size) / 2;
      return {
        kind: "line",
        attrs: {
          x1: cx - dx,
          y1: cy - dy,
          x2: cx + dx,
          y2: cy + dy,
        } as Record<string, string | number>,
      };
    }
  }
}

/* ═══════════════════════════════════════════════════════
   POLYGON / STAR POINT GENERATION
   ═══════════════════════════════════════════════════════ */

function regularPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotationDeg: number
): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = ((rotationDeg + (i * 360) / sides) * Math.PI) / 180;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

function starPoints(
  cx: number,
  cy: number,
  radius: number,
  points: number,
  innerRatio: number,
  rotationDeg: number
): string {
  const pts: string[] = [];
  const innerR = radius * innerRatio;
  const total = points * 2;
  for (let i = 0; i < total; i++) {
    const r = i % 2 === 0 ? radius : innerR;
    const angle = ((rotationDeg + (i * 360) / total) * Math.PI) / 180;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/* ═══════════════════════════════════════════════════════
   DEFAULT LAYER + SVG SERIALIZATION
   ═══════════════════════════════════════════════════════ */

export function defaultLayer(type: ShapeKind = "circle"): IconLayer {
  return {
    id: nextLayerId(),
    type,
    x: 0,
    y: 0,
    size: 50,
    rotation: 0,
    fill: type === "line" ? "none" : "#FFCC11",
    stroke: "#FFCC11",
    strokeWidth: type === "line" ? 4 : 0,
    opacity: 1,
    sides: type === "polygon" ? 6 : type === "star" ? 5 : undefined,
    starInset: type === "star" ? 0.4 : undefined,
  };
}

/** Render a layer's SVG element string (for export) */
export function layerToSvgString(layer: IconLayer): string {
  const props = layerToSvgProps(layer);
  const attrs = { ...props.attrs };

  // Common visual attributes
  const visual: Record<string, string | number> = {
    fill: layer.fill,
    stroke: layer.stroke,
    "stroke-width": layer.strokeWidth,
    "stroke-linejoin": "round",
    "stroke-linecap": "round",
    opacity: layer.opacity,
  };

  const allAttrs = { ...attrs, ...visual };
  const attrStr = Object.entries(allAttrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");

  return `<${props.kind} ${attrStr} />`;
}

/** Generate the full <svg>…</svg> string from a layer stack */
export function exportSvg(layers: IconLayer[], size = 100): string {
  const inner = layers.map(layerToSvgString).join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" width="${size}" height="${size}">\n  ${inner}\n</svg>`;
}
