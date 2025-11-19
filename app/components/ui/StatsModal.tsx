'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentTier, getNextTier, getProgressToNextTier } from '@/app/lib/achievementTiers'

interface Landmark {
  id: string
  name: string
  description: string
  icon: string
  category: string
  visited: boolean
}

interface QuestStats {
  totalPoints: number
  completedQuestsCount: number
  totalQuestsCount: number
  unlockedBadges: string[]
}

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
  landmarks: Landmark[]
  visitedCount: number
  totalCount: number
  onReset: () => void
  questStats?: QuestStats
}

export default function StatsModal({
  isOpen,
  onClose,
  landmarks,
  visitedCount,
  totalCount,
  onReset,
  questStats
}: StatsModalProps) {
  const percentage = Math.round((visitedCount / totalCount) * 100)
  const questPercentage = questStats 
    ? Math.round((questStats.completedQuestsCount / questStats.totalQuestsCount) * 100)
    : 0
  
  // Achievement tier calculation
  const currentTier = getCurrentTier(visitedCount, questStats?.totalPoints || 0)
  const nextTier = getNextTier(currentTier)
  const tierProgress = getProgressToNextTier(visitedCount, questStats?.totalPoints || 0, currentTier)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #FFF8E7 0%, #F5EBD9 100%)',
                border: '4px solid #8B4513',
                fontFamily: 'monospace'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full font-bold text-xl transition-colors hover:bg-red-100"
                style={{
                  color: '#C1604A',
                  border: '2px solid #C1604A'
                }}
              >
                ×
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-green-500 via-blue-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
                  Game Statistics
                </h2>
                <p className="text-stone-600 font-medium">
                  Track your journey through Washington D.C.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left Column: Progress & Tier */}
                <div className="space-y-6">
                  {/* Main Progress Card */}
                  <div className="bg-white/50 p-6 rounded-2xl border-2 border-stone-200 shadow-sm">
                    <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                      <span>📊</span> Exploration Progress
                    </h3>
                    
                    {/* Landmarks Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm font-bold mb-1 text-stone-600">
                        <span>Landmarks Visited</span>
                        <span>{visitedCount} / {totalCount}</span>
                      </div>
                      <div className="h-4 bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-green-400 to-green-600"
                        />
                      </div>
                    </div>

                    {/* Quests Progress */}
                    {questStats && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm font-bold mb-1 text-stone-600">
                          <span>Quests Completed</span>
                          <span>{questStats.completedQuestsCount} / {questStats.totalQuestsCount}</span>
                        </div>
                        <div className="h-4 bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${questPercentage}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* Total Points */}
                    <div className="mt-6 flex items-center justify-between bg-amber-100 p-4 rounded-xl border-2 border-amber-200">
                      <span className="font-bold text-amber-800">Total Score</span>
                      <span className="text-3xl font-black text-amber-600">{questStats?.totalPoints || 0} pts</span>
                    </div>
                  </div>

                  {/* Achievement Tier Card */}
                  <div 
                    className="p-6 rounded-2xl border-2 shadow-sm relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${currentTier.color}15 0%, #FFFFFF 100%)`,
                      borderColor: currentTier.color
                    }}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-5xl filter drop-shadow-md">{currentTier.icon}</div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: currentTier.color }}>Current Rank</div>
                          <h3 className="text-2xl font-bold" style={{ color: '#2C1810' }}>{currentTier.name}</h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {currentTier.perks.map((perk, index) => (
                          <span 
                            key={index}
                            className="text-xs font-bold px-2 py-1 rounded-md bg-white/60 border border-black/5 text-stone-700"
                          >
                            {perk}
                          </span>
                        ))}
                      </div>

                      {/* Next Tier Progress */}
                      {nextTier && tierProgress && (
                        <div className="mt-4 pt-4 border-t border-black/10">
                          <div className="text-xs font-bold mb-3 text-stone-600 flex items-center gap-2">
                            <span>Next Rank:</span>
                            <span className="px-2 py-0.5 rounded bg-white border border-stone-200">
                              {nextTier.icon} {nextTier.name}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex justify-between text-[10px] font-bold mb-1 text-stone-500">
                                <span>Landmarks</span>
                                <span>{visitedCount}/{nextTier.minLandmarks}</span>
                              </div>
                              <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${tierProgress.landmarkProgress}%` }}
                                  className="h-full rounded-full"
                                  style={{ background: nextTier.color }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] font-bold mb-1 text-stone-500">
                                <span>Points</span>
                                <span>{questStats?.totalPoints || 0}/{nextTier.minPoints}</span>
                              </div>
                              <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${tierProgress.pointProgress}%` }}
                                  className="h-full rounded-full"
                                  style={{ background: nextTier.color }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Badges & Landmarks */}
                <div className="space-y-6">
                  {/* Badges Section */}
                  {questStats && questStats.unlockedBadges.length > 0 && (
                    <div className="bg-white/50 p-6 rounded-2xl border-2 border-stone-200 shadow-sm">
                      <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                        <span>🎖️</span> Badges Collection
                      </h3>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                        {questStats.unlockedBadges.map((badge, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="aspect-square flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl border-2 border-orange-200 shadow-sm text-2xl tooltip-container relative group cursor-help"
                          >
                            {/* Assuming badge is an emoji or icon string for now. If it's an ID, we might need a map. 
                                For this implementation, we'll display a generic medal if it's just a string ID, 
                                or the string itself if it's an emoji. */}
                            <span>{badge.includes(' ') ? badge : '🏅'}</span>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                              {badge}
                            </div>
                          </motion.div>
                        ))}
                        {/* Placeholders for locked badges could go here */}
                      </div>
                    </div>
                  )}

                  {/* Landmarks Gallery */}
                  <div className="bg-white/50 p-6 rounded-2xl border-2 border-stone-200 shadow-sm max-h-[400px] overflow-y-auto custom-scrollbar">
                    <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2 sticky top-0 bg-inherit z-10">
                      <span>🏛️</span> Landmarks Gallery
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {landmarks.map((landmark, index) => (
                        <motion.div
                          key={landmark.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                            landmark.visited 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-stone-100 border-stone-200 opacity-70 grayscale-[0.5]'
                          }`}
                        >
                          <div className="text-2xl w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-black/5 shadow-sm">
                            {landmark.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-bold truncate ${landmark.visited ? 'text-stone-800' : 'text-stone-500'}`}>
                                {landmark.name}
                              </h4>
                              {landmark.visited && <span className="text-green-600 font-bold text-xs">✓ FOUND</span>}
                            </div>
                            <p className="text-xs text-stone-500 truncate">
                              {landmark.visited ? landmark.category : 'Explore to discover'}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t-2 border-stone-200/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #5DA5DB 0%, #3A7CA5 100%)',
                    border: '2px solid #2A6C95',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.2)'
                  }}
                >
                  Continue Exploring
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                      onReset()
                      onClose()
                    }
                  }}
                  className="px-6 py-3 rounded-xl font-bold text-white shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #C1604A 0%, #A04030 100%)',
                    border: '2px solid #803020',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.2)'
                  }}
                >
                  Reset Progress
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
