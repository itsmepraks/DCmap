'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

interface WorldBorderWarningProps {
  isVisible: boolean
  direction: string
}

export default function WorldBorderWarning({ isVisible, direction }: WorldBorderWarningProps) {
  const getDirectionText = (dir: string) => {
    const directions: { [key: string]: string } = {
      north: 'Northern',
      south: 'Southern',
      east: 'Eastern',
      west: 'Western'
    }
    return directions[dir] || ''
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30"
        >
          <div
            className="px-6 py-4 flex items-center gap-3"
            style={{
              background: `linear-gradient(145deg, ${minecraftTheme.colors.terracotta.base} 0%, ${minecraftTheme.colors.terracotta.dark} 100%)`,
              border: `3px solid #8B0000`,
              borderRadius: '8px',
              boxShadow: '0 8px 0 #8B0000, 0 10px 20px rgba(139, 0, 0, 0.5)',
              imageRendering: minecraftTheme.minecraft.imageRendering,
            }}
          >
            {/* Pixelated corners */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-black/40" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-black/40" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-black/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-black/40" />

            {/* Warning icon with pulse */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
              className="text-3xl"
            >
              ⚠️
            </motion.div>

            {/* Text */}
            <div>
              <div
                className="text-sm font-bold"
                style={{
                  color: '#FFD700',
                  fontFamily: 'monospace',
                  textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                World Border Reached!
              </div>
              <div
                className="text-xs"
                style={{
                  color: '#FFF',
                  fontFamily: 'monospace',
                  textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                }}
              >
                You&apos;ve reached the {getDirectionText(direction)} edge of the DC Metro Area
              </div>
            </div>

            {/* Particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: (i - 2) * 20,
                  y: [0, -20, -40]
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity
                }}
                className="absolute top-0"
                style={{
                  width: '4px',
                  height: '4px',
                  background: '#FFD700',
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

