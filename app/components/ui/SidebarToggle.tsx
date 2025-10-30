'use client'

import { motion } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

interface SidebarToggleProps {
  isOpen: boolean
  onToggle: () => void
}

export default function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="fixed top-6 left-6 z-50 w-14 h-14 shadow-lg flex items-center justify-center transition-all relative"
      style={{
        background: isOpen 
          ? `linear-gradient(145deg, ${minecraftTheme.colors.terracotta.base} 0%, ${minecraftTheme.colors.terracotta.dark} 100%)`
          : `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
        border: `${minecraftTheme.minecraft.borderWidth} solid ${minecraftTheme.colors.terracotta.base}`,
        borderRadius: minecraftTheme.minecraft.borderRadius,
        boxShadow: isOpen
          ? minecraftTheme.minecraft.shadowPressed
          : minecraftTheme.minecraft.shadowRaised,
        imageRendering: minecraftTheme.minecraft.imageRendering,
        transform: isOpen ? 'translateY(4px)' : 'translateY(0)'
      }}
    >
      {/* Pixelated corners */}
      <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
      <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
      <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
      <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />

      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isOpen ? '#FFF' : minecraftTheme.colors.text.primary}
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        style={{
          filter: isOpen ? 'drop-shadow(1px 1px 0 rgba(0,0,0,0.3))' : 'none'
        }}
      >
        {isOpen ? (
          <path d="M18 6L6 18M6 6l12 12" />
        ) : (
          <>
            <path d="M3 12h18" />
            <path d="M3 6h18" />
            <path d="M3 18h18" />
          </>
        )}
      </svg>
    </motion.button>
  )
}
