'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface Props {
  landmarkName: string
  onOpen: () => void
  onDismiss: () => void
}

/**
 * Small floating affordance shown when the user reaches a landmark that has
 * audio-tour content. Click opens the tour; the small × dismisses for the
 * rest of the session for this landmark.
 */
export default function GuideAvailablePill({ landmarkName, onOpen, onDismiss }: Props) {
  const reduceMotion = useReducedMotion()
  return (
    <AnimatePresence>
      <motion.div
        key={landmarkName}
        initial={reduceMotion ? { opacity: 0 } : { y: 30, opacity: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { y: 30, opacity: 0 }}
        transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', damping: 24, stiffness: 280 }}
        className="fixed left-1/2 bottom-32 z-40 -translate-x-1/2"
      >
        <div
          role="region"
          aria-label={`Audio tour available for ${landmarkName}`}
          className="flex items-center gap-2 rounded-full border border-amber-300/40 px-2 py-1.5 shadow-xl"
          style={{
            background:
              'linear-gradient(180deg, rgba(28, 22, 14, 0.95) 0%, rgba(18, 14, 8, 0.95) 100%)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            onClick={onOpen}
            className="flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-semibold text-stone-900 transition hover:bg-amber-300"
          >
            <span aria-hidden="true">🎧</span>
            <span>Listen to tour: {landmarkName}</span>
          </button>
          <button
            onClick={onDismiss}
            aria-label="Dismiss tour offer"
            className="rounded-full px-2 py-1 text-xs text-white/45 transition hover:text-white"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
