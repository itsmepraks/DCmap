'use client'

import { motion } from 'framer-motion'
import type { LightPreset } from '@/app/hooks/useTimeOfDay'

const TINT: Record<LightPreset, { color: string; opacity: number }> = {
  dawn: {
    color:
      'linear-gradient(180deg, rgba(255, 188, 126, 0.24) 0%, rgba(255, 219, 176, 0.14) 45%, rgba(255,255,255,0.03) 100%)',
    opacity: 0.42,
  },
  day: {
    color:
      'linear-gradient(180deg, rgba(255, 252, 238, 0.08) 0%, transparent 55%, rgba(255,255,255,0.03) 100%)',
    opacity: 0.18,
  },
  dusk: {
    color:
      'linear-gradient(180deg, rgba(255, 132, 76, 0.30) 0%, rgba(223, 113, 122, 0.20) 42%, rgba(91, 80, 142, 0.16) 100%)',
    opacity: 0.50,
  },
  night: {
    color:
      'radial-gradient(ellipse at 50% 22%, rgba(44, 58, 98, 0.18) 0%, rgba(13, 23, 46, 0.22) 48%, rgba(5, 11, 24, 0.34) 100%)',
    opacity: 0.46,
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
        mixBlendMode: preset === 'night' ? 'soft-light' : 'multiply',
      }}
    />
  )
}
