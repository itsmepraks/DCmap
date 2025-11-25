'use client'

import { motion } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

interface ControlDockProps {
  is3D: boolean
  onToggle3D: () => void
  isFlying: boolean
  onToggleFly: () => void
  onToggleLayers: () => void
}

export default function ControlDock({ 
  is3D, 
  onToggle3D, 
  isFlying, 
  onToggleFly,
  onToggleLayers
}: ControlDockProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ opacity: 1, y: -2 }}
      className="fixed bottom-4 right-2 sm:bottom-8 sm:right-8 z-50"
    >
      <div 
        className="flex items-center gap-1.5 sm:gap-3 p-1.5 sm:p-3 rounded-lg sm:rounded-2xl relative shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${minecraftTheme.colors.beige.base}FF 0%, ${minecraftTheme.colors.beige.light}FF 100%)`,
          border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
          boxShadow: `0 4px 0 ${minecraftTheme.colors.terracotta.dark}88, 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.1)`,
          backdropFilter: 'blur(12px)',
          imageRendering: minecraftTheme.minecraft.imageRendering,
        }}
      >
        {/* Layers Button */}
        <DockButton
          icon="🗺️"
          label="LAYERS"
          isActive={false}
          onClick={onToggleLayers}
          color={minecraftTheme.colors.terracotta.base}
        />

        <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-transparent via-[#B8860B]/40 to-transparent" />

        {/* 3D Toggle */}
        <DockButton
          icon="🧊"
          label="3D VIEW"
          isActive={is3D}
          onClick={onToggle3D}
          color="#D4501E"
          activeColor="#D4501E"
        />

        <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-transparent via-[#B8860B]/40 to-transparent" />

        {/* Fly Mode */}
        <DockButton
          icon="🦅"
          label="FLY"
          isActive={isFlying}
          onClick={onToggleFly}
          color="#4A90E2"
          activeColor="#6BB3FF"
        />
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
  return (
    <motion.button
      whileHover={{ scale: 1.12, y: -4 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center w-16 h-16 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl transition-all group overflow-hidden"
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
        className="text-2xl mb-0.5 sm:mb-1 relative z-10 transition-all"
        style={{ 
          filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'grayscale(80%) opacity(0.7)',
          transform: isActive ? 'scale(1.1)' : 'scale(1)'
        }}
      >
        {icon}
      </span>
      <span 
        className="text-[8px] font-bold font-mono tracking-wider uppercase relative z-10"
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
