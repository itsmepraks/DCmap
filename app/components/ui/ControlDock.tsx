'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

interface ControlDockProps {
  is3D: boolean
  onToggle3D: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onOrbit360: () => void
  isOrbiting360: boolean
  isFlying: boolean
  onToggleFly: () => void
  onToggleLayers: () => void
  timeOfDayIcon?: string
  timeOfDayLabel?: string
  onCycleTimeOfDay?: () => void
}

function useIsKeyboardCapable() {
  // Fly mode requires WASD + mouse drag — no usable touch fallback yet.
  const [capable, setCapable] = useState(true)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setCapable(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])
  return capable
}

export default function ControlDock({
  is3D,
  onToggle3D,
  onZoomIn,
  onZoomOut,
  onOrbit360,
  isOrbiting360,
  isFlying,
  onToggleFly,
  onToggleLayers,
  timeOfDayIcon,
  timeOfDayLabel,
  onCycleTimeOfDay,
}: ControlDockProps) {
  const keyboardCapable = useIsKeyboardCapable()
  const timeLabel = timeOfDayLabel ? (timeOfDayLabel === 'day' ? 'Noon' : timeOfDayLabel) : ''

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ opacity: 1, y: -2 }}
      className="fixed inset-x-0 bottom-3 z-50 flex justify-center px-2 sm:inset-x-auto sm:bottom-8 sm:right-8 sm:block sm:px-0"
    >
      <div
        className="relative flex w-fit max-w-[calc(100vw-1rem)] items-center gap-1 overflow-x-auto overscroll-x-contain rounded-xl p-1.5 shadow-2xl sm:gap-2 sm:rounded-2xl sm:p-2.5"
        style={{
          background: `linear-gradient(135deg, ${minecraftTheme.colors.beige.base}FF 0%, ${minecraftTheme.colors.beige.light}FF 100%)`,
          border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
          boxShadow: `0 4px 0 ${minecraftTheme.colors.terracotta.dark}88, 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.1)`,
          backdropFilter: 'blur(12px)',
          imageRendering: minecraftTheme.minecraft.imageRendering,
          scrollbarWidth: 'none',
        }}
      >
        {/* Layers Button */}
        <DockButton
          icon="LAY"
          label="Layers"
          isActive={false}
          onClick={onToggleLayers}
          color={minecraftTheme.colors.terracotta.base}
        />

        <div className="hidden h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-[#B8860B]/40 to-transparent sm:block" />

        <DockButton
          icon="−"
          label="Out"
          isActive={false}
          onClick={onZoomOut}
          color="#8C6A46"
        />

        <DockButton
          icon="+"
          label="In"
          isActive={false}
          onClick={onZoomIn}
          color="#8C6A46"
        />

        <div className="hidden h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-[#B8860B]/40 to-transparent sm:block" />

        {/* 3D Toggle */}
        <DockButton
          icon="3D"
          label="View"
          isActive={is3D}
          onClick={onToggle3D}
          color="#D4501E"
          activeColor="#D4501E"
        />

        <DockButton
          icon="↻"
          label="360"
          isActive={isOrbiting360}
          onClick={onOrbit360}
          color="#197A7A"
          activeColor="#24A2A2"
        />

        {onCycleTimeOfDay && timeOfDayIcon && timeOfDayLabel && (
          <>
            <div className="hidden h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-[#B8860B]/40 to-transparent sm:block" />
            <DockButton
              icon={timeOfDayIcon}
              label={timeLabel.toUpperCase()}
              isActive={true}
              onClick={onCycleTimeOfDay}
              color="#7B5FB8"
              activeColor="#A88BD9"
            />
          </>
        )}

        {keyboardCapable && (
          <>
            <div className="hidden h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-[#B8860B]/40 to-transparent sm:block" />

            {/* Fly Mode (desktop only — requires WASD + mouse) */}
            <DockButton
              icon="NAV"
              label="Fly"
              isActive={isFlying}
              onClick={onToggleFly}
              color="#4A90E2"
              activeColor="#6BB3FF"
            />
          </>
        )}
      </div>
      
      {/* Pixelated corners with glow */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-black/30 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-black/30 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-black/30 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-black/30 rounded-br-sm pointer-events-none" />
      
      {/* Shine effect */}
      <div 
        className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none rounded-t-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)'
        }}
      />
    </motion.div>
  )
}

interface DockButtonProps {
  icon: string
  label: string
  isActive: boolean
  onClick: () => void
  color: string
  activeColor?: string
}

function DockButton({ icon, label, isActive, onClick, color, activeColor }: DockButtonProps) {
  const isTextIcon = icon.length > 1

  return (
    <motion.button
      whileHover={{ scale: 1.12, y: -4 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      title={label}
      className="relative flex h-12 min-h-12 w-[3.25rem] shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg transition-all group sm:h-14 sm:w-[3.65rem] sm:rounded-xl lg:h-16 lg:w-16"
      style={{
        background: isActive 
          ? `linear-gradient(135deg, ${activeColor || color}, ${color})`
          : 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.4))',
        border: isActive 
          ? `3px solid ${minecraftTheme.colors.terracotta.light}`
          : '3px solid rgba(139, 69, 19, 0.5)',
        boxShadow: isActive
          ? `0 6px 0 ${minecraftTheme.colors.terracotta.dark}66, 0 8px 16px rgba(0,0,0,0.3)`
          : '0 3px 0 rgba(139, 69, 19, 0.2), 0 4px 8px rgba(0,0,0,0.15)',
      }}
    >
      {/* Active glow */}
      {isActive && (
        <motion.div 
          className="absolute inset-0"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background: `radial-gradient(circle, ${activeColor || color}88 0%, transparent 70%)`,
          }}
        />
      )}
      
      <span 
        className="relative z-10 mb-0.5 transition-all sm:mb-1"
        style={{ 
          filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none',
          transform: isActive ? 'scale(1.1)' : 'scale(1)',
          fontSize:
            icon === '+' || icon === '−' || icon === '↻' ? 'clamp(1.45rem, 2vw, 1.7rem)'
            : isTextIcon ? '0.82rem'
            : '1.3rem',
          lineHeight: 1,
          fontWeight: isTextIcon ? 900 : undefined,
          letterSpacing: isTextIcon ? '0.04em' : undefined,
          fontFamily: isTextIcon ? 'monospace' : undefined,
        }}
      >
        {icon}
      </span>
      <span 
        className="relative z-10 max-w-full truncate px-0.5 text-center font-mono text-[9px] font-bold uppercase leading-none tracking-wide sm:text-[10px]"
        style={{ 
          color: isActive ? '#FFF' : '#5D4037', 
          textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' 
        }}
      >
        {label}
      </span>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-1 h-1 bg-black/20" />
      <div className="absolute top-0 right-0 w-1 h-1 bg-black/20" />
      <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/20" />
      <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/20" />
    </motion.button>
  )
}
