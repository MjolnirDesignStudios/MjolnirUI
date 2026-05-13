// app/(protected)/blocks/canvas/shaders/page.tsx
// Canvas → Shader Backgrounds (Pro tier surface in the sidebar).
// Showcases the "shader" bucket — GLSL / OGL / postprocessing components.
// Sidebar gates Pro+ for the LINK; once on the page, individual components
// are further gated by their own requiredTier.
"use client";

import { BackgroundGallery } from "@/components/canvas/BackgroundGallery";

export default function ShaderBackgroundsPage() {
  return (
    <BackgroundGallery
      bucket="shader"
      title="Shader Backgrounds"
      description="GLSL fragment shaders, GPU fluid simulations, and post-processed three.js scenes. The heaviest, most distinctive backgrounds in the library — Pro tier and above."
      toolSlug="canvas-shaders"
    />
  );
}
