// app/components/mjolnirui/wireframes/WireframeHammer.tsx
// Mjolnir hammer rendered as a pure-line wireframe mesh — rotates by
// default, can strike on demand for video moments. Built on Three.js
// + React Three Fiber so it composes with the rest of the 3D library.
//
// Designed dual-purpose:
//   1. Drop into the MjolnirUI library at /blocks/browse/wireframe-hammer
//      as a Free-tier showpiece component.
//   2. Capture frames via the MDS video editor — set rotateSpeed=0 and
//      strikeAt=N to drive a deterministic clip.
//
// All animation is time-based via useFrame so frame-rate is decoupled
// from playback. The mesh is procedurally built so there is no .glb
// asset dependency — the entire hammer is generated in code.
"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface WireframeHammerProps {
  /** Continuous rotation speed in revolutions/sec. Set 0 for video keyframing. */
  rotateSpeed?: number;
  /** Axis to rotate around. */
  rotateAxis?: "x" | "y" | "z";
  /** Hammer line color (hex). Default Mjolnir cyan. */
  color?: string;
  /** Pulse glow color. */
  glowColor?: string;
  /** Background — "transparent" for compositing in video editor */
  background?: string;
  /** Camera FOV. Smaller = more orthographic feel. */
  fov?: number;
  /** Camera distance from origin. */
  cameraDistance?: number;
  /** Wireframe line thickness — Three.js BasicMaterial linewidth is GL-clamped to 1px on most platforms, so this drives a tube-based replacement when true. */
  thick?: boolean;
  /** When set to a positive number, the hammer "strikes" — quick scale-down + lightning emission — every `strikeInterval` seconds. */
  strikeInterval?: number;
  className?: string;
}

export function WireframeHammer({
  rotateSpeed = 0.25,
  rotateAxis = "y",
  color = "#00f0ff",
  glowColor = "#FFCC11",
  background = "transparent",
  fov = 35,
  cameraDistance = 6,
  thick = false,
  strikeInterval,
  className,
}: WireframeHammerProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, cameraDistance], fov }}
        gl={{ alpha: background === "transparent", antialias: true }}
        style={{
          background: background === "transparent" ? "transparent" : background,
        }}
      >
        <ambientLight intensity={0.3} />
        <HammerMesh
          rotateSpeed={rotateSpeed}
          rotateAxis={rotateAxis}
          color={color}
          glowColor={glowColor}
          thick={thick}
          strikeInterval={strikeInterval}
        />
      </Canvas>
    </div>
  );
}

/* ── Hammer mesh ───────────────────────────────────────── */
function HammerMesh({
  rotateSpeed,
  rotateAxis,
  color,
  glowColor,
  thick,
  strikeInterval,
}: Required<
  Pick<
    WireframeHammerProps,
    "rotateSpeed" | "rotateAxis" | "color" | "glowColor" | "thick"
  >
> & { strikeInterval: WireframeHammerProps["strikeInterval"] }) {
  const group = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  /* Build the head + handle geometries once. */
  const headGeom = useMemo(
    () => new THREE.BoxGeometry(2.2, 1, 1, 4, 2, 2),
    []
  );
  const handleGeom = useMemo(
    () => new THREE.CylinderGeometry(0.13, 0.13, 2.6, 12, 1),
    []
  );
  const glowGeom = useMemo(() => new THREE.SphereGeometry(2.4, 24, 16), []);

  /* Edges geometry for true line rendering — no fills. */
  const headEdges = useMemo(() => new THREE.EdgesGeometry(headGeom), [headGeom]);
  const handleEdges = useMemo(
    () => new THREE.EdgesGeometry(handleGeom),
    [handleGeom]
  );

  /* Animation tick. */
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();

    // Continuous rotation.
    group.current.rotation[rotateAxis] = t * rotateSpeed * Math.PI * 2;

    // Strike pulse — scale dip + glow flare.
    if (strikeInterval && strikeInterval > 0) {
      const phase = (t % strikeInterval) / strikeInterval; // 0 → 1 over the interval
      const isStrike = phase > 0.92; // last 8% of cycle is the strike
      const strikeT = isStrike ? (phase - 0.92) / 0.08 : 0;
      const scale = isStrike ? 1 - 0.08 * Math.sin(strikeT * Math.PI) : 1;
      group.current.scale.setScalar(scale);
      if (glowRef.current) {
        const mat = glowRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = isStrike ? 0.18 * Math.sin(strikeT * Math.PI) : 0;
      }
    }

    // Subtle handle bob.
    if (headRef.current) {
      headRef.current.position.y = 0.7 + Math.sin(t * 1.5) * 0.02;
    }
  });

  return (
    <group ref={group}>
      {/* Glow halo — invisible except during strike. */}
      <mesh ref={glowRef} geometry={glowGeom}>
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Hammer head wireframe — positioned above origin. */}
      <mesh ref={headRef} position={[0, 0.7, 0]}>
        {thick ? (
          <ThickWireframe edges={headEdges} color={color} radius={0.025} />
        ) : (
          <lineSegments geometry={headEdges}>
            <lineBasicMaterial color={color} />
          </lineSegments>
        )}
      </mesh>

      {/* Handle wireframe — extends below the head. */}
      <mesh position={[0, -0.8, 0]}>
        {thick ? (
          <ThickWireframe edges={handleEdges} color={color} radius={0.018} />
        ) : (
          <lineSegments geometry={handleEdges}>
            <lineBasicMaterial color={color} />
          </lineSegments>
        )}
      </mesh>

      {/* Pommel ring at the bottom of the handle. */}
      <mesh position={[0, -2.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.04, 8, 24]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
    </group>
  );
}

/* ── Tube-based thick wireframe (for video-quality lines) ─ */
function ThickWireframe({
  edges,
  color,
  radius,
}: {
  edges: THREE.EdgesGeometry;
  color: string;
  radius: number;
}) {
  const tubes = useMemo(() => {
    const positions = edges.attributes.position.array as Float32Array;
    const meshes: THREE.Mesh[] = [];
    for (let i = 0; i < positions.length; i += 6) {
      const a = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      const b = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
      const curve = new THREE.LineCurve3(a, b);
      const geom = new THREE.TubeGeometry(curve, 2, radius, 6, false);
      const mat = new THREE.MeshBasicMaterial({ color });
      meshes.push(new THREE.Mesh(geom, mat));
    }
    return meshes;
  }, [edges, color, radius]);

  return (
    <group>
      {tubes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </group>
  );
}

export default WireframeHammer;
