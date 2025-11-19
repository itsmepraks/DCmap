'use client'

import { useEffect } from 'react'
import { useMap } from '@/app/lib/MapContext'

interface HeatmapLayerProps {
  visible: boolean
  month?: number // 1-12
}

const MONTH_KEYS = [
  'temp_jan', 'temp_feb', 'temp_mar', 'temp_apr', 'temp_may', 'temp_jun',
  'temp_jul', 'temp_aug', 'temp_sep', 'temp_oct', 'temp_nov', 'temp_dec'
]

/**
 * HeatmapLayer - Phase 2 Feature
 * 
 * Displays urban heat island data across D.C. using a heatmap layer.
 * Data source: public/data/dc_heat_monthly.geojson
 * Properties expected: temp_jan, temp_feb, ..., temp_dec
 */
export default function HeatmapLayer({ visible, month = 7 }: HeatmapLayerProps) {
  const { map } = useMap()

  // Setup and cleanup
  useEffect(() => {
    if (!map) return

    const sourceId = 'heat-data'
    const layerId = 'heat-layer'

    // Add source if it doesn't exist
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: '/data/dc_heat_monthly.geojson'
      })
    }

    // Add layer if it doesn't exist
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'heatmap',
        source: sourceId,
        maxzoom: 15,
        paint: {
          // Increase the heatmap weight based on frequency and property magnitude
          // Interpolating temp from 0C to 40C (approx DC range)
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', MONTH_KEYS[month - 1] || 'temp_jul'],
            0, 0,
            40, 1
          ],
          // Increase the heatmap color weight weight by zoom level
          // heatmap-intensity is a multiplier on top of heatmap-weight
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            15, 3
          ],
          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          // Adjust the heatmap radius by zoom level
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            9, 20
          ],
          // Transition from heatmap to circle layer by zoom level
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14, 1,
            15, 0
          ]
        }
      }) 
    }

    // Try to move layer below labels if possible
    if (map.getLayer(layerId) && map.getLayer('waterway-label')) {
      try {
        map.moveLayer(layerId, 'waterway-label')
      } catch (e) {
        console.debug('Could not move heatmap below waterway-label')
      }
    }

    // Cleanup function
    return () => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId)
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId)
      }
    }
  }, [map]) // Run once on map load

  // Update updates
  useEffect(() => {
    if (!map) return
    
    const layerId = 'heat-layer'
    if (!map.getLayer(layerId)) return

    // Update visibility
    map.setLayoutProperty(
      layerId,
      'visibility',
      visible ? 'visible' : 'none'
    )

    // Update weight based on month
    if (visible) {
      const property = MONTH_KEYS[month - 1] || 'temp_jul'
      map.setPaintProperty(layerId, 'heatmap-weight', [
        'interpolate',
        ['linear'],
        ['get', property],
        0, 0,
        40, 1
      ])
    }
  }, [map, visible, month])

  return null
}
