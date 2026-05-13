// app/components/background-studio/StudioCanvas.tsx
// The aspect-correct preview surface that renders every layer back→front.
// Wraps in a ref so the export menu can grab its DOM for html2canvas-style
// snapshots in the future.
"use client";

import React, { forwardRef } from "react";
import type { StudioState } from "./studioTypes";
import { LayerRenderer } from "./layers/LayerRenderer";

interface StudioCanvasProps {
  state: StudioState;
}

const ASPECT_TO_STYLE: Record<StudioState["canvasAspect"], string> = {
  "16/9": "16 / 9",
  "1/1": "1 / 1",
  "9/16": "9 / 16",
  "4/3": "4 / 3",
  "21/9": "21 / 9",
};

export const StudioCanvas = forwardRef<HTMLDivElement, StudioCanvasProps>(
  function StudioCanvas({ state }, ref) {
    return (
      <div
        ref={ref}
        className="relative w-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-black shadow-[0_0_60px_-20px_rgba(0,0,0,0.8)]"
        style={{ aspectRatio: ASPECT_TO_STYLE[state.canvasAspect] }}
        data-export-target="true"
      >
        {state.layers.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
            Empty canvas — add a layer to start
          </div>
        ) : (
          state.layers.map((layer) => (
            <LayerRenderer key={layer.id} layer={layer} />
          ))
        )}

        {/* Subtle outline so the canvas always reads as a defined surface */}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-2xl pointer-events-none" />
      </div>
    );
  }
);
