'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { minecraftTheme } from '@/app/lib/theme'

interface MiniStatsBarProps {
  streak: number
  points: number
  discoveredLandmarks: number
  totalLandmarks: number
  discoveredMuseums: number
  totalMuseums: number
  activeQuests: number
  onOpenStats: () => void
}

export default function MiniStatsBar({
  streak,
  points,
  discoveredLandmarks,
  totalLandmarks,
  discoveredMuseums,
  totalMuseums,
  activeQuests,
  onOpenStats
}: MiniStatsBarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Fix hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate totals
  const totalDiscovered = discoveredLandmarks + discoveredMuseums
  const total = totalLandmarks + totalMuseums
  const progressPercent = total > 0 ? Math.round((totalDiscovered / total) * 100) : 0

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
      className="fixed top-2 left-2 sm:top-4 sm:left-4 z-50 cursor-pointer"
      whileHover={{ scale: 1.02, x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="px-2 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2.5 relative"
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
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255, 69, 0, 0.15)' }}>
              <span className="text-sm">🔥</span>
              <span
                className="text-xs font-bold"
                style={{
                  color: '#FF4500',
                  fontFamily: 'monospace',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                {streak}
              </span>
            </div>
            <div className="w-px h-4" style={{ background: minecraftTheme.colors.terracotta.light }} />
          </>
        )}

        {/* Points */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255, 215, 0, 0.15)' }}>
          <span className="text-sm">⭐</span>
          <span
            className="text-xs font-bold"
            style={{
              color: '#D4A000',
              fontFamily: 'monospace',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            {points.toLocaleString()}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-4" style={{ background: minecraftTheme.colors.terracotta.light }} />

        {/* Landmarks - Green */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(46, 125, 50, 0.12)' }}>
          <span className="text-sm">🏛️</span>
          <span
            className="text-xs font-bold"
            style={{
              color: '#2E7D32',
              fontFamily: 'monospace'
            }}
          >
            {discoveredLandmarks}/{totalLandmarks}
          </span>
        </div>

        {/* Museums - Blue */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(25, 118, 210, 0.12)' }}>
          <span className="text-sm">🎨</span>
          <span
            className="text-xs font-bold"
            style={{
              color: '#1976D2',
              fontFamily: 'monospace'
            }}
          >
            {discoveredMuseums}/{totalMuseums}
          </span>
        </div>

        {/* Active Quests (if any) */}
        {activeQuests > 0 && (
          <>
            <div className="w-px h-4" style={{ background: minecraftTheme.colors.terracotta.light }} />
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(212, 80, 30, 0.15)' }}>
              <span className="text-sm">📜</span>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xs font-bold"
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

      {/* Expanded Tooltip on hover */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 left-0 px-4 py-3 shadow-xl min-w-[220px]"
          style={{
            background: `linear-gradient(135deg, ${minecraftTheme.colors.beige.base}, ${minecraftTheme.colors.beige.light})`,
            borderRadius: '12px',
            fontFamily: 'monospace',
            border: `2px solid ${minecraftTheme.colors.terracotta.base}`,
          }}
        >
          {/* Progress Overview */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-stone-600">Overall Progress</span>
              <span className="text-xs font-bold text-stone-800">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Detailed breakdown */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-600">🏛️ Landmarks</span>
              <span className="font-bold text-green-700">{discoveredLandmarks} / {totalLandmarks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600">🎨 Museums</span>
              <span className="font-bold text-blue-700">{discoveredMuseums} / {totalMuseums}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600">⭐ Total Points</span>
              <span className="font-bold text-amber-700">{points.toLocaleString()}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-3 pt-2 border-t border-stone-200 text-center">
            <span className="text-[10px] font-bold text-stone-500">
              Click for full exploration stats
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
