'use client'

import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { useMapInitialization } from '@/app/hooks/useMapInitialization'
import { useMap } from '@/app/lib/MapContext'
import { MapLayers } from '@/app/components/map/MapLayers'
import type { SelectedEntity } from '@/app/components/ui/EntityInfoPanel'

interface MapProps {
  mapContainerId?: string
  layersVisible: {
    museums: boolean
    trees: boolean
    landmarks: boolean
    parks: boolean
  }
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  is3DView: boolean
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>
  visitedLandmarks: Set<string>
  onLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
  onTreeDiscovered?: (treeId: string, treeData: any) => void
  onSelect?: (entity: SelectedEntity | null) => void
}

export default function Map({
  mapContainerId = 'map',
  layersVisible,
  currentSeason,
  is3DView,
  landmarks,
  visitedLandmarks,
  onLandmarkDiscovered,
  onTreeDiscovered,
  onSelect
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const { map } = useMap()
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize map
  useMapInitialization(mapContainer)

  // Track map load state
  useEffect(() => {
    if (!map) return

    if (map.loaded()) {
      setIsLoaded(true)
    } else {
      const onMapLoad = () => setIsLoaded(true)
      map.on('load', onMapLoad)

      // Fallback: Force loaded state after 3 seconds if load event never fires
      const timeout = setTimeout(() => {
        if (!isLoaded) {
          console.warn('⚠️ Map load event timeout - forcing loaded state for layers')
          setIsLoaded(true)
        }
      }, 3000)

      return () => {
        map.off('load', onMapLoad)
        clearTimeout(timeout)
      }
    }
  }, [map, isLoaded])

  // Handle 3D view toggle
  useEffect(() => {
    if (!map) return

    if (is3DView) {
      map.easeTo({
        pitch: 60,
        duration: 1500,
        easing: (t) => t * (2 - t)
      })
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1500,
        easing: (t) => t * (2 - t)
      })
    }
  }, [map, is3DView])

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        id={mapContainerId}
        className="absolute inset-0 w-full h-full focus:outline-none"
      />

      {map && isLoaded && (
        <MapLayers
          map={map}
          layersVisible={layersVisible}
          currentSeason={currentSeason}
          visitedLandmarks={visitedLandmarks}
          onLandmarkDiscovered={onLandmarkDiscovered}
          onTreeDiscovered={onTreeDiscovered}
          onSelectEntity={onSelect}
        />
      )}
    </div>
  )
}
