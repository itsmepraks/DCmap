'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'
import { usePlayerState } from '@/app/lib/playerState'

interface ConsolidatedHUDProps {
  isVisible: boolean
  visitedCount: number
  totalCount: number
  nearestLandmark?: {
    name: string
    distance: number
  }
}

export default function ConsolidatedHUD({
  isVisible,
  visitedCount,
  totalCount,
  nearestLandmark
}: ConsolidatedHUDProps) {
  if (!isVisible) return null

  const progress = (visitedCount / totalCount) * 100
  const { state: playerState } = usePlayerState()
  const bearing = playerState.heading
  const metersPerDegree = 111139
  const speedKmh = playerState.speed * metersPerDegree * 3.6
  const formattedSpeed = Number.isFinite(speedKmh) ? speedKmh : 0
  const locomotionLabel = playerState.locomotionMode === 'scooter' ? 'MOPED' : 'ON FOOT'

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed top-6 right-6 z-20 flex flex-col gap-3"
        >
          {/* Progress Card */}
          <div
            className="px-4 py-3 shadow-lg relative"
            style={{
              background: 'linear-gradient(145deg, #FFE0F0 0%, #F0E8FF 100%)',
              border: '2px solid #FFB6C1',
              borderRadius: '8px',
              boxShadow: '0 4px 0 #FFA8D5, 0 6px 12px rgba(0,0,0,0.2)',
              minWidth: '200px',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold" style={{ color: minecraftTheme.colors.text.light, fontFamily: 'monospace' }}>
                🎮 EXPLORATION
              </span>
              <span className="text-sm font-bold" style={{ color: minecraftTheme.colors.text.primary, fontFamily: 'monospace' }}>
                {visitedCount}/{totalCount}
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: minecraftTheme.colors.beige.dark }}>
              <motion.div
                className="h-full"
                style={{ background: `linear-gradient(90deg, ${minecraftTheme.colors.accent.green} 0%, ${minecraftTheme.colors.accent.blue} 100%)` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Locomotion Card */}
          <div
            className="px-4 py-3 shadow-lg relative"
            style={{
              background: 'linear-gradient(145deg, #E0F7FF 0%, #DFFFD7 100%)',
              border: '2px solid #7ED957',
              borderRadius: '8px',
              boxShadow: '0 4px 0 #5DA040, 0 6px 12px rgba(0,0,0,0.2)',
              minWidth: '200px'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold" style={{ color: '#1E3A5F', fontFamily: 'monospace' }}>
                ⚙️ {locomotionLabel}
              </span>
              <span className="text-xs font-bold" style={{ color: '#2C1810', fontFamily: 'monospace' }}>
                {formattedSpeed.toFixed(1)} km/h
              </span>
            </div>
            <div className="text-[9px] font-bold" style={{ color: '#2C1810', fontFamily: 'monospace' }}>
              {playerState.locomotionMode === 'scooter' ? 'Hold Shift for turbo glow!' : 'Shift = sprint pulse'}
            </div>
          </div>

          {/* Compass Card */}
          <div
            className="w-20 h-20 shadow-lg relative flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #FFE0F0 0%, #F0E8FF 100%)',
              border: '2px solid #C8A2E8',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: -bearing }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <div className="text-3xl">🧭</div>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-sm font-bold" style={{ color: minecraftTheme.colors.text.primary, fontFamily: 'monospace' }}>
                {getCardinalDirection(bearing)}
              </div>
            </div>
          </div>

          {/* Nearest Landmark Card */}
          {nearestLandmark && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-4 py-3 shadow-lg relative"
              style={{
                background: 'linear-gradient(145deg, #FFF0F5 0%, #FFE0F0 100%)',
                border: '2px solid #FFB87A',
                borderRadius: '8px',
                boxShadow: '0 4px 0 #FF9955, 0 6px 12px rgba(0,0,0,0.2)',
                minWidth: '200px',
              }}
            >
              <div className="text-[10px] font-bold mb-1" style={{ color: minecraftTheme.colors.text.light, fontFamily: 'monospace' }}>
                🎯 NEAREST LANDMARK
              </div>
              <div className="text-sm font-bold" style={{ color: minecraftTheme.colors.text.primary, fontFamily: 'monospace' }}>
                {nearestLandmark.name}
              </div>
              <div className="text-xs font-bold mt-1" style={{ color: minecraftTheme.colors.terracotta.base, fontFamily: 'monospace' }}>
                📍 {nearestLandmark.distance.toFixed(1)}km away
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

