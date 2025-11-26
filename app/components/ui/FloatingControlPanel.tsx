'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

interface FloatingControlPanelProps {
  isOpen: boolean
  onClose: () => void
  layersVisible: {
    museums: boolean
    trees: boolean
    landmarks: boolean
    parks: boolean
  }
  onToggleLayer: (layer: keyof FloatingControlPanelProps['layersVisible']) => void
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  onSeasonChange: (season: 'spring' | 'summer' | 'fall' | 'winter') => void
}

export default function FloatingControlPanel({
  isOpen,
  onClose,
  layersVisible,
  onToggleLayer,
  currentSeason,
  onSeasonChange
}: FloatingControlPanelProps) {
  const seasons = [
    { value: 'spring' as const, label: 'Spring', icon: '🌸', color: '#FFB7C5' },
    { value: 'summer' as const, label: 'Summer', icon: '☀️', color: '#FFD700' },
    { value: 'fall' as const, label: 'Fall', icon: '🍂', color: '#FF8C00' },
    { value: 'winter' as const, label: 'Winter', icon: '❄️', color: '#87CEEB' }
  ]

  const layers = [
    { key: 'museums' as const, label: 'Museums', icon: '🏛️', color: '#5DA5DB' },
    { key: 'trees' as const, label: 'Trees', icon: '🌳', color: '#7ED957' },
    { key: 'landmarks' as const, label: 'Landmarks', icon: '⭐', color: '#FFD700' },
    { key: 'parks' as const, label: 'Parks', icon: '🌲', color: '#7ED957' }
  ]

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
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
          />

          {/* Floating Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 left-2 right-2 sm:bottom-28 sm:left-auto sm:right-8 sm:w-80 z-50"
            style={{
              maxHeight: 'calc(100vh - 120px)' // Mobile: less padding, Desktop: more
            }}
          >
            <div
              className="relative rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{
                background: `linear-gradient(135deg, ${minecraftTheme.colors.beige.base}FA, ${minecraftTheme.colors.beige.light}F8)`,
                border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
                maxHeight: 'inherit'
              }}
            >
              {/* Shine overlay */}
              <div 
                className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)'
                }}
              />

              {/* Header - Fixed */}
              <div className="relative z-10 px-4 py-2 sm:px-6 sm:py-3 border-b-2 flex-shrink-0" style={{ borderColor: minecraftTheme.colors.terracotta.light }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <motion.span 
                      className="text-xl sm:text-2xl"
                      animate={{ rotate: [0, 10, 0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      🗺️
                    </motion.span>
                    <h3 
                      className="text-sm sm:text-lg font-bold"
                      style={{ 
                        color: minecraftTheme.colors.text.primary,
                        fontFamily: 'monospace',
                        textShadow: '1px 1px 0 rgba(255,255,255,0.5)'
                      }}
                    >
                      MAP CONTROLS
                    </h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${minecraftTheme.colors.terracotta.light}, ${minecraftTheme.colors.terracotta.base})`,
                      border: '2px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    <span className="text-white font-bold text-lg">×</span>
                  </motion.button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div 
                className="relative z-10 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 custom-scrollbar"
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollbarColor: `${minecraftTheme.colors.terracotta.base} transparent`
                }}
              >
                {/* Layers Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">🗂️</span>
                    <h4 
                      className="text-sm font-bold uppercase tracking-wider"
                      style={{ 
                        color: minecraftTheme.colors.text.secondary,
                        fontFamily: 'monospace'
                      }}
                    >
                      Map Layers
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {layers.map((layer) => (
                      <LayerToggle
                        key={layer.key}
                        icon={layer.icon}
                        label={layer.label}
                        color={layer.color}
                        isActive={layersVisible[layer.key]}
                        onToggle={() => onToggleLayer(layer.key)}
                      />
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div 
                  className="h-px"
                  style={{ 
                    background: `linear-gradient(90deg, transparent, ${minecraftTheme.colors.terracotta.light}, transparent)` 
                  }}
                />

                {/* Season Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">🌤️</span>
                    <h4 
                      className="text-sm font-bold uppercase tracking-wider"
                      style={{ 
                        color: minecraftTheme.colors.text.secondary,
                        fontFamily: 'monospace'
                      }}
                    >
                      Season
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {seasons.map((season) => (
                      <SeasonButton
                        key={season.value}
                        icon={season.icon}
                        label={season.label}
                        color={season.color}
                        isActive={currentSeason === season.value}
                        onClick={() => onSeasonChange(season.value)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer hint - Fixed */}
              <div 
                className="relative z-10 px-4 py-1.5 sm:px-6 sm:py-2 border-t-2 flex-shrink-0"
                style={{ 
                  borderColor: minecraftTheme.colors.terracotta.light,
                  background: 'rgba(0,0,0,0.05)'
                }}
              >
                <p 
                  className="text-[10px] sm:text-xs text-center"
                  style={{ 
                    color: minecraftTheme.colors.text.secondary,
                    fontFamily: 'monospace'
                  }}
                >
                  💡 Tap outside or <kbd className="px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-bold" style={{ background: 'rgba(0,0,0,0.1)' }}>ESC</kbd> to close
                </p>
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-black/20 rounded-tl-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-black/20 rounded-tr-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-black/20 rounded-bl-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-black/20 rounded-br-2xl pointer-events-none" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Layer Toggle Component
interface LayerToggleProps {
  icon: string
  label: string
  color: string
  isActive: boolean
  onToggle: () => void
}

function LayerToggle({ icon, label, color, isActive, onToggle }: LayerToggleProps) {
  return (
    <motion.button
      whileHover={{ x: 4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all relative overflow-hidden min-h-[44px] sm:min-h-[48px]"
      style={{
        background: isActive 
          ? `linear-gradient(135deg, ${color}30, ${color}20)`
          : 'rgba(255,255,255,0.4)',
        border: `2px solid ${isActive ? color : 'rgba(139, 69, 19, 0.2)'}`,
        boxShadow: isActive 
          ? `0 4px 12px ${color}40, inset 0 1px 0 rgba(255,255,255,0.3)`
          : '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {/* Active glow */}
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: `radial-gradient(circle at center, ${color}60, transparent)` }}
        />
      )}

      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
        <span className="text-lg sm:text-xl">{icon}</span>
        <span 
          className="text-xs sm:text-sm font-bold"
          style={{ 
            color: isActive ? minecraftTheme.colors.text.primary : minecraftTheme.colors.text.secondary,
            fontFamily: 'monospace'
          }}
        >
          {label}
        </span>
      </div>

      {/* Toggle indicator */}
      <div 
        className="relative w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-all"
        style={{
          background: isActive ? color : 'rgba(0,0,0,0.2)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        <motion.div
          animate={{ x: isActive ? 18 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 sm:top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full"
          style={{
            background: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        />
      </div>
    </motion.button>
  )
}

// Season Button Component
interface SeasonButtonProps {
  icon: string
  label: string
  color: string
  isActive: boolean
  onClick: () => void
}

function SeasonButton({ icon, label, color, isActive, onClick }: SeasonButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center py-2 sm:py-3 rounded-xl transition-all relative overflow-hidden min-h-[60px] sm:min-h-[70px]"
      style={{
        background: isActive 
          ? `linear-gradient(135deg, ${color}, ${color}CC)`
          : 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.4))',
        border: `2px solid ${isActive ? 'rgba(255,255,255,0.5)' : 'rgba(139, 69, 19, 0.2)'}`,
        boxShadow: isActive
          ? `0 6px 16px ${color}60, inset 0 1px 0 rgba(255,255,255,0.3)`
          : '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* Active glow */}
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: `radial-gradient(circle at center, ${color}80, transparent)` }}
        />
      )}

      <span className="text-xl sm:text-2xl mb-0.5 sm:mb-1 relative z-10">{icon}</span>
      <span 
        className="text-[10px] sm:text-xs font-bold uppercase relative z-10"
        style={{ 
          color: isActive ? 'white' : minecraftTheme.colors.text.secondary,
          fontFamily: 'monospace',
          textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
        }}
      >
        {label}
      </span>

      {/* Checkmark */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.3)' }}
        >
          <span className="text-white text-xs">✓</span>
        </motion.div>
      )}

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-black/10 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-black/10 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-black/10 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-black/10 rounded-br-lg" />
    </motion.button>
  )
}

