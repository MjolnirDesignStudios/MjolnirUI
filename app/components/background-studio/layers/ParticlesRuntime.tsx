// app/components/background-studio/layers/ParticlesRuntime.tsx
// Lazy-loaded tsparticles runtime for the Background Studio's particles layer.
// Isolated in its own file so the main LayerRenderer doesn't pull tsparticles
// into the initial bundle (~80kb) when no particles layer is present.
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import type { ParticlesLayer } from "../studioTypes";

let inited = false;
let initPromise: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (inited) return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = initParticlesEngine(async (engine) => {
    await loadSlim(engine);
  }).then(() => {
    inited = true;
  });
  return initPromise;
}

export function ParticlesRuntime({ layer }: { layer: ParticlesLayer }) {
  const [ready, setReady] = useState(inited);

  useEffect(() => {
    if (inited) return;
    ensureInit().then(() => setReady(true));
  }, []);

  const options: ISourceOptions = useMemo(() => {
    const shapeForTsParticles = ((): string => {
      switch (layer.shape) {
        case "circle":
          return "circle";
        case "square":
          return "square";
        case "triangle":
          return "triangle";
        case "polygon":
          return "polygon";
        case "star":
          return "star";
      }
    })();

    return {
      fpsLimit: 60,
      detectRetina: true,
      background: { color: { value: "transparent" } },
      particles: {
        number: { value: layer.count, density: { enable: true } },
        color: { value: layer.colors.length > 0 ? layer.colors : ["#FFCC11"] },
        shape: {
          type: shapeForTsParticles,
          options: {
            polygon: { sides: layer.shapeParam ?? 6 },
            star: { sides: layer.shapeParam ?? 5 },
          },
        },
        opacity: { value: 0.7 },
        size: {
          value: { min: Math.max(0.5, layer.sizeMin), max: Math.max(1, layer.sizeMax) },
        },
        move: {
          enable: true,
          speed: layer.speed,
          direction: layer.direction,
          outModes: { default: layer.outMode },
          random: layer.direction === "none",
          straight: false,
        },
        links: layer.linksEnabled
          ? {
              enable: true,
              distance: layer.linksDistance ?? 140,
              color: layer.linksColor ?? "#FFCC11",
              opacity: 0.35,
              width: 1,
            }
          : { enable: false },
      },
      interactivity: {
        events: {
          onHover: {
            enable: layer.hoverInteraction !== "none",
            mode: layer.hoverInteraction === "none" ? undefined : layer.hoverInteraction,
          },
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.6 } },
          repulse: { distance: 100, duration: 0.4 },
          bubble: { distance: 100, size: layer.sizeMax * 2.5, duration: 2 },
        },
      },
    } as ISourceOptions;
  }, [layer]);

  if (!ready) return null;

  return (
    <Particles
      id={`studio-particles-${layer.id}`}
      options={options}
      className="absolute inset-0"
    />
  );
}
