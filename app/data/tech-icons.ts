// data/tech-icons.ts
// Client-only — DO NOT import from server components or API routes.
// Separated from data/index.ts to keep the shared data module SSR-safe.
import type { TechIcon } from "@/data/index";

export const techStackIcons: TechIcon[] = [
  // ── Core Web ────────────────────────────────────────────────────────────
  { name: "React",              svgPath: "/SVGs/react.svg" },
  { name: "TypeScript",         svgPath: "/SVGs/typescript.svg" },
  { name: "JavaScript",         svgPath: "/SVGs/javascript.svg" },
  { name: "HTML5",              svgPath: "/SVGs/html.svg" },
  { name: "CSS3",               svgPath: "/SVGs/css.svg" },
  { name: "Tailwind",           svgPath: "/SVGs/tail.svg" },
  // ── Animation / 3D ──────────────────────────────────────────────────────
  { name: "GSAP",               svgPath: "/SVGs/gsap.svg" },
  { name: "Framer Motion",      svgPath: "/SVGs/fm.svg" },
  { name: "Blender",            svgPath: "/SVGs/blend.svg" },
  // ── Backend / Runtime ───────────────────────────────────────────────────
  { name: "Node.js",            svgPath: "/SVGs/nodejs.svg" },
  { name: "Python",             svgPath: "/SVGs/python.svg" },
  // ── Data / Infra ────────────────────────────────────────────────────────
  { name: "Supabase",           svgPath: "/SVGs/supabase.svg" },
  { name: "Docker",             svgPath: "/SVGs/docker.svg" },
  { name: "Cloudflare",         svgPath: "/SVGs/cloudflare.svg" },
  // ── Platform / Hosting ──────────────────────────────────────────────────
  { name: "GitHub",             svgPath: "/SVGs/host.svg" },
  // ── AI ──────────────────────────────────────────────────────────────────
  { name: "Claude",             svgPath: "/SVGs/claude.svg" },
  // ── SaaS / Tools ────────────────────────────────────────────────────────
  { name: "Figma",              svgPath: "/SVGs/figma.svg" },
  { name: "HubSpot",            svgPath: "/SVGs/hubspot.svg" },
];
