'use client'

import { motion } from 'framer-motion'

interface WalkModeToggleProps {
  isWalking: boolean
  onToggle: () => void
}

export default function WalkModeToggle({ isWalking, onToggle }: WalkModeToggleProps) {
  return (
    <motion.button
      initial={{ scale: 0, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onToggle}
      className="fixed bottom-8 right-8 z-30 group"
      style={{
        width: '64px',
        height: '64px',
        background: isWalking
          ? 'linear-gradient(145deg, #7ED957 0%, #5DA040 100%)'
          : 'linear-gradient(145deg, #9FE870 0%, #7ED957 100%)',
        boxShadow: isWalking
          ? 'inset -4px -4px 8px rgba(0,0,0,0.3), inset 4px 4px 8px rgba(255,255,255,0.1), 0 6px 0 #5DA040, 0 8px 12px rgba(0,0,0,0.4)'
          : '0 8px 0 #5DA040, 0 10px 20px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.2)',
        border: '3px solid #5DA040',
        borderRadius: '4px',
        transform: isWalking ? 'translateY(4px)' : 'translateY(0)',
        transition: 'all 0.1s ease',
        imageRendering: 'pixelated',
        fontFamily: 'monospace',
        cursor: 'pointer'
      }}
      aria-label={isWalking ? 'Exit Walk Mode' : 'Enter Walk Mode'}
    >
      {/* Minecraft-style walking icon */}
      <div 
        className="relative w-full h-full flex flex-col items-center justify-center"
        style={{
          textShadow: isWalking 
            ? '2px 2px 0 rgba(0,0,0,0.5)'
            : '2px 2px 0 rgba(0,0,0,0.3), -1px -1px 0 rgba(255,255,255,0.2)'
        }}
      >
        <span 
          className="text-2xl font-bold"
          style={{
            color: '#FFF',
            fontFamily: 'monospace',
            transform: isWalking ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          🚶
        </span>
        <span 
          className="text-[9px] font-bold mt-0.5"
          style={{
            color: isWalking ? '#FFD700' : '#FFF',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {isWalking ? 'WALK' : 'WALK'}
        </span>
      </div>

      {/* Pixelated corners */}
      <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
      <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
      <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
      <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 whitespace-nowrap pointer-events-none"
        style={{
          background: 'linear-gradient(145deg, #EFE6D5 0%, #F5EBD9 100%)',
          border: '2px solid #D4501E',
          borderRadius: '4px',
          boxShadow: '0 4px 0 #B8431A, 0 6px 8px rgba(0,0,0,0.4)',
          imageRendering: 'pixelated'
        }}
      >
        <span 
          className="text-xs font-bold"
          style={{
            color: '#2C1810',
            fontFamily: 'monospace',
            textShadow: 'none'
          }}
        >
          {isWalking ? 'Exit Walk Mode (ESC)' : 'Walk Mode (WASD)'}
        </span>
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #D4501E'
          }}
        />
      </motion.div>

      {/* Active indicator */}
      {isWalking && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 border-2 border-white"
          style={{ boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)' }}
        />
      )}
    </motion.button>
  )
}

