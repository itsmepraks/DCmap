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
      'radial-gradient(ellipse at 50% 25%, rgba(255, 205, 215, 0.28) 0%, rgba(255, 230, 215, 0.12) 60%, transparent 100%)',
    opacity: 0.32,
    blend: 'soft-light',
  },
  summer: {
    color:
      'radial-gradient(ellipse at 50% 35%, rgba(255, 225, 150, 0.22) 0%, rgba(255, 210, 130, 0.1) 60%, transparent 100%)',
    opacity: 0.35,
    blend: 'soft-light',
  },
  fall: {
    color:
      'linear-gradient(180deg, rgba(255, 155, 85, 0.22) 0%, rgba(210, 110, 55, 0.16) 50%, rgba(160, 80, 50, 0.12) 100%)',
    opacity: 0.45,
    blend: 'soft-light',
  },
  winter: {
    color:
      'linear-gradient(180deg, rgba(190, 215, 240, 0.3) 0%, rgba(205, 220, 235, 0.22) 50%, rgba(220, 230, 240, 0.28) 100%)',
    opacity: 0.5,
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
