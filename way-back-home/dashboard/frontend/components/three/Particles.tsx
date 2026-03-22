'use client'

/**
 * Floating Particles
 * Dreamy spores and dust floating through the atmosphere
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticlesProps {
  count?: number
  radius?: number
  colors?: string[]
}

export function FloatingParticles({
  count = 200,
  radius = 5,
  colors = ['#C4B5E0', '#A8E6CF', '#F8B4B4', '#FF9F43', '#FFF8F0'],
}: ParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null)
  
  // Generate particle positions and attributes
  const { positions, particleColors, sizes, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const particleColors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const speeds = new Float32Array(count)
    
    const colorObjects = colors.map(c => new THREE.Color(c))
    
    for (let i = 0; i < count; i++) {
      // Random position in a sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * (0.5 + Math.random() * 0.5)
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      
      // Random color from palette
      const color = colorObjects[Math.floor(Math.random() * colorObjects.length)]
      particleColors[i * 3] = color.r
      particleColors[i * 3 + 1] = color.g
      particleColors[i * 3 + 2] = color.b
      
      // Random size
      sizes[i] = 0.02 + Math.random() * 0.04
      
      // Random speed for animation
      speeds[i] = 0.2 + Math.random() * 0.5
    }
    
    return { positions, particleColors, sizes, speeds }
  }, [count, radius, colors])
  
  // Animate particles
  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const speed = speeds[i]
        
        // Gentle floating motion
        positions[i3] += Math.sin(state.clock.elapsedTime * speed + i) * 0.001
        positions[i3 + 1] += Math.cos(state.clock.elapsedTime * speed * 0.7 + i) * 0.001
        positions[i3 + 2] += Math.sin(state.clock.elapsedTime * speed * 0.5 + i * 0.5) * 0.001
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true
      
      // Slow rotation of the whole particle system
      particlesRef.current.rotation.y += 0.0005
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particleColors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/**
 * Larger, slower-moving glowing orbs
 */
export function GlowingOrbs({ count = 15, radius = 4 }: { count?: number; radius?: number }) {
  const orbsRef = useRef<THREE.Group>(null)
  
  const orbs = useMemo(() => {
    const items: { position: [number, number, number]; scale: number; color: string; speed: number }[] = []
    const colors = ['#FF9F43', '#A8E6CF', '#C4B5E0']
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * (0.6 + Math.random() * 0.4)
      
      items.push({
        position: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ],
        scale: 0.03 + Math.random() * 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.5 + Math.random() * 1,
      })
    }
    
    return items
  }, [count, radius])
  
  useFrame((state) => {
    if (orbsRef.current) {
      orbsRef.current.children.forEach((orb, i) => {
        const data = orbs[i]
        // Pulsing glow
        const scale = data.scale * (1 + Math.sin(state.clock.elapsedTime * data.speed) * 0.3)
        orb.scale.setScalar(scale)
        
        // Gentle drift
        orb.position.x = data.position[0] + Math.sin(state.clock.elapsedTime * 0.2 + i) * 0.1
        orb.position.y = data.position[1] + Math.cos(state.clock.elapsedTime * 0.15 + i) * 0.1
        orb.position.z = data.position[2] + Math.sin(state.clock.elapsedTime * 0.1 + i * 0.5) * 0.1
      })
    }
  })
  
  return (
    <group ref={orbsRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position}>
          <sphereGeometry args={[orb.scale, 16, 16]} />
          <meshBasicMaterial 
            color={orb.color} 
            transparent 
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}

export default FloatingParticles
