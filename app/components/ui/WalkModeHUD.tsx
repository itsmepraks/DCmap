'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WalkModeHUDProps {
  isVisible: boolean
}

export default function WalkModeHUD({ isVisible }: WalkModeHUDProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-4 z-20 max-w-sm"
        >
          {/* Compact control panel - Minecraft style */}
          <div
            className="px-4 py-3 rounded-lg relative"
            style={{
              background: 'linear-gradient(145deg, rgba(74, 124, 36, 0.92) 0%, rgba(46, 95, 26, 0.92) 100%)',
              border: '3px solid #2E5F1A',
              boxShadow: '0 6px 0 #1E4F0A, 0 10px 20px rgba(0,0,0,0.5)',
              imageRendering: 'pixelated',
              fontFamily: 'monospace'
            }}
          >
            {/* Minimize Button */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded cursor-pointer"
              style={{
                background: '#2E5F1A',
                border: '2px solid #1E4F0A',
                color: '#FFD700',
                fontSize: '14px',
                fontWeight: 'bold',
                pointerEvents: 'auto'
              }}
            >
              {isMinimized ? '+' : '−'}
            </button>

            {/* Title */}
            <div className="text-center mb-3">
              <motion.h3
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-base font-bold"
                style={{
                  color: '#FFD700',
                  textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                  letterSpacing: '1px'
                }}
              >
                🚶 {isMinimized ? 'CONTROLS' : 'WALK MODE'}
              </motion.h3>
            </div>

            {/* Compact Controls */}
            {!isMinimized && (
              <div className="space-y-2 text-xs" style={{ color: '#FFF' }}>
                <div className="flex items-center gap-2">
                  <kbd
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      background: '#2E5F1A',
                      border: '2px solid #1E4F0A',
                      boxShadow: '0 2px 0 #0E3F00',
                      fontWeight: 'bold',
                      minWidth: '32px',
                      textAlign: 'center'
                    }}
                  >
                    WASD
                  </kbd>
                  <span>Move</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      background: '#FF6B6B',
                      border: '2px solid #C92A2A',
                      boxShadow: '0 2px 0 #A61E1E',
                      fontWeight: 'bold',
                      color: '#FFF',
                      minWidth: '32px',
                      textAlign: 'center'
                    }}
                  >
                    SHIFT
                  </kbd>
                  <span style={{ color: '#FFD700', fontWeight: 'bold' }}>Run! 🏃</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      background: '#2E5F1A',
                      border: '2px solid #1E4F0A',
                      boxShadow: '0 2px 0 #0E3F00',
                      fontWeight: 'bold',
                      minWidth: '32px',
                      textAlign: 'center'
                    }}
                  >
                    DRAG
                  </kbd>
                  <span>Look</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      background: '#2E5F1A',
                      border: '2px solid #1E4F0A',
                      boxShadow: '0 2px 0 #0E3F00',
                      fontWeight: 'bold',
                      minWidth: '32px',
                      textAlign: 'center'
                    }}
                  >
                    ESC
                  </kbd>
                  <span>Exit</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

