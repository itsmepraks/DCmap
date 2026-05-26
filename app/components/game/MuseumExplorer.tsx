'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SelectedEntity } from '@/app/components/ui/EntityInfoPanel'

interface Museum {
  id: string
  name: string
  coordinates: [number, number]
  properties?: any
}

interface MuseumExplorerProps {
  isVisible: boolean
  visitedLandmarks: Set<string>
  onNavigate: (coordinates: [number, number]) => void
  onSelect: (entity: SelectedEntity) => void
}

export default function MuseumExplorer({ isVisible, visitedLandmarks, onNavigate, onSelect }: MuseumExplorerProps) {
  const [museums, setMuseums] = useState<Museum[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(max-width: 639px)')
    const update = () => setIsCompact(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])
  
  useEffect(() => {
    fetch('/data/museums.geojson')
      .then(res => res.json())
      .then(data => {
        setMuseums(data.features.map((f: any) => ({
          id: f.properties.id || f.properties.NAME,
          name: f.properties.NAME,
          coordinates: f.geometry.coordinates,
          properties: f.properties
        })))
      })
      .catch(err => console.error('Failed to load museums:', err))
  }, [])

  if (!isVisible) return null

  // Safe drag constraints
  const dragConstraints = typeof window !== 'undefined' 
    ? { left: 0, right: window.innerWidth - 300, top: 0, bottom: window.innerHeight - 200 }
    : { left: 0, right: 1000, top: 0, bottom: 600 }

  // Calculate counts
  const visitedCount = museums.filter(m => visitedLandmarks.has(String(m.id))).length
  const totalCount = museums.length

  // Sort museums: Unvisited first, then visited
  const sortedMuseums = [...museums].sort((a, b) => {
    const aVisited = visitedLandmarks.has(String(a.id))
    const bVisited = visitedLandmarks.has(String(b.id))
    if (aVisited === bVisited) return 0
    return aVisited ? 1 : -1
  })

  return (
    <motion.div 
      className="fixed right-2 top-[4.65rem] z-45 cursor-default sm:left-4 sm:right-auto sm:top-36 sm:cursor-move"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      drag={!isCompact}
      dragMomentum={false}
      dragConstraints={dragConstraints}
      style={{
        width: isCompact ? 'calc(50vw - 0.75rem)' : '300px',
        maxWidth: isCompact ? '190px' : '300px',
        maxHeight: 'calc(100vh - 200px)'
      }}
    >
      {/* Clean Toggle Header */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="min-h-11 w-full rounded-xl px-2 py-2 sm:px-3 sm:py-2.5 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, #3B82C6 0%, #2563A0 100%)`,
          border: `2px solid #1E4B8B`,
          boxShadow: `0 4px 12px rgba(0,0,0,0.25)`,
          color: '#FFF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          cursor: 'grab',
        }}
      >
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <span className="shrink-0 text-base sm:text-lg">🎨</span>
          <span className="truncate text-[11px] font-semibold tracking-wide sm:text-sm">MUSEUMS</span>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <span 
            className="rounded-full px-1.5 py-0.5 text-[10px] font-bold sm:px-2 sm:text-xs"
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
                border: `2px solid #3B82C6`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                maxHeight: 'calc(100vh - 350px)',
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="space-y-2">
                {sortedMuseums.map((museum, index) => {
                  const isVisited = visitedLandmarks.has(String(museum.id))
                  return (
                    <motion.div
                      key={museum.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`
                        p-2.5 rounded-lg cursor-pointer transition-all duration-200
                        ${isVisited 
                          ? 'bg-blue-50 hover:bg-blue-100 border border-blue-200' 
                          : 'bg-stone-50 hover:bg-stone-100 border border-stone-200'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        {/* Icon */}
                        <div className={`
                          w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg
                          ${isVisited 
                            ? 'bg-blue-100' 
                            : 'bg-stone-100'
                          }
                        `}>
                          🏛️
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`
                            text-xs font-semibold truncate
                            ${isVisited ? 'text-stone-800' : 'text-stone-600'}
                          `}>
                            {museum.name}
                          </h4>
                          <span className={`text-xs ${isVisited ? 'text-stone-500' : 'text-stone-400'}`}>
                            museum
                          </span>
                        </div>

                        {/* Status Indicator */}
                        <div className={`
                          flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold
                          ${isVisited 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-stone-200 text-stone-500'
                          }
                        `}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isVisited ? 'bg-white' : 'bg-stone-400'}`}></span>
                          {isVisited ? '✓' : '—'}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1 flex-shrink-0">
                          {/* Info Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect({
                                id: String(museum.id),
                                type: 'museum',
                                name: museum.name,
                                description: museum.properties?.DESCRIPTION || 'A museum in Washington DC.',
                                coordinates: museum.coordinates,
                                visited: isVisited,
                                metadata: {
                                  address: museum.properties?.ADDRESS,
                                  phone: museum.properties?.PHONE,
                                  url: museum.properties?.URL
                                }
                              });
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors border border-amber-200"
                            title="View details"
                          >
                            <span className="text-xs">ℹ️</span>
                          </button>
                          {/* Fly Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate(museum.coordinates);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-green-50 hover:bg-green-100 text-green-600 transition-colors border border-green-200"
                            title="Fly to location"
                          >
                            <span className="text-xs">✈️</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Summary Footer */}
              <div className="mt-3 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {visitedCount} discovered
                  </span>
                  <span className="font-semibold text-blue-600">
                    {totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0}% complete
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
