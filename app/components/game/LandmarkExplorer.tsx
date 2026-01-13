'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [isExpanded, setIsExpanded] = useState(false)

  // Sort landmarks: Unvisited first, then visited
  const sortedLandmarks = [...landmarks].sort((a, b) => {
    if (a.visited === b.visited) return 0
    return a.visited ? 1 : -1
  })

  const visitedCount = landmarks.filter(l => l.visited).length
  const totalCount = landmarks.length

  // Safe drag constraints
  const dragConstraints = typeof window !== 'undefined' 
    ? { left: 0, right: window.innerWidth - 300, top: 0, bottom: window.innerHeight - 200 }
    : { left: 0, right: 1000, top: 0, bottom: 600 }

  return (
    <motion.div 
      className="fixed top-20 left-4 z-45 cursor-move"
      drag
      dragMomentum={false}
      dragConstraints={dragConstraints}
      style={{
        maxWidth: '280px',
        maxHeight: 'calc(100vh - 200px)'
      }}
    >
      {/* Clean Toggle Header */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2.5 px-3 flex items-center justify-between rounded-xl"
        style={{
          background: `linear-gradient(135deg, #C65D3B 0%, #A04830 100%)`,
          border: `2px solid #8B3A24`,
          boxShadow: `0 4px 12px rgba(0,0,0,0.25)`,
          color: '#FFF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          cursor: 'grab',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🧭</span>
          <span className="font-semibold text-sm tracking-wide">LANDMARKS</span>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)'
            }}
          >
            {visitedCount}/{totalCount}
          </span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm opacity-70"
          >
            ▼
          </motion.span>
        </div>
      </motion.button>

      {/* Explorer Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden mt-2"
          >
            <div
              className="overflow-y-auto cursor-auto rounded-xl p-3"
              style={{
                background: 'rgba(255, 252, 248, 0.98)',
                border: `2px solid #C65D3B`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                maxHeight: 'calc(100vh - 280px)',
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="space-y-1.5">
                {sortedLandmarks.map((landmark, index) => (
                  <motion.div
                    key={landmark.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`
                      flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200
                      ${landmark.visited 
                        ? 'bg-green-50 hover:bg-green-100 border border-green-200' 
                        : 'bg-stone-50 hover:bg-stone-100 border border-stone-200'
                      }
                    `}
                    onClick={() => {
                      if (onSelect) {
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
                      }
                    }}
                  >
                    {/* Icon */}
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-lg
                      ${landmark.visited 
                        ? 'bg-green-100' 
                        : 'bg-stone-100'
                      }
                    `}>
                      {landmark.icon}
                    </div>

                    {/* Name & Status */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`
                        text-xs font-semibold truncate
                        ${landmark.visited ? 'text-stone-800' : 'text-stone-500'}
                      `}>
                        {landmark.name}
                      </h4>
                      {landmark.visited && (
                        <span className="text-[9px] text-green-600 font-medium">✓ Visited</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(landmark.coordinates);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                        title="Fly to location"
                      >
                        <span className="text-sm">✈️</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Summary Footer */}
              <div className="mt-3 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between text-[10px] text-stone-500">
                  <span>{visitedCount} discovered</span>
                  <span className="font-semibold text-green-600">
                    {Math.round((visitedCount / totalCount) * 100)}% complete
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
