'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Suspense } from 'react'
import * as THREE from 'three'
import React from 'react'

function LiquidMarbleMaterial() {
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    // Noise functions
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
      vec3 pos = vPosition;

      // Create multiple layers of noise
      float noise1 = snoise(vec3(pos.x * 2.0, pos.y * 2.0, pos.z * 2.0 + uTime * 0.5));
      float noise2 = snoise(vec3(pos.x * 4.0, pos.y * 4.0, pos.z * 4.0 + uTime * 0.3));
      float noise3 = snoise(vec3(pos.x * 8.0, pos.y * 8.0, pos.z * 8.0 + uTime * 0.1));

      // Combine noises for marble effect
      float marble = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      marble = sin(marble * 10.0 + uTime) * 0.5 + 0.5;

      // Color palette
      vec3 color1 = vec3(0.1, 0.3, 0.8); // Deep blue
      vec3 color2 = vec3(0.8, 0.2, 0.4); // Pink
      vec3 color3 = vec3(0.9, 0.8, 0.2); // Gold
      vec3 color4 = vec3(0.2, 0.8, 0.4); // Green

      vec3 color = mix(color1, color2, marble);
      color = mix(color, color3, pow(marble, 2.0));
      color = mix(color, color4, pow(marble, 4.0));

      // Add fresnel effect
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);
      color += fresnel * vec3(0.8, 0.9, 1.0) * 0.3;

      gl_FragColor = vec4(color, 1.0);
    }
  `

  return (
    <shaderMaterial
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1024, 1024) }
      }}
      onBeforeCompile={(shader) => {
        shader.uniforms.uTime = { value: 0 }
        shader.uniforms.uResolution = { value: new THREE.Vector2(1024, 1024) }
      }}
    />
  )
}

function ParticleSystem() {
  const particlesRef = React.useRef<THREE.Points>(null!)

  React.useEffect(() => {
    const positions = new Float32Array(1000 * 3)
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  }, [])

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial size={0.02} color="#ffffff" transparent opacity={0.6} />
    </points>
  )
}

function Scene() {
  const materialRef = React.useRef<THREE.ShaderMaterial>(null!)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <primitive object={LiquidMarbleMaterial()} ref={materialRef} />
      </mesh>

      <ParticleSystem />

      <EffectComposer>
        <Bloom intensity={0.5} kernelSize={3} luminanceThreshold={0.9} luminanceSmoothing={0.025} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.002, 0.002]} />
      </EffectComposer>
    </>
  )
}

export default function AdvancedWebGLScene() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}