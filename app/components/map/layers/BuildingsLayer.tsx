'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'
import { STREETS_SOURCE } from '@/app/hooks/useMapInitialization'

const LAYER_ID = 'dc-building-extrusions'

const HEIGHT_EXPR: any[] = [
  'coalesce',
  ['to-number', ['get', 'height']],
  ['to-number', ['get', 'render_height']],
  ['*', ['coalesce', ['to-number', ['get', 'levels']], 2.8], 3.4],
  11,
]

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
        minzoom: 13.2,
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            HEIGHT_EXPR,
            8, '#D9D0BF',
            28, '#C8B9A5',
            70, '#B5A28A',
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13.2,
            0,
            15.2,
            HEIGHT_EXPR,
          ],
          'fill-extrusion-base': [
            'coalesce',
            ['get', 'min_height'],
            ['get', 'render_min_height'],
            0,
          ],
          'fill-extrusion-opacity': 0.88,
          'fill-extrusion-ambient-occlusion-intensity': 0.58,
          'fill-extrusion-ambient-occlusion-radius': 3,
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
