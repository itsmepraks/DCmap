'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QuestCard from './QuestCard'
import type { Quest } from '@/app/lib/questSystem'
import { minecraftTheme } from '@/app/lib/theme'

interface QuestPanelProps {
  quests: Quest[]
  activeQuestIds: string[]
  onStartQuest: (questId: string) => void
}

export default function QuestPanel({ quests, activeQuestIds, onStartQuest }: QuestPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const activeQuests = quests.filter(q => activeQuestIds.includes(q.id))
  const availableQuests = quests.filter(q => q.isUnlocked && !q.isCompleted && !activeQuestIds.includes(q.id))
  const completedQuests = quests.filter(q => q.isCompleted)

  return (
    <div 
      className="fixed top-24 right-4 z-20"
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
          cursor: 'pointer',
          textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
          imageRendering: minecraftTheme.minecraft.imageRendering
        }}
      >
        <span className="flex items-center gap-2">
          📜 QUESTS
          {activeQuests.length > 0 && (
            <span 
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: '#FFD700',
                color: '#2C1810'
              }}
            >
              {activeQuests.length}
            </span>
          )}
        </span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </motion.button>

      {/* Quest panel content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-y-auto"
            style={{
              background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
              border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
              borderRadius: minecraftTheme.minecraft.borderRadius,
              boxShadow: minecraftTheme.minecraft.shadowRaised,
              padding: '16px',
              maxHeight: 'calc(100vh - 280px)',
              imageRendering: minecraftTheme.minecraft.imageRendering
            }}
          >
            {/* Pixelated corners */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-black/40" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-black/40" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-black/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-black/40" />

            {/* Active quests */}
            {activeQuests.length > 0 && (
              <div className="mb-4">
                <h3 
                  className="text-sm font-bold mb-2"
                  style={{
                    color: minecraftTheme.colors.terracotta.base,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase'
                  }}
                >
                  Active Quests
                </h3>
                {activeQuests.map(quest => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    isActive={true}
                  />
                ))}
              </div>
            )}

            {/* Available quests */}
            {availableQuests.length > 0 && (
              <div className="mb-4">
                <h3 
                  className="text-sm font-bold mb-2"
                  style={{
                    color: minecraftTheme.colors.terracotta.base,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase'
                  }}
                >
                  Available Quests
                </h3>
                {availableQuests.map(quest => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onStart={() => onStartQuest(quest.id)}
                  />
                ))}
              </div>
            )}

            {/* Completed quests */}
            {completedQuests.length > 0 && (
              <div>
                <h3 
                  className="text-sm font-bold mb-2"
                  style={{
                    color: minecraftTheme.colors.text.secondary,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase'
                  }}
                >
                  Completed ({completedQuests.length})
                </h3>
                {completedQuests.map(quest => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {quests.length === 0 && (
              <div 
                className="text-center py-8 text-sm"
                style={{
                  color: minecraftTheme.colors.text.secondary,
                  fontFamily: 'monospace'
                }}
              >
                <div className="text-4xl mb-2">📜</div>
                <p>No quests available yet.</p>
                <p className="text-xs mt-1">Explore DC to unlock quests!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

