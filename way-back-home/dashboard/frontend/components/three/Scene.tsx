'use client'

/**
 * Main 3D Scene
 * Combines planet, particles, markers, and environment
 */

import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  Stars,
  Float,
  PerspectiveCamera,
} from '@react-three/drei'
import * as THREE from 'three'

import { Planet, ConeTrees } from './Planet'
import { FloatingParticles, GlowingOrbs } from './Particles'
import { ParticipantMarkers } from './ParticipantMarkers'
import { useMapStore } from '@/lib/store'

/**
 * Background stars with custom colors
 */
function SpaceBackground() {
  return (
    <>
      <Stars 
        radius={100} 
        depth={50} 
        count={3000} 
        factor={4} 
        saturation={0.5}
        fade 
        speed={0.5}
      />
      {/* Add a subtle space gradient */}
      <mesh>
        <sphereGeometry args={[80, 32, 32]} />
        <meshBasicMaterial 
          color="#1A1625" 
          side={THREE.BackSide}
        />
      </mesh>
    </>
  )
}

/**
 * Distant ringed planet in the background
 */
function RingedPlanet() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.01
    }
  })
  
  return (
    <Float
      speed={0.5}
      rotationIntensity={0.1}
      floatIntensity={0.2}
      floatingRange={[-0.1, 0.1]}
    >
      <group ref={groupRef} position={[15, 8, -20]} rotation={[0.3, 0, 0.2]}>
        {/* Planet body */}
        <mesh>
          <sphereGeometry args={[3, 32, 32]} />
          <meshStandardMaterial 
            color="#C4B5E0"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        
        {/* Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4, 6, 64]} />
          <meshStandardMaterial 
            color="#F8B4B4"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </Float>
  )
}

/**
 * Small moons orbiting in the distance
 */
function Moons() {
  const moon1Ref = useRef<THREE.Mesh>(null)
  const moon2Ref = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (moon1Ref.current) {
      moon1Ref.current.position.x = Math.cos(state.clock.elapsedTime * 0.1) * 12
      moon1Ref.current.position.z = Math.sin(state.clock.elapsedTime * 0.1) * 12
    }
    if (moon2Ref.current) {
      moon2Ref.current.position.x = Math.cos(state.clock.elapsedTime * 0.07 + 2) * 15
      moon2Ref.current.position.z = Math.sin(state.clock.elapsedTime * 0.07 + 2) * 15
    }
  })
  
  return (
    <>
      <mesh ref={moon1Ref} position={[12, 5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FFF8F0" />
      </mesh>
      <mesh ref={moon2Ref} position={[-15, 3, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#E8A87C" />
      </mesh>
    </>
  )
}

/**
 * Custom lighting for the dreamy atmosphere
 */
function Lighting() {
  return (
    <>
      {/* Main warm light (alien sun) */}
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.5}
        color="#FFE4C9"
        castShadow
      />
      
      {/* Fill light (cool) */}
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={0.5}
        color="#C4B5E0"
      />
      
      {/* Ambient light */}
      <ambientLight intensity={0.4} color="#DED4F0" />
      
      {/* Rim light for the planet */}
      <pointLight 
        position={[-8, 0, -8]} 
        intensity={0.8}
        color="#A8E6CF"
      />
    </>
  )
}

/**
 * Camera controller with auto-rotation and focus on selected participant
 */
function CameraController() {
  const { autoRotate, selectedParticipant } = useMapStore()
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  
  // When a participant is selected, rotate to focus on them
  useEffect(() => {
    if (selectedParticipant && controlsRef.current && 
        typeof selectedParticipant.x === 'number' && 
        typeof selectedParticipant.y === 'number') {
      // Convert participant coordinates to spherical position
      // x is 0-360 (longitude), y is 0-180 (latitude)
      const longitude = (selectedParticipant.x / 360) * Math.PI * 2
      const latitude = ((selectedParticipant.y / 180) - 0.5) * Math.PI
      
      // Calculate camera position to look at this point on the sphere
      // We want to position the camera so it's looking at the marker
      const radius = 6 // Camera distance
      const targetX = radius * Math.cos(latitude) * Math.cos(longitude)
      const targetY = radius * Math.sin(latitude) + 1 // Slight elevation
      const targetZ = radius * Math.cos(latitude) * Math.sin(longitude)
      
      // Smoothly animate camera position
      const startPos = camera.position.clone()
      const endPos = new THREE.Vector3(targetX, targetY, targetZ)
      
      let progress = 0
      const animate = () => {
        progress += 0.02
        if (progress < 1) {
          camera.position.lerpVectors(startPos, endPos, easeOutCubic(progress))
          camera.lookAt(0, 0, 0)
          controlsRef.current?.update()
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
  }, [selectedParticipant, camera])
  
  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={4}
      maxDistance={12}
      autoRotate={autoRotate && !selectedParticipant} // Pause rotation when viewing someone
      autoRotateSpeed={0.3}
      maxPolarAngle={Math.PI * 0.75}
      minPolarAngle={Math.PI * 0.25}
      dampingFactor={0.05}
      enableDamping
    />
  )
}

// Easing function for smooth animation
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Main scene content
 */
function SceneContent() {
  const planetRadius = 2
  
  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 2, 6]} fov={50} />
      <CameraController />
      
      {/* Environment */}
      <Lighting />
      <SpaceBackground />
      <RingedPlanet />
      <Moons />
      
      {/* Particles */}
      <FloatingParticles count={150} radius={5} />
      <GlowingOrbs count={12} radius={4.5} />
      
      {/* Planet */}
      <Float
        speed={0.3}
        rotationIntensity={0}
        floatIntensity={0.1}
        floatingRange={[-0.05, 0.05]}
      >
        <group>
          <Planet radius={planetRadius} autoRotate={false} />
          <ConeTrees planetRadius={planetRadius} count={25} />
          <ParticipantMarkers planetRadius={planetRadius} />
        </group>
      </Float>
    </>
  )
}

/**
 * Loading fallback
 */
function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="#C4B5E0" wireframe />
    </mesh>
  )
}

/**
 * Main exported component
 */
export function Scene3D() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#1A1625']} />
        <fog attach="fog" args={['#1A1625', 10, 50]} />
        
        <Suspense fallback={<Loader />}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default Scene3D