'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

interface WalkModeHUDProps {
  isVisible: boolean
}

export default function WalkModeHUD({ isVisible }: WalkModeHUDProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div
            className="px-6 py-3 shadow-lg relative"
            style={{
              background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
              border: `${minecraftTheme.minecraft.borderWidth} solid ${minecraftTheme.colors.terracotta.base}`,
              borderRadius: minecraftTheme.minecraft.borderRadius,
              boxShadow: minecraftTheme.minecraft.shadowRaised,
              imageRendering: minecraftTheme.minecraft.imageRendering,
            }}
          >
            {/* Pixelated corners */}
            <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />

            <div className="flex items-center gap-6 text-xs font-bold" style={{ 
              color: minecraftTheme.colors.text.primary,
              fontFamily: 'monospace'
            }}>
              <div className="flex items-center gap-2">
                <kbd 
                  className="px-2 py-1"
                  style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    borderRadius: '2px',
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                  }}
                >W</kbd>
                <kbd 
                  className="px-2 py-1"
                  style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    borderRadius: '2px',
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                  }}
                >A</kbd>
                <kbd 
                  className="px-2 py-1"
                  style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    borderRadius: '2px',
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                  }}
                >S</kbd>
                <kbd 
                  className="px-2 py-1"
                  style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    borderRadius: '2px',
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                  }}
                >D</kbd>
                <span style={{ color: minecraftTheme.colors.text.secondary }}>Move</span>
              </div>
              <div className="w-px h-4" style={{ background: minecraftTheme.colors.terracotta.light }} />
              <div className="flex items-center gap-2">
                <kbd 
                  className="px-2 py-1"
                  style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    borderRadius: '2px',
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                  }}
                >⇧</kbd>
                <span style={{ color: minecraftTheme.colors.text.secondary }}>Run</span>
              </div>
              <div className="w-px h-4" style={{ background: minecraftTheme.colors.terracotta.light }} />
              <div className="flex items-center gap-2">
                <kbd 
                  className="px-2 py-1"
                  style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    borderRadius: '2px',
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                  }}
                >V</kbd>
                <span style={{ color: minecraftTheme.colors.text.secondary }}>View</span>
              </div>
              <div className="w-px h-4" style={{ background: minecraftTheme.colors.terracotta.light }} />
              <div className="flex items-center gap-2">
                <kbd 
                  className="px-2 py-1"
                  style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.dark} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    borderRadius: '2px',
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 ' + minecraftTheme.colors.terracotta.dark
                  }}
                >T</kbd>
                <span style={{ color: minecraftTheme.colors.text.secondary }}>3rd Person</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
