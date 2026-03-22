'use client'

/**
 * Celestial Background
 * Beautiful animated planets and celestial objects that react when cursor gets close
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'

interface CelestialObject {
  id: number
  type: 'planet' | 'ringed' | 'moon' | 'asteroid'
  x: number // percentage
  y: number // percentage
  size: number
  color: string
  ringColor?: string
  interactionRadius: number // how close cursor needs to be to affect it
  pushStrength: number // how much it moves away from cursor
  floatDuration: number
  floatDelay: number
  rotationDuration?: number
}

// Generate celestial objects
const celestialObjects: CelestialObject[] = [
  // Large ringed planet - top right
  {
    id: 1,
    type: 'ringed',
    x: 80,
    y: 15,
    size: 120,
    color: '#C4B5E0',
    ringColor: '#F8B4B4',
    interactionRadius: 200,
    pushStrength: 25,
    floatDuration: 8,
    floatDelay: 0,
    rotationDuration: 60,
  },
  // Medium planet - left side
  {
    id: 2,
    type: 'planet',
    x: 10,
    y: 30,
    size: 80,
    color: '#E8A87C',
    interactionRadius: 150,
    pushStrength: 30,
    floatDuration: 10,
    floatDelay: 1,
  },
  // Small moon - top left
  {
    id: 3,
    type: 'moon',
    x: 20,
    y: 10,
    size: 24,
    color: '#FFF8F0',
    interactionRadius: 100,
    pushStrength: 40,
    floatDuration: 6,
    floatDelay: 0.5,
  },
  // Ringed planet - bottom left
  {
    id: 4,
    type: 'ringed',
    x: 5,
    y: 75,
    size: 100,
    color: '#A8E6CF',
    ringColor: '#C4B5E0',
    interactionRadius: 180,
    pushStrength: 28,
    floatDuration: 12,
    floatDelay: 2,
    rotationDuration: 45,
  },
  // Small planet - right side
  {
    id: 5,
    type: 'planet',
    x: 90,
    y: 60,
    size: 50,
    color: '#F8B4B4',
    interactionRadius: 120,
    pushStrength: 35,
    floatDuration: 7,
    floatDelay: 1.5,
  },
  // Tiny moon - center-ish
  {
    id: 6,
    type: 'moon',
    x: 65,
    y: 40,
    size: 16,
    color: '#DED4F0',
    interactionRadius: 80,
    pushStrength: 45,
    floatDuration: 5,
    floatDelay: 0,
  },
  // Medium planet - bottom right
  {
    id: 7,
    type: 'planet',
    x: 75,
    y: 85,
    size: 70,
    color: '#FF9F43',
    interactionRadius: 140,
    pushStrength: 32,
    floatDuration: 9,
    floatDelay: 3,
  },
  // Small asteroid cluster - scattered
  {
    id: 8,
    type: 'asteroid',
    x: 30,
    y: 55,
    size: 12,
    color: '#9B8AC4',
    interactionRadius: 60,
    pushStrength: 50,
    floatDuration: 4,
    floatDelay: 0.3,
  },
  {
    id: 9,
    type: 'asteroid',
    x: 45,
    y: 20,
    size: 10,
    color: '#7DD3B0',
    interactionRadius: 50,
    pushStrength: 55,
    floatDuration: 3.5,
    floatDelay: 0.7,
  },
  {
    id: 10,
    type: 'asteroid',
    x: 55,
    y: 70,
    size: 14,
    color: '#D4855A',
    interactionRadius: 65,
    pushStrength: 48,
    floatDuration: 4.5,
    floatDelay: 1.2,
  },
  // Extra small moon - top center
  {
    id: 11,
    type: 'moon',
    x: 40,
    y: 8,
    size: 20,
    color: '#F4C9A8',
    interactionRadius: 90,
    pushStrength: 42,
    floatDuration: 6.5,
    floatDelay: 2.5,
  },
  // Large background planet - very subtle movement
  {
    id: 12,
    type: 'planet',
    x: 50,
    y: 90,
    size: 200,
    color: '#2D2640',
    interactionRadius: 250,
    pushStrength: 10,
    floatDuration: 15,
    floatDelay: 0,
  },
]

/**
 * Individual Planet Component with proximity-based cursor reaction
 */
function Planet({ obj, mouseX, mouseY, containerWidth, containerHeight }: { 
  obj: CelestialObject
  mouseX: number
  mouseY: number
  containerWidth: number
  containerHeight: number
}) {
  // Calculate planet center position in pixels
  const planetCenterX = (obj.x / 100) * containerWidth
  const planetCenterY = (obj.y / 100) * containerHeight
  
  // Calculate distance from cursor to planet center
  const dx = mouseX - planetCenterX
  const dy = mouseY - planetCenterY
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // Only apply push effect if cursor is within interaction radius
  let offsetX = 0
  let offsetY = 0
  
  if (distance < obj.interactionRadius && distance > 0) {
    // Calculate push direction (away from cursor)
    const pushFactor = 1 - (distance / obj.interactionRadius) // Stronger when closer
    const angle = Math.atan2(dy, dx)
    
    // Push away from cursor
    offsetX = -Math.cos(angle) * obj.pushStrength * pushFactor
    offsetY = -Math.sin(angle) * obj.pushStrength * pushFactor
  }
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${obj.x}%`,
        top: `${obj.y}%`,
        width: obj.size,
        height: obj.size,
        marginLeft: -obj.size / 2,
        marginTop: -obj.size / 2,
      }}
      animate={{
        x: offsetX,
        y: offsetY,
      }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 150,
        mass: 0.5,
      }}
    >
      {/* Floating animation wrapper */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: obj.rotationDuration ? 360 : 0,
        }}
        transition={{
          y: {
            duration: obj.floatDuration,
            delay: obj.floatDelay,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          rotate: obj.rotationDuration ? {
            duration: obj.rotationDuration,
            repeat: Infinity,
            ease: 'linear',
          } : undefined,
        }}
      >
        {obj.type === 'planet' && (
          <div
            className="rounded-full"
            style={{
              width: obj.size,
              height: obj.size,
              background: `radial-gradient(circle at 30% 30%, ${lightenColor(obj.color, 20)}, ${obj.color}, ${darkenColor(obj.color, 20)})`,
              boxShadow: `
                inset -${obj.size * 0.1}px -${obj.size * 0.1}px ${obj.size * 0.3}px rgba(0,0,0,0.3),
                inset ${obj.size * 0.05}px ${obj.size * 0.05}px ${obj.size * 0.2}px rgba(255,255,255,0.1),
                0 0 ${obj.size * 0.5}px ${obj.color}40
              `,
            }}
          />
        )}
        
        {obj.type === 'ringed' && (
          <div className="relative" style={{ width: obj.size, height: obj.size }}>
            {/* Planet body */}
            <div
              className="absolute rounded-full"
              style={{
                width: obj.size * 0.6,
                height: obj.size * 0.6,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle at 30% 30%, ${lightenColor(obj.color, 20)}, ${obj.color}, ${darkenColor(obj.color, 20)})`,
                boxShadow: `
                  inset -${obj.size * 0.06}px -${obj.size * 0.06}px ${obj.size * 0.2}px rgba(0,0,0,0.3),
                  inset ${obj.size * 0.03}px ${obj.size * 0.03}px ${obj.size * 0.1}px rgba(255,255,255,0.1)
                `,
              }}
            />
            {/* Ring */}
            <div
              className="absolute rounded-full border-4"
              style={{
                width: obj.size,
                height: obj.size * 0.3,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%) rotateX(70deg)',
                borderColor: obj.ringColor || '#F8B4B4',
                opacity: 0.7,
                boxShadow: `0 0 ${obj.size * 0.2}px ${obj.ringColor}60`,
              }}
            />
          </div>
        )}
        
        {obj.type === 'moon' && (
          <div
            className="rounded-full"
            style={{
              width: obj.size,
              height: obj.size,
              background: `radial-gradient(circle at 35% 35%, ${obj.color}, ${darkenColor(obj.color, 15)})`,
              boxShadow: `
                inset -${obj.size * 0.15}px -${obj.size * 0.15}px ${obj.size * 0.4}px rgba(0,0,0,0.2),
                0 0 ${obj.size * 0.8}px ${obj.color}50
              `,
            }}
          />
        )}
        
        {obj.type === 'asteroid' && (
          <div
            style={{
              width: obj.size,
              height: obj.size,
              background: obj.color,
              borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
              boxShadow: `0 0 ${obj.size}px ${obj.color}40`,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

/**
 * Twinkling Stars Background - completely static position
 */
function Stars() {
  const stars = useMemo(() => 
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
    })),
  [])
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/**
 * Main Celestial Background Component
 */
export function CelestialBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 }) // Start off-screen
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }
    
    const handleMouseLeave = () => {
      setMousePos({ x: -1000, y: -1000 }) // Move cursor "off-screen" when leaving
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])
  
  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-gradient-to-b from-space-void via-space-void-light to-space-void"
    >
      {/* Static gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial-glow from-space-lavender/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Static stars - just twinkle, no movement */}
      <Stars />
      
      {/* Static nebula-like glow effects */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #C4B5E0 0%, transparent 70%)',
          left: '10%',
          top: '20%',
        }}
      />
      <div 
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #A8E6CF 0%, transparent 70%)',
          right: '15%',
          bottom: '30%',
        }}
      />
      <div 
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #FF9F43 0%, transparent 70%)',
          left: '50%',
          top: '60%',
        }}
      />
      
      {/* Celestial objects - only these react to cursor proximity */}
      {celestialObjects.map((obj) => (
        <Planet 
          key={obj.id} 
          obj={obj} 
          mouseX={mousePos.x} 
          mouseY={mousePos.y}
          containerWidth={dimensions.width}
          containerHeight={dimensions.height}
        />
      ))}
      
      {/* Static noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none noise-overlay" />
    </div>
  )
}

// Utility functions for color manipulation
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) - amt
  const G = (num >> 8 & 0x00FF) - amt
  const B = (num & 0x0000FF) - amt
  return '#' + (
    0x1000000 +
    (R > 0 ? R : 0) * 0x10000 +
    (G > 0 ? G : 0) * 0x100 +
    (B > 0 ? B : 0)
  ).toString(16).slice(1)
}

export default CelestialBackground