'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface WalkModeHUDProps {
  isVisible: boolean
}

export default function WalkModeHUD({ isVisible }: WalkModeHUDProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-30"
        >
          <div
            className="px-6 py-3 rounded-full shadow-lg"
            style={{
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(20px)',
              }}
            >
            <div className="flex items-center gap-6 text-white text-xs font-medium">
                <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/20 rounded">W</kbd>
                <kbd className="px-2 py-1 bg-white/20 rounded">A</kbd>
                <kbd className="px-2 py-1 bg-white/20 rounded">S</kbd>
                <kbd className="px-2 py-1 bg-white/20 rounded">D</kbd>
                <span className="text-white/80">Move</span>
                </div>
              <div className="w-px h-4 bg-white/30" />
                <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/20 rounded">⇧</kbd>
                <span className="text-white/80">Run</span>
                </div>
              <div className="w-px h-4 bg-white/30" />
                <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/20 rounded">V</kbd>
                <span className="text-white/80">View</span>
                </div>
              <div className="w-px h-4 bg-white/30" />
                <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/20 rounded">T</kbd>
                <span className="text-white/80">3rd Person</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
