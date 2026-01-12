'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

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
  if (!entity) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div 
          className="pointer-events-auto relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
            border: `4px solid ${minecraftTheme.colors.terracotta.base}`,
            fontFamily: 'monospace'
          }}
        >
          {/* Header Image/Icon Area */}
          <div 
            className="relative h-32 flex items-center justify-center"
            style={{
              background: entity.type === 'museum' 
                ? 'linear-gradient(135deg, #4A90E2 0%, #2E6BA0 100%)' 
                : entity.type === 'tree'
                  ? 'linear-gradient(135deg, #7ED957 0%, #5DA040 100%)'
                  : 'linear-gradient(135deg, #D4501E 0%, #B8431A 100%)'
            }}
          >
            <div className="text-6xl filter drop-shadow-lg transform hover:scale-110 transition-transform duration-300">
              {entity.type === 'museum' ? '🏛️' : entity.type === 'tree' ? '🌳' : '📍'}
            </div>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-all hover:scale-110"
            >
              ✕
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 space-y-6">
            {/* Title & Status */}
            <div className="text-center">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
                style={{
                  background: 'rgba(0,0,0,0.05)',
                  color: entity.type === 'museum' ? '#2E6BA0' : '#8B4513'
                }}
              >
                {entity.type}
              </div>
              <h2 className="text-2xl font-bold text-[#2C1810] leading-tight mb-2">
                {entity.name}
              </h2>
              
              {entity.visited && (
                <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-sm bg-green-50 py-1.5 px-4 rounded-full mx-auto w-fit border border-green-200">
                  <span>✓ VISITED</span>
                  <span className="w-1 h-1 rounded-full bg-green-400" />
                  <span>+XP EARNED</span>
                </div>
              )}
            </div>

            {/* Description Card */}
            {entity.description && (
              <div 
                className="p-4 rounded-xl text-[#5D4037] text-sm leading-relaxed shadow-inner"
                style={{ background: 'rgba(255,255,255,0.5)' }}
              >
                {entity.description}
              </div>
            )}

            {/* Info Grid - Fun Facts & Details */}
            {entity.metadata && Object.keys(entity.metadata).length > 0 && (
              <div className="grid gap-3">
                {Object.entries(entity.metadata).map(([key, value]) => (
                  value && (
                    <div 
                      key={key} 
                      className="bg-white/60 p-3 rounded-xl border border-[#D4501E]/10 flex flex-col"
                    >
                      <span className="text-[10px] text-[#8B7355] uppercase font-bold mb-1 tracking-wide">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-[#2C1810] font-medium leading-snug">
                        {String(value)}
                      </span>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => onNavigate(entity.coordinates)}
                className="flex-1 py-3 px-4 bg-[#7ED957] hover:bg-[#6BC94A] text-white font-bold rounded-xl shadow-[0_4px_0_#5DA040] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 group"
              >
                <span className="group-hover:rotate-45 transition-transform duration-300">🧭</span> 
                FLY TO LOCATION
              </button>
              
              <button
                onClick={() => {
                  const url = `https://www.google.com/search?q=${encodeURIComponent(entity.name + ' Washington DC')}`
                  window.open(url, '_blank')
                }}
                className="py-3 px-4 bg-[#5DA5DB] hover:bg-[#4C94CA] text-white font-bold rounded-xl shadow-[0_4px_0_#3A7CA5] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center"
                title="Search on Google"
              >
                🔍
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
