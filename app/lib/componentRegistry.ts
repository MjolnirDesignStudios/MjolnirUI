// app/lib/componentRegistry.ts
// MjolnirUI Component Registry — single source of truth for all browseable components
// Powers the React Bits-style component browser at /blocks/browse

import type { TierName } from "./tierConfig";

export type ComponentCategory =
  | "backgrounds"
  | "animations"
  | "ui"
  | "3d";

export type ComponentTech =
  | "css"
  | "canvas"
  | "three"
  | "ogl"
  | "glsl"
  | "framer-motion"
  | "gsap"
  | "r3f"
  | "tsparticles"
  | "postprocessing";

export interface ComponentMeta {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  requiredTier: TierName;
  tech: ComponentTech[];
  importPath: string;
  hasCSS: boolean;
  isNew?: boolean;
  isPopular?: boolean;
}

/* ═══════════════════════════════════════════════════════
   COMPONENT REGISTRY — 53 Components
     · 1 3D
     · 11 animations
     · 16 backgrounds
     · 25 UI (text effects, buttons, cards, badges, loaders, stats,
            forms, modals)
   ═══════════════════════════════════════════════════════ */
export const COMPONENT_REGISTRY: ComponentMeta[] = [
  // ── 3D (1) ──────────────────────────────────────────
  { id: "animated-orb", name: "Animated Orb", description: "React Three Fiber 3D orb with particles and orbit controls", category: "3d", requiredTier: "base", tech: ["r3f"], importPath: "@/components/ui/AnimatedOrb", hasCSS: false },

  // ── ANIMATIONS (12) — A-Z ─────────────────────────────
  { id: "atmosphere", name: "Atmosphere", description: "Atmospheric particle cloud with tsparticles engine", category: "animations", requiredTier: "base", tech: ["tsparticles"], importPath: "@/components/mjolnirui/animations/atmosphere/Atmosphere", hasCSS: false },
  { id: "aura-waves", name: "Aura Waves", description: "Ethereal aura energy waves with OGL shader rendering", category: "animations", requiredTier: "base", tech: ["ogl", "glsl"], importPath: "@/components/mjolnirui/animations/aurora/AuraWaves", hasCSS: true, isNew: true },
  { id: "black-hole", name: "Black Hole", description: "Warping black hole with simplex noise accretion glow", category: "animations", requiredTier: "pro", tech: ["ogl", "glsl"], importPath: "@/components/mjolnirui/animations/black-hole/BlackHole", hasCSS: false, isPopular: true },
  { id: "globe", name: "Interactive Globe", description: "3D Earth with country borders, arcs, and glow atmosphere", category: "animations", requiredTier: "pro", tech: ["r3f", "three"], importPath: "@/components/mjolnirui/animations/globe/Globe", hasCSS: false, isPopular: true },
  { id: "hyperspeed", name: "Hyperspeed", description: "Warp drive highway with bloom, car lights, and speed lines", category: "animations", requiredTier: "elite", tech: ["three", "postprocessing"], importPath: "@/components/mjolnirui/animations/hyperspeed/Hyperspeed", hasCSS: true, isPopular: true },
  { id: "laser-flow", name: "Laser Flow", description: "Flowing laser beams with Three.js line geometry", category: "animations", requiredTier: "pro", tech: ["three"], importPath: "@/components/mjolnirui/animations/laser-flow/LaserFlow", hasCSS: true, isNew: true },
  { id: "light-pillar", name: "Light Pillar", description: "Vertical light beam pillars with atmospheric scattering", category: "animations", requiredTier: "base", tech: ["three"], importPath: "@/components/mjolnirui/animations/light-pillar/LightPillar", hasCSS: true },
  { id: "lightning", name: "Lightning", description: "WebGL lightning bolts with branching fractal arcs", category: "animations", requiredTier: "free", tech: ["glsl"], importPath: "@/components/mjolnirui/animations/lightning/Lightning", hasCSS: true, isPopular: true },
  { id: "matrix-rain", name: "Matrix Rain", description: "Digital rain with Japanese characters and green glow", category: "animations", requiredTier: "free", tech: ["canvas"], importPath: "@/components/mjolnirui/animations/matrix-rain/MatrixRain", hasCSS: true },
  { id: "ripple-grid", name: "Ripple Grid", description: "Interactive dot grid with ripple wave propagation", category: "animations", requiredTier: "free", tech: ["ogl"], importPath: "@/components/mjolnirui/animations/ripple-grid/RippleGrid", hasCSS: true },
  { id: "swirling-gas", name: "Swirling Gas", description: "Nebular gas clouds with Three.js volumetric rendering", category: "animations", requiredTier: "pro", tech: ["three"], importPath: "@/components/mjolnirui/animations/swirling-gas/SwirlingGas", hasCSS: false },

  // ── BACKGROUNDS (16) — A-Z ────────────────────────────
  { id: "accretion", name: "Accretion Disk", description: "Black hole accretion disk with GLSL ray marching", category: "backgrounds", requiredTier: "pro", tech: ["three", "glsl"], importPath: "@/components/mjolnirui/backgrounds/accretion/Accretion", hasCSS: false, isPopular: true },
  { id: "atomic", name: "Atomic", description: "Orbiting atomic particles with electron trail effects", category: "backgrounds", requiredTier: "base", tech: ["three"], importPath: "@/components/mjolnirui/backgrounds/atomic/Atomic", hasCSS: false },
  { id: "bifrost", name: "Bifrost Bridge", description: "The Rainbow Bridge of Asgard — full GLSL shader with ROYGBIV beams", category: "backgrounds", requiredTier: "pro", tech: ["three", "glsl"], importPath: "@/components/mjolnirui/backgrounds/bifrost/BiFrost", hasCSS: true, isPopular: true },
  { id: "color-halo", name: "Color Halo", description: "Radiant color halo with animated glow transitions", category: "backgrounds", requiredTier: "free", tech: ["css"], importPath: "@/components/mjolnirui/backgrounds/color-halo/ColorHalo", hasCSS: true },
  { id: "dark-veil", name: "Dark Veil", description: "Mysterious dark fog with OGL shader displacement", category: "backgrounds", requiredTier: "pro", tech: ["ogl", "glsl"], importPath: "@/components/mjolnirui/backgrounds/dark-veil/DarkVeil", hasCSS: false },
  { id: "gravity-lens", name: "Gravity Lens", description: "Gravitational lensing distortion with light bending", category: "backgrounds", requiredTier: "elite", tech: ["ogl", "glsl"], importPath: "@/components/mjolnirui/backgrounds/gravity-lens/GravityLens", hasCSS: true, isNew: true },
  { id: "liquid-ether", name: "Liquid Ether", description: "GPU-accelerated fluid simulation with mouse interaction", category: "backgrounds", requiredTier: "elite", tech: ["three", "glsl"], importPath: "@/components/mjolnirui/backgrounds/liquid-ether/LiquidEther", hasCSS: true, isPopular: true },
  { id: "liquid-ribbons", name: "Liquid Ribbons", description: "Flowing ribbon streams with fluid dynamics", category: "backgrounds", requiredTier: "pro", tech: ["three"], importPath: "@/components/mjolnirui/backgrounds/liquid-ribbons/LiquidRibbons", hasCSS: true, isNew: true },
  { id: "neural-net", name: "Neural Network", description: "Connected node graph with pulsing data flow animation", category: "backgrounds", requiredTier: "base", tech: ["canvas"], importPath: "@/components/mjolnirui/backgrounds/neural/NeuralNet", hasCSS: false, isPopular: true },
  { id: "prism", name: "Prism", description: "Light-splitting prism effect with rainbow dispersion", category: "backgrounds", requiredTier: "free", tech: ["css"], importPath: "@/components/mjolnirui/backgrounds/prism/Prism", hasCSS: true },
  { id: "silky-lines", name: "Silky Lines", description: "Smooth flowing silk threads with organic motion", category: "backgrounds", requiredTier: "free", tech: ["canvas"], importPath: "@/components/mjolnirui/backgrounds/silky-lines/SilkyLines", hasCSS: false },
  { id: "singularity", name: "Singularity", description: "Collapsing singularity with gravitational distortion", category: "backgrounds", requiredTier: "elite", tech: ["three"], importPath: "@/components/mjolnirui/backgrounds/singularity/Singularity", hasCSS: false, isNew: true },
  { id: "smoke", name: "Smoke", description: "Volumetric smoke plumes with turbulence simulation", category: "backgrounds", requiredTier: "base", tech: ["three"], importPath: "@/components/mjolnirui/backgrounds/smoke/Smoke", hasCSS: true },
  { id: "star-field", name: "Star Field", description: "Parallax star field with twinkling depth layers", category: "backgrounds", requiredTier: "free", tech: ["canvas"], importPath: "@/components/mjolnirui/backgrounds/star-field/StarField", hasCSS: false },
  { id: "stars-bg", name: "Stars Background", description: "Three.js starfield with camera depth and parallax", category: "backgrounds", requiredTier: "base", tech: ["three"], importPath: "@/components/mjolnirui/backgrounds/stars/StarsBackground", hasCSS: false },
  { id: "vortex", name: "Vortex", description: "Spiraling vortex with particle acceleration", category: "backgrounds", requiredTier: "pro", tech: ["three"], importPath: "@/components/mjolnirui/backgrounds/vortex/Vortex", hasCSS: false, isNew: true },

  // ── UI COMPONENTS (21) — A-Z ──────────────────────────
  { id: "accordion", name: "Accordion", description: "Expandable accordion sections with smooth transitions", category: "ui", requiredTier: "free", tech: ["css"], importPath: "@/components/mjolnirui/accordion/Accordion", hasCSS: false },
  { id: "aurora-text", name: "Aurora Text", description: "Animated gradient text with flowing aurora colors", category: "ui", requiredTier: "free", tech: ["css", "framer-motion"], importPath: "@/components/ui/AuroraText", hasCSS: false },
  { id: "badge", name: "Badge", description: "Pill badge with 13 brand variants — status, tier, and Mjolnir-themed", category: "ui", requiredTier: "free", tech: ["css"], importPath: "@/components/ui/Badge", hasCSS: false, isNew: true, isPopular: true },
  { id: "colorful-text", name: "Colorful Text", description: "Multi-hue animated text with smooth color cycling", category: "ui", requiredTier: "free", tech: ["framer-motion"], importPath: "@/components/ui/TextEffects/ColorfulText", hasCSS: false, isNew: true },
  { id: "count-up", name: "Count Up", description: "Animated number counter with elastic easing and intersection trigger", category: "ui", requiredTier: "free", tech: ["framer-motion"], importPath: "@/components/ui/CountUp", hasCSS: false, isNew: true },
  { id: "decrypt-text", name: "Decrypt Text", description: "Matrix-style scramble-to-reveal text decode animation", category: "ui", requiredTier: "free", tech: ["framer-motion"], importPath: "@/components/ui/DecryptText", hasCSS: false, isNew: true },
  { id: "electric-border", name: "Electric Border", description: "Canvas perlin noise animated border with hover states", category: "ui", requiredTier: "free", tech: ["canvas"], importPath: "@/components/ui/ElectricBorder", hasCSS: false, isPopular: true },
  { id: "flip-card", name: "Flip Card", description: "3D flip card with lightning strike overlay effect", category: "ui", requiredTier: "free", tech: ["css"], importPath: "@/components/ui/Cards/FlipCard", hasCSS: false },
  { id: "glass-card", name: "Glass Card", description: "Frosted glass card with mouse-tracking glow and 5 brand variants", category: "ui", requiredTier: "free", tech: ["framer-motion"], importPath: "@/components/ui/GlassCard", hasCSS: false, isNew: true, isPopular: true },
  { id: "glitch-text", name: "Glitch Text", description: "Norse electric glitch distortion with hover and interval triggers", category: "ui", requiredTier: "free", tech: ["css"], importPath: "@/components/ui/GlitchText", hasCSS: false, isNew: true },
  { id: "glowing-effect", name: "Glowing Effect", description: "Soft animated glow halo wrapper for any content", category: "ui", requiredTier: "free", tech: ["framer-motion"], importPath: "@/components/ui/Animations/GlowingEffect", hasCSS: false, isNew: true },
  { id: "gradient-text", name: "Gradient Text", description: "Animated gradient text with yoyo and directional flow", category: "ui", requiredTier: "free", tech: ["framer-motion"], importPath: "@/components/ui/GradientText", hasCSS: false },
  { id: "lightning-effect", name: "Lightning Effect", description: "Branching lightning bolt overlay for buttons, cards, and emphasis", category: "ui", requiredTier: "free", tech: ["framer-motion"], importPath: "@/components/ui/Animations/LightningEffect", hasCSS: false, isNew: true },
  { id: "mjolnir-button", name: "Mjolnir Button", description: "Premium branded button with 5 variants (storm, thunder, bifrost, void, forge) and lightning-strike click effect", category: "ui", requiredTier: "free", tech: ["framer-motion"], importPath: "@/components/ui/MjolnirButton", hasCSS: false, isNew: true, isPopular: true },
  { id: "mjolnir-input", name: "Mjolnir Input", description: "Branded text input + textarea with label / helper / error states and 4 variant accents", category: "ui", requiredTier: "free", tech: ["css"], importPath: "@/components/ui/MjolnirForm", hasCSS: false, isNew: true },
  { id: "mjolnir-modal", name: "Mjolnir Modal", description: "Branded dialog with backdrop blur, spring entrance, ESC + scroll-lock, and 5 accent variants", category: "ui", requiredTier: "base", tech: ["framer-motion"], importPath: "@/components/ui/MjolnirModal", hasCSS: false, isNew: true },
  { id: "mjolnir-select", name: "Mjolnir Select", description: "Branded dropdown select with custom chevron, label / helper / error states", category: "ui", requiredTier: "base", tech: ["css"], importPath: "@/components/ui/MjolnirForm", hasCSS: false, isNew: true },
  { id: "neon-glow-text", name: "Neon Glow Text", description: "Cyberpunk neon-tube text with electric glow and color variants", category: "ui", requiredTier: "free", tech: ["css"], importPath: "@/components/ui/NeonGlowText", hasCSS: false, isNew: true },
  { id: "rune-loader", name: "Rune Loader", description: "Norse Elder Futhark rune spinner — 9 runes, 6 colors, 4 sizes", category: "ui", requiredTier: "free", tech: ["framer-motion"], importPath: "@/components/ui/RuneLoader", hasCSS: false, isNew: true },
  { id: "shimmer-button", name: "Shimmer Button", description: "Premium shimmer gradient buttons in gold, silver, bronze variants", category: "ui", requiredTier: "free", tech: ["css"], importPath: "@/components/Buttons/ShimmerButton", hasCSS: false, isPopular: true },
  { id: "stat-card", name: "Stat Card", description: "KPI display with label, value, delta indicator, and 5 accent variants", category: "ui", requiredTier: "free", tech: ["framer-motion"], importPath: "@/components/ui/StatCard", hasCSS: false, isNew: true },
  { id: "shiny-text", name: "Shiny Text", description: "Lustrous text with travelling specular highlight", category: "ui", requiredTier: "free", tech: ["css"], importPath: "@/components/ui/ShinyText", hasCSS: false, isNew: true },
  { id: "text-reveal", name: "Text Reveal", description: "Character-by-character text reveal with blur effects", category: "ui", requiredTier: "free", tech: ["framer-motion"], importPath: "@/components/ui/TextReveal", hasCSS: false },
  { id: "typewriter-text", name: "Typewriter Text", description: "Character-by-character typing with blinking cursor and string cycling", category: "ui", requiredTier: "free", tech: ["framer-motion"], importPath: "@/components/ui/TypewriterText", hasCSS: false, isNew: true },
  { id: "wave-text", name: "Wave Text", description: "Wavy text with per-character sinusoidal motion", category: "ui", requiredTier: "free", tech: ["framer-motion"], importPath: "@/components/ui/WaveText", hasCSS: false, isNew: true },
];

/* ── Helpers ─────────────────────────────────────────── */
export function getByCategory(category: ComponentCategory): ComponentMeta[] {
  return COMPONENT_REGISTRY.filter(c => c.category === category);
}
export function getComponentById(id: string): ComponentMeta | undefined {
  return COMPONENT_REGISTRY.find(c => c.id === id);
}
export function getCategories(): ComponentCategory[] {
  return [...new Set(COMPONENT_REGISTRY.map(c => c.category))];
}
export const TOTAL_COMPONENTS = COMPONENT_REGISTRY.length;
