'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistance } from '@/app/lib/proximityDetector'

interface CompassHUDProps {
  isVisible: boolean
  bearing: number
  nearestLandmark?: {
    name: string
    distance: number
    bearing: number
  }
}

export default function CompassHUD({ isVisible, bearing, nearestLandmark }: CompassHUDProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  
  // Normalize bearing to 0-360
  const normalizedBearing = ((bearing % 360) + 360) % 360

  // Get cardinal direction
  const getCardinalDirection = (deg: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(deg / 45) % 8
    return directions[index]
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-4 right-4 z-20"
        >
          {/* Compass Container */}
          <div
            className="relative px-6 py-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(93, 165, 219, 0.95) 0%, rgba(58, 124, 165, 0.95) 100%)',
              border: '3px solid #3A7CA5',
              boxShadow: '0 8px 0 #2A5C85, 0 12px 24px rgba(0,0,0,0.5)',
              imageRendering: 'pixelated',
              fontFamily: 'monospace',
              minWidth: isMinimized ? '120px' : '280px'
            }}
          >
            {/* Minimize Button */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded cursor-pointer"
              style={{
                background: '#2A5C85',
                border: '2px solid #1A4C75',
                color: '#FFD700',
                fontSize: '14px',
                fontWeight: 'bold',
                pointerEvents: 'auto'
              }}
            >
              {isMinimized ? '+' : '−'}
            </button>

            {/* Full Compass View */}
            {!isMinimized && (
              <>
                {/* Compass Circle */}
                <div className="flex items-center justify-center mb-3">
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '3px solid rgba(255,255,255,0.5)',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
                }}
              >
                {/* Cardinal directions */}
                <div
                  className="absolute top-1 text-xs font-bold"
                  style={{
                    color: '#FFD700',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  N
                </div>
                <div
                  className="absolute right-1 text-xs font-bold"
                  style={{
                    color: '#FFF',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  E
                </div>
                <div
                  className="absolute bottom-1 text-xs font-bold"
                  style={{
                    color: '#FFF',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  S
                </div>
                <div
                  className="absolute left-1 text-xs font-bold"
                  style={{
                    color: '#FFF',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  W
                </div>

                {/* Compass needle */}
                <motion.div
                  animate={{ rotate: normalizedBearing }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                  className="absolute w-1 h-10"
                  style={{
                    background: 'linear-gradient(180deg, #FF0000 0%, #FFF 50%, #FFF 100%)',
                    transformOrigin: 'center',
                    boxShadow: '0 0 4px rgba(255,0,0,0.8)',
                    borderRadius: '2px'
                  }}
                />

                {/* Center dot */}
                <div
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: '#FFD700',
                    border: '2px solid #000',
                    boxShadow: '0 0 4px rgba(255,215,0,0.8)'
                  }}
                />
              </div>
            </div>

            {/* Bearing Display */}
            <div className="text-center mb-2">
              <div
                className="text-2xl font-bold"
                style={{
                  color: '#FFD700',
                  textShadow: '2px 2px 0 rgba(0,0,0,0.5)'
                }}
              >
                {getCardinalDirection(normalizedBearing)} {Math.round(normalizedBearing)}°
              </div>
            </div>

            {/* Nearest Landmark */}
            {nearestLandmark && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 pt-3 border-t-2"
                style={{
                  borderColor: 'rgba(255,255,255,0.3)'
                }}
              >
                <div
                  className="text-xs mb-1"
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                  }}
                >
                  🎯 Nearest Landmark
                </div>
                <div
                  className="text-sm font-bold mb-1"
                  style={{
                    color: '#FFF',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                  }}
                >
                  {nearestLandmark.name}
                </div>
                <div
                  className="text-lg font-bold"
                  style={{
                    color: '#FFD700',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                  }}
                >
                  📏 {formatDistance(nearestLandmark.distance)}
                </div>

                {/* Direction arrow to landmark */}
                <div className="flex items-center justify-center mt-2">
                  <motion.div
                    animate={{ rotate: nearestLandmark.bearing - normalizedBearing }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="text-2xl"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                    }}
                  >
                    ⬆️
                  </motion.div>
                </div>
              </motion.div>
            )}
              </>
            )}

            {/* Minimized View */}
            {isMinimized && (
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{
                    color: '#FFD700',
                    textShadow: '2px 2px 0 rgba(0,0,0,0.5)'
                  }}
                >
                  🧭 {getCardinalDirection(normalizedBearing)}
                </div>
                <div
                  className="text-xs mt-1"
                  style={{
                    color: 'rgba(255,255,255,0.9)'
                  }}
                >
                  {Math.round(normalizedBearing)}°
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


