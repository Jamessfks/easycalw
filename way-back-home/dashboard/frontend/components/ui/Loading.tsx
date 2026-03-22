'use client'

/**
 * Loading Screen
 * Beautiful animated loading state
 */

import { motion } from 'framer-motion'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 bg-space-void flex flex-col items-center justify-center">
      {/* Stars background */}
      <div className="absolute inset-0 stars-pattern opacity-30" />
      
      {/* Loading content */}
      <div className="relative z-10 text-center">
        {/* Animated planet */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="w-24 h-24 mx-auto mb-8 relative"
        >
          {/* Planet */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-space-lavender to-space-terracotta" />
          
          {/* Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div 
              className="absolute top-1/2 left-1/2 w-32 h-8 -translate-x-1/2 -translate-y-1/2 
                         rounded-full border-2 border-space-peach/40"
              style={{ transform: 'translateX(-50%) translateY(-50%) rotateX(70deg)' }}
            />
          </motion.div>
          
          {/* Orbiting moon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div className="absolute -top-2 left-1/2 w-3 h-3 rounded-full bg-space-cream shadow-lg" />
          </motion.div>
        </motion.div>
        
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-3xl font-bold text-space-cream mb-2"
        >
          Way Back Home
        </motion.h1>
        
        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-space-lavender/60 mb-6"
        >
          Scanning the cosmos...
        </motion.p>
        
        {/* Loading bar */}
        <div className="w-48 mx-auto">
          <div className="h-1 bg-space-void-lighter rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: 'easeInOut',
              }}
              className="h-full w-1/2 bg-gradient-to-r from-space-mint via-space-orange to-space-lavender rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Error screen
 */
export function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-space-void flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🛸</div>
        <h1 className="font-display text-2xl font-bold text-space-cream mb-2">
          Lost in Space
        </h1>
        <p className="text-space-lavender/60 mb-6">
          {message}
        </p>
        <a 
          href="/"
          className="btn-glow inline-block"
        >
          Return to Base
        </a>
      </div>
    </div>
  )
}

export default LoadingScreen
