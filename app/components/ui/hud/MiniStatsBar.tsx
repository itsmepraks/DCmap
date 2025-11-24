'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { minecraftTheme } from '@/app/lib/theme'

interface MiniStatsBarProps {
  streak: number
  points: number
  discovered: number
  total: number
  activeQuests: number
  onOpenStats: () => void
}

export default function MiniStatsBar({
  streak,
  points,
  discovered,
  total,
  activeQuests,
  onOpenStats
}: MiniStatsBarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Fix hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return skeleton during SSR to match initial render
    return (
      <div className="fixed top-4 left-4 z-30">
        <div
          className="px-4 py-2 flex items-center gap-3"
          style={{
            background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base}F0, ${minecraftTheme.colors.beige.light}F0)`,
            border: `2px solid ${minecraftTheme.colors.terracotta.base}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            opacity: 0.9
          }}
        >
          <span style={{ fontFamily: 'monospace', color: minecraftTheme.colors.text.primary }}>
            Loading...
          </span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isHovered ? 1 : 0.92, x: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onOpenStats}
      className="fixed top-2 left-2 sm:top-6 sm:left-6 z-30 cursor-pointer"
      whileHover={{ scale: 1.05, x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="px-2 py-1.5 sm:px-5 sm:py-2.5 flex items-center gap-1.5 sm:gap-3 relative"
        style={{
          background: `linear-gradient(135deg, ${minecraftTheme.colors.beige.base}F8, ${minecraftTheme.colors.beige.light}F5)`,
          border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
          borderRadius: '12px',
          boxShadow: `${minecraftTheme.minecraft.shadowRaised}, 0 8px 24px rgba(0,0,0,0.15)`,
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Streak */}
        {streak > 0 && (
          <>
            <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md" style={{ background: 'rgba(255, 69, 0, 0.15)' }}>
              <span className="text-sm sm:text-lg">🔥</span>
              <span
                className="text-xs sm:text-base font-bold"
                style={{
                  color: '#FF4500',
                  fontFamily: 'monospace',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                {streak}
              </span>
            </div>
            <div className="w-px h-5" style={{ background: minecraftTheme.colors.terracotta.light }} />
          </>
        )}

        {/* Points */}
        <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md" style={{ background: 'rgba(255, 215, 0, 0.15)' }}>
          <span className="text-sm sm:text-lg">⭐</span>
          <span
            className="text-xs sm:text-base font-bold"
            style={{
              color: '#FFD700',
              fontFamily: 'monospace',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            {points}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 sm:h-5" style={{ background: minecraftTheme.colors.terracotta.light }} />

        {/* Discovered */}
        <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md" style={{ background: 'rgba(46, 125, 50, 0.15)' }}>
          <span className="text-sm sm:text-lg">🗺️</span>
          <div className="flex flex-col">
            <span
              className="text-[10px] sm:text-xs font-bold leading-tight"
              style={{
                color: minecraftTheme.colors.text.primary,
                fontFamily: 'monospace'
              }}
            >
              {discovered}/{total}
            </span>
            <span
              className="text-[8px] sm:text-[9px] font-bold leading-tight"
              style={{
                color: minecraftTheme.colors.text.secondary,
                fontFamily: 'monospace'
              }}
            >
              {((discovered / total) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Active Quests (if any) */}
        {activeQuests > 0 && (
          <>
            <div className="w-px h-4 sm:h-5" style={{ background: minecraftTheme.colors.terracotta.light }} />
            <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md" style={{ background: 'rgba(212, 80, 30, 0.15)' }}>
              <span className="text-sm sm:text-lg">📜</span>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xs sm:text-base font-bold"
                style={{
                  color: minecraftTheme.colors.terracotta.base,
                  fontFamily: 'monospace'
                }}
              >
                {activeQuests}
              </motion.span>
            </div>
          </>
        )}

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-black/30 rounded-tl-sm" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-black/30 rounded-tr-sm" />
        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-black/30 rounded-bl-sm" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-black/30 rounded-br-sm" />
        
        {/* Shine effect */}
        <div 
          className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none rounded-t-lg"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
          }}
        />
      </div>

      {/* Tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-3 left-0 px-4 py-2 text-xs shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${minecraftTheme.colors.terracotta.dark}, ${minecraftTheme.colors.terracotta.base})`,
            color: 'white',
            borderRadius: '8px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            border: '2px solid rgba(255,255,255,0.2)',
            fontWeight: 'bold'
          }}
        >
          ✨ Click to view full stats & achievements
        </motion.div>
      )}
    </motion.div>
  )
}

