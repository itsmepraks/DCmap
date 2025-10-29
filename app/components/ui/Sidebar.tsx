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
          initial={{ x: -350, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -350, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 left-0 h-full w-80 z-10 overflow-y-auto"
          style={{
            background: 'linear-gradient(135deg, #EFE6D5 0%, #F5EBD9 100%)',
            boxShadow: theme.shadows.xl,
            borderRight: `3px solid ${theme.colors.terracotta}`
          }}
        >
          <div className="p-5">
            {/* Compact header */}
            <div className="mb-5 pb-4 border-b-2" style={{ borderColor: theme.colors.terracotta }}>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7ED957] via-[#5DA5DB] to-[#F2A65A] bg-clip-text text-transparent mb-1">
                Anima DC
              </h1>
              <p className="text-xs font-medium" style={{ color: theme.colors.text.secondary }}>
                Explore Washington DC
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: theme.colors.text.light }}>
                Layers
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
                    enabled={layersVisible[config.id] ?? false}
                    onToggle={() => onToggleLayer(config.id)}
                  />
                ))}
              </motion.div>
            </div>

            {/* Seasonal Controls - Show when Trees layer is active */}
            {layersVisible.trees && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-4"
              >
                <SeasonalControls
                  currentSeason={currentSeason}
                  onSeasonChange={onSeasonChange}
                />
              </motion.div>
            )}

            {/* Compact Game Stats */}
            {gameStats && onOpenStats && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4"
              >
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(126, 217, 87, 0.15) 0%, rgba(93, 165, 219, 0.15) 100%)',
                    border: '2px solid #7ED957',
                    boxShadow: theme.shadows.sm
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className="text-xs font-bold"
                      style={{ color: theme.colors.text.primary }}
                    >
                      🎮 Progress
                    </h3>
                    <div
                      className="text-sm font-bold"
                      style={{ color: theme.colors.primary }}
                    >
                      {gameStats.visited}/{gameStats.total}
                    </div>
                  </div>
                  
                  {/* Compact progress bar */}
                  <div
                    className="h-2 rounded-full overflow-hidden mb-2"
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenStats}
                    className="w-full py-1.5 rounded-lg font-semibold text-xs"
                    style={{
                      background: 'linear-gradient(135deg, #7ED957 0%, #5DA5DB 100%)',
                      color: '#FFF',
                      border: '2px solid #4A7C24',
                      boxShadow: theme.shadows.sm
                    }}
                  >
                    📊 View All
                  </motion.button>
                </div>
              </motion.div>
            )}

            <div className="mt-5 pt-4 border-t-2" style={{ borderColor: theme.colors.accent }}>
              <p className="text-xs" style={{ color: theme.colors.text.light }}>
                💡 Click map to jump anywhere • Zoom with mouse wheel
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

