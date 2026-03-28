"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

type LiquidMetalProps = {
  className?: string;
  speed?: number;
  metallic?: number;
  turbulence?: number;
  interactive?: boolean;
};

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_speed;
  uniform float u_metallic;
  uniform float u_turbulence;
  uniform vec2 u_mouse;

  // --- Simplex noise ---
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289v2(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // --- Rotational domain warp (differentiator from source) ---
  vec2 rotate2D(vec2 p, float angle) {
    float c = cos(angle), s = sin(angle);
    return mat2(c, -s, s, c) * p;
  }

  float fbm(vec2 p, float t) {
    float val = 0.0;
    float amp = 0.55;
    float freq = 1.0;
    for (int i = 0; i < 6; i++) {
      // Rotate each octave for swirling metallic flow
      p = rotate2D(p, 0.45 * float(i) + t * 0.08);
      val += amp * snoise(p * freq + t * 0.25);
      freq *= 1.85;
      amp *= 0.42 * u_turbulence;
      p += vec2(3.1, 7.4);
    }
    return val;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);

    float t = u_time * u_speed;

    // Mouse interaction — swirl distortion
    if (u_mouse.x > 0.0) {
      vec2 mNorm = (u_mouse - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
      vec2 diff = p - mNorm;
      float dist = length(diff);
      float swirl = exp(-dist * dist * 6.0) * 0.5;
      p = mNorm + rotate2D(diff, swirl * 8.0);
    }

    // Triple-layer domain warping with unique offset vectors
    vec2 q = vec2(
      fbm(p + vec2(1.4, -0.6), t),
      fbm(p + vec2(-2.8, 3.1), t)
    );

    // Second warp layer with rotated feedback
    vec2 r = vec2(
      fbm(p + 3.5 * rotate2D(q, t * 0.1) + vec2(4.2, -1.8), t * 1.15),
      fbm(p + 3.5 * rotate2D(q, t * 0.1) + vec2(-3.7, 5.4), t * 1.15)
    );

    float f = fbm(p + 3.0 * r, t * 0.7);

    // --- Metallic chrome palette ---
    // Base: deep gunmetal
    vec3 col = mix(
      vec3(0.06, 0.07, 0.09),
      vec3(0.18, 0.20, 0.24),
      clamp(f * f * 2.5, 0.0, 1.0)
    );

    // Mid: brushed silver from warp magnitude
    col = mix(col, vec3(0.55, 0.58, 0.65), clamp(length(q) * 0.45, 0.0, 1.0));

    // Highlight: bright chrome from second warp
    col = mix(col, vec3(0.82, 0.85, 0.92), clamp(length(r.x) * 0.5, 0.0, 1.0));

    // Electric cyan accent (MjolnirUI brand #00f0ff)
    float edgeGlow = smoothstep(0.3, 0.9, abs(f) + length(r) * 0.3);
    vec3 cyan = vec3(0.0, 0.94, 1.0);
    col += cyan * edgeGlow * 0.12 * u_metallic;

    // Fresnel-like metallic reflectance
    float fresnel = pow(1.0 - abs(f * 0.5 + 0.5), 3.0) * u_metallic;
    col += vec3(0.7, 0.75, 0.85) * fresnel * 0.25;

    // Specular highlight peaks
    float spec = smoothstep(0.6, 1.3, f * f * 3.0 + length(r) * 0.4);
    col += vec3(0.15, 0.16, 0.20) * spec;

    // Slight gamma correction for metallic contrast
    col = pow(col, vec3(1.05));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function LiquidMetal({
  className,
  speed = 0.15,
  metallic = 1.0,
  turbulence = 1.0,
  interactive = true,
}: LiquidMetalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1, y: -1 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2() },
      u_speed: { value: speed },
      u_metallic: { value: metallic },
      u_turbulence: { value: turbulence },
      u_mouse: { value: new THREE.Vector2(-1, -1) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.u_resolution.value.set(w * dpr, h * dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouseRef.current.x = e.clientX * dpr;
      mouseRef.current.y = (container.clientHeight - e.clientY) * dpr;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1;
      mouseRef.current.y = -1;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!interactive) return;
      e.preventDefault();
      const touch = e.touches[0];
      mouseRef.current.x = touch.clientX * dpr;
      mouseRef.current.y = (container.clientHeight - touch.clientY) * dpr;
    };

    const handleTouchEnd = () => {
      mouseRef.current.x = -1;
      mouseRef.current.y = -1;
    };

    window.addEventListener("resize", handleResize);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchstart", handleTouchMove as EventListener, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    handleResize();

    const clock = new THREE.Clock();
    const animate = () => {
      uniforms.u_time.value = clock.getElapsedTime();
      uniforms.u_mouse.value.set(mouseRef.current.x, mouseRef.current.y);
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchstart", handleTouchMove as EventListener);
      container.removeEventListener("touchend", handleTouchEnd);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (rendererRef.current?.domElement?.parentNode) {
        container.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [speed, metallic, turbulence, interactive]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className || ""}`}
    />
  );
}
