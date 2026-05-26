'use client'

import { motion } from 'framer-motion'
import type { LightPreset } from '@/app/hooks/useTimeOfDay'

const TINT: Record<LightPreset, { color: string; opacity: number }> = {
  dawn: {
    color:
      'linear-gradient(180deg, rgba(255, 197, 128, 0.16) 0%, rgba(255, 229, 193, 0.07) 46%, transparent 100%)',
    opacity: 0.24,
  },
  day: {
    color:
      'linear-gradient(180deg, rgba(255, 252, 238, 0.05) 0%, transparent 58%, rgba(255,255,255,0.02) 100%)',
    opacity: 0.05,
  },
  dusk: {
    color:
      'linear-gradient(180deg, rgba(255, 139, 80, 0.16) 0%, rgba(149, 90, 128, 0.10) 44%, rgba(22, 43, 84, 0.14) 100%)',
    opacity: 0.28,
  },
  night: {
    color:
      'linear-gradient(180deg, rgba(10, 42, 82, 0.16) 0%, rgba(6, 20, 46, 0.16) 54%, rgba(2, 8, 22, 0.20) 100%)',
    opacity: 0.27,
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
        mixBlendMode: preset === 'day' ? 'multiply' : 'soft-light',
      }}
    />
  )
}
