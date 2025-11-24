'use client'

import { motion } from 'framer-motion'
import type { Quest } from '@/app/lib/questSystem'
import { minecraftTheme } from '@/app/lib/theme'

interface QuestCardProps {
  quest: Quest
  onStart?: () => void
  isActive?: boolean
}

export default function QuestCard({ quest, onStart, isActive = false }: QuestCardProps) {
  const completedObjectives = quest.objectives.filter(obj => obj.completed).length
  const totalObjectives = quest.objectives.length
  const progress = (completedObjectives / totalObjectives) * 100

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#7ED957'
      case 'medium': return '#FFD700'
      case 'hard': return '#D4501E'
      default: return '#7ED957'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative mb-3"
      style={{
        background: isActive 
          ? `linear-gradient(145deg, #FFF8DC 0%, #F5EBD9 100%)`
          : `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
        border: `3px solid ${isActive ? getDifficultyColor(quest.difficulty) : minecraftTheme.colors.terracotta.base}`,
        borderRadius: minecraftTheme.minecraft.borderRadius,
        boxShadow: isActive 
          ? `0 6px 0 ${getDifficultyColor(quest.difficulty)}, 0 8px 12px rgba(0,0,0,0.4)`
          : minecraftTheme.minecraft.shadowRaised,
        imageRendering: minecraftTheme.minecraft.imageRendering,
        padding: '12px',
        opacity: quest.isUnlocked ? 1 : 0.6
      }}
    >
      {/* Pixelated corners */}
      <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" />
      <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" />
      <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" />
      <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" />

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{quest.icon}</span>
          <div>
            <h3 
              className="text-sm font-bold"
              style={{
                color: minecraftTheme.colors.text.primary,
                fontFamily: 'monospace'
              }}
            >
              {quest.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-[9px] font-bold px-2 py-0.5"
                style={{
                  background: getDifficultyColor(quest.difficulty),
                  color: '#FFF',
                  borderRadius: '2px',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase'
                }}
              >
                {quest.difficulty}
              </span>
              <span
                className="text-[9px]"
                style={{
                  color: minecraftTheme.colors.text.secondary,
                  fontFamily: 'monospace'
                }}
              >
                {quest.rewards.points} pts
              </span>
            </div>
          </div>
        </div>
        
        {quest.isCompleted && (
          <span className="text-xl">✓</span>
        )}
      </div>

      {/* Description */}
      <p 
        className="text-xs mb-3"
        style={{
          color: minecraftTheme.colors.text.secondary,
          fontFamily: 'monospace',
          lineHeight: '1.4'
        }}
      >
        {quest.description}
      </p>

      {/* Progress bar */}
      {!quest.isCompleted && isActive && (
        <div 
          className="mb-3"
          style={{
            background: minecraftTheme.colors.beige.dark,
            border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
            borderRadius: '2px',
            height: '12px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${getDifficultyColor(quest.difficulty)} 0%, ${getDifficultyColor(quest.difficulty)}CC 100%)`,
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)'
            }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
            style={{
              color: '#FFF',
              fontFamily: 'monospace',
              textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
              zIndex: 1
            }}
          >
            {completedObjectives}/{totalObjectives}
          </span>
        </div>
      )}

      {/* Objectives list */}
      {isActive && (
        <div className="space-y-1 mb-3">
          {quest.objectives.map((objective, index) => (
            <div 
              key={index}
              className="flex items-start gap-2 text-xs"
              style={{
                color: objective.completed 
                  ? minecraftTheme.colors.text.secondary
                  : minecraftTheme.colors.text.primary,
                fontFamily: 'monospace',
                textDecoration: objective.completed ? 'line-through' : 'none'
              }}
            >
              <span>{objective.completed ? '☑' : '☐'}</span>
              <span>{objective.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action button */}
      {!quest.isCompleted && quest.isUnlocked && !isActive && onStart && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full py-2 text-xs font-bold"
          style={{
            background: `linear-gradient(145deg, ${getDifficultyColor(quest.difficulty)} 0%, ${getDifficultyColor(quest.difficulty)}CC 100%)`,
            border: `2px solid ${getDifficultyColor(quest.difficulty)}`,
            borderRadius: '4px',
            boxShadow: `0 3px 0 ${getDifficultyColor(quest.difficulty)}AA, 0 4px 8px rgba(0,0,0,0.3)`,
            color: '#FFF',
            fontFamily: 'monospace',
            textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
            cursor: 'pointer'
          }}
        >
          START QUEST
        </motion.button>
      )}

      {!quest.isUnlocked && (
        <div 
          className="text-center py-2 text-xs font-bold"
          style={{
            color: minecraftTheme.colors.text.secondary,
            fontFamily: 'monospace'
          }}
        >
          🔒 Complete previous quests to unlock
        </div>
      )}
    </motion.div>
  )
}

