'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { getCurrentTier, getNextTier, getProgressToNextTier, ACHIEVEMENT_TIERS } from '@/app/lib/achievementTiers'

interface Landmark {
  id: string
  name: string
  description: string
  icon: string
  category: string
  visited: boolean
}

interface Museum {
  id: string
  name: string
  address?: string
  visited: boolean
}

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
  landmarks: Landmark[]
  museums: Museum[]
  visitedLandmarksCount: number
  visitedMuseumsCount: number
  totalLandmarks: number
  totalMuseums: number
  onReset: () => void
}

export default function StatsModal({
  isOpen,
  onClose,
  landmarks,
  museums,
  visitedLandmarksCount,
  visitedMuseumsCount,
  totalLandmarks,
  totalMuseums,
  onReset
}: StatsModalProps) {
  const [activeTab, setActiveTab] = useState<'landmarks' | 'museums'>('landmarks')
  
  const landmarkPercentage = totalLandmarks > 0 ? Math.round((visitedLandmarksCount / totalLandmarks) * 100) : 0
  const museumPercentage = totalMuseums > 0 ? Math.round((visitedMuseumsCount / totalMuseums) * 100) : 0
  const totalDiscovered = visitedLandmarksCount + visitedMuseumsCount
  const totalLocations = totalLandmarks + totalMuseums
  const overallPercentage = totalLocations > 0 ? Math.round((totalDiscovered / totalLocations) * 100) : 0
  
  // Achievement tier calculation - now based on landmarks AND museums separately
  const currentTier = getCurrentTier(visitedLandmarksCount, visitedMuseumsCount)
  const nextTier = getNextTier(currentTier)
  const tierProgress = getProgressToNextTier(visitedLandmarksCount, visitedMuseumsCount, currentTier)

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
              <div className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-green-500 via-blue-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
                  Exploration Stats
                </h2>
                <p className="text-stone-600 font-medium">
                  Track your journey through Washington D.C.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column: Progress & Tier */}
                <div className="space-y-4">
                  {/* Overall Progress Summary */}
                  <div className="bg-white/50 p-5 rounded-2xl border-2 border-stone-200 shadow-sm">
                    <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                      <span>📊</span> Discovery Progress
                    </h3>
                    
                    {/* Total Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm font-bold mb-1 text-stone-600">
                        <span>Overall Progress</span>
                        <span>{totalDiscovered} / {totalLocations} ({overallPercentage}%)</span>
                      </div>
                      <div className="h-5 bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${overallPercentage}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                        />
                      </div>
                    </div>
                    
                    {/* Landmarks Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs font-bold mb-1 text-stone-500">
                        <span>🏛️ Landmarks</span>
                        <span>{visitedLandmarksCount} / {totalLandmarks}</span>
                      </div>
                      <div className="h-3 bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${landmarkPercentage}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-green-400 to-green-600"
                        />
                      </div>
                    </div>

                    {/* Museums Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs font-bold mb-1 text-stone-500">
                        <span>🏛️ Museums</span>
                        <span>{visitedMuseumsCount} / {totalMuseums}</span>
                      </div>
                      <div className="h-3 bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${museumPercentage}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Achievement Tier Card */}
                  <div 
                    className="p-5 rounded-2xl border-2 shadow-sm relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${currentTier.color}15 0%, #FFFFFF 100%)`,
                      borderColor: currentTier.color
                    }}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-5xl filter drop-shadow-md">{currentTier.icon}</div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: currentTier.color }}>Current Rank</div>
                          <h3 className="text-xl font-bold" style={{ color: '#2C1810' }}>{currentTier.name}</h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
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
                        <div className="mt-3 pt-3 border-t border-black/10">
                          <div className="text-xs font-bold mb-2 text-stone-600 flex items-center gap-2">
                            <span>Next Rank:</span>
                            <span className="px-2 py-0.5 rounded bg-white border border-stone-200">
                              {nextTier.icon} {nextTier.name}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-stone-500 mb-2 italic">
                            {nextTier.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="flex justify-between text-[10px] font-bold mb-1 text-stone-500">
                                <span>Landmarks</span>
                                <span>{visitedLandmarksCount}/{nextTier.minLandmarks}</span>
                              </div>
                              <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${tierProgress.landmarkProgress}%` }}
                                  className="h-full rounded-full bg-green-500"
                                />
                              </div>
                              {tierProgress.landmarksNeeded > 0 && (
                                <p className="text-[9px] text-stone-400 mt-0.5">Need {tierProgress.landmarksNeeded} more</p>
                              )}
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] font-bold mb-1 text-stone-500">
                                <span>Museums</span>
                                <span>{visitedMuseumsCount}/{nextTier.minMuseums}</span>
                              </div>
                              <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${tierProgress.museumProgress}%` }}
                                  className="h-full rounded-full bg-blue-500"
                                />
                              </div>
                              {tierProgress.museumsNeeded > 0 && (
                                <p className="text-[9px] text-stone-400 mt-0.5">Need {tierProgress.museumsNeeded} more</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {!nextTier && (
                        <div className="mt-3 pt-3 border-t border-black/10 text-center">
                          <span className="text-xs font-bold text-amber-600">🎉 Maximum Rank Achieved!</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Rank Progression Info */}
                  <div className="bg-white/30 p-3 rounded-xl border border-stone-200">
                    <h4 className="text-xs font-bold text-stone-600 mb-2">📈 Rank Requirements</h4>
                    <div className="space-y-1">
                      {ACHIEVEMENT_TIERS.map((tier, index) => {
                        const isCurrentTier = tier.level === currentTier.level
                        const isAchieved = visitedLandmarksCount >= tier.minLandmarks && visitedMuseumsCount >= tier.minMuseums
                        return (
                          <div 
                            key={tier.level}
                            className={`flex items-center justify-between text-[10px] px-2 py-1 rounded ${
                              isCurrentTier ? 'bg-amber-100 border border-amber-300' : 
                              isAchieved ? 'bg-green-50 text-green-700' : 'text-stone-500'
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              {tier.icon} {tier.name}
                              {isAchieved && !isCurrentTier && <span className="text-green-500">✓</span>}
                            </span>
                            <span className="font-mono">
                              {tier.minLandmarks}L + {tier.minMuseums}M
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Tabbed Gallery */}
                <div className="space-y-4">
                  {/* Tab Headers */}
                  <div className="flex rounded-xl overflow-hidden border-2 border-stone-200">
                    <button
                      onClick={() => setActiveTab('landmarks')}
                      className={`flex-1 py-2 px-4 text-sm font-bold transition-colors ${
                        activeTab === 'landmarks' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white/50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      🏛️ Landmarks ({visitedLandmarksCount}/{totalLandmarks})
                    </button>
                    <button
                      onClick={() => setActiveTab('museums')}
                      className={`flex-1 py-2 px-4 text-sm font-bold transition-colors ${
                        activeTab === 'museums' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      🏛️ Museums ({visitedMuseumsCount}/{totalMuseums})
                    </button>
                  </div>
                  
                  {/* Gallery Content */}
                  <div className="bg-white/50 p-4 rounded-2xl border-2 border-stone-200 shadow-sm max-h-[450px] overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                      {activeTab === 'landmarks' && (
                        <motion.div
                          key="landmarks"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="grid grid-cols-1 gap-2"
                        >
                          {landmarks.length === 0 ? (
                            <p className="text-center text-stone-500 py-8">Loading landmarks...</p>
                          ) : (
                            landmarks.map((landmark, index) => (
                              <motion.div
                                key={landmark.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                                  landmark.visited 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-stone-100 border-stone-200 opacity-70'
                                }`}
                              >
                                <div className="text-2xl w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-black/5 shadow-sm flex-shrink-0">
                                  {landmark.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className={`font-bold text-sm truncate ${landmark.visited ? 'text-stone-800' : 'text-stone-500'}`}>
                                      {landmark.name}
                                    </h4>
                                    {landmark.visited ? (
                                      <span className="text-green-600 font-bold text-xs flex-shrink-0">✓ FOUND</span>
                                    ) : (
                                      <span className="text-stone-400 font-bold text-xs flex-shrink-0">???</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-stone-500 truncate">
                                    {landmark.visited ? landmark.category : 'Explore to discover'}
                                  </p>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </motion.div>
                      )}
                      
                      {activeTab === 'museums' && (
                        <motion.div
                          key="museums"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="grid grid-cols-1 gap-2"
                        >
                          {museums.length === 0 ? (
                            <p className="text-center text-stone-500 py-8">Loading museums...</p>
                          ) : (
                            museums.map((museum, index) => (
                              <motion.div
                                key={museum.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                                  museum.visited 
                                    ? 'bg-blue-50 border-blue-200' 
                                    : 'bg-stone-100 border-stone-200 opacity-70'
                                }`}
                              >
                                <div className="text-xl w-9 h-9 flex items-center justify-center bg-white rounded-lg border border-black/5 shadow-sm flex-shrink-0">
                                  🏛️
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className={`font-bold text-sm truncate ${museum.visited ? 'text-stone-800' : 'text-stone-500'}`}>
                                      {museum.visited ? museum.name : '???'}
                                    </h4>
                                    {museum.visited ? (
                                      <span className="text-blue-600 font-bold text-xs flex-shrink-0">✓ FOUND</span>
                                    ) : (
                                      <span className="text-stone-400 font-bold text-xs flex-shrink-0">???</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-stone-500 truncate">
                                    {museum.visited && museum.address ? museum.address : 'Explore to discover'}
                                  </p>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
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
