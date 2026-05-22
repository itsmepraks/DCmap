'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTourNarration } from '@/app/hooks/useTourNarration'
import type { Tour, TourCard } from '@/app/lib/tours'

interface GuideCardProps {
  tour: Tour
  onClose: () => void
}

const KIND_LABEL: Record<TourCard['kind'], string> = {
  pitch: 'What you are looking at',
  history: 'How it came to be',
  surprise: 'Did you know',
  tip: 'If you were here',
}

const KIND_ICON: Record<TourCard['kind'], string> = {
  pitch: '📍',
  history: '📜',
  surprise: '✨',
  tip: '💡',
}

export default function GuideCard({ tour, onClose }: GuideCardProps) {
  const [idx, setIdx] = useState(0)
  const [started, setStarted] = useState(false)
  const reduceMotion = useReducedMotion()
  const { speak, pause, resume, stop, state, supported } = useTourNarration()

  const card = tour.cards[idx]
  const isLast = idx === tour.cards.length - 1
  const isFirst = idx === 0

  // Speak a specific card by index. Auto-advances to the next card on
  // utterance end. Called exclusively from event handlers (button clicks,
  // onEnd callbacks) — never from useEffect — so speechSynthesis.cancel()
  // can't race with a second speak() in the same microtask.
  const speakCard = useCallback(
    (cardIdx: number) => {
      const next = tour.cards[cardIdx]
      if (!next) return
      console.info(`[guide] speaking card ${cardIdx} of ${tour.cards.length}`)
      speak(next.voice, {
        onEnd: () => {
          if (cardIdx < tour.cards.length - 1) {
            window.setTimeout(() => {
              setIdx(cardIdx + 1)
              speakCard(cardIdx + 1)
            }, 600)
          }
        },
      })
    },
    [tour.cards, speak]
  )

  // Stop narration when the card unmounts.
  useEffect(() => () => stop(), [stop])

  const handleClose = () => {
    stop()
    onClose()
  }

  const togglePlay = () => {
    if (state === 'speaking') {
      pause()
      return
    }
    if (state === 'paused') {
      resume()
      return
    }
    if (!started) setStarted(true)
    speakCard(idx)
  }

  const goNext = () => {
    if (isLast) {
      handleClose()
      return
    }
    const newIdx = idx + 1
    setIdx(newIdx)
    if (started) speakCard(newIdx)
  }

  const goBack = () => {
    if (isFirst) return
    const newIdx = idx - 1
    setIdx(newIdx)
    if (started) speakCard(newIdx)
  }

  return (
    <AnimatePresence>
      <motion.div
        key="guide"
        initial={reduceMotion ? { opacity: 0 } : { y: 60, opacity: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { y: 60, opacity: 0 }}
        transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', damping: 26, stiffness: 280 }}
        className="fixed left-1/2 bottom-28 z-40 w-[92%] max-w-md -translate-x-1/2"
      >
        <div
          className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
          style={{
            background:
              'linear-gradient(180deg, rgba(15, 20, 36, 0.95) 0%, rgba(8, 12, 24, 0.95) 100%)',
            backdropFilter: 'blur(12px)',
          }}
          role="dialog"
          aria-label={`Tour guide: ${tour.name}`}
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 200, 130, 0.25), rgba(255, 200, 130, 0.05))',
                border: '1px solid rgba(255, 200, 130, 0.4)',
              }}
              aria-hidden="true"
            >
              <span className="text-lg">🎧</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80">
                Audio guide
              </div>
              <div className="truncate text-sm font-semibold text-white">{tour.name}</div>
            </div>
            <div className="flex items-center gap-2">
              {state === 'speaking' && (
                <motion.span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-amber-300"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              <button
                onClick={handleClose}
                aria-label="Close guide"
                className="rounded p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="px-4 py-4">
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-white/40">
              <span aria-hidden="true">{KIND_ICON[card.kind]}</span>
              <span>{KIND_LABEL[card.kind]}</span>
            </div>
            <h3 className="mb-2 text-base font-semibold text-white">{card.title}</h3>
            <p className="text-sm leading-relaxed text-white/75">{card.display}</p>
          </div>

          <div className="flex justify-center gap-1.5 pb-2">
            {tour.cards.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all"
                style={{
                  width: i === idx ? 22 : 6,
                  background: i === idx ? 'rgba(255, 200, 130, 0.9)' : 'rgba(255, 255, 255, 0.18)',
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
            <button
              onClick={goBack}
              disabled={isFirst}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Back
            </button>

            {supported ? (
              <motion.button
                onClick={togglePlay}
                aria-label={state === 'speaking' ? 'Pause narration' : 'Play narration'}
                animate={
                  !started && state !== 'speaking'
                    ? { scale: [1, 1.06, 1] }
                    : { scale: 1 }
                }
                transition={
                  !started ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.15 }
                }
                className={
                  'rounded-full px-5 py-2 text-xs font-semibold text-stone-900 transition ' +
                  (!started
                    ? 'bg-amber-400 shadow-lg shadow-amber-300/40 ring-2 ring-amber-300/50 hover:bg-amber-300'
                    : 'bg-amber-400/90 hover:bg-amber-300')
                }
              >
                {state === 'speaking' ? '⏸ Pause' : state === 'paused' ? '▶ Resume' : !started ? '🔊 Listen' : '▶ Play'}
              </motion.button>
            ) : (
              <span className="text-xs text-white/30">No voice on this browser</span>
            )}

            <button
              onClick={goNext}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/5"
            >
              {isLast ? 'Done' : 'Next →'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
