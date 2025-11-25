'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'
import { usePlayerState } from '@/app/lib/playerState'
import { formatDistance } from '@/app/lib/proximityDetector'

interface NearestLandmark {
  name: string
  distance: number
}

interface SmartHUDProps {
  mode: 'map' | 'fly'
  // Game Stats
  visitedCount: number
  totalCount: number
  points: number
  activeQuestCount: number
  // Fly Mode Stats
  nearestLandmark?: NearestLandmark
  flySpeed?: number
  flyAltitude?: number
  flyPosition?: { lng: number; lat: number }
}

export default function SmartHUD({
  mode,
  visitedCount,
  totalCount,
  points,
  activeQuestCount,
  nearestLandmark,
  flySpeed = 0,
  flyAltitude = 0,
  flyPosition
}: SmartHUDProps) {
  const { state: playerState } = usePlayerState()
  const bearing = playerState.heading

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
    <>
      {/* Fly Mode HUD - Bottom Center Controls */}
      <AnimatePresence>
        {mode === 'fly' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10"
          >
            <div
              className="px-6 py-3 shadow-lg relative"
              style={{
                background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
                border: `${minecraftTheme.minecraft.borderWidth} solid ${minecraftTheme.colors.terracotta.base}`,
                borderRadius: minecraftTheme.minecraft.borderRadius,
                boxShadow: minecraftTheme.minecraft.shadowRaised,
                imageRendering: minecraftTheme.minecraft.imageRendering,
              }}
            >
              {/* Pixelated corners */}
              <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />

              <div className="flex items-center gap-6 text-xs font-bold" style={{ 
                color: minecraftTheme.colors.text.primary,
                fontFamily: 'monospace'
              }}>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1" style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    borderRadius: '2px',
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                  }}>W</kbd>
                  <kbd className="px-2 py-1" style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    borderRadius: '2px',
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                  }}>A</kbd>
                  <kbd className="px-2 py-1" style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    borderRadius: '2px',
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                  }}>S</kbd>
                  <kbd className="px-2 py-1" style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    borderRadius: '2px',
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                  }}>D</kbd>
                  <span style={{ color: minecraftTheme.colors.text.secondary }}>Move</span>
                </div>
                <div className="w-px h-4" style={{ background: minecraftTheme.colors.terracotta.light }} />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    {['↑','↓','←','→'].map((key) => (
                      <kbd key={key} className="px-1.5 py-0.5" style={{
                        background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                        border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                        borderRadius: '2px',
                        color: minecraftTheme.colors.text.primary,
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        boxShadow: '0 1px 0 ' + minecraftTheme.colors.terracotta.dark,
                        fontSize: '0.7rem'
                      }}>{key}</kbd>
                    ))}
                  </div>
                  <span className="text-[10px]" style={{ color: minecraftTheme.colors.text.secondary }}>Arrow keys</span>
                </div>
                <div className="w-px h-4 hidden sm:block" style={{ background: minecraftTheme.colors.terracotta.light }} />
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1" style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    borderRadius: '2px',
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                  }}>Mouse</kbd>
                  <span style={{ color: minecraftTheme.colors.text.secondary }}>Mouse Look</span>
                </div>
                <div className="w-px h-4" style={{ background: minecraftTheme.colors.terracotta.light }} />
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1" style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    borderRadius: '2px',
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                  }}>ESC</kbd>
                  <span style={{ color: minecraftTheme.colors.text.secondary }}>Exit</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fly Mode Stats - Top Right */}
      <AnimatePresence>
        {mode === 'fly' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-6 right-6 z-20 flex flex-col gap-3"
          >
            {/* Position & Speed Card */}
            <div
              className="px-4 py-3 shadow-lg relative"
              style={{
                background: 'linear-gradient(145deg, #E0F7FF 0%, #B3E5FC 100%)',
                border: '2px solid #4A90E2',
                borderRadius: '8px',
                boxShadow: '0 4px 0 #357ABD, 0 6px 12px rgba(0,0,0,0.2)',
                minWidth: '240px'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold" style={{ color: '#1E3A5F', fontFamily: 'monospace' }}>
                  🦅 FLY MODE
                </span>
                <span className="text-xs font-bold" style={{ color: '#2C1810', fontFamily: 'monospace' }}>
                  {(flySpeed * 3.6).toFixed(1)} km/h
                </span>
              </div>
              {flyPosition && (
                <div className="text-[9px] font-bold mb-1" style={{ color: '#2C1810', fontFamily: 'monospace' }}>
                  📍 {flyPosition.lat.toFixed(5)}, {flyPosition.lng.toFixed(5)}
                </div>
              )}
              <div className="flex items-center justify-between text-[9px] font-bold" style={{ color: '#2C1810', fontFamily: 'monospace' }}>
                <span>Altitude: {flyAltitude.toFixed(0)}m</span>
                <span style={{ color: '#357ABD' }}>Facing: {getCardinalDirection(bearing)}</span>
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
                  📍 {formatDistance(nearestLandmark.distance)} away
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

