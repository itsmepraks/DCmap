'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { useMap } from '@/app/lib/MapContext'
import type { LayerVisibility } from '@/app/types/map'
import MuseumsLayer from './layers/MuseumsLayer'
import RoadDetailsLayer from './layers/RoadDetailsLayer'
import Museum3DMarkers from './layers/Museum3DMarkers'
import TreesLayer from './layers/TreesLayer'
import LandmarksLayer from './layers/LandmarksLayer'
import ParksLayer from './layers/ParksLayer'
import { useMapInitialization } from '@/app/hooks/useMapInitialization'

interface MapProps {
  layersVisible: LayerVisibility
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  is3D: boolean
  isWalking: boolean
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>
  visitedLandmarks: Set<string>
  onLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
  onPlayerPositionChange?: (position: { lng: number; lat: number; bearing: number; nearestLandmark: any }) => void
}

export default function Map({
  layersVisible,
  currentSeason,
  is3D,
  isWalking,
  landmarks,
  visitedLandmarks,
  onLandmarkDiscovered,
  onPlayerPositionChange
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const { map } = useMap()
  useMapInitialization(mapContainer)
  
  // Walk mode is temporarily disabled - no walk controller active

  // Handle 3D view toggle with GTA-like cinematic animation
  useEffect(() => {
    if (!map) return

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
  }, [map, is3D])

  return (
    <>
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full z-0" />
      {map && (
        <>
          <ParksLayer visible={layersVisible.trees} season={currentSeason} />
          <TreesLayer visible={layersVisible.trees} season={currentSeason} />
          <RoadDetailsLayer visible={true} />
          <MuseumsLayer visible={layersVisible.museums} />
          <Museum3DMarkers visible={layersVisible.museums} />
          <LandmarksLayer map={map} visible={layersVisible.landmarks} visitedLandmarks={visitedLandmarks} />
        </>
      )}
    </>
  )
}

