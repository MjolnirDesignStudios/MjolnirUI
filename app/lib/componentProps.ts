// app/lib/componentProps.ts
// Props configuration registry — extracted from MDS Section files
// Powers the interactive customization panel in the component studio

export type PropControlType = "range" | "color" | "toggle" | "select";

export interface PropConfig {
  key: string;
  label: string;
  type: PropControlType;
  default: number | string | boolean | string[];
  // Range slider config
  min?: number;
  max?: number;
  step?: number;
  /** Format display value: "deg", "%", "x", or custom */
  suffix?: string;
  /** Multiply value for display (e.g. 100 for percentage) */
  displayMultiplier?: number;
  // Select config
  options?: { label: string; value: string }[];
}

export interface ComponentPropsConfig {
  id: string;
  props: PropConfig[];
  /** Props to always pass but not expose in UI */
  hardcoded?: Record<string, unknown>;
}

/* ═══════════════════════════════════════════════════════
   COMPONENT PROPS REGISTRY — All 34 Components
   ═══════════════════════════════════════════════════════ */

export const COMPONENT_PROPS: Record<string, ComponentPropsConfig> = {
  // ── BACKGROUNDS ───────────────────────────────────────

  "color-halo": {
    id: "color-halo",
    props: [
      { key: "colors", label: "Halo Colors", type: "color", default: ["#ff006e", "#ff8c00", "#ffd60a", "#4ade80"] },
      { key: "rotation", label: "Rotation", type: "range", default: 45, min: -180, max: 180, step: 1, suffix: "°" },
      { key: "autoRotate", label: "Auto Rotate", type: "range", default: 0, min: -5, max: 5, step: 0.1, suffix: "°/s" },
      { key: "speed", label: "Speed", type: "range", default: 0.2, min: 0, max: 1, step: 0.01 },
      { key: "scale", label: "Scale", type: "range", default: 1.0, min: 0.2, max: 5, step: 0.05 },
      { key: "frequency", label: "Frequency", type: "range", default: 1.0, min: 0, max: 5, step: 0.05 },
      { key: "warpStrength", label: "Warp Strength", type: "range", default: 1.0, min: 0, max: 1, step: 0.01 },
      { key: "mouseInfluence", label: "Mouse Influence", type: "range", default: 1.0, min: 0, max: 2, step: 0.05 },
      { key: "parallax", label: "Parallax", type: "range", default: 1.0, min: 0, max: 2, step: 0.05 },
      { key: "noise", label: "Noise", type: "range", default: 0.71, min: 0, max: 1, step: 0.01, suffix: "%", displayMultiplier: 100 },
    ],
    hardcoded: { transparent: true },
  },

  "prism": {
    id: "prism",
    props: [
      { key: "animationType", label: "Animation", type: "select", default: "rotate", options: [
        { label: "Rotate (Wobble)", value: "rotate" },
        { label: "Hover Tilt", value: "hover" },
        { label: "3D Rotate", value: "3drotate" },
      ]},
      { key: "glow", label: "Glow", type: "range", default: 1.8, min: 0, max: 4, step: 0.1 },
      { key: "bloom", label: "Bloom", type: "range", default: 0.7, min: 0, max: 3, step: 0.1 },
      { key: "noise", label: "Noise", type: "range", default: 0.1, min: 0, max: 1, step: 0.01, suffix: "%", displayMultiplier: 100 },
      { key: "scale", label: "Scale", type: "range", default: 2.5, min: 2, max: 6, step: 0.1 },
      { key: "hueShift", label: "Hue Shift", type: "range", default: 0, min: -180, max: 180, step: 1, suffix: "°" },
      { key: "timeScale", label: "Speed", type: "range", default: 0.5, min: 0, max: 2, step: 0.05 },
      { key: "hoverStrength", label: "Hover Sensitivity", type: "range", default: 2.2, min: 0, max: 5, step: 0.1 },
      { key: "inertia", label: "Inertia", type: "range", default: 0.08, min: 0.01, max: 0.3, step: 0.01, suffix: "%", displayMultiplier: 100 },
    ],
    hardcoded: { transparent: true },
  },

  "silky-lines": {
    id: "silky-lines",
    props: [
      { key: "color", label: "Line Color", type: "color", default: "#c084fc" },
      { key: "amplitude", label: "Amplitude", type: "range", default: 1.0, min: 0, max: 2, step: 0.1 },
      { key: "distance", label: "Line Spacing", type: "range", default: 1.1, min: 0, max: 2, step: 0.1 },
      { key: "speed", label: "Speed", type: "range", default: 0.4, min: 0, max: 2, step: 0.1, suffix: "x" },
      { key: "mouseInteraction", label: "Mouse Interaction", type: "toggle", default: true },
    ],
  },

  "star-field": {
    id: "star-field",
    props: [
      { key: "speed", label: "Speed", type: "range", default: 0.009, min: 0.001, max: 0.02, step: 0.0005 },
    ],
  },

  "neural-net": {
    id: "neural-net",
    props: [
      { key: "hue", label: "Hue", type: "range", default: 200, min: 0, max: 360, step: 1, suffix: "°" },
      { key: "saturation", label: "Saturation", type: "range", default: 0.8, min: 0, max: 1, step: 0.05 },
      { key: "chroma", label: "Chroma (Glow)", type: "range", default: 0.6, min: 0, max: 1, step: 0.05 },
    ],
  },

  "atomic": {
    id: "atomic",
    props: [
      { key: "coreColor1", label: "Core Color 1", type: "color", default: "#ffffff" },
      { key: "coreColor2", label: "Core Color 2", type: "color", default: "#ff8c00" },
      { key: "shellColor1", label: "Shell Color 1", type: "color", default: "#8b00ff" },
      { key: "shellColor2", label: "Shell Color 2", type: "color", default: "#00d0ff" },
      { key: "coreIntensity", label: "Core Intensity", type: "range", default: 1.0, min: 0, max: 3, step: 0.1 },
      { key: "coreSpeed", label: "Core Speed", type: "range", default: 1.0, min: 0, max: 3, step: 0.1 },
      { key: "corePulse", label: "Core Pulse", type: "range", default: 1.0, min: 0, max: 3, step: 0.1 },
      { key: "shellIntensity", label: "Shell Intensity", type: "range", default: 1.0, min: 0, max: 3, step: 0.1 },
      { key: "shellSpeed", label: "Shell Speed", type: "range", default: 1.0, min: 0, max: 3, step: 0.1 },
      { key: "tendrilCount", label: "Tendril Count", type: "range", default: 12, min: 4, max: 20, step: 1 },
      { key: "tendrilIntensity", label: "Tendril Intensity", type: "range", default: 1.0, min: 0, max: 3, step: 0.1 },
      { key: "particleCount", label: "Particle Count", type: "range", default: 80, min: 20, max: 150, step: 10 },
      { key: "particleSpeed", label: "Particle Speed", type: "range", default: 1.0, min: 0, max: 3, step: 0.1 },
      { key: "mistDensity", label: "Mist Density", type: "range", default: 0.3, min: 0, max: 1, step: 0.05 },
      { key: "breathing", label: "Breathing", type: "range", default: 1.0, min: 0, max: 2, step: 0.1 },
      { key: "warp", label: "Warp", type: "range", default: 1.0, min: 0, max: 3, step: 0.1 },
    ],
  },

  "smoke": {
    id: "smoke",
    props: [
      { key: "color", label: "Color", type: "color", default: "#FFD700" },
      { key: "scale", label: "Scale", type: "range", default: 5.0, min: 1, max: 10, step: 0.1 },
      { key: "trailLength", label: "Trail Length", type: "range", default: 60, min: 10, max: 100, step: 5 },
      { key: "inertia", label: "Inertia", type: "range", default: 0.6, min: 0, max: 0.99, step: 0.01 },
      { key: "grainIntensity", label: "Grain", type: "range", default: 0.08, min: 0, max: 0.2, step: 0.005 },
      { key: "bloomStrength", label: "Bloom Strength", type: "range", default: 0.2, min: 0, max: 0.5, step: 0.01 },
      { key: "bloomRadius", label: "Bloom Radius", type: "range", default: 1.2, min: 0.1, max: 3, step: 0.1 },
      { key: "brightness", label: "Brightness", type: "range", default: 3.0, min: 0.5, max: 5, step: 0.1 },
    ],
  },

  "stars-bg": {
    id: "stars-bg",
    props: [
      { key: "starColor", label: "Base Star Color", type: "color", default: "#e0e0ff" },
      { key: "rareStarColor", label: "Rare Star Color", type: "color", default: "#a78bfa" },
      { key: "rareStarChance", label: "Rare Star Chance", type: "range", default: 0.003, min: 0, max: 0.02, step: 0.001, suffix: "%", displayMultiplier: 100 },
      { key: "starDensity", label: "Star Density", type: "range", default: 800, min: 200, max: 2000, step: 100 },
      { key: "twinkleSpeed", label: "Twinkle Speed", type: "range", default: 1.0, min: 0.1, max: 3, step: 0.1, suffix: "x" },
    ],
  },

  "accretion": {
    id: "accretion",
    props: [
      { key: "speed", label: "Speed", type: "range", default: 1.0, min: 0.1, max: 2, step: 0.1 },
      { key: "turbulence", label: "Turbulence", type: "range", default: 1.2, min: 0.5, max: 2, step: 0.1 },
      { key: "depth", label: "Depth", type: "range", default: 1.0, min: 0.5, max: 2, step: 0.1 },
      { key: "brightness", label: "Brightness", type: "range", default: 1.1, min: 0.5, max: 2, step: 0.1 },
      { key: "colorShift", label: "Color Shift", type: "range", default: 1.0, min: 0.5, max: 2, step: 0.1 },
    ],
  },

  "bifrost": {
    id: "bifrost",
    props: [
      { key: "intensity", label: "Intensity", type: "range", default: 1.3, min: 0.5, max: 2.5, step: 0.05 },
      { key: "speed", label: "Speed", type: "range", default: 1.0, min: 0.3, max: 2.5, step: 0.05, suffix: "x" },
      { key: "mouseTilt", label: "Mouse Tilt", type: "toggle", default: true },
    ],
  },

  "dark-veil": {
    id: "dark-veil",
    props: [
      { key: "hueShift", label: "Hue Shift", type: "range", default: 180, min: 0, max: 360, step: 1, suffix: "°" },
      { key: "noiseIntensity", label: "Noise", type: "range", default: 0.08, min: 0, max: 0.2, step: 0.01, suffix: "%", displayMultiplier: 100 },
      { key: "scanlineIntensity", label: "Scanlines", type: "range", default: 0.15, min: 0, max: 1, step: 0.05, suffix: "%", displayMultiplier: 100 },
      { key: "speed", label: "Speed", type: "range", default: 0.5, min: 0, max: 3, step: 0.1, suffix: "x" },
      { key: "scanlineFrequency", label: "Scanline Freq", type: "range", default: 2.5, min: 0.5, max: 5, step: 0.1 },
      { key: "warpAmount", label: "Warp", type: "range", default: 1.2, min: 0, max: 5, step: 0.1 },
    ],
  },

  "vortex": {
    id: "vortex",
    props: [
      { key: "particleCount", label: "Particles", type: "range", default: 1000, min: 300, max: 2000, step: 50 },
      { key: "baseHue", label: "Hue", type: "range", default: 240, min: 0, max: 360, step: 1, suffix: "°" },
    ],
    hardcoded: { rangeY: 120, baseSpeed: 0.0, rangeSpeed: 1.5, baseRadius: 1, rangeRadius: 2.5, backgroundColor: "black" },
  },

  "liquid-ribbons": {
    id: "liquid-ribbons",
    props: [
      { key: "linesGradient", label: "Ribbon Colors", type: "color", default: ["#5227FF", "#FF00CC", "#B19EEF", "#00FFFF"] },
      { key: "animationSpeed", label: "Speed", type: "range", default: 1.0, min: 0, max: 3, step: 0.1, suffix: "x" },
      { key: "bendRadius", label: "Bend Radius", type: "range", default: 8.0, min: 1, max: 20, step: 0.5 },
      { key: "bendStrength", label: "Bend Strength", type: "range", default: -0.8, min: -2, max: 2, step: 0.05 },
      { key: "mouseDamping", label: "Smoothness", type: "range", default: 0.06, min: 0.01, max: 0.2, step: 0.01, suffix: "%", displayMultiplier: 100 },
      { key: "parallax", label: "Parallax Effect", type: "toggle", default: true },
      { key: "parallaxStrength", label: "Parallax Strength", type: "range", default: 0.2, min: 0, max: 1, step: 0.01 },
    ],
    hardcoded: { mixBlendMode: "screen", interactive: true, enabledWaves: ["top", "middle", "bottom"] },
  },

  "gravity-lens": {
    id: "gravity-lens",
    props: [
      { key: "density", label: "Star Density", type: "range", default: 1.8, min: 0.5, max: 3, step: 0.1 },
      { key: "glowIntensity", label: "Glow", type: "range", default: 0.7, min: 0.1, max: 1.5, step: 0.05 },
      { key: "saturation", label: "Saturation", type: "range", default: 0.9, min: 0, max: 1, step: 0.05, suffix: "%", displayMultiplier: 100 },
      { key: "hueShift", label: "Hue Shift", type: "range", default: 240, min: 0, max: 360, step: 1, suffix: "°" },
      { key: "mouseRepulsion", label: "Mouse Repulsion", type: "toggle", default: true },
      { key: "twinkleIntensity", label: "Twinkle", type: "range", default: 0.5, min: 0, max: 1, step: 0.05 },
    ],
    hardcoded: { transparent: true },
  },

  "liquid-ether": {
    id: "liquid-ether",
    props: [
      { key: "colors", label: "Colors", type: "color", default: ["#5227FF", "#FF9FFC", "#B19EEF"] },
      { key: "mouseForce", label: "Force", type: "range", default: 35, min: 10, max: 80, step: 1 },
      { key: "resolution", label: "Clarity", type: "range", default: 0.85, min: 0.4, max: 1.0, step: 0.05, suffix: "%", displayMultiplier: 100 },
      { key: "iterationsPoisson", label: "Flow Sharpness", type: "range", default: 75, min: 30, max: 100, step: 1 },
      { key: "iterationsViscous", label: "Silkiness", type: "range", default: 55, min: 20, max: 80, step: 1 },
      { key: "autoDemo", label: "Auto Demo", type: "toggle", default: true },
    ],
    hardcoded: { cursorSize: 100, isViscous: true, viscous: 30, isBounce: false, autoSpeed: 0.5, autoIntensity: 2.2, autoResumeDelay: 3000, autoRampDuration: 0.6, BFECC: true, dt: 0.016 },
  },

  "singularity": {
    id: "singularity",
    props: [
      { key: "speed", label: "Speed", type: "range", default: 1.0, min: 0.1, max: 3, step: 0.1 },
      { key: "intensity", label: "Intensity", type: "range", default: 1.2, min: 0.5, max: 3, step: 0.1 },
      { key: "size", label: "Size", type: "range", default: 1.1, min: 0.5, max: 2, step: 0.05 },
      { key: "waveStrength", label: "Wave Strength", type: "range", default: 1.0, min: 0.5, max: 2, step: 0.05 },
      { key: "colorShift", label: "Color Shift", type: "range", default: 1.0, min: 0.5, max: 2, step: 0.05 },
    ],
  },

  // ── ANIMATIONS ────────────────────────────────────────

  "lightning": {
    id: "lightning",
    props: [
      { key: "hue", label: "Hue", type: "range", default: 220, min: 0, max: 360, step: 1, suffix: "°" },
      { key: "xOffset", label: "X Offset", type: "range", default: 0, min: -100, max: 100, step: 1 },
      { key: "speed", label: "Speed", type: "range", default: 1, min: 0.1, max: 3, step: 0.1 },
      { key: "intensity", label: "Intensity", type: "range", default: 1, min: 0.5, max: 2, step: 0.1 },
      { key: "size", label: "Size", type: "range", default: 1, min: 0.5, max: 2, step: 0.1 },
    ],
  },

  "matrix-rain": {
    id: "matrix-rain",
    props: [
      { key: "specialWord", label: "Special Word", type: "select", default: "BITCOIN", options: [
        { label: "BITCOIN", value: "BITCOIN" },
        { label: "MJOLNIR", value: "MJOLNIR" },
        { label: "ASGARD", value: "ASGARD" },
        { label: "VALHALLA", value: "VALHALLA" },
      ]},
      { key: "specialHue", label: "Word Hue", type: "range", default: 39, min: 0, max: 360, step: 1, suffix: "°" },
      { key: "wordChance", label: "Word Chance", type: "range", default: 0.001, min: 0.001, max: 0.005, step: 0.0005 },
    ],
  },

  "ripple-grid": {
    id: "ripple-grid",
    props: [
      { key: "enableRainbow", label: "Enable Rainbow", type: "toggle", default: false },
      { key: "gridColor", label: "Grid Color", type: "color", default: "#00ffff" },
      { key: "rippleIntensity", label: "Ripple Intensity", type: "range", default: 0.05, min: 0, max: 0.2, step: 0.001 },
      { key: "gridSize", label: "Grid Size", type: "range", default: 10.0, min: 2, max: 30, step: 0.5 },
      { key: "gridThickness", label: "Grid Thickness", type: "range", default: 15.0, min: 1, max: 50, step: 1 },
      { key: "fadeDistance", label: "Fade Distance", type: "range", default: 1.5, min: 0.5, max: 5, step: 0.1 },
      { key: "vignetteStrength", label: "Vignette", type: "range", default: 2.0, min: 0, max: 10, step: 0.1 },
      { key: "glowIntensity", label: "Glow", type: "range", default: 0.1, min: 0, max: 1, step: 0.01 },
      { key: "opacity", label: "Opacity", type: "range", default: 1.0, min: 0, max: 1, step: 0.01 },
      { key: "gridRotation", label: "Rotation", type: "range", default: 0, min: -180, max: 180, step: 1, suffix: "°" },
      { key: "mouseInteraction", label: "Mouse Interaction", type: "toggle", default: true },
      { key: "mouseInteractionRadius", label: "Mouse Radius", type: "range", default: 0.8, min: 0.1, max: 3, step: 0.05 },
    ],
  },

  "atmosphere": {
    id: "atmosphere",
    props: [
      { key: "color", label: "Glow Color", type: "color", default: "#f59e0b" },
      { key: "density", label: "Density", type: "range", default: 1600, min: 400, max: 3000, step: 100 },
      { key: "speed", label: "Speed", type: "range", default: 1.0, min: 0.3, max: 3, step: 0.1 },
      { key: "size", label: "Particle Size", type: "range", default: 1.8, min: 0.5, max: 3, step: 0.1 },
      { key: "opacity", label: "Opacity", type: "range", default: 0.95, min: 0.3, max: 1, step: 0.05 },
      { key: "opacitySpeed", label: "Pulse Speed", type: "range", default: 2.0, min: 0.5, max: 8, step: 0.5 },
    ],
  },

  "aura-waves": {
    id: "aura-waves",
    props: [
      { key: "colorStops", label: "Color Stops", type: "color", default: ["#ff9ec2", "#a8f0d0", "#4fc3ff"] },
      { key: "amplitude", label: "Amplitude", type: "range", default: 2.25, min: 0.1, max: 3, step: 0.1 },
      { key: "blend", label: "Blend", type: "range", default: 0.5, min: 0.1, max: 1, step: 0.05 },
      { key: "speed", label: "Speed", type: "range", default: 0.5, min: 0, max: 2, step: 0.05 },
    ],
  },

  "light-pillar": {
    id: "light-pillar",
    props: [
      { key: "topColor", label: "Top Color", type: "color", default: "#A0F3B9" },
      { key: "bottomColor", label: "Bottom Color", type: "color", default: "#FFF79E" },
      { key: "intensity", label: "Intensity", type: "range", default: 1.0, min: 0, max: 3, step: 0.05 },
      { key: "rotationSpeed", label: "Rotation Speed", type: "range", default: 0.3, min: 0, max: 2, step: 0.05 },
      { key: "glowAmount", label: "Glow", type: "range", default: 0.005, min: 0.001, max: 0.02, step: 0.001 },
      { key: "pillarWidth", label: "Width", type: "range", default: 3.0, min: 0.5, max: 6, step: 0.1 },
      { key: "pillarHeight", label: "Height", type: "range", default: 0.4, min: 0.1, max: 1, step: 0.05 },
      { key: "noiseIntensity", label: "Noise", type: "range", default: 0.5, min: 0, max: 1, step: 0.05 },
      { key: "pillarRotation", label: "Rotation", type: "range", default: -17, min: -180, max: 180, step: 1, suffix: "°" },
      { key: "interactive", label: "Interactive", type: "toggle", default: false },
    ],
  },

  "black-hole": {
    id: "black-hole",
    props: [
      { key: "speed", label: "Speed", type: "range", default: 1.0, min: 0, max: 3, step: 0.05 },
      { key: "intensity", label: "Intensity", type: "range", default: 1.0, min: 0, max: 3, step: 0.05 },
      { key: "distortion", label: "Distortion", type: "range", default: 1.0, min: 0, max: 2, step: 0.05 },
      { key: "glow", label: "Glow", type: "range", default: 1.0, min: 0, max: 3, step: 0.05 },
      { key: "frequency", label: "Frequency", type: "range", default: 1.4, min: 0.5, max: 3, step: 0.05 },
    ],
  },

  "laser-flow": {
    id: "laser-flow",
    props: [
      { key: "color", label: "Beam Color", type: "color", default: "#9DFB6A" },
      { key: "scale", label: "Beam Scale", type: "range", default: 4.0, min: 1, max: 8, step: 0.1 },
      { key: "horizontalBeamOffset", label: "H-Offset", type: "range", default: 0.2, min: -0.5, max: 0.5, step: 0.01 },
      { key: "verticalBeamOffset", label: "V-Offset", type: "range", default: -0.2, min: -0.5, max: 0.5, step: 0.01 },
      { key: "horizontalSizing", label: "H-Size", type: "range", default: 1.45, min: 0.5, max: 3, step: 0.05 },
      { key: "verticalSizing", label: "V-Size", type: "range", default: 5.5, min: 1, max: 8, step: 0.1 },
      { key: "wispDensity", label: "Wisp Density", type: "range", default: 3.5, min: 0, max: 5, step: 0.1 },
      { key: "wispSpeed", label: "Wisp Speed", type: "range", default: 23, min: 5, max: 50, step: 1 },
      { key: "wispIntensity", label: "Wisp Intensity", type: "range", default: 17, min: 0, max: 25, step: 0.5 },
      { key: "flowSpeed", label: "Flow Speed", type: "range", default: 0.25, min: 0, max: 1, step: 0.05 },
      { key: "flowStrength", label: "Flow Strength", type: "range", default: 0.45, min: 0, max: 1, step: 0.05 },
      { key: "fogIntensity", label: "Fog Intensity", type: "range", default: 0.3, min: 0, max: 1.5, step: 0.05 },
      { key: "fogScale", label: "Fog Scale", type: "range", default: 0.1, min: 0.05, max: 0.5, step: 0.01 },
      { key: "fogFallSpeed", label: "Fog Fall Speed", type: "range", default: 1.85, min: 0, max: 3, step: 0.1 },
      { key: "decay", label: "Decay", type: "range", default: 1.5, min: 0.5, max: 2, step: 0.05 },
      { key: "falloffStart", label: "Falloff Start", type: "range", default: 1.5, min: 1, max: 5, step: 0.1 },
    ],
  },

  "swirling-gas": {
    id: "swirling-gas",
    props: [
      { key: "speed", label: "Speed", type: "range", default: 1.0, min: 0.1, max: 3, step: 0.1 },
      { key: "intensity", label: "Intensity", type: "range", default: 1.2, min: 0.5, max: 2, step: 0.1 },
    ],
  },

  "globe": {
    id: "globe",
    props: [
      { key: "globeColor", label: "Globe Color", type: "color", default: "#1d072e" },
      { key: "atmosphereColor", label: "Atmosphere Color", type: "color", default: "#ffffff" },
      { key: "arcColor", label: "Arc Color", type: "color", default: "#06b6d4" },
      { key: "emissiveIntensity", label: "Emissive", type: "range", default: 0.1, min: 0, max: 1, step: 0.05 },
      { key: "autoRotateSpeed", label: "Rotation Speed", type: "range", default: 0.5, min: 0, max: 3, step: 0.1 },
    ],
  },

  "hyperspeed": {
    id: "hyperspeed",
    props: [
      { key: "preset", label: "Style Preset", type: "select", default: "seven", options: [
        { label: "Classic Turbo", value: "one" },
        { label: "Neon Drift", value: "two" },
        { label: "Cyber Blade", value: "three" },
        { label: "Wide Race", value: "four" },
        { label: "Sunset Rush", value: "five" },
        { label: "Abyss Runner", value: "six" },
        { label: "Bifrost Realm", value: "seven" },
      ]},
    ],
  },

  // ── UI COMPONENTS ─────────────────────────────────────

  "electric-border": {
    id: "electric-border",
    props: [
      { key: "speed", label: "Speed", type: "range", default: 1.0, min: 0.1, max: 3, step: 0.1 },
      { key: "intensity", label: "Intensity", type: "range", default: 1.0, min: 0.1, max: 2, step: 0.1 },
    ],
  },

  "aurora-text": {
    id: "aurora-text",
    props: [
      { key: "text", label: "Text", type: "select", default: "MjolnirUI", options: [
        { label: "MjolnirUI", value: "MjolnirUI" },
        { label: "THOR!", value: "THOR!" },
        { label: "Asgard", value: "Asgard" },
        { label: "Valhalla", value: "Valhalla" },
      ]},
    ],
  },

  "text-reveal": {
    id: "text-reveal",
    props: [
      { key: "text", label: "Text", type: "select", default: "Forged in Valhalla", options: [
        { label: "Forged in Valhalla", value: "Forged in Valhalla" },
        { label: "MjolnirUI Pro", value: "MjolnirUI Pro" },
        { label: "Thunder Reborn", value: "Thunder Reborn" },
      ]},
    ],
  },

  "gradient-text": {
    id: "gradient-text",
    props: [
      { key: "text", label: "Text", type: "select", default: "Component Library", options: [
        { label: "Component Library", value: "Component Library" },
        { label: "MjolnirUI", value: "MjolnirUI" },
        { label: "Asgardian Tech", value: "Asgardian Tech" },
      ]},
    ],
  },

  "shimmer-button": {
    id: "shimmer-button",
    props: [
      { key: "variant", label: "Variant", type: "select", default: "gold", options: [
        { label: "Gold", value: "gold" },
        { label: "Silver", value: "silver" },
        { label: "Bronze", value: "bronze" },
        { label: "Primary", value: "primary" },
        { label: "Emerald", value: "emerald" },
      ]},
      { key: "title", label: "Button Text", type: "select", default: "Get Started", options: [
        { label: "Get Started", value: "Get Started" },
        { label: "Subscribe Now", value: "Subscribe Now" },
        { label: "Upgrade Tier", value: "Upgrade Tier" },
        { label: "Download", value: "Download" },
      ]},
    ],
  },

  "flip-card": {
    id: "flip-card",
    props: [],
  },

  "accordion": {
    id: "accordion",
    props: [],
  },

  // ── 3D ────────────────────────────────────────────────

  "animated-orb": {
    id: "animated-orb",
    props: [],
  },
};

/* ── Helper ──────────────────────────────────────────── */
export function getPropsConfig(componentId: string): ComponentPropsConfig | undefined {
  return COMPONENT_PROPS[componentId];
}
