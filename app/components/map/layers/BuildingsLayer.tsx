'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'
import { STREETS_SOURCE } from '@/app/hooks/useMapInitialization'

const LAYER_ID = 'dc-building-extrusions'

export default function BuildingsLayer() {
  const { map } = useMap()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!map || initializedRef.current) return

    const apply = () => {
      if (!map.isStyleLoaded() || !map.getSource(STREETS_SOURCE)) return
      if (map.getLayer(LAYER_ID)) {
        initializedRef.current = true
        return
      }

      const firstSymbolId = map.getStyle().layers?.find(
        (layer) => layer.type === 'symbol' && layer.id?.includes('label')
      )?.id

      map.addLayer({
        id: LAYER_ID,
        type: 'fill-extrusion',
        source: STREETS_SOURCE,
        'source-layer': 'building',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            '#D8CCBA',
            17,
            '#CDBFA9',
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            0,
            15.2,
            [
              'coalesce',
              ['get', 'height'],
              ['get', 'render_height'],
              ['*', ['coalesce', ['get', 'levels'], 2], 3],
              10,
            ],
          ],
          'fill-extrusion-base': [
            'coalesce',
            ['get', 'min_height'],
            ['get', 'render_min_height'],
            0,
          ],
          'fill-extrusion-opacity': 0.72,
          'fill-extrusion-ambient-occlusion-intensity': 0.35,
          'fill-extrusion-vertical-gradient': true,
        },
      }, firstSymbolId)

      initializedRef.current = true
    }

    if (map.isStyleLoaded()) apply()
    map.on('style.load', apply)
    map.on('idle', apply)

    return () => {
      map.off('style.load', apply)
      map.off('idle', apply)
      initializedRef.current = false
    }
  }, [map])

  return null
}
