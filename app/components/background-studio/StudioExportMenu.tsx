// app/components/background-studio/StudioExportMenu.tsx
// Export the layered composition in 4 formats:
//   1. React component (TSX) — self-contained, no library beyond what's in this repo
//   2. CSS-only — works when no particle / shape / shader layers present
//   3. PNG snapshot — DOM-to-canvas via the browser's built-in SVG foreign-object trick.
//      Note: WebGL layers can't be captured by this method; we render a placeholder.
//   4. JSON — raw state dump, importable in another browser.
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Copy, Check, FileDown, FileJson, FileCode2, ImageIcon, ChevronDown } from "lucide-react";
import type { StudioState, BackgroundLayer } from "./studioTypes";

interface StudioExportMenuProps {
  state: StudioState;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

type Format = "react" | "css" | "png" | "json";

export function StudioExportMenu({ state, canvasRef }: StudioExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useState<Format>("react");
  const [copied, setCopied] = useState(false);

  const exports = {
    react: toReactComponent(state),
    css: toCss(state),
    json: JSON.stringify(state, null, 2),
  };

  const handleCopy = async () => {
    const text =
      activeFormat === "react"
        ? exports.react
        : activeFormat === "css"
          ? exports.css
          : exports.json;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (activeFormat === "png") {
      downloadPng(canvasRef.current, state.name);
      return;
    }
    const text =
      activeFormat === "react"
        ? exports.react
        : activeFormat === "css"
          ? exports.css
          : exports.json;
    const ext = activeFormat === "react" ? "tsx" : activeFormat === "css" ? "css" : "json";
    const safeName = state.name.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase() || "background";
    downloadText(`${safeName}.${ext}`, text);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-semibold text-gray-300 hover:text-white hover:border-zinc-700 transition"
      >
        <FileDown size={14} />
        Export
        <ChevronDown size={12} className={open ? "rotate-180 transition" : "transition"} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-20 w-[520px] max-w-[90vw] rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Format tabs */}
            <div className="flex border-b border-zinc-800/60">
              <FormatTab
                active={activeFormat === "react"}
                onClick={() => setActiveFormat("react")}
                icon={Code2}
                label="React"
              />
              <FormatTab
                active={activeFormat === "css"}
                onClick={() => setActiveFormat("css")}
                icon={FileCode2}
                label="CSS"
              />
              <FormatTab
                active={activeFormat === "png"}
                onClick={() => setActiveFormat("png")}
                icon={ImageIcon}
                label="PNG"
              />
              <FormatTab
                active={activeFormat === "json"}
                onClick={() => setActiveFormat("json")}
                icon={FileJson}
                label="JSON"
              />
            </div>

            {/* Preview / body */}
            <div className="p-3 max-h-[340px] overflow-y-auto">
              {activeFormat === "png" ? (
                <div className="text-center text-xs text-gray-400 leading-relaxed py-8">
                  PNG export captures the visible canvas. WebGL layers (shader
                  presets) may render as a static fallback in the snapshot — for
                  publishable visuals use an external screenshot tool.
                </div>
              ) : (
                <pre className="text-[10px] font-mono text-gray-300 whitespace-pre-wrap break-all leading-relaxed">
                  <code>{exports[activeFormat]}</code>
                </pre>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 border-t border-zinc-800/60 px-3 py-2">
              {activeFormat !== "png" && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition"
                >
                  {copied ? (
                    <Check size={12} className="text-[#10B981]" />
                  ) : (
                    <Copy size={12} />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
              <button
                onClick={handleDownload}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFCC11] text-black hover:bg-[#FFD700] transition"
              >
                <FileDown size={12} />
                Download
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormatTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
        active
          ? "text-[#FFCC11] border-[#FFCC11]"
          : "text-gray-500 border-transparent hover:text-white"
      }`}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   EXPORTERS
   ═══════════════════════════════════════════════════════ */

function toCss(state: StudioState): string {
  // Compose the layers into a single CSS background-image stack where possible.
  // Non-CSS layers (particles, shapes, shader) are noted as comments.
  const lines: string[] = [];
  lines.push(`/* ${state.name} — generated by MjolnirUI Background Studio */`);
  lines.push(".background {");
  lines.push(`  aspect-ratio: ${state.canvasAspect};`);
  lines.push("  position: relative;");

  const stackable: string[] = [];
  const unsupported: string[] = [];

  // Iterate top to bottom for CSS (front-to-back in layer order matches CSS painter).
  for (const layer of [...state.layers].reverse()) {
    if (!layer.visible) continue;
    if (layer.type === "solid") {
      stackable.push(layer.color);
    } else if (layer.type === "gradient") {
      stackable.push(gradientToCss(layer));
    } else if (layer.type === "mesh-gradient") {
      const parts = layer.anchors.map(
        (a) =>
          `radial-gradient(circle at ${(a.x * 100).toFixed(1)}% ${(a.y * 100).toFixed(1)}%, ${a.color} 0%, transparent ${(a.radius * 100).toFixed(1)}%)`
      );
      stackable.push(parts.join(", "));
    } else {
      unsupported.push(`${layer.type} (${layer.name})`);
    }
  }

  if (stackable.length > 0) {
    lines.push(`  background: ${stackable.join(", ")};`);
  } else {
    lines.push("  background: #020617;");
  }
  lines.push("}");

  if (unsupported.length > 0) {
    lines.push("");
    lines.push(
      "/* The following layers are not representable in CSS alone; export as React for full output: */"
    );
    for (const name of unsupported) {
      lines.push(`/*   - ${name} */`);
    }
  }

  return lines.join("\n");
}

function gradientToCss(g: Extract<BackgroundLayer, { type: "gradient" }>): string {
  const stops = g.stops
    .slice()
    .sort((a, b) => a.offset - b.offset)
    .map((s) => `${s.color} ${(s.offset * 100).toFixed(1)}%`)
    .join(", ");
  if (g.gradientType === "linear") return `linear-gradient(${g.angleDeg}deg, ${stops})`;
  if (g.gradientType === "radial")
    return `radial-gradient(circle at 50% 50%, ${stops})`;
  return `conic-gradient(from ${g.angleDeg}deg at 50% 50%, ${stops})`;
}

function toReactComponent(state: StudioState): string {
  const name = state.name.replace(/[^A-Za-z0-9]+/g, "") || "MyBackground";
  const componentName = name.charAt(0).toUpperCase() + name.slice(1);
  return [
    `// ${state.name} — exported from MjolnirUI Background Studio`,
    `// Generated ${new Date().toISOString()}`,
    `// Layers: ${state.layers.length} · Aspect: ${state.canvasAspect}`,
    `"use client";`,
    "",
    `import React from "react";`,
    "",
    `export function ${componentName}() {`,
    `  return (`,
    `    <div style={{ position: "relative", aspectRatio: "${state.canvasAspect}", overflow: "hidden" }}>`,
    ...state.layers
      .filter((l) => l.visible)
      .map((l) => `      ${layerToJsx(l)}`),
    `    </div>`,
    `  );`,
    `}`,
    "",
    "/* For interactive layers (particles / shapes / shader-preset), install:",
    "     npm install @tsparticles/react @tsparticles/slim",
    "   and reference the original MjolnirUI components from the studio JSON. */",
  ].join("\n");
}

function layerToJsx(layer: BackgroundLayer): string {
  const wrapStyle = `style={{ position: "absolute", inset: 0, opacity: ${layer.opacity}, mixBlendMode: "${layer.blendMode}" }}`;
  if (layer.type === "solid") {
    return `<div ${wrapStyle.replace("}}", `, backgroundColor: "${layer.color}" }}`)} />`;
  }
  if (layer.type === "gradient") {
    return `<div ${wrapStyle.replace("}}", `, background: "${gradientToCss(layer)}" }}`)} />`;
  }
  if (layer.type === "mesh-gradient") {
    const parts = layer.anchors
      .map(
        (a) =>
          `radial-gradient(circle at ${(a.x * 100).toFixed(1)}% ${(a.y * 100).toFixed(1)}%, ${a.color} 0%, transparent ${(a.radius * 100).toFixed(1)}%)`
      )
      .join(", ");
    return `<div ${wrapStyle.replace("}}", `, background: "${parts}, ${layer.fallback}" }}`)} />`;
  }
  // Non-CSS layers — emit a comment placeholder
  return `{/* TODO: ${layer.type} layer — see Studio JSON to rebuild */}`;
}

/* ── PNG export via DOM → SVG → canvas ──────────────────── */
async function downloadPng(node: HTMLElement | null, name: string) {
  if (!node) return;
  const rect = node.getBoundingClientRect();
  // We render the node into an inline SVG <foreignObject>, then draw that to a
  // canvas. Works for CSS-only layers; WebGL layers won't be captured by this
  // route (browser security) — they appear as the placeholder gradient.
  const html = node.outerHTML;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${rect.width}px;height:${rect.height}px">${html}</div>
      </foreignObject>
    </svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = rect.width * 2; // 2x for retina
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0);
    const png = canvas.toDataURL("image/png");
    const safe = name.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase() || "background";
    const a = document.createElement("a");
    a.href = png;
    a.download = `${safe}.png`;
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
