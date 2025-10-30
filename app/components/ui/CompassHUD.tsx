'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { minecraftTheme } from '@/app/lib/theme'

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
            className="w-20 h-20 shadow-lg mb-3 flex items-center justify-center relative"
            style={{
              background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
              border: `${minecraftTheme.minecraft.borderWidth} solid ${minecraftTheme.colors.terracotta.base}`,
              borderRadius: minecraftTheme.minecraft.borderRadius,
              boxShadow: minecraftTheme.minecraft.shadowCard,
              imageRendering: minecraftTheme.minecraft.imageRendering,
            }}
          >
            {/* Pixelated corners */}
            <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: compassRotation }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <div className="text-3xl">🧭</div>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="text-sm font-bold"
                style={{ 
                  color: minecraftTheme.colors.text.primary,
                  fontFamily: 'monospace'
                }}
              >
                {getCardinalDirection(bearing)}
              </div>
            </div>
          </div>

          {/* Nearest Landmark */}
          {nearestLandmark && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-4 py-3 shadow-lg relative"
              style={{
                background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.base} 100%)`,
                border: `2px solid ${minecraftTheme.colors.accent.orange}`,
                borderRadius: minecraftTheme.minecraft.borderRadius,
                boxShadow: '0 4px 0 #D4501E, 0 6px 12px rgba(0,0,0,0.3)',
                minWidth: '200px',
                imageRendering: minecraftTheme.minecraft.imageRendering,
              }}
            >
              {/* Pixelated corners */}
              <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />

              <div 
                className="text-[10px] font-bold mb-1"
                style={{ 
                  color: minecraftTheme.colors.text.light,
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px'
                }}
              >
                🎯 NEAREST LANDMARK
              </div>
              <div 
                className="text-sm font-bold"
                style={{ 
                  color: minecraftTheme.colors.text.primary,
                  fontFamily: 'monospace'
                }}
              >
                {nearestLandmark.name}
              </div>
              <div 
                className="text-xs font-bold mt-1"
                style={{ 
                  color: minecraftTheme.colors.terracotta.base,
                  fontFamily: 'monospace'
                }}
              >
                📍 {nearestLandmark.distance.toFixed(1)}km away
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
