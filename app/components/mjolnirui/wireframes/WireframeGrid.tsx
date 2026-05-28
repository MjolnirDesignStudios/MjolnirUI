// app/components/mjolnirui/wireframes/WireframeGrid.tsx
// Tron-style infinite perspective grid floor. The grid scrolls toward
// the camera at a configurable speed — works as a background floor in
// any video scene where you want "moving into the realm" energy.
//
// Implementation:
//   - One large flat grid in the XZ plane
//   - Texture-mapped grid pattern OR Three.js GridHelper (we use a custom
//     ShaderMaterial for crisp aliasing + glow at horizon)
//   - Camera-relative scroll achieved by animating UV offset
//   - Optional vertical sun bar at horizon
//
// Pure procedural — no asset deps. Renders at any aspect ratio for
// video output.
"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface WireframeGridProps {
  /** Grid line color (hex). */
  color?: string;
  /** Glow color at the horizon. */
  horizonColor?: string;
  /** Scroll speed in grid-cells per second. Negative scrolls away. */
  scrollSpeed?: number;
  /** Number of grid divisions visible at any time. Higher = denser. */
  divisions?: number;
  /** Total grid plane size — larger = farther horizon. */
  size?: number;
  /** Camera pitch (radians down from horizontal). */
  cameraPitch?: number;
  /** Background — "transparent" for video compositing. */
  background?: string;
  /** Show vertical horizon sun bar. */
  showSun?: boolean;
  /** Sun color. */
  sunColor?: string;
  className?: string;
}

export function WireframeGrid({
  color = "#00f0ff",
  horizonColor = "#FFCC11",
  scrollSpeed = 1.2,
  divisions = 30,
  size = 60,
  cameraPitch = 0.18,
  background = "transparent",
  showSun = true,
  sunColor = "#FFCC11",
  className,
}: WireframeGridProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{
          position: [0, 1.2, 0],
          rotation: [-cameraPitch, 0, 0],
          fov: 70,
          near: 0.1,
          far: size * 2,
        }}
        gl={{ alpha: background === "transparent", antialias: true }}
        style={{
          background: background === "transparent" ? "transparent" : background,
        }}
      >
        <GridPlane
          color={color}
          horizonColor={horizonColor}
          scrollSpeed={scrollSpeed}
          divisions={divisions}
          size={size}
        />
        {showSun && <HorizonSun color={sunColor} size={size} />}
      </Canvas>
    </div>
  );
}

/* ── Scrolling grid floor (custom shader) ─────────────── */
function GridPlane({
  color,
  horizonColor,
  scrollSpeed,
  divisions,
  size,
}: Required<
  Pick<
    WireframeGridProps,
    "color" | "horizonColor" | "scrollSpeed" | "divisions" | "size"
  >
>) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geom = useMemo(
    () => new THREE.PlaneGeometry(size, size, 1, 1),
    [size]
  );

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uHorizonColor: { value: new THREE.Color(horizonColor) },
        uDivisions: { value: divisions },
        uScrollSpeed: { value: scrollSpeed },
      },
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying float vDist;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vDist = length(worldPos.xyz - cameraPosition);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uHorizonColor;
        uniform float uDivisions;
        uniform float uScrollSpeed;
        varying vec2 vUv;
        varying float vDist;

        // Pristine 1-pixel-wide grid lines with anti-aliasing.
        float grid(vec2 uv, float divisions) {
          vec2 g = uv * divisions;
          vec2 gridLines = abs(fract(g - 0.5) - 0.5) / fwidth(g);
          float line = min(gridLines.x, gridLines.y);
          return 1.0 - clamp(line, 0.0, 1.0);
        }

        void main() {
          // Scroll UV in V direction over time so the grid moves toward the camera.
          vec2 scrolled = vec2(vUv.x, vUv.y + uTime * uScrollSpeed / uDivisions);

          float g = grid(scrolled, uDivisions);
          if (g < 0.02) discard;

          // Distance-based fade — far cells dim, near cells bright.
          float dist01 = clamp(vDist / 35.0, 0.0, 1.0);
          float fade = 1.0 - smoothstep(0.6, 1.0, dist01);

          // Mix grid color toward horizon glow as cells recede.
          vec3 col = mix(uColor, uHorizonColor, smoothstep(0.4, 0.95, dist01));

          gl_FragColor = vec4(col, g * fade * 0.9);
        }
      `,
    });
    // We attach uniforms refs separately so useFrame can mutate uTime.
  }, [color, horizonColor, divisions, scrollSpeed]);

  /* Sync ref. */
  React.useEffect(() => {
    matRef.current = material;
  }, [material]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh
      geometry={geom}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, -size / 2]}
    />
  );
}

/* ── Horizon sun bar — flat vertical glow at the horizon ─ */
function HorizonSun({ color, size }: { color: string; size: number }) {
  const ref = useRef<THREE.Mesh>(null);

  /* Pulse the sun's glow subtly. */
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.65 + Math.sin(t * 0.8) * 0.08;
  });

  return (
    <mesh ref={ref} position={[0, 1.4, -size + 1]}>
      <planeGeometry args={[5, 3]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </mesh>
  );
}

export default WireframeGrid;
