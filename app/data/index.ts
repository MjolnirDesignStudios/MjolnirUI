import type { ComponentType } from "react";

// navlinks
export const navItems = [
  { name: "About", link: "/#about" },
  { name: "Blocks", link: "/#blocks" },
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
 * Four Bifrost gradient CSS strings — Electric Blue, Green, Gold, Orange.
 * Mapped to the MjolnirUI 4-tier color system (Free/Base/Pro/Elite).
 * Purple and Red removed from the MDS 6-color version.
 */
export const BIFROST_GRADIENTS: string[] = [
  "radial-gradient(ellipse at center, #0a0a0a 15%, #0a3a5c 55%, #0EA5E9 80%, #2563EB 100%)", // Electric Blue
  "radial-gradient(ellipse at center, #0a0a0a 15%, #063a28 55%, #10B981 80%, #16A34A 100%)", // Electric Green
  "radial-gradient(ellipse at center, #0a0a0a 15%, #3d2e00 55%, #EAB308 80%, #D4AF37 100%)", // Electric Gold
  "radial-gradient(ellipse at center, #0a0a0a 15%, #3d1800 55%, #F97316 80%, #EA580C 100%)", // Electric Orange
];

/** Inward glow color per gradient (start color at 19% opacity). */
export const BIFROST_GLOWS: string[] = [
  "#0EA5E930", // Blue
  "#10B98130", // Green
  "#EAB30830", // Gold
  "#F9731630", // Orange
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
    { name: "Agentic AI", href: "/agent" },
    { name: "Automations", href: "/automations" },
    { name: "MjolnirUI Pro", href: "/pricing" },
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