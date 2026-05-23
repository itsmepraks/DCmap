'use client'

import { motion } from 'framer-motion'

type Season = 'spring' | 'summer' | 'fall' | 'winter'

/**
 * Soft full-screen color grade tied to the current season. Sits above the
 * map canvas but under the HUD, using mix-blend-mode for non-destructive
 * tinting. Gives the whole scene a seasonal cast without touching Mapbox
 * style internals (which we can't recolor for Standard's built-in 3D trees).
 */

// Seasonal grade is intentionally subtle — atmospheric, not theatrical.
// Real DC in fall is mixed warm tones, not a Halloween orange wash. Real
// spring is mostly green with cherry blossom accents in specific places.
// The grade reads as "this feels like fall" rather than "everything is orange".
const GRADES: Record<Season, { color: string; opacity: number; blend: string }> = {
  spring: {
    color:
      'radial-gradient(ellipse at 50% 25%, rgba(255, 206, 220, 0.28) 0%, rgba(255, 238, 225, 0.12) 62%, transparent 100%)',
    opacity: 0.30,
    blend: 'soft-light',
  },
  summer: {
    color:
      'radial-gradient(ellipse at 50% 35%, rgba(255, 231, 166, 0.14) 0%, rgba(255, 222, 145, 0.06) 60%, transparent 100%)',
    opacity: 0.18,
    blend: 'soft-light',
  },
  fall: {
    color:
      'linear-gradient(180deg, rgba(224, 129, 58, 0.26) 0%, rgba(170, 88, 38, 0.16) 54%, rgba(86, 56, 33, 0.12) 100%)',
    opacity: 0.36,
    blend: 'soft-light',
  },
  winter: {
    color:
      'linear-gradient(180deg, rgba(196, 219, 240, 0.28) 0%, rgba(218, 228, 238, 0.18) 50%, rgba(238, 241, 243, 0.22) 100%)',
    opacity: 0.38,
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
