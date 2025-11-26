'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type EntityType = 'museum' | 'landmark' | 'tree'

export interface SelectedEntity {
  id: string
  type: EntityType
  name: string
  description?: string
  image?: string
  coordinates: [number, number]
  metadata?: Record<string, any>
  visited?: boolean
}

interface EntityInfoPanelProps {
  entity: SelectedEntity | null
  onClose: () => void
  onNavigate: (coordinates: [number, number]) => void
}

export default function EntityInfoPanel({ entity, onClose, onNavigate }: EntityInfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Reset expansion when entity changes
  useEffect(() => {
    if (entity) setIsExpanded(true)
  }, [entity])

  if (!entity) return null

  return (
    <AnimatePresence>
      {entity && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-4 top-32 sm:top-36 z-50 w-72 sm:w-80 pointer-events-auto cursor-move"
          drag
          dragMomentum={false}
          dragConstraints={{ left: -window.innerWidth + 320, right: 0, top: 0, bottom: window.innerHeight - 200 }}
        >
          {/* Glass Card Container with Minecraft/Pixel Theme */}
          <div 
            className="relative overflow-hidden rounded-lg shadow-2xl"
            style={{
              background: 'linear-gradient(145deg, rgba(239, 230, 213, 0.95) 0%, rgba(245, 235, 217, 0.95) 100%)',
              border: '3px solid #D4501E', // Terracotta border
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
          >
            {/* Header */}
            <div 
              className="relative p-4 cursor-grab active:cursor-grabbing"
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: entity.type === 'museum' 
                  ? 'linear-gradient(135deg, #5DA5DB 0%, #3A7CA5 100%)' 
                  : entity.type === 'tree'
                    ? 'linear-gradient(135deg, #7ED957 0%, #5DA040 100%)'
                    : 'linear-gradient(135deg, #D4501E 0%, #B8431A 100%)', // Default/Landmark
                borderBottom: `4px solid ${
                  entity.type === 'museum' ? '#3A7CA5' : entity.type === 'tree' ? '#5DA040' : '#B8431A'
                }`
              }}
            >
              {/* Close Button */}
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer"
                onPointerDown={(e) => e.stopPropagation()}
              >
                ✕
              </button>

              {/* Title & Icon */}
              <div className="flex items-center gap-3 pr-6">
                <div className="text-3xl filter drop-shadow-md">
                  {entity.type === 'museum' ? '🏛️' : entity.type === 'tree' ? '🌳' : '📍'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white/90 uppercase tracking-wider font-mono mb-0.5">
                    {entity.type}
                  </div>
                  <h2 className="text-white font-bold text-lg leading-tight font-mono text-shadow-sm">
                    {entity.name}
                  </h2>
                </div>
              </div>
            </div>

            {/* Content Body - Collapsible */}
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? 'auto' : 0 }}
              className="overflow-hidden cursor-auto"
              onPointerDown={(e) => e.stopPropagation()} // Allow interaction with content
            >
              <div className="p-4 space-y-4">
                {/* Status Badge */}
                {entity.visited && (
                  <div className="bg-green-100/50 border-2 border-green-500 rounded p-2 flex items-center justify-between">
                    <span className="text-green-800 font-bold text-xs font-mono">✓ VISITED</span>
                    <span className="text-green-700 text-xs font-mono">+XP EARNED</span>
                  </div>
                )}

                {/* Description */}
                {entity.description && (
                  <div className="text-sm text-[#5D4037] font-mono leading-relaxed bg-white/40 p-3 rounded border border-[#D4501E]/20">
                    {entity.description}
                  </div>
                )}

                {/* Metadata Grid */}
                {entity.metadata && Object.keys(entity.metadata).length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(entity.metadata).map(([key, value]) => (
                      value && (
                        <div key={key} className="bg-white/30 p-2 rounded border border-[#D4501E]/10">
                          <div className="text-[10px] text-[#8B7355] uppercase font-bold mb-0.5">{key}</div>
                          <div className="text-xs text-[#2C1810] font-semibold truncate" title={String(value)}>
                            {String(value)}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => onNavigate(entity.coordinates)}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-[#7ED957] hover:bg-[#6BC94A] text-white font-bold rounded shadow-[0_3px_0_#5DA040] active:shadow-none active:translate-y-[3px] transition-all font-mono text-xs border-2 border-[#5DA040]"
                  >
                    <span>🧭</span> NAVIGATE
                  </button>
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/search?q=${encodeURIComponent(entity.name + ' Washington DC')}`
                      window.open(url, '_blank')
                    }}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-[#5DA5DB] hover:bg-[#4C94CA] text-white font-bold rounded shadow-[0_3px_0_#3A7CA5] active:shadow-none active:translate-y-[3px] transition-all font-mono text-xs border-2 border-[#3A7CA5]"
                  >
                    <span>🔍</span> INFO
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Pixelated Corners Decoration */}
            <div className="absolute top-0 left-0 w-1 h-1 bg-black/20"></div>
            <div className="absolute top-0 right-0 w-1 h-1 bg-black/20"></div>
            <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/20"></div>
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/20"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
