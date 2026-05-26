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
        className="pointer-events-none fixed inset-x-0 bottom-32 z-40 flex justify-center px-3 sm:bottom-40"
      >
        <div
          role="region"
          aria-label={`Audio tour available for ${landmarkName}`}
          className="pointer-events-auto flex w-full min-w-0 max-w-[min(28rem,calc(100vw-1rem))] items-center gap-2 rounded-full border px-1.5 py-1.5 shadow-xl"
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 249, 235, 0.96) 0%, rgba(242, 222, 184, 0.95) 100%)',
            borderColor: 'rgba(126, 86, 41, 0.26)',
            boxShadow: '0 12px 36px rgba(31, 22, 9, 0.24), inset 0 1px 0 rgba(255,255,255,0.72)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            onClick={onOpen}
            className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-black text-stone-950 shadow-sm transition hover:bg-amber-300 active:scale-[0.96]"
          >
            <span aria-hidden="true" className="shrink-0">🎧</span>
            <span className="truncate">Tour: {landmarkName}</span>
          </button>
          <button
            onClick={onDismiss}
            aria-label="Dismiss tour offer"
            className="min-h-10 shrink-0 rounded-full px-2.5 py-1 text-xs text-stone-500 transition hover:bg-stone-900/5 hover:text-stone-900 active:scale-[0.96]"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
