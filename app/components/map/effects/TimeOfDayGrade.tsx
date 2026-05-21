'use client'

import { motion } from 'framer-motion'
import type { LightPreset } from '@/app/hooks/useTimeOfDay'

const TINT: Record<LightPreset, { color: string; opacity: number }> = {
  dawn: {
    color:
      'linear-gradient(180deg, rgba(255, 175, 105, 0.32) 0%, rgba(255, 200, 130, 0.18) 50%, transparent 100%)',
    opacity: 0.65,
  },
  day: {
    color:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 100%)',
    opacity: 0.3,
  },
  dusk: {
    color:
      'linear-gradient(180deg, rgba(255, 110, 70, 0.32) 0%, rgba(220, 90, 130, 0.25) 40%, rgba(80, 50, 130, 0.2) 100%)',
    opacity: 0.85,
  },
  night: {
    color:
      'linear-gradient(180deg, rgba(20, 25, 60, 0.5) 0%, rgba(15, 20, 50, 0.45) 50%, rgba(8, 10, 30, 0.55) 100%)',
    opacity: 0.95,
  },
}

/**
 * Cinematic colour grade tied to the current time-of-day preset.
 * Cross-fades between presets over 1.6s — matches the Mapbox circle-opacity
 * transition we use on the monument lights, so the whole scene shifts in sync.
 */
export default function TimeOfDayGrade({ preset }: { preset: LightPreset }) {
  const tint = TINT[preset]
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[4]"
      initial={false}
      animate={{ opacity: tint.opacity }}
      transition={{ duration: 1.6, ease: 'easeInOut' }}
      style={{
        background: tint.color,
        mixBlendMode: 'multiply',
      }}
    />
  )
}
