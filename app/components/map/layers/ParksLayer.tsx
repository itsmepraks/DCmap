'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'

interface ParksLayerProps {
  visible: boolean
  season?: 'spring' | 'summer' | 'fall' | 'winter'
}

/**
 * ParksLayer - Displays DMV (DC-Maryland-Virginia) parks and green spaces with seasonal color changes
 * 
 * Features:
 * - Uses Mapbox's built-in land use data covering the entire DMV area
 * - Changes color based on season (pink spring, green summer, orange fall, gray winter)
 * - Applies to parks, gardens, and other green spaces across DC, MD, and VA
 * - Automatically covers all visible map area (no geographic filtering)
 */
export default function ParksLayer({ visible, season = 'summer' }: ParksLayerProps) {
  const { map } = useMap()
  const isInitialized = useRef(false)

  // Initialize layer on mount
  useEffect(() => {
    if (!map || isInitialized.current) return

    const initializeLayer = async () => {
      try {
        // Wait for map style to be loaded
        if (!map.isStyleLoaded()) {
          console.log('🌳 Waiting for map style to load (ParksLayer)...')
          map.once('style.load', () => initializeLayer())
          return
        }

        console.log('🌳 Initializing ParksLayer...')

        // Add seasonal park layer using Mapbox's built-in landuse data
        // Place parks BEFORE buildings so buildings occlude them properly
        const layers = map.getStyle().layers ?? []
        const buildingLayerId = layers.find((layer) => 
          layer.id === 'realistic-buildings' || 
          (layer.type === 'fill-extrusion' && layer['source-layer'] === 'building')
        )?.id
        const firstSymbolId = layers.find((layer) => layer.type === 'symbol')?.id
        const beforeId = buildingLayerId || firstSymbolId
        
        if (!map.getLayer('parks-seasonal')) {
          map.addLayer({
            id: 'parks-seasonal',
            type: 'fill',
            source: 'composite',
            'source-layer': 'landuse',
            filter: [
              'in',
              'class',
              'park',
              'pitch',
              'grass',
              'garden',
              'cemetery',
              'recreation_ground'
            ],
            paint: {
              'fill-color': '#3E7E3E', // Default lush green
              'fill-opacity': 0.6, // Transparent to show terrain texture
              'fill-outline-color': '#2D5A27'
            }
          }, beforeId) // Place BEFORE buildings

          console.log('✅ Added parks-seasonal layer (before buildings)')
        }

        // Set initial visibility
        const visibility = visible ? 'visible' : 'none'
        if (map.getLayer('parks-seasonal')) {
          map.setLayoutProperty('parks-seasonal', 'visibility', visibility)
        }

        isInitialized.current = true
        console.log('✅ ParksLayer initialized successfully')
      } catch (error) {
        console.error('❌ Error initializing ParksLayer:', error)
      }
    }

    initializeLayer()

    // Cleanup on unmount
    return () => {
      if (map && isInitialized.current) {
        try {
          if (map.getLayer && map.getLayer('parks-seasonal')) {
            map.removeLayer('parks-seasonal')
          }
        } catch (error) {
          // Map might be removed already
          console.debug('Parks layer cleanup skipped:', error)
        }
      }
    }
  }, [map, visible])

  // Handle visibility changes
  useEffect(() => {
    if (!map || !isInitialized.current) return

    const visibility = visible ? 'visible' : 'none'
    // #region agent log
    // #endregion
    
    try {
      if (map.getLayer && map.getLayer('parks-seasonal')) {
        map.setLayoutProperty('parks-seasonal', 'visibility', visibility)
      }
    } catch (error) {
      console.debug('ParksLayer visibility update skipped:', error)
    }

    console.log(`🌳 ParksLayer visibility: ${visibility}`)
  }, [map, visible])

  // Handle season changes - update park colors to match trees
  useEffect(() => {
    if (!map || !isInitialized.current) {
      console.log(`🍂 Park season change skipped: map=${!!map}, initialized=${isInitialized.current}`)
      return
    }

    // Wait for map to be fully loaded
    if (!map.isStyleLoaded()) {
      console.log('🍂 Waiting for map style before park season change...')
      map.once('style.load', () => {
        updateParkSeasonalColors()
      })
      return
    }

    updateParkSeasonalColors()

    function updateParkSeasonalColors() {
      if (!map) return

      // Color mapping for seasons - matches tree colors but lighter
      const seasonColors = {
        spring: { fill: '#7FB37F', outline: '#6DA06D' },  // Natural green
        summer: { fill: '#3E7E3E', outline: '#2D5A27' },  // Lush green
        fall: { fill: '#E6A66C', outline: '#D67229' },    // Faded orange
        winter: { fill: '#94A3B8', outline: '#708090' }   // Cold grey
      }

      const colors = seasonColors[season]

      // Update park colors
      try {
        if (map.getLayer && map.getLayer('parks-seasonal')) {
          map.setPaintProperty('parks-seasonal', 'fill-color', colors.fill)
          map.setPaintProperty('parks-seasonal', 'fill-outline-color', colors.outline)
          console.log(`✅ Park colors changed to: ${colors.fill} (${season})`)
        } else {
          console.debug('parks-seasonal layer not yet available')
        }
      } catch (error) {
        console.debug('Park color update skipped:', error)
      }
    }
  }, [map, season])

  return null
}

