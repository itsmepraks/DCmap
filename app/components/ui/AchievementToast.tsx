'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface AchievementToastProps {
  isVisible: boolean
  landmarkName: string
  landmarkIcon: string
  funFact: string
  onDismiss: () => void
}

export default function AchievementToast({
  isVisible,
  landmarkName,
  landmarkIcon,
  funFact,
  onDismiss
}: AchievementToastProps) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onDismiss])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-24 right-8 z-50 pointer-events-auto"
          style={{
            width: '320px'
          }}
        >
          <div
            className="relative p-6 rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              border: '4px solid #B8860B',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.6), 0 8px 16px rgba(0,0,0,0.3)',
              imageRendering: 'pixelated',
              fontFamily: 'monospace'
            }}
          >
            {/* Animated sparkles background */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
              className="absolute inset-0 opacity-20"
              style={{
                background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)',
                backgroundSize: '200% 200%'
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="text-center mb-4"
              >
                <h3
                  className="text-xl font-bold mb-1"
                  style={{
                    color: '#2C1810',
                    textShadow: '2px 2px 0 rgba(255,255,255,0.5)',
                    letterSpacing: '1px'
                  }}
                >
                  🏆 ACHIEVEMENT UNLOCKED!
                </h3>
              </motion.div>

              {/* Landmark Info */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/90 rounded-lg p-4 mb-3"
                style={{
                  border: '2px solid #B8860B'
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{landmarkIcon}</span>
                  <h4
                    className="text-lg font-bold flex-1"
                    style={{
                      color: '#2C1810'
                    }}
                  >
                    {landmarkName}
                  </h4>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: '#5D4037'
                  }}
                >
                  💡 {funFact}
                </p>
              </motion.div>

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDismiss}
                className="w-full py-2 rounded-lg font-bold text-sm"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  color: '#FFF',
                  border: '2px solid rgba(0,0,0,0.3)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                Continue Exploring →
              </motion.button>
            </div>

            {/* Pixelated corners */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-black/20" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute top-0 right-0 w-2 h-2 bg-black/20" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-black/20" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-black/20" style={{ imageRendering: 'pixelated' }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


