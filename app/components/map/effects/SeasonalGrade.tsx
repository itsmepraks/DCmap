'use client'

import { motion } from 'framer-motion'

type Season = 'spring' | 'summer' | 'fall' | 'winter'

/**
 * Soft full-screen color grade tied to the current season. Sits above the
 * map canvas but under the HUD, using mix-blend-mode for non-destructive
 * tinting. Gives the whole scene a seasonal cast without touching Mapbox
 * style internals (which we can't recolor for Standard's built-in 3D trees).
 */

const GRADES: Record<Season, { color: string; opacity: number; blend: string }> = {
  spring: {
    // soft cherry pink wash + warm midday
    color:
      'radial-gradient(ellipse at 50% 30%, rgba(255, 200, 215, 0.5) 0%, rgba(255, 220, 200, 0.25) 50%, transparent 100%)',
    opacity: 0.6,
    blend: 'soft-light',
  },
  summer: {
    // golden, slightly hazy
    color:
      'radial-gradient(ellipse at 50% 40%, rgba(255, 220, 130, 0.4) 0%, rgba(255, 200, 100, 0.2) 60%, transparent 100%)',
    opacity: 0.7,
    blend: 'soft-light',
  },
  fall: {
    // warm orange + amber sweep
    color:
      'linear-gradient(180deg, rgba(255, 130, 60, 0.35) 0%, rgba(225, 95, 40, 0.25) 50%, rgba(150, 50, 20, 0.2) 100%)',
    opacity: 0.85,
    blend: 'soft-light',
  },
  winter: {
    // cool desaturating blue + low contrast
    color:
      'linear-gradient(180deg, rgba(180, 210, 240, 0.45) 0%, rgba(200, 220, 240, 0.35) 50%, rgba(220, 230, 240, 0.5) 100%)',
    opacity: 0.85,
    blend: 'soft-light',
  },
}

export default function SeasonalGrade({ season }: { season: Season }) {
  const grade = GRADES[season]
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[6]"
      initial={false}
      animate={{ opacity: grade.opacity }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      style={{
        background: grade.color,
        mixBlendMode: grade.blend as React.CSSProperties['mixBlendMode'],
      }}
    />
  )
}
