'use client'

import { useEffect } from 'react'
import { useMap } from '@/app/lib/MapContext'
import { STREETS_SOURCE } from '@/app/hooks/useMapInitialization'

type Season = 'spring' | 'summer' | 'fall' | 'winter'

interface Props {
  season: Season
}

const PARK_LAYER = 'seasonal-ground-parks'

// Per-season tint for park / grass polygons. Subtle by design — Standard
// renders these summer-green year-round, and overpainting them in one
// uniform colour reads as theatrical instead of realistic.
//
// We deliberately do NOT touch 'landcover' here — mapbox-streets-v8 (which
// we attach as 'composite') does not expose that source-layer, and using
// it produces a console error. 'landuse' covers the parks + grass polygons
// that matter for DC's monumental core.
const PALETTE: Record<Season, { park: string; parkOp: number }> = {
  spring: { park: '#F4D7E1', parkOp: 0.18 },
  summer: { park: '#FFFFFF', parkOp: 0 },
  fall:   { park: '#C77A37', parkOp: 0.32 },
  winter: { park: '#F0F4FA', parkOp: 0.5 },
}

/**
 * Tints park / grass polygons per season so the ground actually reads
 * seasonally even though Standard's 3D tree models stay green year-round.
 */
export default function SeasonalGround({ season }: Props) {
  const { map } = useMap()

  useEffect(() => {
    if (!map) return

    const apply = () => {
      const palette = PALETTE[season]
      try {
        if (!map.getLayer(PARK_LAYER)) {
          map.addLayer({
            id: PARK_LAYER,
            type: 'fill',
            source: STREETS_SOURCE,
            'source-layer': 'landuse',
            filter: ['in', ['get', 'class'], ['literal', ['park', 'cemetery', 'pitch', 'grass']]],
            paint: {
              'fill-color': palette.park,
              'fill-opacity': 0,
              'fill-opacity-transition': { duration: 1400, delay: 0 },
              'fill-color-transition': { duration: 1400, delay: 0 },
            },
          })
        }
        if (!map.getLayer(PARK_LAYER)) return
        map.setPaintProperty(PARK_LAYER, 'fill-color', palette.park)
        map.setPaintProperty(PARK_LAYER, 'fill-opacity', palette.parkOp)
      } catch {
        // composite may not be ready before style.load; retry handles it.
      }
    }

    if (map.isStyleLoaded()) apply()
    map.on('style.load', apply)
    return () => {
      map.off('style.load', apply)
    }
  }, [map, season])

  return null
}
