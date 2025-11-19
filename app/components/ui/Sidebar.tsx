'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { LayerVisibility, LayerId } from '@/app/types/map'

interface SidebarProps {
  isOpen: boolean
  layersVisible: LayerVisibility
  onToggleLayer: (layerId: LayerId) => void
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  onSeasonChange: (season: 'spring' | 'summer' | 'fall' | 'winter') => void
  onOpenStats?: () => void
  gameStats?: {
    visited: number
    total: number
  }
}

const seasons = [
  { id: 'spring' as const, name: 'Spring', emoji: '🌸', color: '#FFB7D5' },
  { id: 'summer' as const, name: 'Summer', emoji: '☀️', color: '#7ED957' },
  { id: 'fall' as const, name: 'Fall', emoji: '🍂', color: '#FF8C42' },
  { id: 'winter' as const, name: 'Winter', emoji: '❄️', color: '#8D6E63' }
]

export default function Sidebar({
  isOpen,
  layersVisible,
  onToggleLayer,
  currentSeason,
  onSeasonChange,
  onOpenStats,
  gameStats,
}: SidebarProps) {
  const [seasonPanelOpen, setSeasonPanelOpen] = useState(false)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
          className="fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-lg shadow-2xl z-30 flex flex-col border-r border-gray-200"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              Anima DC
            </h1>
            <p className="text-sm text-gray-200 mt-1 font-semibold">GTA-like 3D World</p>
            <p className="text-xs text-gray-400 mt-1">DC • Maryland • Virginia • Realistic 3D</p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Map Layers Section */}
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Map Layers
              </h2>
              <div className="space-y-2">
                {/* Museums Toggle */}
                <button
                  onClick={() => onToggleLayer('museums')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group relative"
                  title="View Smithsonian museums and cultural institutions"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      layersVisible.museums 
                        ? 'bg-blue-500 shadow-lg shadow-blue-500/50' 
                        : 'bg-gray-200'
                    }`}>
                      <span className="text-xl">🏛️</span>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        Museums
                        <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">8</span>
                      </div>
                      <div className="text-xs text-gray-500">Smithsonian & more</div>
                      <div className="text-xs text-gray-500">
                        {layersVisible.museums ? '28 DMV locations visible' : 'Toggle to show'}
                      </div>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-all duration-200 ${
                    layersVisible.museums 
                      ? 'bg-blue-500 shadow-md shadow-blue-500/30' 
                      : 'bg-gray-300'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                      layersVisible.museums ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                    }`} />
                  </div>
                </button>

                {/* Greenery Toggle */}
                <button
                  onClick={() => onToggleLayer('trees')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  title="View trees, parks, and seasonal foliage across DC"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      layersVisible.trees ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      <span className="text-xl">🌳</span>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        Greenery
                        <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">50+</span>
                      </div>
                      <div className="text-xs text-gray-500">Trees & seasonal parks</div>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    layersVisible.trees ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
                      layersVisible.trees ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                    }`} />
            </div>
                </button>

                {/* Hidden Gems Toggle */}
                <button
                  onClick={() => onToggleLayer('hiddenGems')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Discover secret Easter egg locations"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      layersVisible.hiddenGems ? 'bg-purple-500 shadow-lg shadow-purple-500/50' : 'bg-gray-200'
                    }`}>
                      <span className="text-xl">🔮</span>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        Hidden Gems
                        <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-purple-200 text-purple-700">Secret</span>
                      </div>
                      <div className="text-xs text-gray-500">Easter egg locations</div>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    layersVisible.hiddenGems ? 'bg-purple-500' : 'bg-gray-300'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
                      layersVisible.hiddenGems ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                    }`} />
                  </div>
                </button>

                {/* Seasonal Controls - Collapsible */}
            {layersVisible.trees && (
              <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-13 mt-2 overflow-hidden"
                  >
                    <button
                      onClick={() => setSeasonPanelOpen(!seasonPanelOpen)}
                      className="w-full flex items-center justify-between p-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <span className="font-medium">Change Season</span>
                      <span className={`transform transition-transform ${seasonPanelOpen ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    
                    {seasonPanelOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 gap-2 mt-2"
                      >
                        {seasons.map((season) => (
                          <button
                            key={season.id}
                            onClick={() => onSeasonChange(season.id)}
                            className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                              currentSeason === season.id
                                ? 'bg-gray-800 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <span className="text-2xl">{season.emoji}</span>
                            <span className="text-xs font-medium">{season.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
              </motion.div>
            )}
              </div>
            </div>

            {/* Game Progress Section */}
            {gameStats && onOpenStats && (
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Exploration Progress
                </h2>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Landmarks Found</span>
                    <span className="text-lg font-bold text-gray-800">
                      {gameStats.visited}/{gameStats.total}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(gameStats.visited / gameStats.total) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-green-400 to-blue-400"
                    />
                  </div>

                  <button
                    onClick={onOpenStats}
                    className="w-full py-2 px-4 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    View All Landmarks
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-xs font-medium text-gray-700 mb-1">📍 Accurate Locations</p>
              <p className="text-xs text-gray-600">
                All museums are positioned at their exact real-world GPS coordinates for navigation accuracy.
              </p>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              💡 Use WASD to walk • Drag to look around
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
