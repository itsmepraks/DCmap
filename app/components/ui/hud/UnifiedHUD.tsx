'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'
import { formatDistance } from '@/app/lib/proximityDetector'
import type { CurrentObjectiveInfo } from '@/app/lib/progressiveWaypointSystem'

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
  // Quest Progress (NEW)
  currentObjective?: CurrentObjectiveInfo | null
  onNavigateToObjective?: (coordinates: [number, number]) => void
  // Nearest undiscovered landmark (NEW)
  nearestUndiscovered?: { id: string; name: string; distance: number; coordinates: [number, number] } | null
  onNavigateToUndiscovered?: (coordinates: [number, number]) => void
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
  nearestLandmark,
  currentObjective,
  onNavigateToObjective,
  nearestUndiscovered,
  onNavigateToUndiscovered
}: UnifiedHUDProps) {
  const [showFlyControls, setShowFlyControls] = useState(true)
  const [showRecommendation, setShowRecommendation] = useState(true)
  const [showQuestCard, setShowQuestCard] = useState(true)
  const [showNearestCard, setShowNearestCard] = useState(true)

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
      {/* Right Side Stack Container - Consolidated HUD - DRAGGABLE */}
      <motion.div 
        className="fixed z-40 flex flex-col gap-2 items-end pointer-events-auto cursor-move"
        drag
        dragMomentum={false}
        initial={{ top: 80, right: 16 }}
        style={{ top: 80, right: 16 }}
      >
        {/* Grip Handle */}
        <div className="w-full flex justify-end mb-1 opacity-0 hover:opacity-100 transition-opacity">
          <div className="px-2 py-0.5 rounded bg-black/20 text-[10px] font-bold text-white backdrop-blur-sm">
            ⋮⋮ DRAG
          </div>
        </div>
        
        {/* Recommendation (Map Mode) */}
        <AnimatePresence>
          {mode === 'map' && showRecommendation && recommendedLandmark && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="pointer-events-auto"
              style={{ maxWidth: '240px' }}
              onPointerDown={(e) => e.stopPropagation()} // Allow clicking inside without dragging
            >
              <div
                className="px-3 py-2 shadow-lg relative group"
                onClick={() => onNavigateToRecommendation?.(recommendedLandmark.coordinates)}
                style={{
                  background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
                  border: `${minecraftTheme.minecraft.borderWidth} solid ${minecraftTheme.colors.terracotta.base}`,
                  borderRadius: minecraftTheme.minecraft.borderRadius,
                  boxShadow: minecraftTheme.minecraft.shadowRaised,
                  imageRendering: minecraftTheme.minecraft.imageRendering,
                  minWidth: '180px',
                  maxWidth: '240px'
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

        {/* Fly Mode Stats */}
        <AnimatePresence>
          {mode === 'fly' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-2 pointer-events-auto"
              style={{ maxWidth: '200px' }}
              onPointerDown={(e) => e.stopPropagation()} // Allow clicking inside without dragging
            >
              {/* Speed/Position Card - Compact */}
              <div
                className="px-2.5 py-1.5 shadow-lg relative"
                style={{
                  background: 'linear-gradient(145deg, #E0F7FF 0%, #B3E5FC 100%)',
                  border: '2px solid #4A90E2',
                  borderRadius: '6px',
                  boxShadow: '0 4px 0 #357ABD, 0 6px 12px rgba(0,0,0,0.2)',
                  minWidth: '160px',
                  maxWidth: '180px'
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[8px] font-bold" style={{ color: '#1E3A5F', fontFamily: 'monospace' }}>
                    🦅 FLY
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: '#2C1810', fontFamily: 'monospace' }}>
                    {(flySpeed * 3.6).toFixed(0)} km/h
                  </span>
                </div>
                <div className="flex items-center justify-between text-[8px] font-bold" style={{ color: '#2C1810', fontFamily: 'monospace' }}>
                  <span>Alt: {flyAltitude.toFixed(0)}m</span>
                  <span style={{ color: '#357ABD' }}>{getCardinalDirection(flyBearing)}</span>
                </div>
              </div>

              {/* Nearest Landmark Card - Compact */}
              {nearestLandmark && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-2.5 py-1.5 shadow-lg relative"
                  style={{
                    background: 'linear-gradient(145deg, #FFF0F5 0%, #FFE0F0 100%)',
                    border: '2px solid #FFB87A',
                    borderRadius: '6px',
                    boxShadow: '0 4px 0 #FF9955, 0 6px 12px rgba(0,0,0,0.2)',
                    minWidth: '160px',
                    maxWidth: '180px',
                  }}
                >
                  <div className="text-[8px] font-bold mb-0.5" style={{ color: minecraftTheme.colors.text.light, fontFamily: 'monospace' }}>
                    🎯 NEAREST
                  </div>
                  <div className="text-[10px] font-bold truncate" style={{ color: minecraftTheme.colors.text.primary, fontFamily: 'monospace' }}>
                    {nearestLandmark.name}
                  </div>
                  <div className="text-[8px] font-bold mt-0.5" style={{ color: minecraftTheme.colors.terracotta.base, fontFamily: 'monospace' }}>
                    📍 {formatDistance(nearestLandmark.distance)}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quest Objective Card */}
        <AnimatePresence>
          {showQuestCard && currentObjective && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="pointer-events-auto"
              style={{ maxWidth: '220px' }}
              onPointerDown={(e) => e.stopPropagation()} // Allow clicking inside without dragging
            >
              <div
                className="px-3 py-2 shadow-lg relative group"
                onClick={() => currentObjective.coordinates && onNavigateToObjective?.(currentObjective.coordinates)}
                style={{
                  background: `linear-gradient(145deg, #FFF8DC 0%, #FFE4B5 100%)`,
                  border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
                  borderRadius: minecraftTheme.minecraft.borderRadius,
                  boxShadow: '0 4px 0 #B8431A, 0 6px 12px rgba(0,0,0,0.2)',
                  imageRendering: minecraftTheme.minecraft.imageRendering,
                }}
              >
                {/* Header with quest icon and progress */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{currentObjective.quest.icon}</span>
                    <span className="text-[10px] font-bold" style={{ 
                      color: minecraftTheme.colors.text.secondary,
                      fontFamily: 'monospace'
                    }}>
                      QUEST
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold" style={{ 
                      color: minecraftTheme.colors.terracotta.base,
                      fontFamily: 'monospace'
                    }}>
                      {currentObjective.completedCount}/{currentObjective.totalCount}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowQuestCard(false)
                      }}
                      className="opacity-50 hover:opacity-100 transition-opacity text-xs ml-1"
                      style={{ color: minecraftTheme.colors.text.secondary }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                {/* Current objective */}
                <div className="flex items-center gap-2">
                  <div className="text-xl">🎯</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate" style={{ 
                      color: minecraftTheme.colors.text.primary,
                      fontFamily: 'monospace'
                    }}>
                      {currentObjective.objective.description}
                    </div>
                    {currentObjective.distanceFromPlayer !== null && (
                      <div className="text-[10px] mt-0.5" style={{ 
                        color: minecraftTheme.colors.text.secondary,
                        fontFamily: 'monospace'
                      }}>
                        📍 {formatDistance(currentObjective.distanceFromPlayer)}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentObjective.progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, #7ED957, #5DA5DB)`
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nearest Undiscovered Landmark Card */}
        <AnimatePresence>
          {showNearestCard && nearestUndiscovered && mode === 'map' && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="pointer-events-auto"
              style={{ maxWidth: '200px' }}
              onPointerDown={(e) => e.stopPropagation()} // Allow clicking inside without dragging
            >
              <div
                className="px-2.5 py-1.5 shadow-lg relative group"
                onClick={() => onNavigateToUndiscovered?.(nearestUndiscovered.coordinates)}
                style={{
                  background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
                  border: `2px solid ${minecraftTheme.colors.accent.green}`,
                  borderRadius: minecraftTheme.minecraft.borderRadius,
                  boxShadow: '0 3px 0 #5DA040, 0 5px 10px rgba(0,0,0,0.15)',
                  imageRendering: minecraftTheme.minecraft.imageRendering,
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[8px] font-bold" style={{ 
                    color: minecraftTheme.colors.accent.greenDark,
                    fontFamily: 'monospace'
                  }}>
                    🧭 NEAREST
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowNearestCard(false)
                    }}
                    className="opacity-50 hover:opacity-100 transition-opacity text-[8px]"
                    style={{ color: minecraftTheme.colors.text.secondary }}
                  >
                    ✕
                  </button>
                </div>
                <div className="text-[10px] font-bold truncate" style={{ 
                  color: minecraftTheme.colors.text.primary,
                  fontFamily: 'monospace'
                }}>
                  {nearestUndiscovered.name}
                </div>
                <div className="text-[8px] mt-0.5" style={{ 
                  color: minecraftTheme.colors.accent.green,
                  fontFamily: 'monospace'
                }}>
                  📍 {formatDistance(nearestUndiscovered.distance)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* Fly Mode: Collapsible Bottom Controls */}
      <AnimatePresence>
        {mode === 'fly' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            drag
            dragMomentum={false}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 cursor-move"
          >
            <motion.div
              animate={{ scale: showFlyControls ? 1 : 0.9, opacity: showFlyControls ? 1 : 0.7 }}
              className="px-4 py-2 shadow-lg relative"
              onClick={() => setShowFlyControls(!showFlyControls)}
              onPointerDown={(e) => e.stopPropagation()} // Stop drag when clicking
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
                      }}>Space</kbd>
                      <span className="text-[10px]" style={{ color: minecraftTheme.colors.text.secondary }}>↑</span>
                      <kbd className="px-1.5 py-0.5 text-[10px]" style={{
                        background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                        border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                        borderRadius: '2px',
                        color: minecraftTheme.colors.text.primary,
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                      }}>Shift</kbd>
                      <span className="text-[10px]" style={{ color: minecraftTheme.colors.text.secondary }}>↓</span>
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