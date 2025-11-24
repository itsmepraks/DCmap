'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'
import type { DailyChallenge } from '@/app/lib/dailyChallenges'
import { useState } from 'react'

interface DailyChallengesPanelProps {
  challenges: DailyChallenge[]
  streak: number
}

export default function DailyChallengesPanel({ challenges, streak }: DailyChallengesPanelProps) {
  const completedCount = challenges.filter(c => c.completed).length
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Safe drag constraints that work with SSR
  const dragConstraints = typeof window !== 'undefined' 
    ? { left: 0, right: window.innerWidth - 300, top: 0, bottom: window.innerHeight - 300 }
    : { left: 0, right: 1000, top: 0, bottom: 600 }
  
  return (
    <motion.div 
      className="fixed top-4 left-4 z-20 cursor-move"
      drag
      dragMomentum={false}
      dragConstraints={dragConstraints}
      style={{ width: '300px' }}
    >
      {/* Streak Badge - Collapsed State */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-3 cursor-pointer relative group"
          style={{
            imageRendering: minecraftTheme.minecraft.imageRendering,
          }}
        >
          {/* Badge Container */}
          <div 
            className="px-4 py-2 flex items-center justify-between"
            style={{
              background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
              border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
              borderRadius: minecraftTheme.minecraft.borderRadius,
              boxShadow: minecraftTheme.minecraft.shadowRaised,
            }}
          >
            <div className="flex items-center gap-3">
               {/* Flame Icon */}
              <div 
                className="flex items-center justify-center w-10 h-10 rounded bg-[#FFD700] border-2 border-[#B8860B] shadow-[0_2px_0_#B8860B]"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xl"
                >
                  🔥
                </motion.span>
              </div>
              
              {/* Text Info */}
              <div>
                <div className="text-[10px] font-bold uppercase text-[#8B4513] font-mono leading-none mb-1">
                  Day Streak
                </div>
                <div className="text-xl font-bold text-[#D4501E] font-mono leading-none" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.1)' }}>
                  {streak}
                </div>
              </div>
            </div>

            {/* Expand Arrow */}
            <div className="text-[#8B4513] opacity-60 text-[10px] font-mono group-hover:opacity-100 transition-opacity">
              {isExpanded ? '▼' : '▶'}
            </div>
          </div>

          {/* Pixelated corners */}
          <div className="absolute top-0 left-0 w-1 h-1 bg-black/40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-1 h-1 bg-black/40 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40 pointer-events-none" />
        </motion.div>
      )}

      {/* Daily Challenges - Collapsible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 py-3"
              style={{
                background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
                border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
                borderRadius: '8px',
                boxShadow: minecraftTheme.minecraft.shadowRaised,
                imageRendering: minecraftTheme.minecraft.imageRendering,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: minecraftTheme.colors.terracotta.base, fontFamily: 'monospace' }}>
                      DAILY CHALLENGES
                    </div>
                    <div className="text-xs" style={{ color: minecraftTheme.colors.text.secondary, fontFamily: 'monospace' }}>
                      {completedCount}/{challenges.length} Complete
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenges List */}
              <div className="space-y-2">
                {challenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3"
                    style={{
                      background: challenge.completed 
                        ? `linear-gradient(145deg, rgba(126, 217, 87, 0.3) 0%, rgba(93, 160, 64, 0.2) 100%)`
                        : `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.base} 100%)`,
                      border: `2px solid ${challenge.completed ? '#7ED957' : minecraftTheme.colors.terracotta.light}`,
                      borderRadius: '4px',
                      opacity: challenge.completed ? 0.8 : 1,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl">{challenge.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs font-bold" style={{ color: minecraftTheme.colors.text.primary, fontFamily: 'monospace' }}>
                            {challenge.title}
                          </div>
                          {challenge.completed && (
                            <span className="text-sm">✓</span>
                          )}
                        </div>
                        <div className="text-[10px] mb-2" style={{ color: minecraftTheme.colors.text.secondary, fontFamily: 'monospace' }}>
                          {challenge.description}
                        </div>

                        {/* Progress Bar */}
                        <div className="relative">
                          <div 
                            className="h-2 rounded-full overflow-hidden"
                            style={{
                              background: minecraftTheme.colors.beige.dark,
                              border: `1px solid ${minecraftTheme.colors.terracotta.light}`,
                            }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(challenge.current / challenge.target) * 100}%` }}
                              transition={{ duration: 0.5 }}
                              style={{
                                height: '100%',
                                background: challenge.completed ? '#7ED957' : '#FFD700',
                              }}
                            />
                          </div>
                          <div 
                            className="text-[8px] font-bold mt-1 flex items-center justify-between"
                            style={{ color: minecraftTheme.colors.text.secondary, fontFamily: 'monospace' }}
                          >
                            <span>{challenge.current}/{challenge.target}</span>
                            <span>+{challenge.reward.points} pts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Completion Message */}
              {completedCount === challenges.length && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-3 p-3 text-center"
                  style={{
                    background: 'linear-gradient(145deg, #7ED957 0%, #5DA040 100%)',
                    border: `2px solid #5DA040`,
                    borderRadius: '4px',
                    boxShadow: '0 3px 0 #5DA040',
                  }}
                >
                  <div className="text-xs font-bold" style={{ color: '#FFF', fontFamily: 'monospace', textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
                    🎉 ALL CHALLENGES COMPLETE!
                  </div>
                  <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>
                    Come back tomorrow for new challenges
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
