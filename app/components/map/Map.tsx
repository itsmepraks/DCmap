'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { useMap } from '@/app/lib/MapContext'
import type { LayerVisibility } from '@/app/types/map'
import { useMapInitialization } from '@/app/hooks/useMapInitialization'
import { MapLayers } from './MapLayers'
import EntityInfoPanel, { type SelectedEntity } from '@/app/components/ui/EntityInfoPanel'

interface MapProps {
  layersVisible: LayerVisibility
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  is3D: boolean
  isFlying: boolean
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>
  visitedLandmarks: Set<string>
  onLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
}

export default function Map({
  layersVisible,
  currentSeason,
  is3D,
  isFlying,
  landmarks,
  visitedLandmarks,
  onLandmarkDiscovered
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const { map } = useMap()
  useMapInitialization(mapContainer)
  
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null)

  // Handle 3D view toggle with cinematic animation (disabled while flying)
  useEffect(() => {
    if (!map || isFlying) return // Don't interfere with fly mode street camera

    // GTA-like cinematic 3D transformation
    map.easeTo({
      pitch: is3D ? 70 : 45,           // More dramatic angle for immersive 3D
      zoom: is3D ? 16 : 12,            // Wider zoom to show MD/VA region
      duration: 2000,                  // Smooth cinematic transition
      easing: (t) => t < 0.5 
        ? 4 * t * t * t                // Ease-in cubic
        : 1 - Math.pow(-2 * t + 2, 3) / 2  // Ease-out cubic
    })

    console.log(`🎮 ${is3D ? 'Entering GTA-like 3D world mode' : 'Returning to overview mode'}`)
  }, [map, is3D, isFlying])

  // Close panel on map click if not clicking a feature
  useEffect(() => {
    if (!map) return

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      // If clicking on nothing interactive, close panel
      // Only query layers that exist in the map
      const availableLayers = ['landmarks-layer', 'museums-layer', 'dmv-tree-points-layer'].filter(
        layerId => map.getLayer(layerId)
      )
      
      if (availableLayers.length === 0) {
        setSelectedEntity(null)
        return
      }
      
      const features = map.queryRenderedFeatures(e.point, {
        layers: availableLayers
      })
      if (features.length === 0) {
        setSelectedEntity(null)
      }
    }
    map.on('click', handleMapClick)
    return () => {
      map.off('click', handleMapClick)
    }
  }, [map])

  const handleNavigate = (coordinates: [number, number]) => {
    if (!map) return
    map.flyTo({
      center: coordinates,
      zoom: 17,
      pitch: 60,
      bearing: 0,
      duration: 2000,
      essential: true
    })
  }

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
        <>
          <MapLayers
            map={map}
            layersVisible={layersVisible}
            currentSeason={currentSeason}
            visitedLandmarks={visitedLandmarks}
            onLandmarkDiscovered={onLandmarkDiscovered}
            onSelectEntity={setSelectedEntity}
          />
          <EntityInfoPanel 
            entity={selectedEntity}
            onClose={() => setSelectedEntity(null)}
            onNavigate={handleNavigate}
          />
        </>
      )}
    </>
  )
}
