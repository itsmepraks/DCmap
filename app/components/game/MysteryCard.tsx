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
  const reduceMotion = useReducedMotion()
  const mystery = useMemo(() => pickMystery(landmarks, visited), [landmarks, visited])

  if (dismissed || !mystery) return null

  return (
    <AnimatePresence>
      <motion.div
        key="mystery"
        initial={reduceMotion ? { opacity: 0 } : { y: -16, opacity: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { y: -16, opacity: 0 }}
        transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', damping: 24, stiffness: 280 }}
        className="fixed left-1/2 top-3 z-40 w-[88%] max-w-md -translate-x-1/2 sm:top-5"
      >
        <div className="rounded-xl border border-amber-300/40 bg-gradient-to-b from-amber-50/95 to-amber-100/95 px-4 py-3 shadow-lg backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="text-2xl" aria-hidden="true">🕵️</div>
            <div className="flex-1">
              <div className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
                Mystery of the day
              </div>
              <div className="text-sm leading-snug text-stone-800">{mystery.clue}</div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => onNavigate(mystery.landmark.coordinates)}
                  className="rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  Take me close
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="rounded-md px-2 py-1 text-xs text-stone-500 hover:text-stone-800"
                  aria-label="Dismiss mystery card"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
