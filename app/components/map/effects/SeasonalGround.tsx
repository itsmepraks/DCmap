'use client'

import { useEffect } from 'react'
import { useMap } from '@/app/lib/MapContext'

type Season = 'spring' | 'summer' | 'fall' | 'winter'

interface Props {
  season: Season
}

const LANDCOVER_LAYER = 'seasonal-ground-landcover'
const PARK_LAYER = 'seasonal-ground-parks'

// Per-season tint for park / grass / forest polygons. Subtle by design —
// Standard's parks are already a credible summer green, and overpainting them
// in one uniform colour reads as theatrical instead of realistic. Spring is
// barely-tinted blossom; fall is warm amber that lets the green peek through;
// winter is a thin snow wash, not pure white.
const PALETTE: Record<Season, { landcover: string; park: string; landOp: number; parkOp: number }> = {
  spring: { landcover: '#EFD2DE', park: '#F4D7E1', landOp: 0.12, parkOp: 0.18 },
  summer: { landcover: '#FFFFFF', park: '#FFFFFF', landOp: 0, parkOp: 0 },
  fall:   { landcover: '#BF7233', park: '#C77A37', landOp: 0.25, parkOp: 0.32 },
  winter: { landcover: '#E8EEF6', park: '#F0F4FA', landOp: 0.38, parkOp: 0.5 },
}

/**
 * Tints landcover and park polygons per season. Lets the actual ground in DC
 * read seasonally even though Standard's 3D tree models stay green.
 * Replaces the earlier WinterGround which was winter-only.
 */
export default function SeasonalGround({ season }: Props) {
  const { map } = useMap()

  useEffect(() => {
    if (!map) return

    const apply = () => {
      const palette = PALETTE[season]
      try {
        if (!map.getLayer(LANDCOVER_LAYER)) {
          map.addLayer({
            id: LANDCOVER_LAYER,
            type: 'fill',
            source: 'composite',
            'source-layer': 'landcover',
            paint: {
              'fill-color': palette.landcover,
              'fill-opacity': 0,
              'fill-opacity-transition': { duration: 1400, delay: 0 },
              'fill-color-transition': { duration: 1400, delay: 0 },
            },
          })
        }
        if (!map.getLayer(PARK_LAYER)) {
          map.addLayer({
            id: PARK_LAYER,
            type: 'fill',
            source: 'composite',
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

        map.setPaintProperty(LANDCOVER_LAYER, 'fill-color', palette.landcover)
        map.setPaintProperty(LANDCOVER_LAYER, 'fill-opacity', palette.landOp)
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
