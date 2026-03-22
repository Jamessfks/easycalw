'use client'

/**
 * 404 Not Found Page
 */

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-space" />
      <div className="absolute inset-0 stars-pattern opacity-30" />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-md">
        {/* Lost astronaut illustration */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="text-8xl mb-8"
        >
          🧑‍🚀
        </motion.div>
        
        {/* Error message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold text-space-cream mb-4"
        >
          Lost in Space
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-space-lavender/70 mb-8"
        >
          The coordinates you're looking for don't exist in this galaxy. 
          The event might have ended or never existed.
        </motion.p>
        
        {/* Return button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link 
            href="/"
            className="btn-glow inline-block"
          >
            Return to Base
          </Link>
        </motion.div>
        
        {/* Decorative elements */}
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
          className="absolute top-1/4 left-0 text-2xl opacity-20"
        >
          ✨
        </motion.div>
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 30, 0],
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
          className="absolute bottom-1/4 right-0 text-2xl opacity-20"
        >
          🌟
        </motion.div>
      </div>
    </div>
  )
}
