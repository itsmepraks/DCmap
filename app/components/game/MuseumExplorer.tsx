'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'
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
  
  useEffect(() => {
    fetch('/data/museums.geojson')
      .then(res => res.json())
      .then(data => {
        setMuseums(data.features.map((f: any) => ({
          id: f.properties.id || f.properties.NAME, // Fallback to name if ID missing
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
    ? { left: 0, right: window.innerWidth - 320, top: 0, bottom: window.innerHeight - 200 }
    : { left: 0, right: 1000, top: 0, bottom: 600 }

  // Calculate counts
  const visitedCount = museums.filter(m => visitedLandmarks.has(String(m.id))).length
  const totalCount = museums.length

  return (
    <motion.div 
      className="fixed top-36 left-4 z-45 cursor-move"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
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
          background: `linear-gradient(145deg, #4A90E2 0%, #2E6BA0 100%)`,
          border: `3px solid #1C4E80`,
          borderRadius: minecraftTheme.minecraft.borderRadius,
          boxShadow: `0 4px 0 #1C4E80, 0 6px 12px rgba(0,0,0,0.4)`,
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
          🏛️ MUSEUMS
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
              border: `3px solid #2E6BA0`,
              borderRadius: minecraftTheme.minecraft.borderRadius,
              boxShadow: minecraftTheme.minecraft.shadowRaised,
              padding: '16px',
              maxHeight: 'calc(100vh - 350px)',
              imageRendering: minecraftTheme.minecraft.imageRendering
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              {museums.map((museum) => {
                const isVisited = visitedLandmarks.has(String(museum.id))
                return (
                  <motion.div
                    key={museum.id}
                    whileHover={{ x: 2, backgroundColor: 'rgba(74, 144, 226, 0.1)' }}
                    className="p-3 rounded-lg border border-[#4A90E2]/30 bg-white/50 cursor-pointer group"
                    style={{
                      background: isVisited 
                        ? 'rgba(74, 144, 226, 0.15)' 
                        : 'rgba(255, 255, 255, 0.5)',
                      border: `2px solid ${isVisited ? '#4A90E2' : '#E5E7EB'}`
                    }}
                    onClick={() => {
                      onSelect({
                        id: String(museum.id),
                        type: 'museum',
                        name: museum.name,
                        description: museum.properties.DESCRIPTION,
                        coordinates: museum.coordinates,
                        visited: isVisited,
                        metadata: {
                          address: museum.properties.ADDRESS,
                          phone: museum.properties.PHONE,
                          url: museum.properties.URL
                        }
                      })
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-xs font-bold leading-tight text-[#2C1810] group-hover:text-[#2E6BA0] transition-colors">
                          {museum.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span 
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              background: isVisited ? '#4A90E2' : '#9CA3AF',
                              color: 'white'
                            }}
                          >
                            {isVisited ? 'VISITED' : 'UNVISITED'}
                          </span>
                        </div>
                        {museum.properties.ADDRESS && (
                          <p className="text-[10px] text-gray-500 mt-1 truncate">
                            {museum.properties.ADDRESS}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect({
                                id: String(museum.id),
                                type: 'museum',
                                name: museum.name,
                                description: museum.properties.DESCRIPTION,
                                coordinates: museum.coordinates,
                                visited: isVisited,
                                metadata: {
                                address: museum.properties.ADDRESS,
                                phone: museum.properties.PHONE,
                                url: museum.properties.URL
                                }
                            });
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                          title="View Info"
                        >
                           ℹ️
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect({
                                id: String(museum.id),
                                type: 'museum',
                                name: museum.name,
                                description: museum.properties.DESCRIPTION,
                                coordinates: museum.coordinates,
                                visited: isVisited,
                                metadata: {
                                address: museum.properties.ADDRESS,
                                phone: museum.properties.PHONE,
                                url: museum.properties.URL
                                }
                            });
                            onNavigate(museum.coordinates);
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-green-100 hover:bg-green-200 rounded-full transition-colors opacity-50 group-hover:opacity-100"
                          title="Fly to Location"
                        >
                           ✈️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
