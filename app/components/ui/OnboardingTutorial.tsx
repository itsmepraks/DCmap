'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useFocusTrap } from '@/app/hooks/useFocusTrap'
import { useMap } from '@/app/lib/MapContext'
import { STORAGE_KEYS } from '@/app/lib/storageKeys'

const ONBOARDING_STORAGE_KEY = STORAGE_KEYS.onboardingComplete

interface Slide {
  eyebrow: string
  title: string
  body: string
  hint?: string
}

const SLIDES: Slide[] = [
  {
    eyebrow: 'Welcome',
    title: 'Washington, D.C.',
    body:
      'A photorealistic 3D map you can explore at any hour of the day. Real buildings, real streets, real monuments — floodlit at night, swept by petals in spring, blanketed in snow in winter.',
    hint: 'Press ⌘K (or Ctrl+K) any time to search.',
  },
  {
    eyebrow: 'Discover',
    title: 'Find 10 iconic landmarks',
    body:
      'Click any landmark marker to discover it. Earn points, unlock museums, and complete the daily Mystery of the Day card up top.',
    hint: 'Get within 50 m of a landmark in Fly Mode to discover it on foot.',
  },
  {
    eyebrow: 'Shape the scene',
    title: 'Time-of-day and seasons',
    body:
      'The dock in the bottom-right cycles Dawn → Day → Dusk → Night. Open Layers to switch seasons — the whole city changes colour, monuments light up at night.',
    hint: 'Try toggling Fly mode for first-person navigation (desktop only).',
  },
]

// Cinematic tour waypoints — flown through one by one when "Show me around" is hit.
const TOUR: Array<{
  center: [number, number]
  zoom: number
  pitch: number
  bearing: number
}> = [
  { center: [-77.0353, 38.8895], zoom: 16.5, pitch: 70, bearing: -17.6 }, // Washington Monument
  { center: [-77.0502, 38.8893], zoom: 16, pitch: 65, bearing: 90 },      // Lincoln Memorial
  { center: [-77.0089, 38.8899], zoom: 15.5, pitch: 65, bearing: -45 },   // US Capitol
]

export default function OnboardingTutorial() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const reduceMotion = useReducedMotion()
  const { map } = useMap()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(ONBOARDING_STORAGE_KEY)) return
    const timer = window.setTimeout(() => setIsVisible(true), 600)
    return () => window.clearTimeout(timer)
  }, [])

  function handleComplete() {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    window.dispatchEvent(new Event('dc:onboarding-complete'))
    setIsVisible(false)
  }

  const handleSkip = () => handleComplete()

  const handleShowAround = () => {
    handleComplete()
    if (!map) return
    // Sequential flyTo calls — Mapbox doesn't queue them, so we chain via the
    // 'moveend' event for a smooth multi-stop tour.
    let i = 0
    const next = () => {
      if (i >= TOUR.length) {
        map.off('moveend', next)
        return
      }
      const stop = TOUR[i++]
      map.flyTo({
        center: stop.center,
        zoom: stop.zoom,
        pitch: stop.pitch,
        bearing: stop.bearing,
        duration: 3200,
        curve: 1.4,
        essential: true,
      })
    }
    map.on('moveend', next)
    next()
  }

  const dialogRef = useFocusTrap<HTMLDivElement>(isVisible, handleSkip)

  const step = SLIDES[currentStep]
  const isLastStep = currentStep === SLIDES.length - 1

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleSkip()
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            aria-describedby="onboarding-desc"
            initial={reduceMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
            transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-xl rounded-t-3xl sm:rounded-3xl"
            style={{
              background:
                'radial-gradient(ellipse at top, #1A2238 0%, #0F1424 70%, #060B1A 100%)',
              border: '1px solid rgba(255, 200, 130, 0.15)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.55)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleSkip}
              aria-label="Skip introduction"
              className="absolute right-4 top-4 text-xs uppercase tracking-[0.2em] text-white/40 hover:text-white/80"
            >
              Skip
            </button>

            <div className="px-8 pb-8 pt-12 sm:px-12 sm:pt-14">
              <motion.div
                key={`eyebrow-${currentStep}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 text-xs uppercase tracking-[0.32em]"
                style={{ color: 'rgba(255, 200, 130, 0.7)' }}
              >
                {step.eyebrow}
              </motion.div>

              <motion.h2
                id="onboarding-title"
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-4 text-3xl font-light leading-tight text-white sm:text-4xl"
              >
                {step.title}
              </motion.h2>

              <motion.p
                id="onboarding-desc"
                key={`body-${currentStep}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm leading-relaxed text-white/70"
              >
                {step.body}
              </motion.p>

              {step.hint && (
                <motion.div
                  key={`hint-${currentStep}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60"
                >
                  <span className="mr-2 text-amber-300/80">Tip</span>
                  {step.hint}
                </motion.div>
              )}

              <div className="mt-8 flex items-center justify-center gap-1.5">
                {SLIDES.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1 rounded-full transition-all"
                    style={{
                      width: idx === currentStep ? 32 : 8,
                      background:
                        idx === currentStep ? 'rgba(255, 200, 130, 0.85)' : 'rgba(255, 255, 255, 0.18)',
                    }}
                  />
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-end">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5"
                  >
                    Back
                  </button>
                )}
                {!isLastStep && (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="rounded-lg bg-amber-400/90 px-5 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-amber-300"
                  >
                    Continue
                  </button>
                )}
                {isLastStep && (
                  <>
                    <button
                      onClick={handleComplete}
                      className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5"
                    >
                      Explore on my own
                    </button>
                    <button
                      onClick={handleShowAround}
                      className="rounded-lg bg-amber-400/90 px-5 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-amber-300"
                    >
                      Show me around →
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
