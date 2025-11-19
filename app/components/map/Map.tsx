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
import HiddenLandmarksLayer from './layers/HiddenLandmarksLayer'
import HeatmapLayer from './layers/HeatmapLayer'
import { useMapInitialization } from '@/app/hooks/useMapInitialization'
import { useWalkController } from '@/app/hooks/useWalkController'
import Realistic3DAvatars from './Realistic3DAvatars'
import { usePlayerState } from '@/app/lib/playerState'

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
  
  const { state: playerState } = usePlayerState()
  const { isMoving, isRunning } = useWalkController({
    map,
    isActive: isWalking,
    avatarType: playerState.avatarType,
    landmarks,
    visitedLandmarks,
    onLandmarkDiscovered,
    onPlayerPositionChange
  })

  // Handle 3D view toggle with GTA-like cinematic animation
  useEffect(() => {
    if (!map || isWalking) return // Don't interfere with walk mode camera

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
          <HeatmapLayer visible={layersVisible.heatmap} />
          <RoadDetailsLayer visible={true} />
          <MuseumsLayer visible={layersVisible.museums} />
          <Museum3DMarkers visible={layersVisible.museums} />
          <LandmarksLayer 
            map={map} 
            visible={layersVisible.landmarks} 
            visitedLandmarks={visitedLandmarks} 
            onLandmarkDiscovered={onLandmarkDiscovered}
          />
          <HiddenLandmarksLayer 
            map={map} 
            isVisible={layersVisible.hiddenGems} 
            visitedLandmarks={Array.from(visitedLandmarks)}
            onDiscovered={(landmarkId) => {
              onLandmarkDiscovered(landmarkId, { id: landmarkId, name: 'Hidden Gem', coordinates: [0, 0] } as any)
            }}
          />
          {isWalking && (
            <Realistic3DAvatars
              map={map}
              position={playerState.position}
              bearing={playerState.heading}
              isMoving={isMoving}
              isRunning={isRunning}
              avatarType={playerState.avatarType}
            />
          )}
        </>
      )}
    </>
  )
}

