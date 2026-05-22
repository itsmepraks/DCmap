'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface Props {
  landmarkName: string
  onAccept: () => void
  onDismiss: () => void
}

/**
 * One-time invitation to enable the audio guide. Slides up the first time the
 * user is near a landmark we have curated content for. Accepting enables
 * Guide Mode permanently (toggleable later via the dock).
 */
export default function GuideOptInPrompt({ landmarkName, onAccept, onDismiss }: Props) {
  const reduceMotion = useReducedMotion()
  return (
    <AnimatePresence>
      <motion.div
        key="opt-in"
        initial={reduceMotion ? { opacity: 0 } : { y: 60, opacity: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { y: 60, opacity: 0 }}
        transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', damping: 24, stiffness: 280 }}
        className="fixed left-1/2 bottom-28 z-40 w-[92%] max-w-sm -translate-x-1/2"
      >
        <div
          role="dialog"
          aria-label="Try the audio guide"
          className="rounded-2xl border border-amber-300/30 px-4 py-3 shadow-2xl"
          style={{
            background:
              'linear-gradient(180deg, rgba(28, 22, 14, 0.96) 0%, rgba(18, 14, 8, 0.96) 100%)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl" aria-hidden="true">🎧</div>
            <div className="flex-1">
              <div className="mb-0.5 text-[10px] uppercase tracking-[0.3em] text-amber-300/80">
                You&apos;re near {landmarkName}
              </div>
              <p className="text-sm leading-snug text-white/85">
                Want me to tell you about it? A short audio tour, narrated in your browser — no
                accounts, no costs.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={onAccept}
                  className="rounded-md bg-amber-400 px-3 py-1.5 text-xs font-semibold text-stone-900 transition hover:bg-amber-300"
                >
                  Yes, guide me
                </button>
                <button
                  onClick={onDismiss}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-white/55 transition hover:text-white"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
