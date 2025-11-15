'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { AvatarType } from '@/app/types/avatar'

interface AvatarInstructionsProps {
  isVisible: boolean
  avatarType: AvatarType
}

export default function AvatarInstructions({ isVisible, avatarType }: AvatarInstructionsProps) {
  const [showInstructions, setShowInstructions] = useState(true)

  useEffect(() => {
    if (isVisible) {
      setShowInstructions(true)
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowInstructions(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, avatarType])

  const avatarMessages: Record<AvatarType, { emoji: string; title: string; tip: string }> = {
    human: {
      emoji: '🚶',
      title: 'Playing as REALISTIC HUMAN',
      tip: 'Use W/A/S/D to stay on the streets — Shift kicks in a sprint!'
    },
    scooter: {
      emoji: '🛵',
      title: 'Riding the RETRO MOPED',
      tip: 'Steer with W/A/S/D — Hold Shift for turbo engine & glowing wheels!'
    }
  }

  const message = avatarMessages[avatarType]

  return (
    <AnimatePresence>
      {isVisible && showInstructions && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-32 left-1/2 transform -translate-x-1/2 z-40"
          style={{
            background: 'linear-gradient(145deg, #EFE6D5 0%, #F5EBD9 100%)',
            border: '3px solid #D4501E',
            borderRadius: '8px',
            boxShadow: '0 8px 0 #B8431A, 0 10px 20px rgba(0,0,0,0.4)',
            padding: '16px 24px',
            imageRendering: 'pixelated',
            fontFamily: 'monospace',
            minWidth: '400px'
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setShowInstructions(false)}
            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center"
            style={{
              background: '#FF6B6B',
              border: '2px solid #FFF',
              borderRadius: '50%',
              color: '#FFF',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            ×
          </button>

          <div className="flex items-center gap-3">
            <span className="text-4xl">{message.emoji}</span>
            <div className="flex-1">
              <h3 
                className="text-sm font-bold mb-1"
                style={{
                  color: '#2C1810',
                  textShadow: '1px 1px 0 rgba(255,255,255,0.5)'
                }}
              >
                {message.title}
              </h3>
              <p 
                className="text-xs"
                style={{
                  color: '#5DA040',
                  fontWeight: 600
                }}
              >
                {message.tip}
              </p>
              <p 
                className="text-xs mt-2"
                style={{
                  color: '#666',
                  fontSize: '10px'
                }}
              >
                💡 Hold SHIFT to run faster!
              </p>
            </div>
          </div>

          {/* Pixelated corners */}
          <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
          <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

