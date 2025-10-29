'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface GameProgressHUDProps {
  isVisible: boolean
  visitedCount: number
  totalCount: number
}

export default function GameProgressHUD({
  isVisible,
  visitedCount,
  totalCount,
}: GameProgressHUDProps) {
  const progress = (visitedCount / totalCount) * 100

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="fixed bottom-6 right-6 z-30"
        >
          <div
            className="px-5 py-3 rounded-2xl shadow-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              minWidth: '140px'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎮</span>
              <div>
                <div className="text-[10px] font-medium text-gray-500">
                  EXPLORATION
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {visitedCount}/{totalCount}
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #7ED957 0%, #5DA5DB 100%)'
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
