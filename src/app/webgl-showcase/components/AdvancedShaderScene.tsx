'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Suspense } from 'react'
import * as THREE from 'three'
import React from 'react'

function HolographicMaterial() {
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    // Simplex noise
    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 mod289(vec4 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 permute(vec4 x) {
      return mod289(((x*34.0)+1.0)*x);
    }

    vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
    }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute(permute(permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vec2 st = vUv;
      vec3 pos = vWorldPosition;

      // Create holographic interference patterns
      float pattern1 = sin(pos.x * 20.0 + uTime * 2.0) * cos(pos.y * 20.0 + uTime * 1.5);
      float pattern2 = sin(pos.z * 15.0 + uTime * 3.0) * sin(pos.x * 15.0 + uTime * 2.5);
      float pattern3 = cos(pos.y * 25.0 + uTime * 1.8) * cos(pos.z * 25.0 + uTime * 2.2);

      float hologram = (pattern1 + pattern2 + pattern3) * 0.33;
      hologram = sin(hologram * 10.0 + uTime) * 0.5 + 0.5;

      // Glass-like refraction effect
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);

      // Color mixing with holographic effect
      vec3 color = mix(uColor1, uColor2, hologram);
      color += fresnel * vec3(0.8, 0.9, 1.0) * 0.4;

      // Add scan lines
      float scanLine = sin(st.y * 100.0 + uTime * 5.0) * 0.5 + 0.5;
      color *= mix(0.8, 1.2, scanLine);

      gl_FragColor = vec4(color, 0.7);
    }
  `

  return (
    <shaderMaterial
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1024, 1024) },
        uColor1: { value: new THREE.Color(0.2, 0.8, 1.0) },
        uColor2: { value: new THREE.Color(1.0, 0.2, 0.8) }
      }}
      transparent={true}
      side={THREE.DoubleSide}
    />
  )
}

function GlassCube() {
  const meshRef = React.useRef<THREE.Mesh>(null!)
  const materialRef = React.useRef<THREE.ShaderMaterial>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      meshRef.current.rotation.y += 0.01
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <primitive object={HolographicMaterial()} ref={materialRef} />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ff6b6b" />

      <GlassCube />

      <EffectComposer>
        <Bloom intensity={0.8} kernelSize={3} luminanceThreshold={0.8} luminanceSmoothing={0.025} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.001, 0.001]} />
        <Noise blendFunction={BlendFunction.OVERLAY} premultiply={true} />
      </EffectComposer>
    </>
  )
}

export default function AdvancedShaderScene() {
  return (
    <div className="w-full h-screen bg-linear-to-br from-slate-900 to-slate-800">
      <Canvas>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}