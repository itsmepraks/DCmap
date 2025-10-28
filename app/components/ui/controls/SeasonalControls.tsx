'use client'

import { motion } from 'framer-motion'
import { theme, seasonColors } from '@/app/lib/theme'

interface SeasonalControlsProps {
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  onSeasonChange: (season: 'spring' | 'summer' | 'fall' | 'winter') => void
}

export default function SeasonalControls({
  currentSeason,
  onSeasonChange,
}: SeasonalControlsProps) {
  const seasons = ['spring', 'summer', 'fall', 'winter'] as const

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="p-6 bg-white/90 rounded-2xl border-2" 
      style={{ 
        boxShadow: theme.shadows.xl,
        borderColor: theme.colors.terracotta
      }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: theme.colors.text.primary }}>
        Choose Season
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {seasons.map((season) => {
          const colors = seasonColors[season]
          const isActive = currentSeason === season
          
          return (
            <motion.button
              key={season}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSeasonChange(season)}
              className="relative px-4 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: isActive ? colors.active : colors.bg,
                color: isActive ? 'white' : colors.text,
                boxShadow: isActive 
                  ? `0 4px 16px ${colors.active}40` 
                  : '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {/* Season emoji */}
              <span className="mr-2 text-base">{colors.emoji}</span>
              {season.charAt(0).toUpperCase() + season.slice(1)}
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeSeasonIndicator"
                  className="absolute inset-0 rounded-xl border-2 border-white/50"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

