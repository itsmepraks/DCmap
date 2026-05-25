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
      'radial-gradient(ellipse at 45% 22%, rgba(255, 193, 214, 0.42) 0%, rgba(255, 230, 222, 0.20) 58%, transparent 100%)',
    opacity: 0.42,
    blend: 'soft-light',
  },
  summer: {
    color:
      'radial-gradient(ellipse at 50% 35%, rgba(255, 230, 150, 0.24) 0%, rgba(128, 178, 92, 0.08) 62%, transparent 100%)',
    opacity: 0.28,
    blend: 'soft-light',
  },
  fall: {
    color:
      'linear-gradient(180deg, rgba(226, 129, 50, 0.38) 0%, rgba(177, 91, 35, 0.24) 54%, rgba(92, 58, 32, 0.18) 100%)',
    opacity: 0.46,
    blend: 'soft-light',
  },
  winter: {
    color:
      'linear-gradient(180deg, rgba(186, 215, 240, 0.40) 0%, rgba(220, 230, 238, 0.28) 50%, rgba(246, 248, 249, 0.30) 100%)',
    opacity: 0.48,
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
