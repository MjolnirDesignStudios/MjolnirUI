// app/(protected)/blocks/layout/grids/page.tsx
// Layout → Grid Systems (Free tier sidebar link).
// 8 grid patterns: 2/3/4-col, asymmetric, masonry, bento, auto-fit, holy grail.
"use client";

import { LayoutGrid } from "lucide-react";
import { LayoutGallery } from "@/components/layout/LayoutGallery";

export default function GridsPage() {
  return (
    <LayoutGallery
      bucket="grids"
      Icon={LayoutGrid}
      title="Grid Systems"
      description="Eight grid patterns covering 90% of real-world layouts — from simple 2-column splits to bento boxes and the holy-grail app shell. All pure CSS, mobile-first, copy-paste ready."
      toolSlug="layout-grids"
    />
  );
}
