'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'
import { useState } from 'react'

interface NearbyLandmark {
  id: string
  name: string
  icon: string
  distance: number
  direction: string
}

interface ProximityHintProps {
  nearbyLandmarks: NearbyLandmark[]
  visitedLandmarks?: Set<string>
  onNavigate?: (landmarkId: string) => void
}

export default function ProximityHint({ nearbyLandmarks, visitedLandmarks = new Set(), onNavigate }: ProximityHintProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getDirectionArrow = (direction: string) => {
    const directions: { [key: string]: string } = {
      'N': '↑', 'NE': '↗', 'E': '→', 'SE': '↘',
      'S': '↓', 'SW': '↙', 'W': '←', 'NW': '↖'
    }
    return directions[direction] || '○'
  }

  // Show up to 3 nearest unvisited landmarks for better exploration guidance
  // This ensures the hint updates as user progresses and discovers landmarks
  const unvisitedLandmarks = nearbyLandmarks
    .filter(l => !visitedLandmarks.has(l.id))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3) // Show top 3 nearest

  const nearestLandmark = unvisitedLandmarks[0]

  // If no unvisited landmarks nearby, show nothing (user has explored this area)
  if (!nearestLandmark) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={nearestLandmark.id} // Key ensures smooth transition when landmark changes
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 0.95 }}
        exit={{ y: 50, opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        drag
        dragMomentum={false}
        className="fixed z-40 pointer-events-auto max-w-sm sm:max-w-none mx-auto cursor-move"
        style={{ bottom: '5rem', left: '50%', x: '-50%' }}
      >
        {/* Grip Handle */}
        <div className="w-full flex justify-center mb-1 opacity-0 hover:opacity-100 transition-opacity">
          <div className="px-2 py-0.5 rounded bg-black/20 text-[10px] font-bold text-white backdrop-blur-sm">
            ⋮⋮ DRAG
          </div>
        </div>

        {/* Main Nearest Landmark - Always Visible */}
        <motion.button
          onClick={() => onNavigate?.(nearestLandmark.id)}
          onPointerDown={(e) => e.stopPropagation()} // Stop drag when clicking button
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl transition-all relative overflow-hidden w-full sm:w-auto mb-2"
          style={{
            background: `linear-gradient(135deg, ${minecraftTheme.colors.beige.light}F8, ${minecraftTheme.colors.beige.base}F5)`,
            backdropFilter: 'blur(12px)',
            border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)`
          }}
        >
          {/* Shine effect */}
          <div 
            className="absolute top-0 left-0 right-0 h-[50%] pointer-events-none rounded-t-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)'
            }}
          />
          
          {/* Icon & Pulse */}
          <div className="relative z-10">
            <motion.span 
              className="text-xl sm:text-2xl block"
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {nearestLandmark.icon}
            </motion.span>
            {/* Pulse indicator when very close (< 100m) - ready to discover! */}
            {nearestLandmark.distance < 100 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 sm:h-4 sm:w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-green-500 border-2 border-white"></span>
              </span>
            )}
            {/* "NEW" badge when close (< 200m) - encourages exploration */}
            {nearestLandmark.distance < 200 && nearestLandmark.distance >= 100 && (
              <span 
                className="absolute -top-0.5 -right-0.5 text-[8px] sm:text-[10px] font-bold px-1 py-0.5 rounded z-20"
                style={{
                  background: minecraftTheme.colors.terracotta.base,
                  color: '#FFF',
                  border: `1px solid ${minecraftTheme.colors.terracotta.dark}`,
                  boxShadow: `0 2px 0 ${minecraftTheme.colors.terracotta.dark}`
                }}
              >
                NEW
              </span>
            )}
          </div>

          {/* Text Info */}
          <div className="text-left flex flex-col gap-0.5 z-10 flex-1 min-w-0">
            <span 
              className="text-xs sm:text-sm font-bold font-mono leading-tight truncate"
              style={{ color: minecraftTheme.colors.text.primary }}
            >
              {nearestLandmark.name}
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span 
                className="text-[10px] sm:text-xs font-bold font-mono"
                style={{ color: minecraftTheme.colors.text.secondary }}
              >
                📍 {Math.round(nearestLandmark.distance)}m
              </span>
              <motion.span 
                className="text-base sm:text-lg font-bold"
                style={{ color: minecraftTheme.colors.terracotta.base }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {getDirectionArrow(nearestLandmark.direction)}
              </motion.span>
            </div>
          </div>

          {/* Navigate Icon */}
          <motion.span 
            className="text-lg sm:text-xl z-10 flex-shrink-0"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🧭
          </motion.span>
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-black/20 rounded-tl-xl z-0" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-black/20 rounded-tr-xl z-0" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-black/20 rounded-bl-xl z-0" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-black/20 rounded-br-xl z-0" />
        </motion.button>

        {/* Additional Recommendations - Expandable */}
        {unvisitedLandmarks.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isExpanded ? 1 : 0.7, height: isExpanded ? 'auto' : 'auto' }}
            className="flex flex-col gap-1.5"
          >
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] sm:text-xs font-bold font-mono px-2 py-1 rounded"
              style={{
                background: `linear-gradient(135deg, ${minecraftTheme.colors.beige.base}E0, ${minecraftTheme.colors.beige.light}E0)`,
                border: `1px solid ${minecraftTheme.colors.terracotta.light}`,
                color: minecraftTheme.colors.text.secondary
              }}
            >
              {isExpanded ? '▼' : '▶'} {unvisitedLandmarks.length - 1} more nearby
            </motion.button>
            
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1.5"
              >
                {unvisitedLandmarks.slice(1).map((landmark) => (
                  <motion.button
                    key={landmark.id}
                    onClick={() => onNavigate?.(landmark.id)}
                    whileHover={{ scale: 1.05, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left"
                    style={{
                      background: `linear-gradient(135deg, ${minecraftTheme.colors.beige.light}E8, ${minecraftTheme.colors.beige.base}E5)`,
                      border: `2px solid ${minecraftTheme.colors.terracotta.light}`,
                      boxShadow: `0 4px 12px rgba(0,0,0,0.15)`
                    }}
                  >
                    <span className="text-base">{landmark.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="text-[10px] font-bold font-mono truncate"
                        style={{ color: minecraftTheme.colors.text.primary }}
                      >
                        {landmark.name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="text-[9px] font-bold font-mono"
                          style={{ color: minecraftTheme.colors.text.secondary }}
                        >
                          {Math.round(landmark.distance)}m
                        </span>
                        <span 
                          className="text-xs font-bold"
                          style={{ color: minecraftTheme.colors.terracotta.base }}
                        >
                          {getDirectionArrow(landmark.direction)}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
