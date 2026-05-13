// app/components/canvas/backgroundCatalog.ts
// Curated catalog of backgrounds used by /blocks/canvas/backgrounds and
// /blocks/canvas/shaders. Each entry references a component path that's
// dynamically imported in the preview modal — we never bundle all of them
// into the gallery page.

import type { TierName } from "@/lib/tierConfig";

export type CatalogTech =
  | "css"
  | "canvas"
  | "tsparticles"
  | "three"
  | "ogl"
  | "glsl"
  | "postprocessing"
  | "r3f";

export interface CatalogEntry {
  /** Stable id used in URL params and analytics events */
  id: string;
  name: string;
  description: string;
  /** "simple" = CSS / canvas / basic three.js (Backgrounds page)
   *  "shader" = GLSL / OGL / postprocessing (Shader Backgrounds page) */
  bucket: "simple" | "shader";
  requiredTier: TierName;
  tech: CatalogTech[];
  /** Dynamic import path, mapped manually in importMap below (string-literal lookup) */
  importKey: string;
  /** Named export to use; if omitted, default export is used */
  exportName?: string;
  /** Themed gradient for the card placeholder when not live-previewed */
  gradient: string;
  /** Optional flags surfaced as badges on the card */
  isNew?: boolean;
  isPopular?: boolean;
}

/* ═══════════════════════════════════════════════════════
   CATALOG
   ═══════════════════════════════════════════════════════ */
export const BACKGROUND_CATALOG: CatalogEntry[] = [
  /* ─── SIMPLE BACKGROUNDS ─────────────────────────────── */
  {
    id: "color-halo",
    name: "Color Halo",
    description: "Radiant color halo with animated glow transitions. Pure CSS.",
    bucket: "simple",
    requiredTier: "free",
    tech: ["css"],
    importKey: "color-halo",
    gradient: "radial-gradient(circle at 30% 40%, #FFCC11 0%, #00f0ff 40%, #020617 80%)",
  },
  {
    id: "prism",
    name: "Prism",
    description: "Light-splitting prism with rainbow dispersion. Pure CSS.",
    bucket: "simple",
    requiredTier: "free",
    tech: ["css"],
    importKey: "prism",
    gradient:
      "linear-gradient(135deg, #ef4444 0%, #f97316 20%, #FFCC11 40%, #10B981 60%, #00f0ff 80%, #7C3AED 100%)",
  },
  {
    id: "silky-lines",
    name: "Silky Lines",
    description: "Smooth flowing silk threads with organic motion.",
    bucket: "simple",
    requiredTier: "free",
    tech: ["canvas"],
    importKey: "silky-lines",
    gradient: "linear-gradient(135deg, #0a0a0f 0%, #1e293b 50%, #334155 100%)",
  },
  {
    id: "star-field",
    name: "Star Field",
    description: "Parallax star field with twinkling depth layers.",
    bucket: "simple",
    requiredTier: "free",
    tech: ["canvas"],
    importKey: "star-field",
    gradient:
      "radial-gradient(ellipse at center, #1e1b4b 0%, #020617 80%), radial-gradient(circle at 30% 20%, white 1px, transparent 2px)",
  },
  {
    id: "matrix-rain",
    name: "Matrix Rain",
    description: "Digital rain with Japanese characters and green glow.",
    bucket: "simple",
    requiredTier: "free",
    tech: ["canvas"],
    importKey: "matrix-rain",
    gradient: "linear-gradient(180deg, #022c22 0%, #064e3b 50%, #022c22 100%)",
  },
  {
    id: "neural-net",
    name: "Neural Network",
    description: "Connected node graph with pulsing data flow animation.",
    bucket: "simple",
    requiredTier: "base",
    tech: ["canvas"],
    importKey: "neural-net",
    gradient: "linear-gradient(135deg, #0a0a0f 0%, #1e3a8a 50%, #0a0a0f 100%)",
    isPopular: true,
  },
  {
    id: "atomic",
    name: "Atomic",
    description: "Orbiting atomic particles with electron trail effects.",
    bucket: "simple",
    requiredTier: "base",
    tech: ["three"],
    importKey: "atomic",
    gradient: "radial-gradient(circle at center, #1e293b 0%, #0f172a 60%, #020617 100%)",
  },
  {
    id: "smoke",
    name: "Smoke",
    description: "Volumetric smoke plumes with turbulence simulation.",
    bucket: "simple",
    requiredTier: "base",
    tech: ["three"],
    importKey: "smoke",
    gradient: "linear-gradient(180deg, #0a0a0f 0%, #18181b 50%, #27272a 100%)",
  },
  {
    id: "stars-bg",
    name: "Stars",
    description: "Three.js starfield with camera depth and parallax.",
    bucket: "simple",
    requiredTier: "base",
    tech: ["three"],
    importKey: "stars-bg",
    gradient:
      "radial-gradient(ellipse at center, #18181b 0%, #09090b 60%, #020617 100%)",
  },
  {
    id: "atmosphere",
    name: "Atmosphere",
    description: "Atmospheric particle cloud with tsparticles engine.",
    bucket: "simple",
    requiredTier: "base",
    tech: ["tsparticles"],
    importKey: "atmosphere",
    gradient: "linear-gradient(180deg, #0c4a6e 0%, #0e7490 50%, #155e75 100%)",
  },
  {
    id: "light-pillar",
    name: "Light Pillar",
    description: "Vertical light beam pillars with atmospheric scattering.",
    bucket: "simple",
    requiredTier: "base",
    tech: ["three"],
    importKey: "light-pillar",
    gradient:
      "linear-gradient(180deg, #020617 0%, #1e1b4b 40%, #312e81 70%, #020617 100%)",
  },
  {
    id: "vortex",
    name: "Vortex",
    description: "Spiraling vortex with particle acceleration.",
    bucket: "simple",
    requiredTier: "pro",
    tech: ["three"],
    importKey: "vortex",
    gradient:
      "radial-gradient(circle at center, #7C3AED 0%, #1e1b4b 50%, #020617 100%)",
    isNew: true,
  },
  {
    id: "liquid-ribbons",
    name: "Liquid Ribbons",
    description: "Flowing ribbon streams with fluid dynamics.",
    bucket: "simple",
    requiredTier: "pro",
    tech: ["three"],
    importKey: "liquid-ribbons",
    gradient: "linear-gradient(135deg, #0c4a6e 0%, #7C3AED 50%, #be185d 100%)",
    isNew: true,
  },
  {
    id: "swirling-gas",
    name: "Swirling Gas",
    description: "Nebular gas clouds with Three.js volumetric rendering.",
    bucket: "simple",
    requiredTier: "pro",
    tech: ["three"],
    importKey: "swirling-gas",
    gradient: "radial-gradient(circle at 70% 30%, #be185d 0%, #4c1d95 60%, #020617 100%)",
  },
  {
    id: "singularity",
    name: "Singularity",
    description: "Collapsing singularity with gravitational distortion.",
    bucket: "simple",
    requiredTier: "elite",
    tech: ["three"],
    importKey: "singularity",
    gradient: "radial-gradient(circle at center, #f97316 0%, #7c2d12 30%, #020617 80%)",
    isNew: true,
  },

  /* ─── SHADER BACKGROUNDS ────────────────────────────── */
  {
    id: "ripple-grid",
    name: "Ripple Grid",
    description: "Interactive dot grid with ripple wave propagation. OGL.",
    bucket: "shader",
    requiredTier: "free",
    tech: ["ogl"],
    importKey: "ripple-grid",
    gradient: "linear-gradient(135deg, #020617 0%, #0c4a6e 50%, #020617 100%)",
  },
  {
    id: "lightning",
    name: "Lightning",
    description: "WebGL lightning bolts with branching fractal arcs.",
    bucket: "shader",
    requiredTier: "free",
    tech: ["glsl"],
    importKey: "lightning",
    gradient: "linear-gradient(180deg, #020617 0%, #1e1b4b 50%, #6366f1 100%)",
    isPopular: true,
  },
  {
    id: "aura-waves",
    name: "Aura Waves",
    description: "Ethereal aura energy waves with OGL shader rendering.",
    bucket: "shader",
    requiredTier: "base",
    tech: ["ogl", "glsl"],
    importKey: "aura-waves",
    gradient:
      "radial-gradient(ellipse at 50% 70%, #10B981 0%, #1e3a8a 50%, #020617 100%)",
    isNew: true,
  },
  {
    id: "accretion",
    name: "Accretion Disk",
    description: "Black hole accretion disk with GLSL ray marching.",
    bucket: "shader",
    requiredTier: "pro",
    tech: ["three", "glsl"],
    importKey: "accretion",
    gradient:
      "radial-gradient(circle at center, #FFCC11 0%, #b45309 25%, #020617 70%)",
    isPopular: true,
  },
  {
    id: "bifrost",
    name: "Bifrost Bridge",
    description: "The Rainbow Bridge of Asgard — full GLSL shader with ROYGBIV beams.",
    bucket: "shader",
    requiredTier: "pro",
    tech: ["three", "glsl"],
    importKey: "bifrost",
    gradient:
      "conic-gradient(from 270deg at 50% 100%, #ef4444 0%, #f97316 15%, #FFCC11 30%, #10B981 50%, #00f0ff 70%, #7C3AED 90%, #ef4444 100%)",
    isPopular: true,
  },
  {
    id: "dark-veil",
    name: "Dark Veil",
    description: "Mysterious dark fog with OGL shader displacement.",
    bucket: "shader",
    requiredTier: "pro",
    tech: ["ogl", "glsl"],
    importKey: "dark-veil",
    gradient: "linear-gradient(180deg, #020617 0%, #18181b 50%, #020617 100%)",
  },
  {
    id: "laser-flow",
    name: "Laser Flow",
    description: "Flowing laser beams with Three.js line geometry.",
    bucket: "shader",
    requiredTier: "pro",
    tech: ["three"],
    importKey: "laser-flow",
    gradient:
      "linear-gradient(45deg, #ef4444 0%, #FFCC11 30%, #00f0ff 60%, #7C3AED 100%)",
    isNew: true,
  },
  {
    id: "black-hole",
    name: "Black Hole",
    description: "Warping black hole with simplex noise accretion glow.",
    bucket: "shader",
    requiredTier: "pro",
    tech: ["ogl", "glsl"],
    importKey: "black-hole",
    gradient:
      "radial-gradient(circle at center, #000 0%, #18181b 25%, #be185d 60%, #020617 90%)",
    isPopular: true,
  },
  {
    id: "globe",
    name: "Interactive Globe",
    description: "3D Earth with country borders, arcs, and glow atmosphere.",
    bucket: "shader",
    requiredTier: "pro",
    tech: ["r3f", "three"],
    importKey: "globe",
    gradient:
      "radial-gradient(circle at 40% 50%, #00f0ff 0%, #1e3a8a 40%, #020617 80%)",
    isPopular: true,
  },
  {
    id: "gravity-lens",
    name: "Gravity Lens",
    description: "Gravitational lensing distortion with light bending.",
    bucket: "shader",
    requiredTier: "elite",
    tech: ["ogl", "glsl"],
    importKey: "gravity-lens",
    gradient:
      "radial-gradient(circle at center, #FFCC11 0%, #be185d 25%, #4c1d95 60%, #020617 100%)",
    isNew: true,
  },
  {
    id: "liquid-ether",
    name: "Liquid Ether",
    description: "GPU-accelerated fluid simulation with mouse interaction.",
    bucket: "shader",
    requiredTier: "elite",
    tech: ["three", "glsl"],
    importKey: "liquid-ether",
    gradient:
      "linear-gradient(135deg, #00f0ff 0%, #FFCC11 50%, #be185d 100%)",
    isPopular: true,
  },
  {
    id: "hyperspeed",
    name: "Hyperspeed",
    description: "Warp drive highway with bloom, car lights, and speed lines.",
    bucket: "shader",
    requiredTier: "elite",
    tech: ["three", "postprocessing"],
    importKey: "hyperspeed",
    gradient: "linear-gradient(90deg, #020617 0%, #FFCC11 50%, #020617 100%)",
    isPopular: true,
  },
];

export function getByBucket(bucket: "simple" | "shader"): CatalogEntry[] {
  return BACKGROUND_CATALOG.filter((c) => c.bucket === bucket);
}

export function findEntry(id: string): CatalogEntry | undefined {
  return BACKGROUND_CATALOG.find((c) => c.id === id);
}
