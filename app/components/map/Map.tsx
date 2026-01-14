'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { useMap } from '@/app/lib/MapContext'
import type { LayerVisibility } from '@/app/types/map'
import { useMapInitialization } from '@/app/hooks/useMapInitialization'
import { MapLayers } from './MapLayers'
import type { SelectedEntity } from '@/app/components/ui/EntityInfoPanel'

interface MapProps {
  layersVisible: LayerVisibility
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  is3D: boolean
  isFlying: boolean
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>
  visitedLandmarks: Set<string>
  onLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
  onSelect?: (entity: SelectedEntity | null) => void
}

export default function Map({
  layersVisible,
  currentSeason,
  is3D,
  isFlying,
  landmarks,
  visitedLandmarks,
  onLandmarkDiscovered,
  onSelect
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const { map } = useMap()
  useMapInitialization(mapContainer)

  // Handle 3D view toggle with smooth animation (disabled while flying)
  useEffect(() => {
    if (!map || isFlying) return // Don't interfere with fly mode street camera

    // Cancel any ongoing animations first to prevent conflicts
    map.stop()

    // Smooth 3D transformation - use shorter duration for better responsiveness
    map.easeTo({
      pitch: is3D ? 70 : 45,           // More dramatic angle for immersive 3D
      zoom: is3D ? 16 : 12,            // Wider zoom to show MD/VA region
      duration: 1000,                  // Faster transition (reduced from 2000ms)
      easing: (t) => t * (2 - t),      // Smooth ease-out for better performance
      essential: true                   // Essential animation - can't be interrupted
    })

    console.log(`🎮 ${is3D ? 'Entering 3D world mode' : 'Returning to overview mode'}`)
  }, [map, is3D, isFlying])

  // Close panel on map click if not clicking a feature
  useEffect(() => {
    if (!map || !onSelect) return

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      // If clicking on nothing interactive, close panel
      // Only query layers that exist in the map
      const availableLayers = ['landmarks-layer', 'museums-layer', 'dmv-tree-points-layer', 'parks-seasonal'].filter(
        layerId => map.getLayer(layerId)
      )
      
      if (availableLayers.length === 0) {
        onSelect(null)
        return
      }
      
      const features = map.queryRenderedFeatures(e.point, {
        layers: availableLayers
      })
      if (features.length === 0) {
        onSelect(null)
      }
    }
    map.on('click', handleMapClick)
    return () => {
      map.off('click', handleMapClick)
    }
  }, [map, onSelect])

  return (
    <>
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full z-0" />
      <style jsx global>{`
        /* Hide default Mapbox controls */
        .mapboxgl-ctrl-top-right {
          display: none !important;
        }
        .mapboxgl-ctrl-bottom-right {
          display: none !important;
        }
      `}</style>
      {map && (
        <MapLayers
          map={map}
          layersVisible={layersVisible}
          currentSeason={currentSeason}
          visitedLandmarks={visitedLandmarks}
          onLandmarkDiscovered={onLandmarkDiscovered}
          onSelectEntity={onSelect}
        />
      )}
    </>
  )
}
