// app/(protected)/blocks/layout/sections/page.tsx
// Layout → Sections (Base tier sidebar link).
// 10 section patterns: 3 hero variants, 2 feature grids, pricing,
// testimonials, CTA, stats, FAQ.
"use client";

import { LayoutTemplate } from "lucide-react";
import { LayoutGallery } from "@/components/layout/LayoutGallery";

export default function SectionsPage() {
  return (
    <LayoutGallery
      bucket="sections"
      Icon={LayoutTemplate}
      title="Page Sections"
      description="Ten production-ready section patterns — hero, features, pricing, testimonials, CTAs. Drop straight into a Next.js page, swap the copy, ship today."
      toolSlug="layout-sections"
    />
  );
}
