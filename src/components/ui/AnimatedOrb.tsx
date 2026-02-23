import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import { Mesh } from 'three'

// Helper function to generate random positions
const generateRandomPositions = (count: number): [number, number, number][] => {
  return Array.from({ length: count }, () => [
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 6
  ] as [number, number, number])
}

// Inner component that uses R3F hooks
function OrbScene() {
  const meshRef = useRef<Mesh>(null)
  const particleRefs = useRef<Mesh[]>([])

  const positions = useMemo(() => generateRandomPositions(20), [])

  // Animate the main orb
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.x += 0.002
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      meshRef.current.scale.setScalar(scale)
    }
    // Animate particles
    particleRefs.current.forEach((particle, i) => {
      if (particle) {
        particle.position.y += Math.sin(state.clock.elapsedTime + i) * 0.01
        particle.rotation.x += 0.01
        particle.rotation.y += 0.01
      }
    })
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#6366f1" />
      <pointLight position={[5, -5, 5]} intensity={0.3} color="#ff6b6b" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      
      {/* Main Animated Orb */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.9}
          roughness={0.1}
          emissive="#1e1e2e"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Floating particles */}
      {positions.map((pos, i) => (
        <mesh 
          key={i} 
          ref={(el) => (particleRefs.current[i] = el!)} 
          position={pos}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#6366f1" />
        </mesh>
      ))}
    </>
  )
}

// Hero 3D Orb Component
export default function AnimatedOrb() {
  return (
    <Canvas 
      style={{ height: '400px', width: '100%' }}
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <OrbScene />
    </Canvas>
  )
}