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

  // Only show the 1 nearest unvisited landmark for minimal view
  const nearestLandmark = nearbyLandmarks
    .filter(l => !visitedLandmarks.has(l.id))
    .sort((a, b) => a.distance - b.distance)[0]

  if (!nearestLandmark) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 0.95 }}
        exit={{ y: 50, opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="fixed bottom-20 left-2 right-2 sm:bottom-24 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-20 pointer-events-auto max-w-sm sm:max-w-none mx-auto"
      >
        {/* Compact Pill Design */}
        <motion.button
          onClick={() => onNavigate?.(nearestLandmark.id)}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl transition-all relative overflow-hidden w-full sm:w-auto"
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
            {nearestLandmark.distance < 100 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 sm:h-4 sm:w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-green-500 border-2 border-white"></span>
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
      </motion.div>
    </AnimatePresence>
  )
}
