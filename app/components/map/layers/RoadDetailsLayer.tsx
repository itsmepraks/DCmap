'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'

interface RoadDetailsLayerProps {
  visible: boolean
}

export default function RoadDetailsLayer({ visible }: RoadDetailsLayerProps) {
  const mapContext = useMap()
  const map = mapContext?.map
  const isInitialized = useRef(false)

  useEffect(() => {
    if (!map) return
    if (isInitialized.current) return

    const initializeLayer = async () => {
      try {
        if (!map || !map.isStyleLoaded()) {
          if (map) map.once('idle', () => initializeLayer())
          return
        }

        console.log('🛣️ Initializing Road Details Layer...')

        // Find first symbol layer to insert before
        const layers = map.getStyle().layers
        let firstSymbolId: string | undefined
        for (const layer of layers || []) {
          if (layer.type === 'symbol' && layer.id?.includes('label')) {
            firstSymbolId = layer.id
            break
          }
        }

        // Add realistic sidewalks along roads
        if (!map.getLayer('sidewalks-left')) {
          map.addLayer({
            id: 'sidewalks-left',
            type: 'line',
            source: 'composite',
            'source-layer': 'road',
            filter: [
              'in',
              ['get', 'class'],
              ['literal', ['street', 'primary', 'secondary', 'tertiary']]
            ],
            paint: {
              'line-color': '#E0E0E0',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14, 4,
                16, 6,
                18, 8
              ],
              'line-offset': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14, 10,
                16, 15,
                18, 20
              ]
            }
          }, firstSymbolId)
        }

        if (!map.getLayer('sidewalks-right')) {
          map.addLayer({
            id: 'sidewalks-right',
            type: 'line',
            source: 'composite',
            'source-layer': 'road',
            filter: [
              'in',
              ['get', 'class'],
              ['literal', ['street', 'primary', 'secondary', 'tertiary']]
            ],
            paint: {
              'line-color': '#E0E0E0',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14, 4,
                16, 6,
                18, 8
              ],
              'line-offset': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14, -10,
                16, -15,
                18, -20
              ]
            }
          }, firstSymbolId)
        }
        
        // Add sidewalk borders
        if (!map.getLayer('sidewalk-borders')) {
          map.addLayer({
            id: 'sidewalk-borders',
            type: 'line',
            source: 'composite',
            'source-layer': 'road',
            filter: [
              'in',
              ['get', 'class'],
              ['literal', ['street', 'primary', 'secondary']]
            ],
            paint: {
              'line-color': '#CCCCCC',
              'line-width': 0.5,
              'line-offset': [
                'interpolate',
                ['linear'],
                ['zoom'],
                16, 20,
                18, 28
              ]
            }
          }, firstSymbolId)
        }

        // Add realistic zebra crosswalks
        if (!map.getLayer('zebra-crosswalks')) {
          map.addLayer({
            id: 'zebra-crosswalks',
            type: 'line',
            source: 'composite',
            'source-layer': 'road',
            filter: [
              'in',
              ['get', 'class'],
              ['literal', ['street', 'primary', 'secondary']]
            ],
            paint: {
              'line-color': '#FFFFFF',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                16, 2,
                18, 4
              ],
              'line-dasharray': [4, 3],
              'line-opacity': 0.95,
              'line-gap-width': 1
            }
          }, firstSymbolId)
        }

        // Add realistic road center lines (yellow dashed)
        if (!map.getLayer('road-center-lines')) {
          map.addLayer({
            id: 'road-center-lines',
            type: 'line',
            source: 'composite',
            'source-layer': 'road',
            filter: [
              'in',
              ['get', 'class'],
              ['literal', ['primary', 'secondary', 'motorway', 'trunk']]
            ],
            paint: {
              'line-color': '#FFD700',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14, 1,
                16, 2,
                18, 3
              ],
              'line-dasharray': [8, 4]
            }
          }, firstSymbolId)
        }
        
        // Add road edge lines (white solid)
        if (!map.getLayer('road-edge-lines')) {
          map.addLayer({
            id: 'road-edge-lines',
            type: 'line',
            source: 'composite',
            'source-layer': 'road',
            filter: [
              'in',
              ['get', 'class'],
              ['literal', ['primary', 'secondary', 'motorway']]
            ],
            paint: {
              'line-color': '#FFFFFF',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15, 0.5,
                17, 1,
                19, 2
              ]
            }
          }, firstSymbolId)
        }

        // Set initial visibility
        const visibility = visible ? 'visible' : 'none'
        if (map.getLayer('sidewalks-left')) {
          map.setLayoutProperty('sidewalks-left', 'visibility', visibility)
        }
        if (map.getLayer('sidewalks-right')) {
          map.setLayoutProperty('sidewalks-right', 'visibility', visibility)
        }
        if (map.getLayer('sidewalk-borders')) {
          map.setLayoutProperty('sidewalk-borders', 'visibility', visibility)
        }
        if (map.getLayer('zebra-crosswalks')) {
          map.setLayoutProperty('zebra-crosswalks', 'visibility', visibility)
        }
        if (map.getLayer('road-center-lines')) {
          map.setLayoutProperty('road-center-lines', 'visibility', visibility)
        }
        if (map.getLayer('road-edge-lines')) {
          map.setLayoutProperty('road-edge-lines', 'visibility', visibility)
        }

        isInitialized.current = true
        console.log('✅ Road Details Layer initialized')
      } catch (error) {
        console.error('❌ Error initializing Road Details Layer:', error)
      }
    }

    initializeLayer()
  }, [map])

  // Update visibility
  useEffect(() => {
    if (!map || !isInitialized.current) return

    const visibility = visible ? 'visible' : 'none'
    if (map.getLayer('sidewalks-left')) {
      map.setLayoutProperty('sidewalks-left', 'visibility', visibility)
    }
    if (map.getLayer('sidewalks-right')) {
      map.setLayoutProperty('sidewalks-right', 'visibility', visibility)
    }
    if (map.getLayer('sidewalk-borders')) {
      map.setLayoutProperty('sidewalk-borders', 'visibility', visibility)
    }
    if (map.getLayer('zebra-crosswalks')) {
      map.setLayoutProperty('zebra-crosswalks', 'visibility', visibility)
    }
    if (map.getLayer('road-center-lines')) {
      map.setLayoutProperty('road-center-lines', 'visibility', visibility)
    }
    if (map.getLayer('road-edge-lines')) {
      map.setLayoutProperty('road-edge-lines', 'visibility', visibility)
    }
  }, [map, visible])

  return null
}

