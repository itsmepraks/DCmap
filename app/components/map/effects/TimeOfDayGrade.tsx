'use client'

import { motion } from 'framer-motion'
import type { LightPreset } from '@/app/hooks/useTimeOfDay'

const TINT: Record<LightPreset, { color: string; opacity: number }> = {
  dawn: {
    color:
      'linear-gradient(180deg, rgba(255, 190, 116, 0.20) 0%, rgba(255, 225, 186, 0.08) 48%, transparent 100%)',
    opacity: 0.34,
  },
  day: {
    color:
      'linear-gradient(180deg, rgba(255, 252, 238, 0.08) 0%, transparent 55%, rgba(255,255,255,0.03) 100%)',
    opacity: 0.08,
  },
  dusk: {
    color:
      'linear-gradient(180deg, rgba(255, 128, 76, 0.20) 0%, rgba(148, 80, 128, 0.14) 45%, rgba(28, 41, 82, 0.18) 100%)',
    opacity: 0.38,
  },
  night: {
    color:
      'linear-gradient(180deg, rgba(7, 45, 103, 0.24) 0%, rgba(3, 17, 43, 0.22) 58%, rgba(1, 7, 20, 0.26) 100%)',
    opacity: 0.42,
  },
}

/**
 * Cinematic colour grade tied to the current time-of-day preset.
 * Cross-fades between presets over 1.9s — matches the Mapbox circle-opacity
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
      transition={{ duration: 1.9, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: tint.color,
        mixBlendMode: preset === 'night' ? 'overlay' : 'multiply',
      }}
    />
  )
}
