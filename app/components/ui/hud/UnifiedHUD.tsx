'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'
import { formatDistance } from '@/app/lib/proximityDetector'

interface Landmark {
  id: string
  name: string
  coordinates: [number, number]
  distance?: number
}

interface UnifiedHUDProps {
  mode: 'map' | 'fly'
  // Recommendation
  recommendedLandmark?: Landmark | null
  recommendationDistance?: number | null
  onNavigateToRecommendation?: (coordinates: [number, number]) => void
  // Fly Mode Stats
  flySpeed?: number
  flyAltitude?: number
  flyPosition?: { lng: number; lat: number }
  flyBearing?: number
  nearestLandmark?: { name: string; distance: number }
}

export default function UnifiedHUD({
  mode,
  recommendedLandmark,
  recommendationDistance,
  onNavigateToRecommendation,
  flySpeed = 0,
  flyAltitude = 0,
  flyPosition,
  flyBearing = 0,
  nearestLandmark
}: UnifiedHUDProps) {
  const [showFlyControls, setShowFlyControls] = useState(true)
  const [showRecommendation, setShowRecommendation] = useState(true)

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
      {/* Top Right: Recommendation (Compact) */}
      <AnimatePresence>
        {mode === 'map' && showRecommendation && recommendedLandmark && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-6 right-6 z-30"
          >
            <div
              className="px-4 py-3 shadow-lg relative cursor-pointer group"
              onClick={() => onNavigateToRecommendation?.(recommendedLandmark.coordinates)}
              style={{
                background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
                border: `${minecraftTheme.minecraft.borderWidth} solid ${minecraftTheme.colors.terracotta.base}`,
                borderRadius: minecraftTheme.minecraft.borderRadius,
                boxShadow: minecraftTheme.minecraft.shadowRaised,
                imageRendering: minecraftTheme.minecraft.imageRendering,
                minWidth: '200px',
                maxWidth: '280px'
              }}
            >
              <div className="flex items-center gap-2">
                <div className="text-2xl">🎯</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate" style={{ 
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace'
                  }}>
                    {recommendedLandmark.name}
                  </div>
                  {recommendationDistance !== null && recommendationDistance !== undefined && (
                    <div className="text-[10px] mt-0.5" style={{ 
                      color: minecraftTheme.colors.text.secondary,
                      fontFamily: 'monospace'
                    }}>
                      📍 {formatDistance(recommendationDistance)}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowRecommendation(false)
                  }}
                  className="opacity-50 hover:opacity-100 transition-opacity text-xs"
                  style={{ color: minecraftTheme.colors.text.secondary }}
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fly Mode: Top Right Stats Panel */}
      <AnimatePresence>
        {mode === 'fly' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-20 flex flex-col gap-2"
          >
            {/* Speed/Position Card */}
            <div
              className="px-3 py-2 shadow-lg relative"
              style={{
                background: 'linear-gradient(145deg, #E0F7FF 0%, #B3E5FC 100%)',
                border: '2px solid #4A90E2',
                borderRadius: '6px',
                boxShadow: '0 4px 0 #357ABD, 0 6px 12px rgba(0,0,0,0.2)',
                minWidth: '180px'
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold" style={{ color: '#1E3A5F', fontFamily: 'monospace' }}>
                  🦅 FLY MODE
                </span>
                <span className="text-xs font-bold" style={{ color: '#2C1810', fontFamily: 'monospace' }}>
                  {(flySpeed * 3.6).toFixed(1)} km/h
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-bold" style={{ color: '#2C1810', fontFamily: 'monospace' }}>
                <span>Alt: {flyAltitude.toFixed(0)}m</span>
                <span style={{ color: '#357ABD' }}>{getCardinalDirection(flyBearing)}</span>
              </div>
            </div>

            {/* Nearest Landmark Card */}
            {nearestLandmark && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-3 py-2 shadow-lg relative"
                style={{
                  background: 'linear-gradient(145deg, #FFF0F5 0%, #FFE0F0 100%)',
                  border: '2px solid #FFB87A',
                  borderRadius: '6px',
                  boxShadow: '0 4px 0 #FF9955, 0 6px 12px rgba(0,0,0,0.2)',
                  minWidth: '180px',
                }}
              >
                <div className="text-[9px] font-bold mb-1" style={{ color: minecraftTheme.colors.text.light, fontFamily: 'monospace' }}>
                  🎯 NEAREST
                </div>
                <div className="text-xs font-bold truncate" style={{ color: minecraftTheme.colors.text.primary, fontFamily: 'monospace' }}>
                  {nearestLandmark.name}
                </div>
                <div className="text-[9px] font-bold mt-0.5" style={{ color: minecraftTheme.colors.terracotta.base, fontFamily: 'monospace' }}>
                  📍 {formatDistance(nearestLandmark.distance)}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fly Mode: Collapsible Bottom Controls */}
      <AnimatePresence>
        {mode === 'fly' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10"
          >
            <motion.div
              animate={{ scale: showFlyControls ? 1 : 0.9, opacity: showFlyControls ? 1 : 0.7 }}
              className="px-4 py-2 shadow-lg relative cursor-pointer"
              onClick={() => setShowFlyControls(!showFlyControls)}
              style={{
                background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
                border: `${minecraftTheme.minecraft.borderWidth} solid ${minecraftTheme.colors.terracotta.base}`,
                borderRadius: minecraftTheme.minecraft.borderRadius,
                boxShadow: minecraftTheme.minecraft.shadowRaised,
                imageRendering: minecraftTheme.minecraft.imageRendering,
              }}
            >
              <AnimatePresence mode="wait">
                {showFlyControls ? (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-4 text-xs font-bold"
                    style={{ 
                      color: minecraftTheme.colors.text.primary,
                      fontFamily: 'monospace'
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 text-[10px]" style={{
                        background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                        border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                        borderRadius: '2px',
                        color: minecraftTheme.colors.text.primary,
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                      }}>W</kbd>
                      <kbd className="px-1.5 py-0.5 text-[10px]" style={{
                        background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                        border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                        borderRadius: '2px',
                        color: minecraftTheme.colors.text.primary,
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                      }}>A</kbd>
                      <kbd className="px-1.5 py-0.5 text-[10px]" style={{
                        background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                        border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                        borderRadius: '2px',
                        color: minecraftTheme.colors.text.primary,
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                      }}>S</kbd>
                      <kbd className="px-1.5 py-0.5 text-[10px]" style={{
                        background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                        border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                        borderRadius: '2px',
                        color: minecraftTheme.colors.text.primary,
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                      }}>D</kbd>
                      <span className="text-[10px]" style={{ color: minecraftTheme.colors.text.secondary }}>Move</span>
                    </div>
                    <div className="w-px h-3" style={{ background: minecraftTheme.colors.terracotta.light }} />
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 text-[10px]" style={{
                        background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                        border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                        borderRadius: '2px',
                        color: minecraftTheme.colors.text.primary,
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                      }}>Mouse</kbd>
                      <span className="text-[10px]" style={{ color: minecraftTheme.colors.text.secondary }}>Look</span>
                    </div>
                    <div className="w-px h-3" style={{ background: minecraftTheme.colors.terracotta.light }} />
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 text-[10px]" style={{
                        background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                        border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                        borderRadius: '2px',
                        color: minecraftTheme.colors.text.primary,
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                      }}>ESC</kbd>
                      <span className="text-[10px]" style={{ color: minecraftTheme.colors.text.secondary }}>Exit</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-bold"
                    style={{ 
                      color: minecraftTheme.colors.text.secondary,
                      fontFamily: 'monospace'
                    }}
                  >
                    Click for controls
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

