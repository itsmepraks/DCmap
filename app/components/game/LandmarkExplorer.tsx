'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'
import type { SelectedEntity } from '@/app/components/ui/EntityInfoPanel'

interface Landmark {
  id: string
  name: string
  icon: string
  visited: boolean
  coordinates: [number, number]
  category?: string
  description?: string
  funFact?: string
}

interface LandmarkExplorerProps {
  landmarks: Landmark[]
  onNavigate: (coordinates: [number, number]) => void
  onSelect?: (entity: SelectedEntity) => void
}

export default function LandmarkExplorer({ landmarks, onNavigate, onSelect }: LandmarkExplorerProps) {
  const [isExpanded, setIsExpanded] = useState(false) // Start collapsed

  // Sort landmarks: Unvisited first, then visited
  const sortedLandmarks = [...landmarks].sort((a, b) => {
    if (a.visited === b.visited) return 0
    return a.visited ? 1 : -1
  })

  const visitedCount = landmarks.filter(l => l.visited).length
  const totalCount = landmarks.length

  // Safe drag constraints
  const dragConstraints = typeof window !== 'undefined' 
    ? { left: 0, right: window.innerWidth - 320, top: 0, bottom: window.innerHeight - 200 }
    : { left: 0, right: 1000, top: 0, bottom: 600 }

  return (
    <motion.div 
      className="fixed top-20 left-4 z-45 cursor-move"
      drag
      dragMomentum={false}
      dragConstraints={dragConstraints}
      style={{
        maxWidth: '320px',
        maxHeight: 'calc(100vh - 200px)'
      }}
    >
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mb-2 py-3 px-4 flex items-center justify-between"
        style={{
          background: `linear-gradient(145deg, ${minecraftTheme.colors.terracotta.base} 0%, ${minecraftTheme.colors.terracotta.dark} 100%)`,
          border: `3px solid ${minecraftTheme.colors.terracotta.dark}`,
          borderRadius: minecraftTheme.minecraft.borderRadius,
          boxShadow: `0 4px 0 ${minecraftTheme.colors.terracotta.dark}, 0 6px 12px rgba(0,0,0,0.4)`,
          color: '#FFF',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          fontSize: '14px',
          cursor: 'grab',
          textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
          imageRendering: minecraftTheme.minecraft.imageRendering
        }}
      >
        <span className="flex items-center gap-2">
          🧭 EXPLORER
          <span 
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: '#FFD700',
              color: '#2C1810'
            }}
          >
            {visitedCount}/{totalCount}
          </span>
        </span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </motion.button>

      {/* Explorer Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-y-auto cursor-auto custom-scrollbar"
            style={{
              background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
              border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
              borderRadius: minecraftTheme.minecraft.borderRadius,
              boxShadow: minecraftTheme.minecraft.shadowRaised,
              padding: '16px',
              maxHeight: 'calc(100vh - 280px)',
              imageRendering: minecraftTheme.minecraft.imageRendering
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Pixelated corners */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-black/40" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-black/40" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-black/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-black/40" />

            <div className="space-y-2">
              {sortedLandmarks.map((landmark) => (
                <motion.div
                  key={landmark.id}
                  whileHover={{ x: 2, backgroundColor: 'rgba(212, 80, 30, 0.1)' }}
                  className="p-3 rounded-lg border group"
                  style={{
                    background: landmark.visited 
                      ? 'rgba(126, 217, 87, 0.15)' 
                      : 'rgba(255, 255, 255, 0.5)',
                    border: `2px solid ${landmark.visited ? minecraftTheme.colors.accent.green : '#E5E7EB'}`,
                    borderRadius: '8px'
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold leading-tight text-[#2C1810] group-hover:text-[#D4501E] transition-colors">
                        {landmark.icon} {landmark.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: landmark.visited ? minecraftTheme.colors.accent.green : '#9CA3AF',
                            color: 'white'
                          }}
                        >
                          {landmark.visited ? 'VISITED' : 'UNVISITED'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {onSelect && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect({
                              id: landmark.id,
                              type: 'landmark',
                              name: landmark.name,
                              description: landmark.description || `A famous landmark in Washington DC.`,
                              coordinates: landmark.coordinates,
                              visited: landmark.visited,
                              metadata: {
                                category: landmark.category,
                                funFact: landmark.funFact
                              }
                            });
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                          title="View Info"
                        >
                          ℹ️
                        </button>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(landmark.coordinates);
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-green-100 hover:bg-green-200 rounded-full transition-colors opacity-50 group-hover:opacity-100"
                        title="Fly to Location"
                      >
                        ✈️
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
