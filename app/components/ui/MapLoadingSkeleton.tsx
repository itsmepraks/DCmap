'use client'

import { motion } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

export default function MapLoadingSkeleton() {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center"
      style={{
        background: 'linear-gradient(145deg, #EFE6D5 0%, #F5EBD9 100%)'
      }}
    >
      {/* Minecraft-themed loading screen */}
      <div className="text-center">
        {/* Animated map icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="text-8xl mb-6"
        >
          🗺️
        </motion.div>

        {/* Loading text */}
        <motion.h2
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-2xl font-bold mb-4"
          style={{
            color: minecraftTheme.colors.terracotta.base,
            fontFamily: 'monospace',
            textShadow: '2px 2px 0 rgba(0,0,0,0.1)'
          }}
        >
          Loading DC Explorer...
        </motion.h2>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-4 h-4 rounded-full"
              style={{
                background: minecraftTheme.colors.terracotta.base
              }}
            />
          ))}
        </div>

        {/* Loading tips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-6 py-4 max-w-md"
          style={{
            background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.base} 100%)`,
            border: `2px solid ${minecraftTheme.colors.terracotta.light}`,
            borderRadius: '8px'
          }}
        >
          <p className="text-sm"
            style={{
              color: minecraftTheme.colors.text.primary,
              fontFamily: 'monospace',
              lineHeight: '1.6'
            }}
          >
            💡 <strong>Tip:</strong> Click on landmarks to discover them and earn points!
          </p>
        </motion.div>

        {/* Pixelated loading bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="mt-6 mx-auto"
          style={{
            maxWidth: '300px',
            height: '8px',
            background: minecraftTheme.colors.beige.dark,
            border: `2px solid ${minecraftTheme.colors.terracotta.base}`,
            borderRadius: '4px',
            overflow: 'hidden',
            imageRendering: 'pixelated'
          }}
        >
          <motion.div
            animate={{
              x: [-300, 300]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              width: '50%',
              height: '100%',
              background: `linear-gradient(90deg, transparent 0%, ${minecraftTheme.colors.terracotta.base} 50%, transparent 100%)`
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

