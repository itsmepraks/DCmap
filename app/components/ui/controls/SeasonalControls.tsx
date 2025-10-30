'use client'

import { motion } from 'framer-motion'
import { seasonColors, minecraftTheme } from '@/app/lib/theme'

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
      className="p-6 border-2 relative" 
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

      <h3 
        className="text-lg font-bold mb-4"
        style={{ 
          color: minecraftTheme.colors.text.primary,
          fontFamily: 'monospace'
        }}
      >
        Choose Season
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {seasons.map((season) => {
          const colors = seasonColors[season]
          const isActive = currentSeason === season
          
          // Get the darker shade for the shadow
          const getDarkColor = (color: string) => {
            // Simple color darkening
            const colorMap: Record<string, string> = {
              '#FF69B4': '#C13584',
              '#4CAF50': '#2E7D32',
              '#F4511E': '#BF360C',
              '#5D4037': '#3E2723'
            }
            return colorMap[color] || color
          }
          
          return (
            <motion.button
              key={season}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSeasonChange(season)}
              className="relative px-4 py-3 font-bold text-sm transition-all"
              style={{
                background: isActive ? colors.active : colors.bg,
                color: isActive ? 'white' : colors.text,
                border: `2px solid ${isActive ? getDarkColor(colors.active) : colors.active}`,
                borderRadius: minecraftTheme.minecraft.borderRadius,
                boxShadow: isActive 
                  ? minecraftTheme.minecraft.shadowPressed
                  : `0 4px 0 ${getDarkColor(colors.active)}, 0 6px 12px rgba(0,0,0,0.3)`,
                imageRendering: minecraftTheme.minecraft.imageRendering,
                fontFamily: 'monospace',
                transform: isActive ? 'translateY(2px)' : 'translateY(0)'
              }}
            >
              {/* Pixelated corners on buttons */}
              <div className="absolute top-0 left-0 w-1 h-1 bg-black/30" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute top-0 right-0 w-1 h-1 bg-black/30" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/30" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/30" style={{ imageRendering: 'pixelated' }} />

              {/* Season emoji */}
              <span className="mr-2 text-base">{colors.emoji}</span>
              {season.charAt(0).toUpperCase() + season.slice(1)}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
