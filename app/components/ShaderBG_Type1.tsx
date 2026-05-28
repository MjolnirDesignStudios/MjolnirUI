"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

type ShaderBG_Type1Props = {
  className?: string;
  speed?: number;
  turbulence?: number;
  depth?: number;
  brightness?: number;
  colorShift?: number;
};

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

/* Fragment shader with compile-time iteration counts. GLSL `for` loops
   need constant bounds for best perf — runtime uniforms force the GPU
   to plan for the worst case. We compile two variants and pick at
   runtime based on viewport width.

   HIGH (desktop ≥ 768px):  outer 10 × inner 3 = 30 iterations per pixel
   LOW  (mobile  < 768px):  outer  6 × inner 2 = 12 iterations per pixel

   The mobile path also boosts u_brightness slightly to compensate for
   fewer accumulation steps so the visual character matches. */
function buildFragmentShader(outerSteps: number, innerSteps: number): string {
  return `
  precision highp float;

  uniform float iTime;
  uniform vec3 iResolution;
  uniform float u_speed;
  uniform float u_turbulence;
  uniform float u_depth;
  uniform float u_brightness;
  uniform float u_colorShift;

  vec4 tanhApprox(vec4 x) {
    vec4 x2 = x * x;
    return x * (3.0 + x2) / (3.0 + 3.0 * x2);
  }

  void mainImage(out vec4 O, vec2 I) {
    float z = 0.0, d, i = 0.0;
    O = vec4(0.0);
    for(float step = 0.0; step < ${outerSteps.toFixed(1)}; step++) {
      i = step;
      vec3 p = z * normalize(vec3(I + I, 0) - iResolution.xyx) + 0.1 * u_depth;
      p = vec3(atan(p.y / 0.2, p.x) * 2.0, p.z / 3.0, length(p.xy) - 5.0 - z * 0.2);
      for(float turb = 0.0; turb < ${innerSteps.toFixed(1)}; turb++) {
        p += sin(p.yzx * (turb + 1.0) + iTime * u_speed + 0.3 * i * u_turbulence) / (turb + 1.0);
      }
      d = length(vec4(0.4 * cos(p) - 0.4, p.z));
      z += d;
      vec4 color = (1.0 + cos(p.x + i * 0.4 + z + vec4(6, 1, 2, 0) * u_colorShift)) / d;
      O += color * u_brightness;
    }
    O = tanhApprox(O * O / 400.0);
  }

  varying vec2 vUv;
  void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
  }
`;
}

const fragmentShaderHigh = buildFragmentShader(10, 3);
const fragmentShaderLow = buildFragmentShader(6, 2);

export default function ShaderBG_Type1({
  className,
  speed = 0.8,
  turbulence = 1.0,
  depth = 2.0,
  brightness = 0.7,
  colorShift = 0.7,
}: ShaderBG_Type1Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    /* Quality tier: mobile gets the LOW shader variant + boosted
       brightness to compensate for fewer accumulation steps. */
    const isMobile = window.innerWidth < 768;
    const qualityFragment = isMobile ? fragmentShaderLow : fragmentShaderHigh;
    const qualityBrightness = isMobile ? brightness * 1.5 : brightness;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3() },
      u_speed: { value: speed },
      u_turbulence: { value: turbulence },
      u_depth: { value: depth },
      u_brightness: { value: qualityBrightness },
      u_colorShift: { value: colorShift },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader: qualityFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    /* DPR cap: 1.0 on mobile (33% fewer pixels than 1.5), 1.5 on desktop.
       The Bifrost shader is heavy enough that even retina laptops can
       feel the difference between 1.5 and 2.0 — this cap is a major win. */
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.iResolution.value.set(width, height, 1);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    /* Performance gates:
       1. Pause render loop entirely when the canvas isn't intersecting
          the viewport (user scrolled past). Resume on re-intersect.
       2. Throttle to ~30fps via frame skipping — ambient backgrounds
          look identical at 30fps but cost half the GPU.
       3. Respect prefers-reduced-motion — render a single frame and stop. */

    const clock = new THREE.Clock();
    let isVisible = true;
    let isReducedMotion = false;
    let lastRenderTime = 0;
    const FRAME_BUDGET_MS = 1000 / 30; // ~33ms = 30fps cap

    if (typeof window !== "undefined" && window.matchMedia) {
      isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    const animate = (now: number) => {
      // Skip frames to stay under the 30fps budget.
      if (now - lastRenderTime >= FRAME_BUDGET_MS) {
        uniforms.iTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
        lastRenderTime = now;
      }
      // Only schedule the next frame if we're actually on-screen and
      // motion isn't suppressed.
      if (isVisible && !isReducedMotion) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        frameRef.current = null;
      }
    };

    /* Kick off one render so the background paints immediately even if
       motion is reduced. */
    uniforms.iTime.value = 0;
    renderer.render(scene, camera);

    if (!isReducedMotion) {
      frameRef.current = requestAnimationFrame(animate);
    }

    /* Scroll-based gating: the container is position:fixed so it always
       intersects the viewport — IntersectionObserver would never trigger.
       Instead, watch scrollY: when the user is more than ~1.5 viewports
       deep, the shader is visually obscured by content above it, so
       there's no point rendering. Resume when scrolled back up. */
    const onScroll = () => {
      const wasVisible = isVisible;
      const pastFold = window.scrollY > window.innerHeight * 1.5;
      isVisible = !pastFold;
      if (
        isVisible &&
        !wasVisible &&
        frameRef.current === null &&
        !isReducedMotion
      ) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    /* Also pause when the tab is backgrounded. */
    const onVisibilityChange = () => {
      const wasVisible = isVisible;
      isVisible = !document.hidden && window.scrollY <= window.innerHeight * 1.5;
      if (
        isVisible &&
        !wasVisible &&
        frameRef.current === null &&
        !isReducedMotion
      ) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (rendererRef.current?.domElement?.parentNode) {
        container.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [speed, turbulence, depth, brightness, colorShift]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 -z-10 w-full h-full ${className || ""}`}
    />
  );
}