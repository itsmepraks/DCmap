'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

interface DiscoveryAnimationProps {
  isVisible: boolean
  landmarkName: string
  landmarkIcon: string
  points: number
}

export default function DiscoveryAnimation({ 
  isVisible, 
  landmarkName, 
  landmarkIcon,
  points = 10
}: DiscoveryAnimationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%)'
          }}
        >
          {/* Confetti particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 0
              }}
              animate={{
                x: (Math.random() - 0.5) * 600,
                y: (Math.random() - 0.5) * 600,
                opacity: 0,
                scale: [0, 1.5, 0],
                rotate: Math.random() * 360
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.03,
                ease: 'easeOut'
              }}
              className="absolute"
              style={{
                width: '12px',
                height: '12px',
                background: ['#FFD700', '#FFA500', '#FF6347', '#7ED957', '#5DA5DB'][i % 5],
                borderRadius: '50%',
                boxShadow: '0 0 10px currentColor'
              }}
            />
          ))}

          {/* Star burst effect */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 2, 0],
                rotate: i * 45
              }}
              transition={{
                duration: 1,
                delay: 0.1,
                ease: 'easeOut'
              }}
              className="absolute"
              style={{
                width: '100px',
                height: '4px',
                background: 'linear-gradient(90deg, transparent 0%, #FFD700 50%, transparent 100%)',
                transformOrigin: 'center'
              }}
            />
          ))}

          {/* Main card */}
          <motion.div
            initial={{ scale: 0, rotate: -180, y: 100 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0, rotate: 180, y: -100 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15
            }}
            className="relative pointer-events-none"
            style={{
              background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
              border: `4px solid #FFD700`,
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(255, 215, 0, 0.5), 0 0 0 8px rgba(255, 215, 0, 0.2)',
              padding: '32px',
              minWidth: '320px',
              imageRendering: minecraftTheme.minecraft.imageRendering,
            }}
          >
            {/* Pixelated corners */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-black/40" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-black/40" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-black/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-black/40" />

            {/* Pulsing glow */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(255, 215, 0, 0.4)',
                  '0 0 40px rgba(255, 215, 0, 0.6)',
                  '0 0 20px rgba(255, 215, 0, 0.4)'
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 rounded-12px"
              style={{ pointerEvents: 'none' }}
            />

            {/* Content */}
            <div className="text-center relative z-10">
              {/* Icon with bounce */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 0.6,
                  repeat: 3,
                  ease: 'easeInOut'
                }}
                className="text-7xl mb-4"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }}
              >
                {landmarkIcon}
              </motion.div>

              {/* Discovery text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-2"
              >
                <div
                  className="text-sm font-bold mb-2"
                  style={{
                    color: '#FFD700',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    textShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                    letterSpacing: '2px'
                  }}
                >
                  ⭐ LANDMARK DISCOVERED! ⭐
                </div>
                <h2
                  className="text-2xl font-bold mb-3"
                  style={{
                    color: minecraftTheme.colors.terracotta.base,
                    fontFamily: 'monospace',
                    textShadow: '2px 2px 0 rgba(0,0,0,0.1)'
                  }}
                >
                  {landmarkName}
                </h2>
              </motion.div>

              {/* Points earned */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.5,
                  type: 'spring',
                  stiffness: 300,
                  damping: 10
                }}
                className="inline-block px-6 py-3"
                style={{
                  background: 'linear-gradient(135deg, #7ED957 0%, #5DA040 100%)',
                  border: '3px solid #5DA040',
                  borderRadius: '8px',
                  boxShadow: '0 6px 0 #5DA040, 0 8px 16px rgba(0,0,0,0.3)'
                }}
              >
                <span
                  className="text-xl font-bold"
                  style={{
                    color: '#FFF',
                    fontFamily: 'monospace',
                    textShadow: '2px 2px 0 rgba(0,0,0,0.3)'
                  }}
                >
                  +{points} XP
                </span>
              </motion.div>

              {/* Floating sparkles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [-20, -60],
                    x: (i - 3) * 30
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.7 + i * 0.1,
                    ease: 'easeOut'
                  }}
                  className="absolute"
                  style={{
                    top: '0',
                    left: '50%',
                    fontSize: '24px'
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Circular wave effect */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute"
            style={{
              width: '200px',
              height: '200px',
              border: '4px solid #FFD700',
              borderRadius: '50%',
              pointerEvents: 'none'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

