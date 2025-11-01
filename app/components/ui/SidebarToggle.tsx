'use client'

import { motion } from 'framer-motion'

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
      className="fixed top-6 left-6 w-14 h-14 flex items-center justify-center transition-all"
      style={{
        zIndex: 9999,
        background: isOpen 
          ? 'linear-gradient(145deg, #D4501E 0%, #B8431A 100%)'
          : 'linear-gradient(145deg, #EFE6D5 0%, #F5EBD9 100%)',
        border: '3px solid #D4501E',
        borderRadius: '4px',
        boxShadow: isOpen
          ? 'inset -4px -4px 8px rgba(0,0,0,0.3), inset 4px 4px 8px rgba(255,255,255,0.1)'
          : '0 8px 0 #B8431A, 0 10px 20px rgba(0,0,0,0.3)',
        transform: isOpen ? 'translateY(4px)' : 'translateY(0)'
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isOpen ? '#FFF' : '#2C1810'}
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
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
