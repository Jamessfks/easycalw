'use client'

/**
 * Planet Component
 * A stylized low-poly alien planet with the Way Back Home aesthetic
 * Soft pastels, gentle animations, dreamy atmosphere
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PlanetProps {
  radius?: number
  autoRotate?: boolean
  rotationSpeed?: number
}

export function Planet({
  radius = 2,
  autoRotate = true,
  rotationSpeed = 0.05
}: PlanetProps) {
  const planetRef = useRef<THREE.Group>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)

  // Gentle rotation
  useFrame((state, delta) => {
    if (planetRef.current && autoRotate) {
      planetRef.current.rotation.y += delta * rotationSpeed
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.02
    }
  })

  // Create gradient texture for the planet surface
  const surfaceTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    // Create a warm, alien surface gradient
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    gradient.addColorStop(0, '#E8A87C') // Terracotta center
    gradient.addColorStop(0.3, '#F4C9A8') // Lighter terracotta
    gradient.addColorStop(0.5, '#DED4F0') // Lavender light
    gradient.addColorStop(0.7, '#C4B5E0') // Lavender
    gradient.addColorStop(1, '#A8E6CF') // Mint edges

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)

    // Add some subtle noise/texture
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const alpha = Math.random() * 0.1
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.beginPath()
      ctx.arc(x, y, Math.random() * 3, 0, Math.PI * 2)
      ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  // Atmosphere gradient
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color('#C4B5E0') },
        viewVector: { value: new THREE.Vector3(0, 0, 1) },
      },
      vertexShader: `
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(vec3(0.0, 0.0, 1.0));
          intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, intensity * 0.5);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    })
  }, [])

  return (
    <group ref={planetRef}>
      {/* Main planet sphere */}
      <mesh>
        <icosahedronGeometry args={[radius, 4]} />
        <meshStandardMaterial
          map={surfaceTexture}
          roughness={0.8}
          metalness={0.1}
          flatShading
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} material={atmosphereMaterial}>
        <sphereGeometry args={[radius * 1.15, 32, 32]} />
      </mesh>

      {/* Surface details - small bumps/hills */}
      <PlanetSurfaceDetails radius={radius} />
    </group>
  )
}

/**
 * Small surface details like hills and craters
 */
function PlanetSurfaceDetails({ radius }: { radius: number }) {
  const details = useMemo(() => {
    const items: { position: [number, number, number]; scale: number; color: string }[] = []

    // Generate random surface features
    for (let i = 0; i < 30; i++) {
      // Random point on sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      const colors = ['#A8E6CF', '#C4B5E0', '#E8A87C', '#F8B4B4']

      items.push({
        position: [x, y, z],
        scale: 0.05 + Math.random() * 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    return items
  }, [radius])

  return (
    <group>
      {details.map((detail, i) => (
        <mesh key={i} position={detail.position}>
          <sphereGeometry args={[detail.scale, 8, 8]} />
          <meshStandardMaterial
            color={detail.color}
            roughness={0.9}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Cone Trees - the iconic mint-colored vegetation
 */
export function ConeTrees({ planetRadius = 2, count = 20 }: { planetRadius?: number; count?: number }) {
  const treesRef = useRef<THREE.Group>(null)

  // Gentle sway animation
  useFrame((state) => {
    if (treesRef.current) {
      treesRef.current.children.forEach((tree, i) => {
        const offset = i * 0.5
        // Subtle sway at the tips
        tree.children[0].rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + offset) * 0.05
        tree.children[0].rotation.z = Math.cos(state.clock.elapsedTime * 0.3 + offset) * 0.05
      })
    }
  })

  const trees = useMemo(() => {
    const items: { position: THREE.Vector3; scale: number }[] = []

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      // Position on planet surface
      const r = planetRadius * 1.0
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      items.push({
        position: new THREE.Vector3(x, y, z),
        scale: 0.08 + Math.random() * 0.12,
      })
    }

    return items
  }, [planetRadius, count])

  return (
    <group ref={treesRef}>
      {trees.map((tree, i) => {
        // Calculate rotation to point away from planet center
        // The cone's default orientation is along the Y axis
        // We need to rotate it to point in the direction of the position vector
        const direction = tree.position.clone().normalize()
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)

        return (
          <group key={i} position={tree.position} quaternion={quaternion}>
            {/* Tree cone - now pointing outward from planet */}
            <mesh position={[0, tree.scale * 0.5, 0]}>
              <coneGeometry args={[tree.scale * 0.4, tree.scale * 1.0, 6]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? '#7DD3B0' : '#A8E6CF'}
                roughness={0.8}
                flatShading
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export default Planet