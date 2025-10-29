'use client'

import { motion } from 'framer-motion'

interface ThreeDToggleProps {
  is3D: boolean
  onToggle: () => void
}

export default function ThreeDToggle({ is3D, onToggle }: ThreeDToggleProps) {
  return (
    <motion.button
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onToggle}
      className="fixed bottom-8 right-28 z-30 group"
      style={{
        width: '64px',
        height: '64px',
        background: is3D 
          ? 'linear-gradient(145deg, #8B7355 0%, #6B5344 100%)'
          : 'linear-gradient(145deg, #A0826D 0%, #8B7355 100%)',
        boxShadow: is3D
          ? 'inset -4px -4px 8px rgba(0,0,0,0.3), inset 4px 4px 8px rgba(255,255,255,0.1), 0 6px 0 #4A3728, 0 8px 12px rgba(0,0,0,0.4)'
          : '0 8px 0 #6B5344, 0 10px 20px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.2)',
        border: '3px solid #5D4A3A',
        borderRadius: '4px',
        transform: is3D ? 'translateY(4px)' : 'translateY(0)',
        transition: 'all 0.1s ease',
        imageRendering: 'pixelated',
        fontFamily: 'monospace',
        cursor: 'pointer'
      }}
      aria-label={is3D ? 'Switch to 2D view' : 'Switch to 3D view'}
    >
      {/* Minecraft-style 3D text */}
      <div 
        className="relative w-full h-full flex flex-col items-center justify-center"
        style={{
          textShadow: is3D 
            ? '2px 2px 0 rgba(0,0,0,0.5)'
            : '2px 2px 0 rgba(0,0,0,0.3), -1px -1px 0 rgba(255,255,255,0.2)'
        }}
      >
        <span 
          className="text-2xl font-bold"
          style={{
            color: '#FFF',
            fontFamily: 'monospace',
            letterSpacing: '1px',
            transform: is3D ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          3D
        </span>
        <span 
          className="text-[10px] font-bold mt-1"
          style={{
            color: is3D ? '#FFD700' : '#DDD',
            fontFamily: 'monospace',
            textTransform: 'uppercase'
          }}
        >
          {is3D ? 'ON' : 'OFF'}
        </span>
      </div>

      {/* Minecraft-style pixel corners */}
      <div 
        className="absolute top-0 left-0 w-1 h-1 bg-black/40"
        style={{ imageRendering: 'pixelated' }}
      />
      <div 
        className="absolute top-0 right-0 w-1 h-1 bg-black/40"
        style={{ imageRendering: 'pixelated' }}
      />
      <div 
        className="absolute bottom-0 left-0 w-1 h-1 bg-black/40"
        style={{ imageRendering: 'pixelated' }}
      />
      <div 
        className="absolute bottom-0 right-0 w-1 h-1 bg-black/40"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none"
        style={{
          background: 'linear-gradient(145deg, #5D4A3A 0%, #4A3728 100%)',
          border: '2px solid #3A2918',
          boxShadow: '0 4px 0 #2A1908, 0 6px 8px rgba(0,0,0,0.4)',
          imageRendering: 'pixelated'
        }}
      >
        <span 
          className="text-xs font-bold"
          style={{
            color: '#FFF',
            fontFamily: 'monospace',
            textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
          }}
        >
          {is3D ? 'Disable 3D View' : 'Enable 3D View'}
        </span>
        {/* Arrow pointing down */}
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #4A3728'
          }}
        />
      </motion.div>
    </motion.button>
  )
}

