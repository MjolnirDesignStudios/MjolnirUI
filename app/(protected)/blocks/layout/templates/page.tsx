// app/(protected)/blocks/layout/templates/page.tsx
// Layout → Page Templates (Base tier sidebar link).
// 5 full-page templates: SaaS landing, agency portfolio, dashboard shell,
// auth split, docs site.
"use client";

import { FileText } from "lucide-react";
import { LayoutGallery } from "@/components/layout/LayoutGallery";

export default function TemplatesPage() {
  return (
    <LayoutGallery
      bucket="templates"
      Icon={FileText}
      title="Page Templates"
      description="Full-page compositions covering the most common product surfaces — SaaS landing, agency portfolio, dashboard shell, auth pages, docs site. Each template is a starting point you can carve up however you want."
      toolSlug="layout-templates"
    />
  );
}
