'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

interface CompletionNotificationProps {
  allLandmarksVisited: boolean
  onClose: () => void
}

export default function CompletionNotification({
  allLandmarksVisited,
  onClose
}: CompletionNotificationProps) {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (allLandmarksVisited) {
      setMessage('🎉 Amazing! You\'ve visited all landmarks in Washington D.C.!')
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [allLandmarksVisited, onClose])

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
      >
        <div
          className="px-8 py-6 shadow-2xl relative"
          style={{
            background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
            border: `4px solid ${minecraftTheme.colors.terracotta.base}`,
            borderRadius: '12px',
            boxShadow: '0 8px 0 ' + minecraftTheme.colors.terracotta.dark + ', 0 12px 24px rgba(0,0,0,0.4)',
            imageRendering: minecraftTheme.minecraft.imageRendering,
            minWidth: '320px',
            textAlign: 'center'
          }}
        >
          <div className="text-5xl mb-4">{allLandmarksVisited ? '🏆' : '✅'}</div>
          <div className="text-lg font-bold mb-2" style={{ 
            color: minecraftTheme.colors.text.primary,
            fontFamily: 'monospace'
          }}>
            {message}
          </div>
          <button
            onClick={() => {
              setShow(false)
              onClose()
            }}
            className="mt-4 px-4 py-2 text-sm font-bold"
            style={{
              background: minecraftTheme.colors.terracotta.base,
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            Awesome!
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

