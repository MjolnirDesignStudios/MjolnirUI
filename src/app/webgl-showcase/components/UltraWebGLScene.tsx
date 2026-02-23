'use client'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Suspense, useRef, useMemo } from 'react'
import * as THREE from 'three'

function UltraShaderMaterial() {
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;

      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      vec4 viewPosition = viewMatrix * worldPosition;
      vViewPosition = viewPosition.xyz;

      gl_Position = projectionMatrix * viewPosition;
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

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

    // Fractal Brownian Motion
    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;

      for(int i = 0; i < 5; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
      }

      return value;
    }

    void main() {
      vec2 st = vUv;
      vec3 pos = vWorldPosition;

      // Mouse interaction
      vec2 mouse = uMouse / uResolution;
      float mouseDistance = distance(st, mouse);
      float mouseInfluence = 1.0 / (mouseDistance * mouseDistance + 0.1);

      // Complex noise patterns
      float noise1 = fbm(vec3(pos.x * 3.0, pos.y * 3.0, pos.z * 3.0 + uTime * 0.5));
      float noise2 = fbm(vec3(pos.x * 6.0, pos.y * 6.0, pos.z * 6.0 + uTime * 0.3));
      float noise3 = fbm(vec3(pos.x * 12.0, pos.y * 12.0, pos.z * 12.0 + uTime * 0.1));

      // Combine with mouse interaction
      float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      combinedNoise += mouseInfluence * 0.2;

      // Create swirling patterns
      float angle = atan(pos.y, pos.x);
      float radius = length(pos.xy);
      float swirl = sin(angle * 8.0 + uTime * 2.0 + radius * 5.0) * 0.5 + 0.5;

      // Mix all effects
      float finalPattern = combinedNoise * swirl;
      finalPattern = sin(finalPattern * 15.0 + uTime * 3.0) * 0.5 + 0.5;

      // Color mixing with multiple gradients
      vec3 color = mix(uColor1, uColor2, finalPattern);
      color = mix(color, uColor3, pow(finalPattern, 2.0));

      // Fresnel effect
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - dot(viewDirection, vNormal), 4.0);
      color += fresnel * vec3(1.0, 1.0, 1.0) * 0.5;

      // Mouse glow effect
      color += mouseInfluence * vec3(0.8, 0.9, 1.0) * 0.3;

      // Rim lighting
      float rim = 1.0 - dot(viewDirection, vNormal);
      rim = pow(rim, 3.0);
      color += rim * vec3(0.5, 0.7, 1.0) * 0.4;

      gl_FragColor = vec4(color, 1.0);
    }
  `

  return (
    <shaderMaterial
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1024, 1024) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColor1: { value: new THREE.Color(0.1, 0.3, 0.9) },
        uColor2: { value: new THREE.Color(0.9, 0.2, 0.5) },
        uColor3: { value: new THREE.Color(0.2, 0.8, 0.4) }
      }}
    />
  )
}

function InteractiveSphere() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  const { size } = useThree()

  const mouse = useMemo(() => new THREE.Vector2(), [])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.2
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uMouse.value.copy(mouse)
    }
  })

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    mouse.x = (event.clientX / size.width) * 2 - 1
    mouse.y = -(event.clientY / size.height) * 2 + 1
  }

  return (
    <mesh ref={meshRef} onPointerMove={handlePointerMove}>
      <sphereGeometry args={[2, 128, 128]} />
      <primitive object={UltraShaderMaterial()} ref={materialRef} />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.6} color="#ff4444" />
      <pointLight position={[5, -5, 5]} intensity={0.6} color="#4444ff" />

      <InteractiveSphere />

      <EffectComposer>
        <Bloom intensity={1.0} kernelSize={3} luminanceThreshold={0.7} luminanceSmoothing={0.025} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.003, 0.003]} />
        <Noise blendFunction={BlendFunction.OVERLAY} premultiply={true} />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
        <ToneMapping adaptive={true} resolution={256} middleGrey={0.6} maxLuminance={16.0} averageLuminance={1.0} adaptationRate={2.0} />
      </EffectComposer>
    </>
  )
}

export default function UltraWebGLScene() {
  return (
    <div className="w-full h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Canvas>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}