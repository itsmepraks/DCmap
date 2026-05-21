'use client'

import { useEffect } from 'react'
import { useMap } from '@/app/lib/MapContext'

type Season = 'spring' | 'summer' | 'fall' | 'winter'

interface Props {
  season: Season
}

const LANDCOVER_LAYER = 'seasonal-ground-landcover'
const PARK_LAYER = 'seasonal-ground-parks'

// Per-season tint for park / grass / forest polygons that sit on the ground.
// Standard renders these summer-green year-round; this overlay paints them
// the right colour without recoloring Standard's 3D tree models above.
const PALETTE: Record<Season, { landcover: string; park: string; landOp: number; parkOp: number }> = {
  spring: { landcover: '#F5DCE6', park: '#FCE1EA', landOp: 0.32, parkOp: 0.45 },
  summer: { landcover: '#FFFFFF', park: '#FFFFFF', landOp: 0, parkOp: 0 }, // pass through Standard's green
  fall:   { landcover: '#D67932', park: '#E0823A', landOp: 0.55, parkOp: 0.65 },
  winter: { landcover: '#F8FAFD', park: '#FFFFFF', landOp: 0.65, parkOp: 0.78 },
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
