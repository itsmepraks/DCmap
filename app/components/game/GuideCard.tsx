'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTourNarration, tourAudioSrc } from '@/app/hooks/useTourNarration'
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
  const advanceTimeoutRef = useRef<number | null>(null)
  const reduceMotion = useReducedMotion()
  const { play, speak, pause, resume, stop, state, isPlaying, isPaused } = useTourNarration()

  const card = tour.cards[idx]
  const isLast = idx === tour.cards.length - 1
  const isFirst = idx === 0

  // Play a specific card by index. Auto-advances at end of clip.
  const playCard = useCallback(
    (cardIdx: number) => {
      const next = tour.cards[cardIdx]
      if (!next) return
      if (advanceTimeoutRef.current !== null) {
        window.clearTimeout(advanceTimeoutRef.current)
        advanceTimeoutRef.current = null
      }
      const playOptions = {
        onEnd: () => {
          if (cardIdx < tour.cards.length - 1) {
            advanceTimeoutRef.current = window.setTimeout(() => {
              advanceTimeoutRef.current = null
              setIdx(cardIdx + 1)
              playCard(cardIdx + 1)
            }, 650)
          }
        },
      }
      if (tour.audioMode === 'speech') {
        speak(next.voice, playOptions)
      } else {
        const src = tourAudioSrc(tour.id, next.kind)
        play(src, playOptions)
      }
    },
    [tour, play, speak]
  )

  // Stop narration on unmount.
  useEffect(
    () => () => {
      if (advanceTimeoutRef.current !== null) window.clearTimeout(advanceTimeoutRef.current)
      stop()
    },
    [stop]
  )

  const handleClose = () => {
    if (advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }
    stop()
    onClose()
  }

  const togglePlay = () => {
    if (isPlaying) {
      pause()
      return
    }
    if (isPaused) {
      resume()
      return
    }
    if (!started) setStarted(true)
    playCard(idx)
  }

  const goNext = () => {
    if (isLast) {
      handleClose()
      return
    }
    const newIdx = idx + 1
    setIdx(newIdx)
    if (started) playCard(newIdx)
  }

  const goBack = () => {
    if (isFirst) return
    const newIdx = idx - 1
    setIdx(newIdx)
    if (started) playCard(newIdx)
  }

  const playLabel =
    state === 'loading' ? 'Loading'
      : isPlaying ? 'Pause'
      : isPaused ? 'Resume'
      : !started ? 'Listen'
      : 'Play'

  return (
    <AnimatePresence>
      <motion.div
        key="guide"
        initial={reduceMotion ? { opacity: 0 } : { y: 60, opacity: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { y: 60, opacity: 0 }}
        transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', damping: 26, stiffness: 280 }}
        className="pointer-events-none fixed inset-x-0 bottom-32 z-40 flex justify-center px-3 sm:bottom-40"
      >
        <div
          className="pointer-events-auto w-full min-w-0 max-w-[min(32rem,calc(100vw-1rem))] overflow-hidden rounded-[1.35rem] shadow-2xl"
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 249, 235, 0.97) 0%, rgba(246, 231, 201, 0.96) 100%)',
            border: '1px solid rgba(126, 86, 41, 0.28)',
            boxShadow: '0 18px 60px rgba(31, 22, 9, 0.32), 0 3px 0 rgba(126, 86, 41, 0.28), inset 0 1px 0 rgba(255,255,255,0.78)',
            backdropFilter: 'blur(16px)',
          }}
          role="dialog"
          aria-label={`Tour guide: ${tour.name}`}
        >
          <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'rgba(126, 86, 41, 0.18)' }}>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(193, 111, 38, 0.20), rgba(255, 212, 124, 0.44))',
                border: '1px solid rgba(126, 86, 41, 0.32)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
              }}
              aria-hidden="true"
            >
              <span className="text-lg">🎧</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-amber-800/80">
                Audio guide
              </div>
              <div className="truncate text-base font-black text-stone-950">{tour.name}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {isPlaying && (
                <motion.span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-emerald-500"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              <button
                onClick={handleClose}
                aria-label="Close guide"
                className="rounded-md p-1.5 text-stone-500 transition hover:bg-stone-900/5 hover:text-stone-950 active:scale-[0.96]"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-800/70">
              <span aria-hidden="true">{KIND_ICON[card.kind]}</span>
              <span>{KIND_LABEL[card.kind]}</span>
            </div>
            <h3 className="mb-2 text-xl font-black leading-tight text-stone-950">{card.title}</h3>
            <p className="text-[15px] leading-relaxed text-stone-700">{card.display}</p>
          </div>

          <div className="flex justify-center gap-1.5 pb-2">
            {tour.cards.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all"
                style={{
                  width: i === idx ? 22 : 6,
                  background: i === idx ? 'rgba(176, 95, 28, 0.86)' : 'rgba(126, 86, 41, 0.20)',
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between border-t px-3 py-3" style={{ borderColor: 'rgba(126, 86, 41, 0.18)' }}>
            <button
              onClick={goBack}
              disabled={isFirst}
              className="min-h-10 rounded-lg px-3 py-1.5 text-sm font-bold text-stone-600 transition hover:bg-stone-900/5 hover:text-stone-950 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Back
            </button>

            <motion.button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
              animate={!started && !isPlaying ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={!started ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.15 }}
              className={
                'min-h-11 rounded-full px-6 py-2 text-sm font-black text-stone-950 transition active:scale-[0.96] ' +
                (!started
                  ? 'bg-amber-400 shadow-lg shadow-amber-300/40 ring-2 ring-amber-300/50 hover:bg-amber-300'
                  : 'bg-amber-400/90 hover:bg-amber-300')
              }
            >
              <span aria-hidden="true" className="mr-1.5">🔊</span>{playLabel}
            </motion.button>

            <button
              onClick={goNext}
              className="min-h-10 rounded-lg px-3 py-1.5 text-sm font-bold text-stone-700 transition hover:bg-stone-900/5 active:scale-[0.96]"
            >
              {isLast ? 'Done' : 'Next →'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
