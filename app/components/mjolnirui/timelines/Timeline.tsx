// components/ui/Timeline.tsx — FINAL: GSAP-ENHANCED + 3D MJÖLNIR FLY-THROUGH
"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshStandardMaterial, Vector3, Mesh } from "three";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

gsap.registerPlugin(ScrollTrigger);

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

interface TimelineProps {
  data: TimelineEntry[];
}

const Timeline = ({ data }: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const mjolnirRef = useRef<Group>(null);

  useEffect(() => {
    if (!lineRef.current) return;

    gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    }).to(lineRef.current, { height: "100%", opacity: 1, ease: "power1.inOut" });

    // GSAP for Mjolnir fly-through
    if (mjolnirRef.current && mjolnirRef.current.position && mjolnirRef.current.rotation) {
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      })
        .to(mjolnirRef.current.position, {
          y: -window.innerHeight,
          z: -100,
          ease: "power1.inOut",
        })
        .to(mjolnirRef.current.rotation, {
          x: Math.PI * 2,
          y: Math.PI * 2,
          ease: "power1.inOut",
        }, 0);
    }
  }, []);

  return (
    <div className="relative w-full overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-lg md:text-4xl mb-4 text-black dark:text-white max-w-4xl">
          Our Quest to lift the mighty hammer, Mjolnir!
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-sm">
          I&#39;ve been working on MjolnirUI for the past 2 years. Here&#39;s a timeline of the major milestones in the development of this project.
        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-10 md:pt-40 md:gap-10">
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
            </div>
            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        {/* PROGRESS LINE */}
        <div
          ref={lineRef}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
          style={{ height: "0%", opacity: 0 }}
        />

        {/* 3D MJÖLNIR FLY-THROUGH */}
        <Canvas className="absolute inset-0 pointer-events-none">
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <MjolnirModel ref={mjolnirRef} />
        </Canvas>
      </div>
    </div>
  );
};

// 3D MJÖLNIR MODEL COMPONENT — PLACEHOLDER (LOAD YOUR MESHY MODEL)
import { Group } from "three";
const MjolnirModel = React.forwardRef<Group, React.JSX.IntrinsicElements["group"]>((props, ref) => {
  const group = useRef<Group>(null);
  const { nodes, materials } = useLoader(GLTFLoader, "/models/mjolnir.glb"); // ← YOUR MESHY MODEL PATH

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.01;
    }
  });

  // Type guard to ensure nodes.Hammer is a Mesh
  const hammerMesh = nodes.Hammer as Mesh;

  return (
    <group ref={ref} {...props} dispose={null}>
      {hammerMesh && hammerMesh.geometry && (
        <mesh geometry={hammerMesh.geometry} material={materials.HammerMaterial} />
      )}
    </group>
  );
});
MjolnirModel.displayName = "MjolnirModel";

export { Timeline };