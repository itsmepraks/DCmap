'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useMap } from '@/app/lib/MapContext'
import { STREETS_SOURCE } from '@/app/hooks/useMapInitialization'
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
  
  // Store visible prop in ref for use during initialization
  const visibleRef = useRef(visible)
  useEffect(() => {
    visibleRef.current = visible
  }, [visible])
  
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
        
        // Optional info layer only. Keep it extremely light so the Standard
        // 3D basemap remains the visual source of truth.
        const seasonColors = {
          spring: { fill: '#F4DDE3', outline: '#B9808C', opacity: 0.12 },
          summer: { fill: '#5F8C5D', outline: '#3D6540', opacity: 0.10 },
          fall: { fill: '#A56B3A', outline: '#7E4E2A', opacity: 0.11 },
          winter: { fill: '#DCE5EA', outline: '#94A5AE', opacity: 0.13 }
        }
        const colors = seasonColors[season]

        // Get initial visibility - HIDDEN by default unless explicitly visible
        const initialVisibility = visibleRef.current ? 'visible' : 'none'
        
        if (!map.getLayer('parks-seasonal')) {
          map.addLayer({
            id: 'parks-seasonal',
            type: 'fill',
            source: STREETS_SOURCE,
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
            layout: {
              'visibility': initialVisibility
            },
            paint: {
              'fill-color': colors.fill,
              'fill-opacity': colors.opacity,
              'fill-opacity-transition': { duration: 1400, delay: 0 },
              'fill-color-transition': { duration: 1400, delay: 0 },
              'fill-outline-color': colors.outline
            }
          }, beforeId) // Place BEFORE buildings

          console.log(`✅ Added parks-seasonal layer with ${season} colors (visibility: ${initialVisibility})`)
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
              currentSeason === 'spring' ? 'Spring adds early blossoms and fresh canopy color around DC.' :
              currentSeason === 'fall' ? 'Fall brings mixed amber, rust, and green canopy color rather than one flat orange.' :
              currentSeason === 'winter' ? 'Winter opens up longer sightlines through the trees and across the lawns.' :
              'Summer is the fullest green season for shade and park lawns.'
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
    
    // Color mapping for seasons - subtle info tint, not a blanket overlay.
    const seasonColors = {
      spring: { fill: '#F4DDE3', outline: '#B9808C', opacity: 0.12 },
      summer: { fill: '#5F8C5D', outline: '#3D6540', opacity: 0.10 },
      fall: { fill: '#A56B3A', outline: '#7E4E2A', opacity: 0.11 },
      winter: { fill: '#DCE5EA', outline: '#94A5AE', opacity: 0.13 }
    }

    const colors = seasonColors[season]

    const updateParkSeasonalColors = () => {
      try {
        const layer = map.getLayer('parks-seasonal')
        if (layer) {
          map.setPaintProperty('parks-seasonal', 'fill-color', colors.fill)
          map.setPaintProperty('parks-seasonal', 'fill-opacity', colors.opacity)
          map.setPaintProperty('parks-seasonal', 'fill-outline-color', colors.outline)
          console.log(`✅ Park colors changed to: ${colors.fill} (${season})`)
        } else {
          // Layer not ready yet, wait for idle and retry once
          console.log('🌳 Layer not found, waiting for idle...')
          map.once('idle', () => {
            const retryLayer = map.getLayer('parks-seasonal')
            if (retryLayer) {
              map.setPaintProperty('parks-seasonal', 'fill-color', colors.fill)
              map.setPaintProperty('parks-seasonal', 'fill-opacity', colors.opacity)
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
