'use client'

import { motion } from 'framer-motion'

type Season = 'spring' | 'summer' | 'fall' | 'winter'

/**
 * Soft full-screen color grade tied to the current season. Sits above the
 * map canvas but under the HUD, using mix-blend-mode for non-destructive
 * tinting. Gives the whole scene a seasonal cast without touching Mapbox
 * style internals (which we can't recolor for Standard's built-in 3D trees).
 */

// Seasonal grade strength is intentionally subtle — Standard renders DC very
// vividly already, and stacking opaque colour washes bleached the scene.
const GRADES: Record<Season, { color: string; opacity: number; blend: string }> = {
  spring: {
    color:
      'radial-gradient(ellipse at 50% 30%, rgba(255, 200, 215, 0.35) 0%, rgba(255, 220, 200, 0.18) 50%, transparent 100%)',
    opacity: 0.4,
    blend: 'soft-light',
  },
  summer: {
    color:
      'radial-gradient(ellipse at 50% 40%, rgba(255, 220, 130, 0.28) 0%, rgba(255, 200, 100, 0.15) 60%, transparent 100%)',
    opacity: 0.45,
    blend: 'soft-light',
  },
  fall: {
    color:
      'linear-gradient(180deg, rgba(255, 140, 70, 0.22) 0%, rgba(220, 95, 40, 0.16) 50%, rgba(150, 50, 20, 0.14) 100%)',
    opacity: 0.55,
    blend: 'soft-light',
  },
  winter: {
    color:
      'linear-gradient(180deg, rgba(180, 210, 240, 0.32) 0%, rgba(200, 220, 240, 0.25) 50%, rgba(220, 230, 240, 0.32) 100%)',
    opacity: 0.6,
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
