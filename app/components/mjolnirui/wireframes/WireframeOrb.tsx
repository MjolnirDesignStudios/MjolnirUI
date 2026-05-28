// app/components/mjolnirui/wireframes/WireframeOrb.tsx
// Rotating wireframe sphere with electric pulse rings emanating outward.
// Designed for video intros — "Mjolnir energy core" vibe. Use as a hero
// element or layered behind text.
//
// Composition:
//   - Inner icosahedron sphere (smooth subdivision) in wireframe
//   - Outer wireframe sphere counter-rotating
//   - 3 expanding ring pulses on a timed loop
//   - Optional inner glow point light
//
// Pure procedural — no assets. Deterministic per-time-T frame output.
"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface WireframeOrbProps {
  /** Rotation speed in revolutions/sec for the inner sphere. */
  rotateSpeed?: number;
  /** Outer sphere counter-rotates at this multiplier of rotateSpeed. */
  counterRotateMultiplier?: number;
  /** Inner / outer wireframe color. */
  color?: string;
  /** Pulse-ring color. */
  pulseColor?: string;
  /** Seconds between pulse emissions. */
  pulseInterval?: number;
  /** Background — "transparent" for video compositing. */
  background?: string;
  /** Camera FOV. */
  fov?: number;
  /** Camera distance from origin. */
  cameraDistance?: number;
  /** Inner sphere geometry detail (subdivision). */
  detail?: number;
  className?: string;
}

export function WireframeOrb({
  rotateSpeed = 0.18,
  counterRotateMultiplier = -1.6,
  color = "#00f0ff",
  pulseColor = "#FFCC11",
  pulseInterval = 1.6,
  background = "transparent",
  fov = 35,
  cameraDistance = 6,
  detail = 2,
  className,
}: WireframeOrbProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, cameraDistance], fov }}
        gl={{ alpha: background === "transparent", antialias: true }}
        style={{
          background: background === "transparent" ? "transparent" : background,
        }}
      >
        <ambientLight intensity={0.2} />
        <OrbCore
          rotateSpeed={rotateSpeed}
          counterRotateMultiplier={counterRotateMultiplier}
          color={color}
          pulseColor={pulseColor}
          pulseInterval={pulseInterval}
          detail={detail}
        />
      </Canvas>
    </div>
  );
}

function OrbCore({
  rotateSpeed,
  counterRotateMultiplier,
  color,
  pulseColor,
  pulseInterval,
  detail,
}: Required<
  Pick<
    WireframeOrbProps,
    | "rotateSpeed"
    | "counterRotateMultiplier"
    | "color"
    | "pulseColor"
    | "pulseInterval"
    | "detail"
  >
>) {
  const inner = useRef<THREE.Mesh>(null);
  const outer = useRef<THREE.Mesh>(null);

  // Pulse rings live in refs so we can mutate scale + opacity per frame
  // without re-rendering React.
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);

  const innerGeom = useMemo(
    () => new THREE.IcosahedronGeometry(1, detail),
    [detail]
  );
  const outerGeom = useMemo(
    () => new THREE.IcosahedronGeometry(1.6, 1),
    []
  );

  /* Single ring geometry shared by all 3 pulse refs. */
  const ringGeom = useMemo(() => new THREE.TorusGeometry(1, 0.012, 6, 64), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (inner.current) {
      inner.current.rotation.y = t * rotateSpeed * Math.PI * 2;
      inner.current.rotation.x = Math.sin(t * 0.3) * 0.4;
    }
    if (outer.current) {
      outer.current.rotation.y = t * rotateSpeed * counterRotateMultiplier * Math.PI * 2;
      outer.current.rotation.z = t * rotateSpeed * 0.3 * Math.PI;
    }

    /* Pulse rings — 3 staggered emissions, each ring scales 1 → 4 and
       fades out over its lifetime. */
    const rings = [ring1.current, ring2.current, ring3.current];
    rings.forEach((ring, i) => {
      if (!ring) return;
      const phase = (((t + i * (pulseInterval / 3)) / pulseInterval) % 1);
      const scale = 1 + phase * 3;
      const opacity = (1 - phase) * 0.7;
      ring.scale.setScalar(scale);
      const mat = ring.material as THREE.MeshBasicMaterial;
      mat.opacity = opacity;
    });
  });

  return (
    <group>
      {/* Outer wireframe shell */}
      <mesh ref={outer} geometry={outerGeom}>
        <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
      </mesh>

      {/* Inner detailed icosahedron */}
      <mesh ref={inner} geometry={innerGeom}>
        <meshBasicMaterial color={color} wireframe />
      </mesh>

      {/* 3 expanding pulse rings — staggered emissions */}
      <mesh ref={ring1} geometry={ringGeom} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial
          color={pulseColor}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ring2} geometry={ringGeom} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial
          color={pulseColor}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ring3} geometry={ringGeom} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial
          color={pulseColor}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle central glow point */}
      <pointLight position={[0, 0, 0]} intensity={0.5} color={pulseColor} />
    </group>
  );
}

export default WireframeOrb;
