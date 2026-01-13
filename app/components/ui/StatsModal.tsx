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

// Points system config - simplified to just landmarks and museums
const POINTS_CONFIG = {
  landmarkVisit: 100,
  museumVisit: 50,
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
  
  // Calculate stats
  const totalDiscovered = visitedLandmarksCount + visitedMuseumsCount
  const totalLocations = totalLandmarks + totalMuseums
  const overallPercentage = totalLocations > 0 ? Math.round((totalDiscovered / totalLocations) * 100) : 0
  const landmarkPercentage = totalLandmarks > 0 ? Math.round((visitedLandmarksCount / totalLandmarks) * 100) : 0
  const museumPercentage = totalMuseums > 0 ? Math.round((visitedMuseumsCount / totalMuseums) * 100) : 0
  
  // Calculate points
  const totalPoints = (visitedLandmarksCount * POINTS_CONFIG.landmarkVisit) + (visitedMuseumsCount * POINTS_CONFIG.museumVisit)
  const maxPoints = (totalLandmarks * POINTS_CONFIG.landmarkVisit) + (totalMuseums * POINTS_CONFIG.museumVisit)
  
  // Achievement tier calculation
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
              className="pointer-events-auto relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-5 md:p-6 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #FEFCF8 0%, #F8F4ED 100%)',
                border: '3px solid #D4A574',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg transition-colors hover:bg-stone-200 text-stone-500"
              >
                ×
              </button>

              {/* Header */}
              <div className="text-center mb-5">
                <h2 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#2C5F2D' }}>
                  🗺️ Exploration Hub
                </h2>
                <p className="text-stone-500 text-sm">
                  Track your journey through Washington D.C.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column: Progress & Rank */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Overall Progress Card */}
                  <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
                    <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                      📊 Discovery Progress
                    </h3>
                    
                    {/* Total Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-semibold mb-1 text-stone-600">
                        <span>Overall</span>
                        <span>{totalDiscovered}/{totalLocations} ({overallPercentage}%)</span>
                      </div>
                      <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${overallPercentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                        />
                      </div>
                    </div>
                    
                    {/* Landmarks */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs font-medium mb-1 text-stone-500">
                        <span className="flex items-center gap-1">🏛️ Landmarks</span>
                        <span className="text-green-600 font-semibold">{visitedLandmarksCount}/{totalLandmarks}</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${landmarkPercentage}%` }}
                          className="h-full bg-green-500"
                        />
                      </div>
                    </div>

                    {/* Museums */}
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1 text-stone-500">
                        <span className="flex items-center gap-1">🎨 Museums</span>
                        <span className="text-blue-600 font-semibold">{visitedMuseumsCount}/{totalMuseums}</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${museumPercentage}%` }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Current Rank Card */}
                  <div 
                    className="rounded-xl p-4 border shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${currentTier.color}15 0%, white 100%)`,
                      borderColor: currentTier.color
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-4xl">{currentTier.icon}</div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: currentTier.color }}>
                          Current Rank
                        </div>
                        <h3 className="text-lg font-bold text-stone-800">{currentTier.name}</h3>
                      </div>
                    </div>

                    {/* Next Tier Progress - Fixed visibility */}
                    {nextTier && tierProgress && (
                      <div className="bg-white/80 rounded-lg p-3 border border-stone-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-stone-600">Next Rank:</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 flex items-center gap-1">
                            {nextTier.icon} {nextTier.name}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {/* Landmarks needed */}
                          <div>
                            <div className="flex justify-between text-[10px] text-stone-500 mb-0.5">
                              <span>🏛️ Landmarks</span>
                              <span className="font-semibold">{visitedLandmarksCount} / {nextTier.minLandmarks}</span>
                            </div>
                            <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, tierProgress.landmarkProgress)}%` }}
                              />
                            </div>
                            {tierProgress.landmarksNeeded > 0 && (
                              <p className="text-[9px] text-stone-400 mt-0.5">Need {tierProgress.landmarksNeeded} more</p>
                            )}
                          </div>
                          
                          {/* Museums needed */}
                          <div>
                            <div className="flex justify-between text-[10px] text-stone-500 mb-0.5">
                              <span>🎨 Museums</span>
                              <span className="font-semibold">{visitedMuseumsCount} / {nextTier.minMuseums}</span>
                            </div>
                            <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, tierProgress.museumProgress)}%` }}
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
                      <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
                        <span className="text-sm font-bold text-amber-600">🎉 Maximum Rank Achieved!</span>
                      </div>
                    )}
                  </div>

                  {/* Ranking Guide */}
                  <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
                    <h4 className="text-xs font-bold text-stone-700 mb-2">📈 All Ranks</h4>
                    <div className="space-y-1">
                      {ACHIEVEMENT_TIERS.map((tier) => {
                        const isCurrentTier = tier.level === currentTier.level
                        const isAchieved = visitedLandmarksCount >= tier.minLandmarks && visitedMuseumsCount >= tier.minMuseums
                        return (
                          <div 
                            key={tier.level}
                            className={`flex items-center justify-between text-[10px] px-2 py-1.5 rounded-lg ${
                              isCurrentTier ? 'bg-amber-50 border border-amber-200' : 
                              isAchieved ? 'bg-green-50 text-green-700' : 'text-stone-500 bg-stone-50'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>{tier.icon}</span>
                              <span className="font-medium">{tier.name}</span>
                              {isAchieved && !isCurrentTier && <span className="text-green-500">✓</span>}
                            </span>
                            <span className="text-stone-400 text-[9px]">
                              {tier.minLandmarks}L + {tier.minMuseums}M
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Location Gallery */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Points Info Banner - Simplified */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-amber-800 mb-1">⭐ Points System</h4>
                        <p className="text-xs text-amber-700">
                          Earn points by exploring D.C.!
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-amber-600">{totalPoints.toLocaleString()}</div>
                        <div className="text-[10px] text-amber-500">of {maxPoints.toLocaleString()} possible</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-3">
                      <div className="flex-1 bg-white/60 rounded-lg px-3 py-2 text-center">
                        <div className="font-bold text-green-600 text-sm">+{POINTS_CONFIG.landmarkVisit}</div>
                        <div className="text-stone-500 text-[10px]">per landmark</div>
                      </div>
                      <div className="flex-1 bg-white/60 rounded-lg px-3 py-2 text-center">
                        <div className="font-bold text-blue-600 text-sm">+{POINTS_CONFIG.museumVisit}</div>
                        <div className="text-stone-500 text-[10px]">per museum</div>
                      </div>
                    </div>
                  </div>

                  {/* Tab Headers */}
                  <div className="flex rounded-xl overflow-hidden border border-stone-200 bg-white">
                    <button
                      onClick={() => setActiveTab('landmarks')}
                      className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all ${
                        activeTab === 'landmarks' 
                          ? 'bg-green-500 text-white' 
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      🏛️ Landmarks ({visitedLandmarksCount}/{totalLandmarks})
                    </button>
                    <button
                      onClick={() => setActiveTab('museums')}
                      className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all ${
                        activeTab === 'museums' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      🎨 Museums ({visitedMuseumsCount}/{totalMuseums})
                    </button>
                  </div>
                  
                  {/* Gallery Content */}
                  <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-sm max-h-[380px] overflow-y-auto">
                    <AnimatePresence mode="wait">
                      {activeTab === 'landmarks' && (
                        <motion.div
                          key="landmarks"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-2"
                        >
                          {landmarks.length === 0 ? (
                            <p className="text-center text-stone-500 py-8 col-span-2">Loading landmarks...</p>
                          ) : (
                            landmarks.map((landmark, index) => (
                              <motion.div
                                key={landmark.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.02 }}
                                className={`p-3 rounded-lg border flex items-center gap-3 ${
                                  landmark.visited 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-stone-50 border-stone-200'
                                }`}
                              >
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                                  landmark.visited ? 'bg-green-100' : 'bg-stone-100'
                                }`}>
                                  {landmark.visited ? landmark.icon : '❓'}
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-semibold text-sm truncate ${
                                    landmark.visited ? 'text-stone-800' : 'text-stone-400'
                                  }`}>
                                    {landmark.visited ? landmark.name : '???'}
                                  </h4>
                                  <p className="text-[10px] text-stone-500 truncate">
                                    {landmark.visited ? landmark.category : 'Explore to discover'}
                                  </p>
                                </div>
                                
                                {/* Status Badge */}
                                <div className="flex items-center gap-1.5">
                                  {landmark.visited ? (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                      Visited
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-medium text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                                      <span className="w-2 h-2 rounded-full bg-stone-300"></span>
                                      Not Found
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            ))
                          )}
                        </motion.div>
                      )}
                      
                      {activeTab === 'museums' && (
                        <motion.div
                          key="museums"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-2"
                        >
                          {museums.length === 0 ? (
                            <p className="text-center text-stone-500 py-8 col-span-2">Loading museums...</p>
                          ) : (
                            museums.map((museum, index) => (
                              <motion.div
                                key={museum.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.01 }}
                                className={`p-3 rounded-lg border flex items-center gap-3 ${
                                  museum.visited 
                                    ? 'bg-blue-50 border-blue-200' 
                                    : 'bg-stone-50 border-stone-200'
                                }`}
                              >
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                                  museum.visited ? 'bg-blue-100' : 'bg-stone-100'
                                }`}>
                                  {museum.visited ? '🏛️' : '❓'}
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-semibold text-sm truncate ${
                                    museum.visited ? 'text-stone-800' : 'text-stone-400'
                                  }`}>
                                    {museum.visited ? museum.name : '???'}
                                  </h4>
                                  <p className="text-[10px] text-stone-500 truncate">
                                    {museum.visited && museum.address ? museum.address : 'Explore to discover'}
                                  </p>
                                </div>
                                
                                {/* Status Badge */}
                                <div className="flex items-center gap-1.5">
                                  {museum.visited ? (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                      Visited
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-medium text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                                      <span className="w-2 h-2 rounded-full bg-stone-300"></span>
                                      Not Found
                                    </span>
                                  )}
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
              <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-4 border-t border-stone-200">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #2C5F2D 0%, #1E4620 100%)',
                  }}
                >
                  Continue Exploring
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    if (confirm('Reset all progress? This cannot be undone.')) {
                      onReset()
                      onClose()
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl font-semibold text-white shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #C1604A 0%, #A04030 100%)',
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
