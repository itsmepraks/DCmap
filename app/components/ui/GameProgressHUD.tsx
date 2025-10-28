'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GameProgressHUDProps {
  isVisible: boolean
  visitedCount: number
  totalCount: number
  currentLocation?: string
}

export default function GameProgressHUD({
  isVisible,
  visitedCount,
  totalCount,
  currentLocation
}: GameProgressHUDProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const percentage = (visitedCount / totalCount) * 100

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-64 right-4 z-20"
        >
          <div
            className="px-6 py-4 rounded-xl relative"
            style={{
              background: 'linear-gradient(135deg, rgba(126, 217, 87, 0.95) 0%, rgba(74, 124, 36, 0.95) 100%)',
              border: '3px solid #4A7C24',
              boxShadow: '0 8px 0 #2E5F1A, 0 12px 24px rgba(0,0,0,0.5)',
              imageRendering: 'pixelated',
              fontFamily: 'monospace',
              minWidth: isMinimized ? '120px' : '240px'
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
              <h3
                className="text-lg font-bold"
                style={{
                  color: '#FFD700',
                  textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                  letterSpacing: '1px'
                }}
              >
                🎮 {isMinimized ? `${visitedCount}/${totalCount}` : 'EXPLORATION'}
              </h3>
            </div>

            {/* Full Progress View */}
            {!isMinimized && (
              <>
                {/* Progress Counter */}
                <div className="mb-3 text-center">
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{
                      color: '#FFF',
                      textShadow: '2px 2px 0 rgba(0,0,0,0.5)'
                    }}
                  >
                    {visitedCount}/{totalCount}
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.3)'
                    }}
                  >
                    Landmarks Discovered
                  </div>
                </div>

                {/* Progress Bar */}
            <div
              className="relative h-6 rounded-lg overflow-hidden mb-3"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '2px solid rgba(0,0,0,0.4)'
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0"
                style={{
                  background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)'
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                style={{
                  color: percentage > 50 ? '#2C1810' : '#FFF',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  mixBlendMode: 'difference'
                }}
              >
                {Math.round(percentage)}%
              </div>
            </div>

            {/* Current Location */}
            {currentLocation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center pt-2 border-t-2"
                style={{
                  borderColor: 'rgba(255,255,255,0.3)'
                }}
              >
                <div
                  className="text-xs mb-1"
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.3)'
                  }}
                >
                  📍 Current Area
                </div>
                <div
                  className="text-sm font-bold"
                  style={{
                    color: '#FFD700',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                  }}
                >
                  {currentLocation}
                </div>
              </motion.div>
            )}

            {/* Completion Message */}
            {visitedCount === totalCount && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="mt-3 text-center"
              >
                <div
                  className="text-sm font-bold"
                  style={{
                    color: '#FFD700',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                  }}
                >
                  🎉 ALL LANDMARKS FOUND!
                </div>
              </motion.div>
            )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


