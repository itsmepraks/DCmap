'use client'

import { motion } from 'framer-motion'

interface SeasonalControlsProps {
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  onSeasonChange: (season: 'spring' | 'summer' | 'fall' | 'winter') => void
}

/**
 * SeasonalControls - Phase 2 Feature
 * 
 * Controls for changing the seasonal appearance of the tree layer.
 * Will be displayed in the sidebar when the Trees layer is active.
 * 
 * TODO: Implement in Phase 2
 */
export default function SeasonalControls({
  currentSeason,
  onSeasonChange,
}: SeasonalControlsProps) {
  const seasons = ['spring', 'summer', 'fall', 'winter'] as const

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-blue-50 rounded-lg"
    >
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Season</h3>
      <div className="grid grid-cols-2 gap-2">
        {seasons.map((season) => (
          <button
            key={season}
            onClick={() => onSeasonChange(season)}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              currentSeason === season
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {season.charAt(0).toUpperCase() + season.slice(1)}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

