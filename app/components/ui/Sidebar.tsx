'use client'

import { motion, AnimatePresence } from 'framer-motion'
import LayerToggle from './LayerToggle'
import type { LayerVisibility, LayerId } from '@/app/types/map'

interface SidebarProps {
  isOpen: boolean
  layersVisible: LayerVisibility
  onToggleLayer: (layerId: LayerId) => void
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
    description: 'Tree canopy and seasonal changes (Phase 2)',
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
}: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          exit={{ x: -320 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-10 overflow-y-auto"
        >
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Project Anima DC
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Interactive D.C. Data Layers
              </p>
            </div>

            <div className="space-y-1">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Data Layers
              </h2>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
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

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Click on map markers for more information. Pan and zoom to explore.
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

