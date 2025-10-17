'use client'

import { motion } from 'framer-motion'

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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
    >
      <div className="flex-1">
        <label htmlFor={id} className="cursor-pointer">
          <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </label>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <motion.span
          layout
          animate={{ x: enabled ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
        />
      </button>
    </motion.div>
  )
}

