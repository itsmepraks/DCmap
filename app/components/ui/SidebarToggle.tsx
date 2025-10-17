'use client'

import { motion } from 'framer-motion'

interface SidebarToggleProps {
  isOpen: boolean
  onToggle: () => void
}

export default function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onClick={onToggle}
      className="fixed top-6 left-6 z-20 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-lg shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
        <motion.span
          animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-0.5 bg-gray-800 rounded-full"
        />
        <motion.span
          animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-0.5 bg-gray-800 rounded-full"
        />
        <motion.span
          animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-0.5 bg-gray-800 rounded-full"
        />
      </div>
    </motion.button>
  )
}

