// app/twitter-image.tsx
// Next.js generates the Twitter / X card image at build time. Re-uses the
// same generator as opengraph-image — the design works at 1200×630 for both
// networks.
//
// IMPORTANT: route segment config exports (runtime, size, contentType) must
// be defined inline as literal exports in this file. Next.js's static
// analyzer can't follow re-exports like `export { runtime } from "..."`
// (build error: "Next.js can't recognize the exported runtime field in
// route. It mustn't be reexported.")
export { default } from "./opengraph-image";

export const runtime = "edge";
export const alt = "MjolnirUI — Premium React Component Library";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
