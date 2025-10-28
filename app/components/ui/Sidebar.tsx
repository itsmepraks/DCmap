'use client'

import { motion, AnimatePresence } from 'framer-motion'
import LayerToggle from './LayerToggle'
import SeasonalControls from './controls/SeasonalControls'
import { theme } from '@/app/lib/theme'
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

const layerConfigs = [
  {
    id: 'museums' as LayerId,
    label: 'Museums',
    description: 'Cultural institutions across D.C.',
  },
  {
    id: 'trees' as LayerId,
    label: 'Greenery',
    description: 'Tree canopy and seasonal changes',
  },
  {
    id: 'heatmap' as LayerId,
    label: 'Heat Map',
    description: 'Urban temperature visualization (Phase 2)',
  },
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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 left-0 h-full w-96 z-10 overflow-y-auto"
          style={{
            background: 'linear-gradient(135deg, #EFE6D5 0%, #F5EBD9 100%)',
            boxShadow: theme.shadows.xl,
            borderRight: `3px solid ${theme.colors.terracotta}`
          }}
        >
          <div className="p-8">
            {/* Bold colorful header */}
            <div className="mb-8 pb-6 border-b-2" style={{ borderColor: theme.colors.terracotta }}>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7ED957] via-[#5DA5DB] to-[#F2A65A] bg-clip-text text-transparent mb-1">
                Anima DC
              </h1>
              <p className="text-sm font-medium" style={{ color: theme.colors.text.secondary }}>
                Interactive Data Layers
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: theme.colors.text.light }}>
                Data Layers
              </h2>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.08,
                    },
                  },
                }}
                className="space-y-3"
              >
                {layerConfigs.map((config) => (
                  <LayerToggle
                    key={config.id}
                    id={config.id}
                    label={config.label}
                    description={config.description}
                    enabled={layersVisible[config.id]}
                    onToggle={() => onToggleLayer(config.id)}
                  />
                ))}
              </motion.div>
            </div>

            {/* Seasonal Controls - Show when Trees layer is active */}
            {layersVisible.trees && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <SeasonalControls
                  currentSeason={currentSeason}
                  onSeasonChange={onSeasonChange}
                />
              </motion.div>
            )}

            {/* Game Stats & Progress */}
            {gameStats && onOpenStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(126, 217, 87, 0.2) 0%, rgba(93, 165, 219, 0.2) 100%)',
                    border: '2px solid #7ED957',
                    boxShadow: theme.shadows.md
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className="text-sm font-bold"
                      style={{ color: theme.colors.text.primary }}
                    >
                      🎮 Exploration Progress
                    </h3>
                    <div
                      className="text-lg font-bold"
                      style={{ color: theme.colors.primary }}
                    >
                      {gameStats.visited}/{gameStats.total}
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div
                    className="h-2 rounded-full overflow-hidden mb-3"
                    style={{
                      background: 'rgba(0,0,0,0.1)'
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(gameStats.visited / gameStats.total) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #7ED957 0%, #FFD700 100%)'
                      }}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenStats}
                    className="w-full py-2 rounded-lg font-semibold text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #7ED957 0%, #5DA5DB 100%)',
                      color: '#FFF',
                      border: '2px solid #4A7C24',
                      boxShadow: theme.shadows.sm,
                      textShadow: '1px 1px 0 rgba(0,0,0,0.3)'
                    }}
                  >
                    📊 View All Landmarks
                  </motion.button>
                </div>
              </motion.div>
            )}

            <div className="mt-8 pt-6 border-t-2" style={{ borderColor: theme.colors.accent }}>
              <p className="text-xs mb-2" style={{ color: theme.colors.text.light }}>
                🗺️ Click map markers for details • Pan and zoom to explore
              </p>
              <p className="text-xs font-semibold" style={{ color: theme.colors.text.secondary }}>
                🏗️ 3D Mode: Right-click + drag to tilt • Ctrl + drag to rotate
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

