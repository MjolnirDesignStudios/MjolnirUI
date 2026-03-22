import type { ComponentType } from "react";

// navlinks
export const navItems = [
  { name: "Build", link: "/#build" },
  { name: "Demo", link: "/#demo" },
  { name: "Pricing", link: "/#pricing" },
  { name: "Tech", link: "/#tech" },
];

// ────────────────────────────────────────────────────────────────
// TECH FLIP GRID — types + gradient constants
// ────────────────────────────────────────────────────────────────
export type TechIcon = {
  name: string;
  svgPath?: string;
  /** react-icons component — e.g. SiReact from react-icons/si */
  reactIcon?: ComponentType<{ size?: number; color?: string; className?: string }>;
  /** 2–3 character fallback badge text */
  initials?: string;
};

/**
 * Six Bifrost gradient CSS strings — the full MjolnirUI electric spectrum.
 * Blue, Green, Gold, Orange (4-tier system) + Purple & Red for visual variety.
 */
export const BIFROST_GRADIENTS: string[] = [
  "radial-gradient(ellipse at center, #0a0a0a 15%, #0a3a5c 55%, #0EA5E9 80%, #2563EB 100%)", // Electric Blue
  "radial-gradient(ellipse at center, #0a0a0a 15%, #063a28 55%, #10B981 80%, #16A34A 100%)", // Electric Green
  "radial-gradient(ellipse at center, #0a0a0a 15%, #3d2e00 55%, #EAB308 80%, #D4AF37 100%)", // Electric Gold
  "radial-gradient(ellipse at center, #0a0a0a 15%, #3d1800 55%, #F97316 80%, #EA580C 100%)", // Electric Orange
  "radial-gradient(ellipse at center, #0a0a0a 15%, #2d0a3d 55%, #A855F7 80%, #7C3AED 100%)", // Electric Purple
  "radial-gradient(ellipse at center, #0a0a0a 15%, #3d0a0a 55%, #EF4444 80%, #DC2626 100%)", // Electric Red
];

/** Inward glow color per gradient (start color at 19% opacity). */
export const BIFROST_GLOWS: string[] = [
  "#0EA5E930", // Blue
  "#10B98130", // Green
  "#EAB30830", // Gold
  "#F9731630", // Orange
  "#A855F730", // Purple
  "#EF444430", // Red
];

// ────────────────────────────────────────────────────────────────
// BENTO GRID — item types + data
// ────────────────────────────────────────────────────────────────
export type ContentType =
  | "mjolnir"
  | "galactic"
  | "tech-stack"
  | "lightning"
  | "midgard"
  | "bifrost";

export type GridItem = {
  id: number;
  title: string;
  description: string;
  className: string;
  imgClassName?: string;
  titleClassName: string;
  img?: string;
  direction: "left" | "right";
  contentType: ContentType;
  animation?: {
    intensity?: "low" | "medium" | "high" | "epic";
    gradient?: boolean;
    particles?: boolean;
    confettiOnClick?: boolean;
    glow?: boolean;
    bifrost?: boolean;
  };
};

export const gridItems: GridItem[] = [
  {
    id: 1,
    title: "Electric!",
    description: "Thunderous UI/UX!",
    className: "lg:col-span-3 md:col-span-6 md:row-span-4 lg:min-h-[40vh]",
    titleClassName: "justify-end text-[#A9A9A9]",
    img: "",
    direction: "left",
    contentType: "lightning",
    animation: { intensity: "epic", glow: true },
  },
  {
    id: 2,
    title: "Other Worldly",
    description: "Galactic Power!",
    className: "lg:col-span-2 md:col-span-3 md:row-span-2",
    titleClassName: "justify-start pt-12 pl-10 text-left",
    direction: "right",
    contentType: "galactic",
    animation: { intensity: "medium", particles: true },
  },
  {
    id: 3,
    title: "Asgardian Tech!",
    description: "Verily!",
    className: "lg:col-span-2 md:col-span-3 md:row-span-2",
    titleClassName: "justify-center",
    direction: "right",
    contentType: "tech-stack",
    animation: { intensity: "high" },
  },
  {
    id: 4,
    title: "A Tool to Build...",
    description: "Mighty Designs!",
    className: "lg:col-span-2 md:col-span-3 md:row-span-1",
    titleClassName: "justify-start",
    direction: "left",
    contentType: "mjolnir",
    animation: { intensity: "high" },
  },
  {
    id: 5,
    title: "Premium Innovation",
    description: "For Midgard!",
    className: "md:col-span-3 md:row-span-2 lg:min-h-[50vh]",
    titleClassName: "justify-center md:justify-start lg:justify-center",
    direction: "right",
    contentType: "midgard",
    animation: { intensity: "medium", glow: true },
  },
  {
    id: 6,
    title: "Open the BiFrost!",
    description: "Contact MjolnirUI",
    className: "lg:col-span-2 md:col-span-3 md:row-span-1",
    titleClassName: "justify-center md:max-w-full max-w-60 text-center",
    direction: "left",
    contentType: "bifrost",
    animation: { intensity: "high", bifrost: true, confettiOnClick: true },
  },
];

// footer links
export const footerLinks = {
  Company: [
    { name: "About Us", href: "/#about" },
    { name: "Contact", href: "/contact" },
    { name: "Roadmap", href: "/roadmap" },
  ],
  Designs: [
    { name: "Animations", href: "/#animations" },
    { name: "Components", href: "/#components" },
    { name: "Templates", href: "/#templates" },
  ],
  Products: [
    { name: "Automations", href: "/automations" },
    { name: "MjolnirUI Pro", href: "/#pricing" },
    { name: "OdinAI", href: "/blocks/ai/odinai" },
  ],
  Support: [
    { name: "Documentation", href: "/docs" },
    { name: "Help Center", href: "/help" },
    { name: "FAQ", href: "/faq" },
  ],
  Legal: [
    { name: "Cookie Policy", href: "/legal/cookies" },
    { name: "Privacy Policy", href: "/legal/privacy" },
    { name: "Terms of Service", href: "/legal/terms" },
  ],
};


// social media links
export const socialMedia = [
  { id: 1, img: "/Socials/fb-color.svg", link: "https://facebook.com/mjolnirdesignstudios" },
  { id: 2, img: "/Socials/git-color.svg", link: "https://github.com/mjolnirdesignstudios" },
  { id: 3, img: "/Socials/instagram-color.svg", link: "https://instagram.com/mjolnirdesignstudios" },
  { id: 4, img: "/Socials/tiktok-color.svg", link: "https://tiktok.com/@mjolnirdesignstudios" },
  { id: 5, img: "/Socials/youtube-color.svg", link: "https://youtube.com/@mjolnirdesignstudios" },
  { id: 6, img: "/Socials/x-white.svg", link: "https://x.com/mjolnirdesignsx" },
];