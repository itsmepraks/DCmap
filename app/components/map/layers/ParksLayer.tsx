'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'

interface ParksLayerProps {
  visible: boolean
  season?: 'spring' | 'summer' | 'fall' | 'winter'
}

/**
 * ParksLayer - Displays DC's parks and green spaces with seasonal color changes
 * 
 * Features:
 * - Uses Mapbox's built-in land use data
 * - Changes color based on season (pink spring, green summer, orange fall, gray winter)
 * - Applies to parks, gardens, and other green spaces
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
          map.once('idle', () => initializeLayer())
          return
        }

        console.log('🌳 Initializing ParksLayer...')

        // Add seasonal park layer using Mapbox's built-in landuse data
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
              'fill-color': '#4CAF50', // Default summer green
              'fill-opacity': 0.4,
              'fill-outline-color': '#2E7D32'
            }
          }) // Add without specifying beforeId

          console.log('✅ Added parks-seasonal layer')
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
        if (map.getLayer('parks-seasonal')) {
          map.removeLayer('parks-seasonal')
        }
      }
    }
  }, [map])

  // Handle visibility changes
  useEffect(() => {
    if (!map || !isInitialized.current) return

    const visibility = visible ? 'visible' : 'none'
    
    if (map.getLayer('parks-seasonal')) {
      map.setLayoutProperty('parks-seasonal', 'visibility', visibility)
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
      map.once('idle', () => {
        updateParkSeasonalColors()
      })
      return
    }

    updateParkSeasonalColors()

    function updateParkSeasonalColors() {
      if (!map) return

      // Color mapping for seasons - matches tree colors
      const seasonColors = {
        spring: { fill: '#FFB7CE', outline: '#E88FAE' },  // PINK
        summer: { fill: '#4CAF50', outline: '#2E7D32' },  // GREEN
        fall: { fill: '#FF6B35', outline: '#D4501E' },    // ORANGE
        winter: { fill: '#B0BEC5', outline: '#78909C' }   // GRAY
      }

      const colors = seasonColors[season]

      // Update park colors
      if (map.getLayer('parks-seasonal')) {
        map.setPaintProperty('parks-seasonal', 'fill-color', colors.fill)
        map.setPaintProperty('parks-seasonal', 'fill-outline-color', colors.outline)
        console.log(`✅ Park colors changed to: ${colors.fill} (${season})`)
      } else {
        console.warn('⚠️ parks-seasonal layer not found')
      }
    }
  }, [map, season])

  return null
}

