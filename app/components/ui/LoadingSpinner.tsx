'use client'

import { motion } from 'framer-motion'

export default function LoadingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-4"
        style={{ 
          borderColor: '#EFE6D5',
          borderTopColor: '#7ED957'
        }}
      />
    </motion.div>
  )
}

