// app/(protected)/blocks/canvas/backgrounds/page.tsx
// Canvas → Backgrounds (Base tier surface in the sidebar).
// Showcases the "simple" bucket — CSS, canvas, and basic three.js components.
// Anyone can browse; individual components are gated by their requiredTier
// (handled inside BackgroundCard / BackgroundPreviewModal).
"use client";

import { BackgroundGallery } from "@/components/canvas/BackgroundGallery";

export default function BackgroundsPage() {
  return (
    <BackgroundGallery
      bucket="simple"
      title="Backgrounds"
      description="CSS, canvas, and lightweight three.js backgrounds — fast to load, easy to drop into any project. Click a card for a live preview, copy code, or grab the install command."
      toolSlug="canvas-backgrounds"
    />
  );
}
