'use client'

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
  const timeLabel = timeOfDayLabel ? (timeOfDayLabel === 'day' ? 'Day' : timeOfDayLabel) : ''

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ opacity: 1, y: -2 }}
      className="fixed inset-x-0 bottom-2 z-50 flex justify-center px-2 sm:inset-x-auto sm:bottom-8 sm:right-8 sm:block sm:px-0"
    >
      <div
        className="relative flex w-fit max-w-[calc(100vw-1rem)] items-center gap-1 overflow-x-auto overscroll-x-contain rounded-2xl p-1.5 shadow-2xl sm:gap-1.5 sm:p-2"
        style={{
          background: `linear-gradient(135deg, ${minecraftTheme.colors.beige.base}F2 0%, ${minecraftTheme.colors.beige.light}F2 100%)`,
          border: `2px solid ${minecraftTheme.colors.terracotta.base}`,
          boxShadow: `0 3px 0 ${minecraftTheme.colors.terracotta.dark}88, 0 12px 34px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.38) inset`,
          backdropFilter: 'blur(16px) saturate(1.08)',
          imageRendering: minecraftTheme.minecraft.imageRendering,
          scrollbarWidth: 'none',
        }}
      >
        {/* Layers Button */}
        <DockButton
          icon="▦"
          label="Layers"
          isActive={false}
          onClick={onToggleLayers}
          color={minecraftTheme.colors.terracotta.base}
        />

        <div className="hidden h-7 w-px shrink-0 bg-gradient-to-b from-transparent via-[#B8860B]/28 to-transparent sm:block" />

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

        <div className="hidden h-7 w-px shrink-0 bg-gradient-to-b from-transparent via-[#B8860B]/28 to-transparent sm:block" />

        {/* 3D Toggle */}
        <DockButton
          icon="▰"
          label="View"
          isActive={is3D}
          onClick={onToggle3D}
          color="#D4501E"
          activeColor="#D4501E"
        />

        <DockButton
          icon="⟳"
          label="360"
          isActive={isOrbiting360}
          onClick={onOrbit360}
          color="#197A7A"
          activeColor="#24A2A2"
        />

        {onCycleTimeOfDay && timeOfDayIcon && timeOfDayLabel && (
          <>
            <div className="hidden h-7 w-px shrink-0 bg-gradient-to-b from-transparent via-[#B8860B]/28 to-transparent sm:block" />
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

        {(
          <div className="hidden contents sm:contents">
            <div className="hidden h-7 w-px shrink-0 bg-gradient-to-b from-transparent via-[#B8860B]/28 to-transparent sm:block" />

            {/* Fly mode supports keyboard and touch */}
            <DockButton
              icon="✈"
              label="Fly"
              isActive={isFlying}
              onClick={onToggleFly}
              color="#4A90E2"
              activeColor="#6BB3FF"
            />
          </div>
        )}
      </div>
      
      {/* Shine effect */}
      <div 
        className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none rounded-t-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)'
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
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      title={label}
      className="group relative flex h-11 min-h-11 w-11 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl transition-all sm:h-[3.35rem] sm:w-[3.45rem] lg:h-14 lg:w-14"
      style={{
        background: isActive 
          ? `linear-gradient(135deg, ${activeColor || color}, ${color})`
          : 'linear-gradient(135deg, rgba(255,255,255,0.74), rgba(255,255,255,0.46))',
        border: isActive 
          ? `2px solid ${minecraftTheme.colors.terracotta.light}`
          : '2px solid rgba(139, 69, 19, 0.36)',
        boxShadow: isActive
          ? `0 4px 0 ${minecraftTheme.colors.terracotta.dark}66, 0 8px 16px rgba(0,0,0,0.24)`
          : '0 2px 0 rgba(139, 69, 19, 0.18), 0 5px 10px rgba(0,0,0,0.11)',
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
            icon === '+' || icon === '−' || icon === '⟳' ? 'clamp(1.25rem, 2vw, 1.5rem)'
            : isTextIcon ? '0.98rem'
            : '1.18rem',
          lineHeight: 1,
          fontWeight: isTextIcon ? 900 : undefined,
          letterSpacing: isTextIcon ? '0.04em' : undefined,
          fontFamily: isTextIcon ? 'monospace' : undefined,
        }}
      >
        {icon}
      </span>
      <span 
        className="relative z-10 max-w-full truncate px-0.5 text-center font-mono text-[7px] font-bold uppercase leading-none tracking-wide sm:text-[9px]"
        style={{ 
          color: isActive ? '#FFF' : '#5D4037', 
          textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' 
        }}
      >
        {label}
      </span>
      
    </motion.button>
  )
}
