// app/lib/typeScale.ts
// Modular type scale generator + curated font pair library.
// No external dependencies. SSR-safe.

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
export type ScaleRatio = 1.2 | 1.25 | 1.333 | 1.5 | 1.618;

export type ScaleStep =
  | "xs"
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl";

export interface ScaleResult {
  /** Resolved sizes in px (rounded to 2 decimal places) */
  px: Record<ScaleStep, number>;
  /** Resolved sizes in rem (assuming 16px root) */
  rem: Record<ScaleStep, string>;
}

export interface FontPair {
  id: string;
  /** Friendly name, e.g. "Editorial Tech" */
  name: string;
  /** One-line description of the vibe */
  description: string;
  /** Heading / display font */
  display: {
    name: string;
    /** Google Fonts URL (or empty if system) */
    googleFontsUrl?: string;
    /** font-family CSS value */
    family: string;
    /** Recommended weight for headings */
    weight?: number;
  };
  /** Body font */
  body: {
    name: string;
    googleFontsUrl?: string;
    family: string;
    weight?: number;
  };
  /** Optional mono font */
  mono?: {
    name: string;
    googleFontsUrl?: string;
    family: string;
  };
  /** Mood tags for filtering */
  tags: string[];
}

/* ═══════════════════════════════════════════════════════
   SCALE GENERATOR
   Steps below "base" use negative powers, above use positive.
   Ratio anchors:
     1.2     — Minor third (subtle)
     1.25    — Major third (default in many systems)
     1.333   — Perfect fourth (clear hierarchy)
     1.5     — Perfect fifth (dramatic)
     1.618   — Golden ratio (luxury, editorial)
   ═══════════════════════════════════════════════════════ */

const STEP_OFFSETS: Record<ScaleStep, number> = {
  xs: -2,
  sm: -1,
  base: 0,
  lg: 1,
  xl: 2,
  "2xl": 3,
  "3xl": 4,
  "4xl": 5,
  "5xl": 6,
  "6xl": 7,
};

export function generateScale(ratio: ScaleRatio, basePx: number = 16): ScaleResult {
  const px = {} as Record<ScaleStep, number>;
  const rem = {} as Record<ScaleStep, string>;

  for (const [step, offset] of Object.entries(STEP_OFFSETS) as [ScaleStep, number][]) {
    const sizePx = basePx * Math.pow(ratio, offset);
    px[step] = Math.round(sizePx * 100) / 100;
    rem[step] = `${(px[step] / 16).toFixed(3).replace(/\.?0+$/, "")}rem`;
  }
  return { px, rem };
}

/* ═══════════════════════════════════════════════════════
   CURATED FONT PAIRS
   30 pairs across moods. Mix of Google Fonts + project fonts.
   ═══════════════════════════════════════════════════════ */

const G = (fam: string, weights = "400;500;600;700;900") =>
  `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam)}:wght@${weights}&display=swap`;

export const FONT_PAIRS: FontPair[] = [
  // ── Editorial / Tech ──────────────────────────────────
  {
    id: "satoshi-ubuntu",
    name: "Asgard Default",
    description: "The MjolnirUI brand pair. Geometric display + humanist body.",
    display: { name: "Satoshi", family: "'Satoshi', system-ui, sans-serif", weight: 700 },
    body: { name: "Ubuntu", family: "'Ubuntu', system-ui, sans-serif", weight: 400 },
    mono: { name: "Geist Mono", family: "'Geist Mono', ui-monospace, monospace" },
    tags: ["default", "tech", "geometric", "modern"],
  },
  {
    id: "inter-merriweather",
    name: "Editorial Tech",
    description: "Clean sans heading + literary serif body. SaaS-meets-magazine.",
    display: { name: "Inter", googleFontsUrl: G("Inter"), family: "'Inter', system-ui, sans-serif", weight: 700 },
    body: { name: "Merriweather", googleFontsUrl: G("Merriweather"), family: "'Merriweather', Georgia, serif", weight: 400 },
    tags: ["editorial", "serif", "magazine", "tech"],
  },
  {
    id: "playfair-source",
    name: "Heritage Modern",
    description: "Display serif + grotesque body. Luxury but legible.",
    display: { name: "Playfair Display", googleFontsUrl: G("Playfair+Display"), family: "'Playfair Display', Georgia, serif", weight: 700 },
    body: { name: "Source Sans 3", googleFontsUrl: G("Source+Sans+3"), family: "'Source Sans 3', system-ui, sans-serif", weight: 400 },
    tags: ["luxury", "editorial", "serif"],
  },
  {
    id: "space-grotesk-ibm-plex",
    name: "Quantum Code",
    description: "Geometric grotesque + IBM Plex everywhere. Engineering deck vibe.",
    display: { name: "Space Grotesk", googleFontsUrl: G("Space+Grotesk"), family: "'Space Grotesk', system-ui, sans-serif", weight: 700 },
    body: { name: "IBM Plex Sans", googleFontsUrl: G("IBM+Plex+Sans"), family: "'IBM Plex Sans', system-ui, sans-serif", weight: 400 },
    mono: { name: "IBM Plex Mono", googleFontsUrl: G("IBM+Plex+Mono"), family: "'IBM Plex Mono', ui-monospace, monospace" },
    tags: ["tech", "engineering", "geometric"],
  },
  {
    id: "fraunces-inter",
    name: "Variable Brutalist",
    description: "Variable serif display + neutral sans body.",
    display: { name: "Fraunces", googleFontsUrl: G("Fraunces"), family: "'Fraunces', Georgia, serif", weight: 700 },
    body: { name: "Inter", googleFontsUrl: G("Inter"), family: "'Inter', system-ui, sans-serif", weight: 400 },
    tags: ["editorial", "variable", "modern"],
  },
  {
    id: "bricolage-figtree",
    name: "Playful Authority",
    description: "Variable display + warm humanist body. Friendly but confident.",
    display: { name: "Bricolage Grotesque", googleFontsUrl: G("Bricolage+Grotesque"), family: "'Bricolage Grotesque', system-ui, sans-serif", weight: 700 },
    body: { name: "Figtree", googleFontsUrl: G("Figtree"), family: "'Figtree', system-ui, sans-serif", weight: 400 },
    tags: ["friendly", "modern", "saas"],
  },
  {
    id: "rubik-rubik",
    name: "Bold Rubik",
    description: "All Rubik. Confident, slightly playful, retains seriousness at small sizes.",
    display: { name: "Rubik", googleFontsUrl: G("Rubik"), family: "'Rubik', system-ui, sans-serif", weight: 700 },
    body: { name: "Rubik", family: "'Rubik', system-ui, sans-serif", weight: 400 },
    tags: ["bold", "saas", "single-family"],
  },
  {
    id: "syne-manrope",
    name: "Future Authority",
    description: "Geometric display with surprise + modern grotesque body.",
    display: { name: "Syne", googleFontsUrl: G("Syne"), family: "'Syne', system-ui, sans-serif", weight: 700 },
    body: { name: "Manrope", googleFontsUrl: G("Manrope"), family: "'Manrope', system-ui, sans-serif", weight: 400 },
    tags: ["futuristic", "tech", "modern"],
  },
  {
    id: "dm-serif-dm-sans",
    name: "DM Pair",
    description: "DM Serif Display + DM Sans. Editorial product launch energy.",
    display: { name: "DM Serif Display", googleFontsUrl: G("DM+Serif+Display"), family: "'DM Serif Display', Georgia, serif", weight: 400 },
    body: { name: "DM Sans", googleFontsUrl: G("DM+Sans"), family: "'DM Sans', system-ui, sans-serif", weight: 400 },
    tags: ["editorial", "launch", "serif"],
  },
  {
    id: "anton-roboto",
    name: "Poster Punch",
    description: "Condensed display headline + neutral grotesque. Magazine cover energy.",
    display: { name: "Anton", googleFontsUrl: G("Anton", "400"), family: "'Anton', system-ui, sans-serif", weight: 400 },
    body: { name: "Roboto", googleFontsUrl: G("Roboto"), family: "'Roboto', system-ui, sans-serif", weight: 400 },
    tags: ["bold", "poster", "editorial"],
  },
  // ── Tech / SaaS ───────────────────────────────────────
  {
    id: "geist-geist",
    name: "Vercel Default",
    description: "All Geist — the Vercel design system pair.",
    display: { name: "Geist", googleFontsUrl: G("Geist"), family: "'Geist', system-ui, sans-serif", weight: 700 },
    body: { name: "Geist", family: "'Geist', system-ui, sans-serif", weight: 400 },
    mono: { name: "Geist Mono", googleFontsUrl: G("Geist+Mono"), family: "'Geist Mono', ui-monospace, monospace" },
    tags: ["tech", "saas", "vercel"],
  },
  {
    id: "general-sans-instrument",
    name: "Instrument Pair",
    description: "Modern grotesque + serif italic accents.",
    display: { name: "General Sans", family: "'General Sans', system-ui, sans-serif", weight: 700 },
    body: { name: "Instrument Serif", googleFontsUrl: G("Instrument+Serif", "400"), family: "'Instrument Serif', Georgia, serif", weight: 400 },
    tags: ["editorial", "modern"],
  },
  {
    id: "host-grotesk-newsreader",
    name: "Host Pair",
    description: "Host Grotesk + Newsreader. Editorial with technical precision.",
    display: { name: "Host Grotesk", googleFontsUrl: G("Host+Grotesk"), family: "'Host Grotesk', system-ui, sans-serif", weight: 700 },
    body: { name: "Newsreader", googleFontsUrl: G("Newsreader"), family: "'Newsreader', Georgia, serif", weight: 400 },
    tags: ["editorial", "technical"],
  },
  {
    id: "outfit-outfit",
    name: "Outfit",
    description: "Outfit-only. Sleek tech-product feel.",
    display: { name: "Outfit", googleFontsUrl: G("Outfit"), family: "'Outfit', system-ui, sans-serif", weight: 700 },
    body: { name: "Outfit", family: "'Outfit', system-ui, sans-serif", weight: 400 },
    tags: ["tech", "saas", "single-family"],
  },
  {
    id: "lexend-lexend",
    name: "Accessible Lexend",
    description: "Lexend — designed to maximize reading proficiency.",
    display: { name: "Lexend", googleFontsUrl: G("Lexend"), family: "'Lexend', system-ui, sans-serif", weight: 700 },
    body: { name: "Lexend", family: "'Lexend', system-ui, sans-serif", weight: 400 },
    tags: ["accessible", "single-family", "saas"],
  },
  // ── Friendly / Playful ────────────────────────────────
  {
    id: "fraunces-figtree",
    name: "Studio Friendly",
    description: "Variable serif + warm humanist sans. Approachable studio brand.",
    display: { name: "Fraunces", googleFontsUrl: G("Fraunces"), family: "'Fraunces', Georgia, serif", weight: 700 },
    body: { name: "Figtree", googleFontsUrl: G("Figtree"), family: "'Figtree', system-ui, sans-serif", weight: 400 },
    tags: ["friendly", "studio", "warm"],
  },
  {
    id: "sora-be-vietnam",
    name: "Sora Vietnam",
    description: "Geometric Sora + warm Be Vietnam Pro. Soft but precise.",
    display: { name: "Sora", googleFontsUrl: G("Sora"), family: "'Sora', system-ui, sans-serif", weight: 700 },
    body: { name: "Be Vietnam Pro", googleFontsUrl: G("Be+Vietnam+Pro"), family: "'Be Vietnam Pro', system-ui, sans-serif", weight: 400 },
    tags: ["friendly", "modern", "geometric"],
  },
  {
    id: "caveat-quicksand",
    name: "Hand-Drawn Friendly",
    description: "Casual handwritten display + rounded sans body.",
    display: { name: "Caveat", googleFontsUrl: G("Caveat", "700"), family: "'Caveat', cursive", weight: 700 },
    body: { name: "Quicksand", googleFontsUrl: G("Quicksand"), family: "'Quicksand', system-ui, sans-serif", weight: 400 },
    tags: ["playful", "casual", "friendly"],
  },
  // ── Brutalist / Bold ──────────────────────────────────
  {
    id: "archivo-archivo",
    name: "Archivo Brutalist",
    description: "Variable Archivo across the system. Strong, confident, geometric.",
    display: { name: "Archivo", googleFontsUrl: G("Archivo"), family: "'Archivo', system-ui, sans-serif", weight: 900 },
    body: { name: "Archivo", family: "'Archivo', system-ui, sans-serif", weight: 400 },
    tags: ["brutalist", "bold", "geometric"],
  },
  {
    id: "unbounded-inter",
    name: "Unbounded",
    description: "Unbounded display (variable) + Inter body. Y2K + minimalism.",
    display: { name: "Unbounded", googleFontsUrl: G("Unbounded"), family: "'Unbounded', system-ui, sans-serif", weight: 700 },
    body: { name: "Inter", googleFontsUrl: G("Inter"), family: "'Inter', system-ui, sans-serif", weight: 400 },
    tags: ["modern", "y2k", "futuristic"],
  },
  {
    id: "big-shoulders-inter",
    name: "Stadium Inline",
    description: "Big Shoulders condensed + Inter. Sports / poster / event.",
    display: { name: "Big Shoulders Display", googleFontsUrl: G("Big+Shoulders+Display"), family: "'Big Shoulders Display', system-ui, sans-serif", weight: 800 },
    body: { name: "Inter", googleFontsUrl: G("Inter"), family: "'Inter', system-ui, sans-serif", weight: 400 },
    tags: ["bold", "poster", "event"],
  },
  // ── Classic / Authoritative ───────────────────────────
  {
    id: "libre-bodoni-libre-franklin",
    name: "Bodoni Authority",
    description: "Libre Bodoni + Libre Franklin. Newspaper masthead authority.",
    display: { name: "Libre Bodoni", googleFontsUrl: G("Libre+Bodoni"), family: "'Libre Bodoni', Georgia, serif", weight: 700 },
    body: { name: "Libre Franklin", googleFontsUrl: G("Libre+Franklin"), family: "'Libre Franklin', system-ui, sans-serif", weight: 400 },
    tags: ["authoritative", "newspaper", "serif"],
  },
  {
    id: "cormorant-lato",
    name: "Cormorant Lato",
    description: "Display serif + workhorse sans. Wedding / luxury / book.",
    display: { name: "Cormorant Garamond", googleFontsUrl: G("Cormorant+Garamond"), family: "'Cormorant Garamond', Georgia, serif", weight: 700 },
    body: { name: "Lato", googleFontsUrl: G("Lato"), family: "'Lato', system-ui, sans-serif", weight: 400 },
    tags: ["luxury", "elegant", "serif"],
  },
  {
    id: "lora-nunito",
    name: "Lora Nunito",
    description: "Soft serif + rounded sans. Friendly but credible.",
    display: { name: "Lora", googleFontsUrl: G("Lora"), family: "'Lora', Georgia, serif", weight: 700 },
    body: { name: "Nunito", googleFontsUrl: G("Nunito"), family: "'Nunito', system-ui, sans-serif", weight: 400 },
    tags: ["friendly", "credible", "serif"],
  },
  // ── Mono-leaning / Code ───────────────────────────────
  {
    id: "jetbrains-mono-inter",
    name: "Devtools Pair",
    description: "JetBrains Mono headline + Inter body. Developer-tool brand.",
    display: { name: "JetBrains Mono", googleFontsUrl: G("JetBrains+Mono"), family: "'JetBrains Mono', ui-monospace, monospace", weight: 700 },
    body: { name: "Inter", googleFontsUrl: G("Inter"), family: "'Inter', system-ui, sans-serif", weight: 400 },
    mono: { name: "JetBrains Mono", family: "'JetBrains Mono', ui-monospace, monospace" },
    tags: ["devtools", "tech", "code"],
  },
  {
    id: "fragment-mono-pp-mori",
    name: "Studio Mono",
    description: "Fragment Mono display + neo-grotesque. Indie studio.",
    display: { name: "Fragment Mono", googleFontsUrl: G("Fragment+Mono", "400"), family: "'Fragment Mono', ui-monospace, monospace", weight: 400 },
    body: { name: "Manrope", googleFontsUrl: G("Manrope"), family: "'Manrope', system-ui, sans-serif", weight: 400 },
    tags: ["studio", "modern", "code"],
  },
  // ── Quirky / Distinctive ──────────────────────────────
  {
    id: "nabla-inter",
    name: "Nabla Future",
    description: "Variable color font Nabla + Inter. Web-only display moment.",
    display: { name: "Nabla", googleFontsUrl: G("Nabla", "400"), family: "'Nabla', system-ui, sans-serif", weight: 400 },
    body: { name: "Inter", googleFontsUrl: G("Inter"), family: "'Inter', system-ui, sans-serif", weight: 400 },
    tags: ["futuristic", "experimental", "color"],
  },
  {
    id: "vt323-inter",
    name: "Terminal Retro",
    description: "VT323 pixel headline + Inter body. Retro tech.",
    display: { name: "VT323", googleFontsUrl: G("VT323", "400"), family: "'VT323', ui-monospace, monospace", weight: 400 },
    body: { name: "Inter", googleFontsUrl: G("Inter"), family: "'Inter', system-ui, sans-serif", weight: 400 },
    tags: ["retro", "pixel", "tech"],
  },
  {
    id: "abril-fatface-poppins",
    name: "Abril Fatface",
    description: "Display serif weight + Poppins body. Confident magazine cover.",
    display: { name: "Abril Fatface", googleFontsUrl: G("Abril+Fatface", "400"), family: "'Abril Fatface', Georgia, serif", weight: 400 },
    body: { name: "Poppins", googleFontsUrl: G("Poppins"), family: "'Poppins', system-ui, sans-serif", weight: 400 },
    tags: ["bold", "magazine", "serif"],
  },
  {
    id: "monoton-inter",
    name: "Monoton Marquee",
    description: "Monoton outline display + Inter. Marquee / arcade.",
    display: { name: "Monoton", googleFontsUrl: G("Monoton", "400"), family: "'Monoton', system-ui, sans-serif", weight: 400 },
    body: { name: "Inter", googleFontsUrl: G("Inter"), family: "'Inter', system-ui, sans-serif", weight: 400 },
    tags: ["retro", "arcade", "bold"],
  },
];

/** Filter pairs by a tag string */
export function getPairsByTag(tag: string): FontPair[] {
  return FONT_PAIRS.filter((p) => p.tags.includes(tag));
}

/** All distinct tags across the library */
export function getAllTags(): string[] {
  const all = new Set<string>();
  FONT_PAIRS.forEach((p) => p.tags.forEach((t) => all.add(t)));
  return Array.from(all).sort();
}
