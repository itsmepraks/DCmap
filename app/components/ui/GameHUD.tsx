'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

interface GameHUDProps {
  visitedCount: number
  totalCount: number
  points: number
  activeQuestCount: number
}

export default function GameHUD({ visitedCount, totalCount, points, activeQuestCount }: GameHUDProps) {
  const completionPercentage = (visitedCount / totalCount) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20"
    >
      <div 
        className="flex items-center gap-3 px-6 py-3"
        style={{
          background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
          border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
          borderRadius: minecraftTheme.minecraft.borderRadius,
          boxShadow: minecraftTheme.minecraft.shadowRaised,
          imageRendering: minecraftTheme.minecraft.imageRendering,
        }}
      >
        {/* Pixelated corners */}
        <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" />
        <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" />
        <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" />
        <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" />

        {/* Points */}
        <div className="flex items-center gap-2 px-3 py-1 rounded" style={{ background: 'rgba(255, 215, 0, 0.2)' }}>
          <span className="text-lg">⭐</span>
          <div>
            <div 
              className="text-[10px] font-bold"
              style={{
                color: minecraftTheme.colors.text.secondary,
                fontFamily: 'monospace',
                textTransform: 'uppercase'
              }}
            >
              Points
            </div>
            <div 
              className="text-sm font-bold"
              style={{
                color: '#FFD700',
                fontFamily: 'monospace',
                textShadow: '1px 1px 0 rgba(0,0,0,0.2)'
              }}
            >
              {points.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8" style={{ background: minecraftTheme.colors.terracotta.light }} />

        {/* Landmarks discovered */}
        <div className="flex items-center gap-2 px-3 py-1 rounded" style={{ background: 'rgba(126, 217, 87, 0.2)' }}>
          <span className="text-lg">🗺️</span>
          <div>
            <div 
              className="text-[10px] font-bold"
              style={{
                color: minecraftTheme.colors.text.secondary,
                fontFamily: 'monospace',
                textTransform: 'uppercase'
              }}
            >
              Discovered
            </div>
            <div 
              className="text-sm font-bold"
              style={{
                color: minecraftTheme.colors.text.primary,
                fontFamily: 'monospace'
              }}
            >
              {visitedCount}/{totalCount}
              <span 
                className="text-[9px] ml-1"
                style={{
                  color: minecraftTheme.colors.text.secondary
                }}
              >
                ({completionPercentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        {activeQuestCount > 0 && (
          <>
            <div className="w-px h-8" style={{ background: minecraftTheme.colors.terracotta.light }} />

            {/* Active quests */}
            <div className="flex items-center gap-2 px-3 py-1 rounded" style={{ background: 'rgba(212, 80, 30, 0.2)' }}>
              <span className="text-lg">📜</span>
              <div>
                <div 
                  className="text-[10px] font-bold"
                  style={{
                    color: minecraftTheme.colors.text.secondary,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase'
                  }}
                >
                  Quests
                </div>
                <div 
                  className="text-sm font-bold flex items-center gap-1"
                  style={{
                    color: minecraftTheme.colors.terracotta.base,
                    fontFamily: 'monospace'
                  }}
                >
                  {activeQuestCount}
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-[8px]"
                  >
                    ⚡
                  </motion.span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

