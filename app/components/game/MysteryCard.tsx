'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { pickMystery } from '@/app/lib/mysteryLandmark'

interface Landmark {
  id: string
  name: string
  category?: string
  coordinates: [number, number]
}

interface Props {
  landmarks: Landmark[]
  visited: Set<string>
  onNavigate: (coordinates: [number, number]) => void
}

/**
 * Top-center card showing the daily mystery landmark — same pick for everyone
 * on the same UTC date. Solved automatically when the user visits the location.
 */
export default function MysteryCard({ landmarks, visited, onNavigate }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const reduceMotion = useReducedMotion()
  const mystery = useMemo(() => pickMystery(landmarks, visited), [landmarks, visited])

  if (dismissed || !mystery) return null

  if (!expanded) {
    return (
      <AnimatePresence>
        <motion.button
          key="mystery-chip"
          initial={reduceMotion ? { opacity: 0 } : { y: -10, opacity: 0 }}
          animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: -10, opacity: 0 }}
          transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', damping: 24, stiffness: 280 }}
          onClick={() => setExpanded(true)}
          className="fixed right-2 top-[7.75rem] z-40 min-h-11 rounded-full border border-amber-400/35 bg-amber-50/90 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-amber-900 shadow-lg backdrop-blur-md transition hover:bg-amber-100 active:scale-[0.96] sm:right-5 sm:top-24 sm:px-3.5 sm:text-xs"
          aria-label="Open mystery of the day"
        >
          <span aria-hidden="true" className="mr-1.5">🕵️</span>
          Mystery
        </motion.button>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        key="mystery"
        initial={reduceMotion ? { opacity: 0 } : { y: -16, opacity: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { y: -16, opacity: 0 }}
        transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', damping: 24, stiffness: 280 }}
        className="fixed right-2 top-[7.75rem] z-40 w-[calc(100vw-1rem)] max-w-xs sm:right-5 sm:top-24 sm:w-[82%]"
      >
        <div className="rounded-2xl border border-amber-400/35 bg-gradient-to-b from-amber-50/92 to-yellow-100/88 px-3.5 py-3 shadow-lg backdrop-blur-md">
          <div className="flex items-start gap-2.5">
            <div className="text-xl" aria-hidden="true">🕵️</div>
            <div className="flex-1">
              <div className="mb-0.5 text-[10px] font-black uppercase tracking-[0.22em] text-amber-800">
                Mystery of the day
              </div>
              <div className="text-xs leading-snug text-stone-800">{mystery.clue}</div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => onNavigate(mystery.landmark.coordinates)}
                  className="min-h-9 rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-amber-700 active:scale-[0.96]"
                >
                  Go near it
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  className="min-h-9 rounded-full px-2 py-1 text-xs text-stone-500 transition hover:bg-stone-900/5 hover:text-stone-800 active:scale-[0.96]"
                  aria-label="Collapse mystery card"
                >
                  Later
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="ml-auto min-h-9 rounded-full px-2 py-1 text-xs text-stone-400 transition hover:bg-stone-900/5 hover:text-stone-700 active:scale-[0.96]"
                  aria-label="Dismiss mystery card"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
