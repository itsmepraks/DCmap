'use client'

import { motion } from 'framer-motion'
import { theme } from '@/app/lib/theme'

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
      className="relative p-5 rounded-xl transition-all duration-200 cursor-pointer"
      style={{
        background: enabled 
          ? 'linear-gradient(135deg, #7ED957 0%, #66BB6A 100%)' 
          : 'rgba(255, 255, 255, 0.8)',
        boxShadow: enabled ? theme.shadows.lg : theme.shadows.md,
        border: enabled ? `2px solid ${theme.colors.darkGreen}` : '2px solid transparent'
      }}
    >
      {/* Layer indicator dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: enabled ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="absolute top-3 left-3 w-3 h-3 rounded-full bg-white shadow-md"
      />
      
      {/* Content */}
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-3" style={{ marginLeft: enabled ? '16px' : '0' }}>
          <h3 
            className="text-base font-bold transition-colors" 
            style={{ color: enabled ? 'white' : theme.colors.text.primary }}
          >
            {label}
          </h3>
          {description && (
            <p 
              className="text-xs mt-1 transition-colors"
              style={{ color: enabled ? 'rgba(255, 255, 255, 0.9)' : theme.colors.text.light }}
            >
              {description}
            </p>
          )}
        </div>
        {/* Animated toggle switch */}
        <motion.div
          className="relative inline-flex h-7 w-12 items-center rounded-full transition-all"
          style={{ 
            backgroundColor: enabled ? 'rgba(255, 255, 255, 0.3)' : theme.colors.accent
          }}
        >
          <motion.span
            layout
            animate={{ x: enabled ? 26 : 3 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg"
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

