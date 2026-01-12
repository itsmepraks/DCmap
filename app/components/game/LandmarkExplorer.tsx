'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

interface Landmark {
  id: string
  name: string
  icon: string
  visited: boolean
  coordinates: [number, number]
  category?: string
}

interface LandmarkExplorerProps {
  landmarks: Landmark[]
  onNavigate: (coordinates: [number, number]) => void
}

export default function LandmarkExplorer({ landmarks, onNavigate }: LandmarkExplorerProps) {
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

            <div className="space-y-3">
              {sortedLandmarks.map((landmark) => (
                <motion.div
                  key={landmark.id}
                  whileHover={{ x: 2 }}
                  className="p-3 rounded-lg relative overflow-hidden group"
                  style={{
                    background: landmark.visited 
                      ? 'rgba(126, 217, 87, 0.15)' 
                      : 'rgba(255, 255, 255, 0.5)',
                    border: `2px solid ${landmark.visited ? minecraftTheme.colors.accent.green : '#E5E7EB'}`,
                    borderRadius: '8px'
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xl filter drop-shadow-sm">{landmark.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold leading-tight" style={{ color: minecraftTheme.colors.text.primary }}>
                          {landmark.name}
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
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onNavigate(landmark.coordinates)}
                      className="p-2 rounded-lg"
                      style={{
                        background: minecraftTheme.colors.terracotta.base,
                        color: 'white',
                        boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                      }}
                      title="Fly to location"
                    >
                      ✈️
                    </motion.button>
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
