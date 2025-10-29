'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface CompassHUDProps {
  isVisible: boolean
  bearing: number
  nearestLandmark?: {
    name: string
    distance: number
  }
}

export default function CompassHUD({ isVisible, bearing, nearestLandmark }: CompassHUDProps) {
  const [compassRotation, setCompassRotation] = useState(0)

  useEffect(() => {
    setCompassRotation(-bearing)
  }, [bearing])

  const getCardinalDirection = (bearing: number) => {
    const normalized = ((bearing % 360) + 360) % 360
    if (normalized >= 337.5 || normalized < 22.5) return 'N'
    if (normalized >= 22.5 && normalized < 67.5) return 'NE'
    if (normalized >= 67.5 && normalized < 112.5) return 'E'
    if (normalized >= 112.5 && normalized < 157.5) return 'SE'
    if (normalized >= 157.5 && normalized < 202.5) return 'S'
    if (normalized >= 202.5 && normalized < 247.5) return 'SW'
    if (normalized >= 247.5 && normalized < 292.5) return 'W'
    return 'NW'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
          className="fixed top-6 right-6 z-30"
        >
          {/* Compass */}
          <div
            className="w-16 h-16 rounded-full shadow-lg mb-3 flex items-center justify-center relative"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: compassRotation }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <div className="text-2xl">🧭</div>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs font-bold text-gray-900">
                {getCardinalDirection(bearing)}
              </div>
            </div>
          </div>

          {/* Nearest Landmark */}
          {nearestLandmark && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-4 py-2.5 rounded-2xl shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                minWidth: '180px'
              }}
            >
              <div className="text-[10px] font-medium text-gray-500 mb-0.5">
                🎯 NEAREST LANDMARK
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {nearestLandmark.name}
              </div>
              <div className="text-xs font-medium text-blue-600 mt-1">
                📍 {nearestLandmark.distance.toFixed(1)}km away
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
