'use client'

import { motion } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

interface LayerToggleProps {
  id: string
  label: string
  description?: string
  enabled: boolean
  onToggle: () => void
}

export default function LayerToggle({
  id,
  label,
  description,
  enabled,
  onToggle,
}: LayerToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className="relative p-4 transition-all duration-200 cursor-pointer"
      style={{
        background: enabled 
          ? `linear-gradient(135deg, ${minecraftTheme.colors.accent.green} 0%, ${minecraftTheme.colors.accent.greenDark} 100%)`
          : `linear-gradient(135deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
        boxShadow: enabled 
          ? `0 6px 0 ${minecraftTheme.colors.accent.greenDark}, 0 8px 16px rgba(0,0,0,0.3)`
          : '0 4px 0 ' + minecraftTheme.colors.beige.dark + ', 0 6px 12px rgba(0,0,0,0.2)',
        border: enabled 
          ? `2px solid ${minecraftTheme.colors.accent.greenDark}` 
          : `2px solid ${minecraftTheme.colors.terracotta.light}`,
        borderRadius: minecraftTheme.minecraft.borderRadius,
        imageRendering: minecraftTheme.minecraft.imageRendering,
        transform: enabled ? 'translateY(2px)' : 'translateY(0)'
      }}
    >
      {/* Pixelated corners */}
      <div className="absolute top-0 left-0 w-1 h-1 bg-black/30" style={{ imageRendering: 'pixelated' }} />
      <div className="absolute top-0 right-0 w-1 h-1 bg-black/30" style={{ imageRendering: 'pixelated' }} />
      <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/30" style={{ imageRendering: 'pixelated' }} />
      <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/30" style={{ imageRendering: 'pixelated' }} />
      
      {/* Content */}
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-3">
          <h3 
            className="text-base font-bold transition-colors"
            style={{ 
              color: enabled ? 'white' : minecraftTheme.colors.text.primary,
              fontFamily: 'monospace',
              textShadow: enabled ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            {label}
          </h3>
          {description && (
            <p 
              className="text-xs mt-1 transition-colors font-medium"
              style={{ 
                color: enabled ? 'rgba(255, 255, 255, 0.9)' : minecraftTheme.colors.text.secondary,
                fontFamily: 'monospace'
              }}
            >
              {description}
            </p>
          )}
        </div>
        {/* Minecraft-style toggle switch */}
        <motion.div
          className="relative inline-flex h-7 w-14 items-center transition-all"
          style={{ 
            backgroundColor: enabled 
              ? minecraftTheme.colors.accent.greenDark
              : minecraftTheme.colors.terracotta.base,
            border: `2px solid ${enabled ? minecraftTheme.colors.accent.greenDark : minecraftTheme.colors.terracotta.dark}`,
            borderRadius: '2px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
            imageRendering: minecraftTheme.minecraft.imageRendering,
          }}
        >
          <motion.span
            layout
            animate={{ x: enabled ? 28 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="inline-block h-5 w-5 transform shadow-lg relative"
            style={{
              background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.base} 100%)`,
              border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
              borderRadius: '2px',
              boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark,
              imageRendering: minecraftTheme.minecraft.imageRendering,
            }}
          >
            {/* Pixel corners on switch */}
            <div className="absolute top-0 left-0 w-px h-px bg-black/40" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute top-0 right-0 w-px h-px bg-black/40" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute bottom-0 left-0 w-px h-px bg-black/40" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute bottom-0 right-0 w-px h-px bg-black/40" style={{ imageRendering: 'pixelated' }} />
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  )
}
