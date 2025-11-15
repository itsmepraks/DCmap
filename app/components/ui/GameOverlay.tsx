'use client'

import { motion } from 'framer-motion'

/**
 * GameOverlay - GTA-style visual overlay effects
 * Adds game-like atmosphere with color grading, vignette, and UI elements
 */
export default function GameOverlay() {
  return (
    <>
      {/* GTA-style color grading overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{
          background: `
            radial-gradient(ellipse at top left, rgba(255, 200, 100, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(100, 150, 255, 0.06) 0%, transparent 50%),
            linear-gradient(135deg, 
              rgba(255, 180, 80, 0.04) 0%,
              transparent 30%,
              transparent 70%,
              rgba(80, 140, 255, 0.04) 100%
            )
          `,
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Vignette effect for cinematic feel */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9998]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 55%, rgba(0, 0, 0, 0.2) 100%)',
          mixBlendMode: 'multiply',
        }}
      />
      
      {/* Subtle scanline effect for retro game feel */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9997] opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
          mixBlendMode: 'overlay',
        }}
      />
    </>
  )
}

