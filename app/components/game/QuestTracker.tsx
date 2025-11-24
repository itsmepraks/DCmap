'use client'

import { motion } from 'framer-motion'
import type { Quest } from '@/app/lib/questSystem'
import { minecraftTheme } from '@/app/lib/theme'

interface QuestTrackerProps {
  activeQuests: Quest[]
}

export default function QuestTracker({ activeQuests }: QuestTrackerProps) {
  if (activeQuests.length === 0) return null

  return (
    <div 
      className="fixed top-24 left-4 z-20 max-w-[280px]"
      style={{ pointerEvents: 'none' }} // Allow clicking through to map
    >
      {activeQuests.map((quest) => (
        <motion.div
          key={quest.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mb-3 pointer-events-auto" // Re-enable clicks for content
          style={{
            background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
            border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
            borderRadius: minecraftTheme.minecraft.borderRadius,
            boxShadow: minecraftTheme.minecraft.shadowRaised,
            padding: '12px',
            imageRendering: minecraftTheme.minecraft.imageRendering
          }}
        >
          {/* Pixelated corners */}
          <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" />
          <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" />
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" />
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" />

          {/* Header */}
          <div className="flex items-center gap-2 mb-2 border-b-2 border-dashed border-[#D4501E]/30 pb-2">
            <span className="text-xl filter drop-shadow-sm">{quest.icon}</span>
            <h3 
              className="text-sm font-bold leading-tight"
              style={{
                color: minecraftTheme.colors.text.primary,
                fontFamily: 'monospace',
                textShadow: '1px 1px 0 rgba(255,255,255,0.5)'
              }}
            >
              {quest.title}
            </h3>
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            {quest.objectives.map((objective, index) => (
              <div key={index} className="flex items-start gap-2">
                <div 
                  className="mt-1 w-3 h-3 border-2 flex-shrink-0 flex items-center justify-center"
                  style={{
                    borderColor: objective.completed ? '#7ED957' : minecraftTheme.colors.terracotta.base,
                    background: objective.completed ? '#7ED957' : 'rgba(255,255,255,0.5)',
                    borderRadius: '2px'
                  }}
                >
                  {objective.completed && (
                    <span className="text-[10px] text-white font-bold leading-none">✓</span>
                  )}
                </div>
                <span 
                  className="text-xs leading-tight"
                  style={{
                    color: objective.completed ? '#5DA040' : minecraftTheme.colors.text.secondary,
                    fontFamily: 'monospace',
                    textDecoration: objective.completed ? 'line-through' : 'none'
                  }}
                >
                  {objective.description}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

