'use client'

import { useEffect } from 'react'
import { useMap } from '@/app/lib/MapContext'

const SOURCE_ID = 'winter-ground'
const LANDCOVER_LAYER = 'winter-ground-landcover'
const PARK_LAYER = 'winter-ground-parks'

/**
 * Lays a soft white overlay across landcover and park polygons when winter is
 * active. Subtle on its own; reads as snow once combined with the winter
 * grade and snowflake particles.
 */
export default function WinterGround({ active }: { active: boolean }) {
  const { map } = useMap()

  useEffect(() => {
    if (!map) return

    const apply = () => {
      try {
        // composite source-layer 'landcover' covers grass/forest/parks.
        if (!map.getLayer(LANDCOVER_LAYER)) {
          map.addLayer({
            id: LANDCOVER_LAYER,
            type: 'fill',
            source: 'composite',
            'source-layer': 'landcover',
            paint: {
              'fill-color': '#F8FAFD',
              'fill-opacity': 0,
              'fill-opacity-transition': { duration: 1200, delay: 0 },
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
              'fill-color': '#FFFFFF',
              'fill-opacity': 0,
              'fill-opacity-transition': { duration: 1200, delay: 0 },
            },
          })
        }

        map.setPaintProperty(LANDCOVER_LAYER, 'fill-opacity', active ? 0.6 : 0)
        map.setPaintProperty(PARK_LAYER, 'fill-opacity', active ? 0.75 : 0)
      } catch {
        // composite source may not be ready before style.load; the retry handles it.
      }
    }

    if (map.isStyleLoaded()) apply()
    map.on('style.load', apply)
    return () => {
      map.off('style.load', apply)
    }
  }, [map, active])

  return null
}
