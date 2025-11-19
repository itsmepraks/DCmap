'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'
import type { DailyChallenge } from '@/app/lib/dailyChallenges'

interface DailyChallengesPanelProps {
  challenges: DailyChallenge[]
  streak: number
}

export default function DailyChallengesPanel({ challenges, streak }: DailyChallengesPanelProps) {
  const completedCount = challenges.filter(c => c.completed).length
  
  return (
    <div className="fixed top-4 right-4 z-20" style={{ width: '300px' }}>
      {/* Streak Badge */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-3 px-4 py-3"
          style={{
            background: `linear-gradient(145deg, #FFD700 0%, #FFA500 100%)`,
            border: `3px solid #B8860B`,
            borderRadius: '8px',
            boxShadow: '0 6px 0 #B8860B, 0 8px 16px rgba(0,0,0,0.3)',
            imageRendering: minecraftTheme.minecraft.imageRendering,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl"
              >
                🔥
              </motion.span>
              <div>
                <div className="text-xs font-bold" style={{ color: '#8B4513', fontFamily: 'monospace' }}>
                  DAY STREAK
                </div>
                <div className="text-xl font-bold" style={{ color: '#FFF', fontFamily: 'monospace', textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
                  {streak}
                </div>
              </div>
            </div>
            <div className="text-xs" style={{ color: '#8B4513', fontFamily: 'monospace', fontWeight: 'bold' }}>
              Keep it up!
            </div>
          </div>
        </motion.div>
      )}

      {/* Daily Challenges */}
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
    </div>
  )
}

