// data/tech-icons.ts
// Client-only — DO NOT import from server components or API routes.
// Separated from data/index.ts to keep the shared data module SSR-safe.
import type { TechIcon } from "@/data/index";

export const techStackIcons: TechIcon[] = [
  // ── Core Web ────────────────────────────────────────────────────────────
  { name: "React",              svgPath: "/Icons/Technologies/react.svg" },
  { name: "Next.js",            svgPath: "/Icons/Technologies/nextjs.svg" },
  { name: "TypeScript",         svgPath: "/Icons/Technologies/typescript.svg" },
  { name: "JavaScript",         svgPath: "/Icons/Technologies/javascript.svg" },
  { name: "HTML5",              svgPath: "/Icons/Technologies/html.svg" },
  { name: "CSS3",               svgPath: "/Icons/Technologies/css.svg" },
  { name: "Tailwind",           svgPath: "/Icons/Technologies/tailwind.svg" },
  // ── Animation / 3D ──────────────────────────────────────────────────────
  { name: "GSAP",               svgPath: "/Icons/Technologies/gsap.svg" },
  { name: "Three.js",           svgPath: "/Icons/Technologies/threejs.svg" },
  { name: "Framer Motion",      svgPath: "/Icons/Technologies/framer-motion.svg" },
  { name: "Blender",            svgPath: "/Icons/Technologies/blender.svg" },
  // ── Backend / Runtime ───────────────────────────────────────────────────
  { name: "Node.js",            svgPath: "/Icons/Technologies/nodejs.svg" },
  { name: "Python",             svgPath: "/Icons/Technologies/python.svg" },
  // ── Data / Infra ────────────────────────────────────────────────────────
  { name: "Supabase",           svgPath: "/Icons/Technologies/supabase.svg" },
  { name: "PostgreSQL",         svgPath: "/Icons/Technologies/postgresql.svg" },
  { name: "Docker",             svgPath: "/Icons/Technologies/docker.svg" },
  { name: "Cloudflare",         svgPath: "/Icons/Technologies/cloudflare.svg" },
  // ── Payments ────────────────────────────────────────────────────────────
  { name: "Stripe",             svgPath: "/Icons/Technologies/stripe.svg" },
  // ── Platform / Hosting ──────────────────────────────────────────────────
  { name: "Vercel",             svgPath: "/Icons/Technologies/vercel.svg" },
  { name: "GitHub",             svgPath: "/Icons/Technologies/github.svg" },
  // ── AI ──────────────────────────────────────────────────────────────────
  { name: "Claude",             svgPath: "/Icons/Technologies/claude.svg" },
  // ── SaaS / Tools ────────────────────────────────────────────────────────
  { name: "Figma",              svgPath: "/Icons/Technologies/figma.svg" },
  { name: "HubSpot",            svgPath: "/Icons/Technologies/hubspot.svg" },
  // ── MjolnirUI Stack ─────────────────────────────────────────────────────
  { name: "Remotion",           svgPath: "/Icons/Technologies/remotion.svg" },
  { name: "Resend",             svgPath: "/Icons/Technologies/resend.svg" },
  { name: "Capacitor",          svgPath: "/Icons/Technologies/capacitor.svg" },
  { name: "Radix UI",           svgPath: "/Icons/Technologies/radix.svg" },
  { name: "Shadcn/ui",          svgPath: "/Icons/Technologies/shadcn.svg" },
  { name: "React Three Fiber",  svgPath: "/Icons/Technologies/r3f.svg" },
  { name: "GLSL/WebGL",         svgPath: "/Icons/Technologies/webgl.svg" },
];
