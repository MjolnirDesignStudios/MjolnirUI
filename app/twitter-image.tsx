// app/twitter-image.tsx
// Next.js generates the Twitter / X card image at build time. Re-exports the
// OG image since the design works at 1200×630 for both networks.
export { default, runtime, size, contentType } from "./opengraph-image";
export const alt = "MjolnirUI — Premium React Component Library";
