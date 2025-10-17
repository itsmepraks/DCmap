'use client'

import { motion } from 'framer-motion'

interface MonthSliderProps {
  currentMonth: number // 1-12
  onMonthChange: (month: number) => void
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/**
 * MonthSlider - Phase 2 Feature
 * 
 * Slider control for selecting month to view in the heat map layer.
 * Will be displayed in the sidebar when the Heatmap layer is active.
 * 
 * TODO: Implement in Phase 2
 */
export default function MonthSlider({
  currentMonth,
  onMonthChange,
}: MonthSliderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-red-50 rounded-lg"
    >
      <h3 className="text-sm font-semibold text-gray-800 mb-2">
        Month: {monthNames[currentMonth - 1]}
      </h3>
      <input
        type="range"
        min="1"
        max="12"
        value={currentMonth}
        onChange={(e) => onMonthChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Jan</span>
        <span>Dec</span>
      </div>
    </motion.div>
  )
}

