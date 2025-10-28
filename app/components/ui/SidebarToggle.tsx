'use client'

import { motion } from 'framer-motion'

interface SidebarToggleProps {
  isOpen: boolean
  onToggle: () => void
}

export default function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
  return (
    <motion.button
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onToggle}
      className="fixed top-8 left-8 z-30 p-4 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/50"
      style={{
        background: 'linear-gradient(135deg, #7ED957 0%, #5DA5DB 100%)',
        boxShadow: '0 8px 24px rgba(126, 217, 87, 0.4)'
      }}
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      <div className="w-7 h-7 flex flex-col justify-center items-center gap-2">
        <motion.span
          animate={isOpen ? { rotate: 45, y: 10 } : { rotate: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="w-full h-1 bg-white rounded-full shadow-sm"
        />
        <motion.span
          animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="w-full h-1 bg-white rounded-full shadow-sm"
        />
        <motion.span
          animate={isOpen ? { rotate: -45, y: -10 } : { rotate: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="w-full h-1 bg-white rounded-full shadow-sm"
        />
      </div>
    </motion.button>
  )
}

