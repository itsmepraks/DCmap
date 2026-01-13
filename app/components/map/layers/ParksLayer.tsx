'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useMap } from '@/app/lib/MapContext'
import type { SelectedEntity } from '@/app/components/ui/EntityInfoPanel'

interface ParksLayerProps {
  visible: boolean
  season?: 'spring' | 'summer' | 'fall' | 'winter'
  onSelect?: (entity: SelectedEntity | null) => void
}

// Park name lookup by class for better info display (static, doesn't need to be in component)
const parkNames: Record<string, string> = {
  park: 'Park',
  pitch: 'Sports Field',
  grass: 'Green Space',
  garden: 'Garden',
  cemetery: 'Cemetery',
  recreation_ground: 'Recreation Area'
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
export default function ParksLayer({ visible, season = 'summer', onSelect }: ParksLayerProps) {
  const { map } = useMap()
  const isInitialized = useRef(false)
  
  // Store onSelect in a ref so click handlers always use the latest callback
  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])
  
  // Store season in a ref for click handler description
  const seasonRef = useRef(season)
  useEffect(() => {
    seasonRef.current = season
  }, [season])

  // Initialize layer on mount
  useEffect(() => {
    if (!map || isInitialized.current) return

    const initializeLayer = async () => {
      try {
        // Wait for map style to be loaded - use 'idle' as fallback
        if (!map.isStyleLoaded()) {
          console.log('🌳 Waiting for map idle (ParksLayer)...')
          map.once('idle', () => initializeLayer())
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
        
        // Color mapping for seasons
        const seasonColors = {
          spring: { fill: '#FFCDD2', outline: '#F8BBD9' },  // Cherry blossom PINK
          summer: { fill: '#3E7E3E', outline: '#2D5A27' },  // Lush green
          fall: { fill: '#FFCC80', outline: '#FFB74D' },    // Warm orange/amber
          winter: { fill: '#B0BEC5', outline: '#90A4AE' }   // Cool grey
        }
        const colors = seasonColors[season]

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
              'fill-color': colors.fill, // Use current season color
              'fill-opacity': 0.6, // Transparent to show terrain texture
              'fill-outline-color': colors.outline
            }
          }, beforeId) // Place BEFORE buildings

          console.log(`✅ Added parks-seasonal layer with ${season} colors (${colors.fill})`)
        }

        // Add click handler for park info
        map.on('click', 'parks-seasonal', (e) => {
          if (!e.features || e.features.length === 0 || !onSelectRef.current) return
          
          const feature = e.features[0]
          const properties = feature.properties || {}
          const parkClass = properties.class || 'park'
          
          // Get park name from properties or use generic name
          const parkName = properties.name || parkNames[parkClass] || 'Green Space'
          
          // Calculate approximate center of the clicked area
          const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat]
          
          // Use seasonRef.current for current season
          const currentSeason = seasonRef.current
          
          onSelectRef.current({
            id: `park-${e.lngLat.lng.toFixed(5)}-${e.lngLat.lat.toFixed(5)}`,
            type: 'tree', // Using tree type for green space consistency
            name: parkName,
            description: `A ${parkNames[parkClass]?.toLowerCase() || 'green space'} in Washington DC. ${
              currentSeason === 'spring' ? 'Beautiful cherry blossoms bloom in spring!' :
              currentSeason === 'fall' ? 'Gorgeous fall foliage colors!' :
              currentSeason === 'winter' ? 'Peaceful winter scenery.' :
              'Lush green foliage in summer.'
            }`,
            coordinates: coords,
            metadata: {
              type: parkNames[parkClass] || 'Park',
              season: currentSeason,
              area: 'Washington DC Metro Area'
            }
          })
        })
        
        // Change cursor on hover
        map.on('mouseenter', 'parks-seasonal', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'parks-seasonal', () => {
          map.getCanvas().style.cursor = ''
        })

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
  }, [map, visible, season])

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
    if (!map || !isInitialized.current) return
    
    // Color mapping for seasons - matches tree colors
    const seasonColors = {
      spring: { fill: '#FFCDD2', outline: '#F8BBD9' },  // Cherry blossom PINK for spring
      summer: { fill: '#3E7E3E', outline: '#2D5A27' },  // Lush green
      fall: { fill: '#FFCC80', outline: '#FFB74D' },    // Warm orange/amber
      winter: { fill: '#B0BEC5', outline: '#90A4AE' }   // Cool grey
    }

    const colors = seasonColors[season]

    const updateParkSeasonalColors = () => {
      try {
        const layer = map.getLayer('parks-seasonal')
        if (layer) {
          map.setPaintProperty('parks-seasonal', 'fill-color', colors.fill)
          map.setPaintProperty('parks-seasonal', 'fill-outline-color', colors.outline)
          console.log(`✅ Park colors changed to: ${colors.fill} (${season})`)
        } else {
          // Layer not ready yet, wait for idle and retry once
          console.log('🌳 Layer not found, waiting for idle...')
          map.once('idle', () => {
            const retryLayer = map.getLayer('parks-seasonal')
            if (retryLayer) {
              map.setPaintProperty('parks-seasonal', 'fill-color', colors.fill)
              map.setPaintProperty('parks-seasonal', 'fill-outline-color', colors.outline)
              console.log(`✅ Park colors changed to: ${colors.fill} (${season}) after retry`)
            }
          })
        }
      } catch (error) {
        console.error('Park color update failed:', error)
      }
    }

    // Try to update now or when map is ready
    if (map.isStyleLoaded()) {
      updateParkSeasonalColors()
    } else {
      map.once('idle', updateParkSeasonalColors)
    }
  }, [map, season])

  return null
}

