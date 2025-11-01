'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

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
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="fixed top-6 right-6 z-20"
        >
          <div
            className="px-4 py-3 shadow-lg relative"
            style={{
              background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
              border: `${minecraftTheme.minecraft.borderWidth} solid ${minecraftTheme.colors.accent.green}`,
              borderRadius: minecraftTheme.minecraft.borderRadius,
              boxShadow: `0 6px 0 ${minecraftTheme.colors.accent.greenDark}, 0 8px 16px rgba(0,0,0,0.3)`,
              minWidth: '160px',
              imageRendering: minecraftTheme.minecraft.imageRendering,
            }}
          >
            {/* Pixelated corners */}
            <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🎮</span>
              <div>
                <div 
                  className="text-[10px] font-bold"
                  style={{ 
                    color: minecraftTheme.colors.text.light,
                    fontFamily: 'monospace',
                    letterSpacing: '0.5px'
                  }}
                >
                  EXPLORATION
                </div>
                <div 
                  className="text-sm font-bold"
                  style={{ 
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace'
                  }}
                >
                  {visitedCount}/{totalCount}
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div 
              className="w-full h-2 rounded-full overflow-hidden"
              style={{
                background: minecraftTheme.colors.beige.dark,
                border: `1px solid ${minecraftTheme.colors.terracotta.dark}`
              }}
            >
              <motion.div
                className="h-full"
                style={{
                  background: `linear-gradient(90deg, ${minecraftTheme.colors.accent.green} 0%, ${minecraftTheme.colors.accent.blue} 100%)`,
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)'
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
