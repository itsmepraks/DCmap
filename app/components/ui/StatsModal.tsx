'use client'

import { motion, AnimatePresence } from 'framer-motion'

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
            className="fixed inset-0 bg-black/60 z-40"
            style={{ backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-8"
              style={{
                background: 'linear-gradient(135deg, #EFE6D5 0%, #F5EBD9 100%)',
                border: '4px solid #C1604A',
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                fontFamily: 'monospace'
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full font-bold text-xl"
                style={{
                  background: 'rgba(193, 96, 74, 0.2)',
                  color: '#C1604A',
                  border: '2px solid #C1604A'
                }}
              >
                ×
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <h2
                  className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#7ED957] via-[#5DA5DB] to-[#F2A65A] bg-clip-text text-transparent"
                >
                  🎮 Game Statistics
                </h2>
                <p className="text-sm" style={{ color: '#5D4037' }}>
                  Track your DC exploration progress
                </p>
              </div>

              {/* Progress Summary */}
              <div
                className="mb-6 p-6 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #7ED957 0%, #66BB6A 100%)',
                  border: '3px solid #4A7C24',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <div className="text-center">
                  <div
                    className="text-5xl font-bold mb-2"
                    style={{
                      color: '#FFF',
                      textShadow: '2px 2px 0 rgba(0,0,0,0.3)'
                    }}
                  >
                    {visitedCount}/{totalCount}
                  </div>
                  <div
                    className="text-xl font-bold mb-3"
                    style={{
                      color: '#FFD700',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.3)'
                    }}
                  >
                    {percentage}% Complete
                  </div>
                  
                  {/* Progress bar */}
                  <div
                    className="h-4 rounded-full overflow-hidden"
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      border: '2px solid rgba(0,0,0,0.3)'
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)'
                      }}
                    />
                  </div>
                </div>

                {percentage === 100 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="mt-4 text-center text-xl font-bold"
                    style={{
                      color: '#FFD700',
                      textShadow: '2px 2px 0 rgba(0,0,0,0.3)'
                    }}
                  >
                    🎉 CONGRATULATIONS! ALL LANDMARKS DISCOVERED!
                  </motion.div>
                )}
              </div>

              {/* Landmarks List */}
              <div className="mb-6">
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ color: '#2C1810' }}
                >
                  🏛️ Landmarks Gallery
                </h3>
                <div className="grid gap-3">
                  {landmarks.map((landmark, index) => (
                    <motion.div
                      key={landmark.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl"
                      style={{
                        background: landmark.visited
                          ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%)'
                          : 'rgba(255, 255, 255, 0.5)',
                        border: landmark.visited
                          ? '2px solid #FFD700'
                          : '2px solid #CCC',
                        boxShadow: landmark.visited
                          ? '0 0 16px rgba(255, 215, 0, 0.3)'
                          : '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{landmark.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className="text-lg font-bold"
                              style={{
                                color: landmark.visited ? '#2C1810' : '#999'
                              }}
                            >
                              {landmark.name}
                            </h4>
                            {landmark.visited && (
                              <span className="text-xl">✓</span>
                            )}
                          </div>
                          <p
                            className="text-sm"
                            style={{
                              color: landmark.visited ? '#5D4037' : '#AAA'
                            }}
                          >
                            {landmark.visited
                              ? landmark.description
                              : '??? - Not yet discovered'}
                          </p>
                          <div
                            className="mt-2 text-xs px-2 py-1 rounded inline-block"
                            style={{
                              background: landmark.visited
                                ? '#FFD700'
                                : '#DDD',
                              color: landmark.visited ? '#2C1810' : '#999',
                              fontWeight: 'bold'
                            }}
                          >
                            {landmark.visited ? '🏆 DISCOVERED' : '🔒 LOCKED'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #5DA5DB 0%, #3A7CA5 100%)',
                    color: '#FFF',
                    border: '3px solid #3A7CA5',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.3)'
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
                  className="px-6 py-3 rounded-xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #C1604A 0%, #A04030 100%)',
                    color: '#FFF',
                    border: '3px solid #A04030',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.3)'
                  }}
                >
                  🔄 Reset Progress
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}









