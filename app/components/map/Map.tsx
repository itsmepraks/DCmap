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
    landmarks: boolean
  }
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  is3DView: boolean
  isFlying?: boolean
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>
  visitedLandmarks: Set<string>
  onLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
  onSelect?: (entity: SelectedEntity | null) => void
}

export default function Map({
  mapContainerId = 'map',
  layersVisible,
  currentSeason,
  is3DView,
  isFlying,
  landmarks,
  visitedLandmarks,
  onLandmarkDiscovered,
  onSelect
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const { map } = useMap()
  const lastView = useRef<boolean | undefined>(undefined)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize map
  useMapInitialization(mapContainer)

  // Track map load state
  useEffect(() => {
    if (!map) return

    const loaded = () => setIsLoaded(true)
    if (map.isStyleLoaded()) loaded()
    map.on('style.load', loaded)
    return () => {
      map.off('style.load', loaded)
    }
  }, [map])

  // Handle 3D view toggle
  useEffect(() => {
    if (!map) return
    const changed = lastView.current !== is3DView
    lastView.current = is3DView
    if (isFlying || !changed) return

    if (is3DView) {
      map.flyTo({
        zoom: Math.max(map.getZoom(), 16.25),
        pitch: 68,
        bearing: -28,
        duration: 1800,
        essential: true,
        curve: 1.25,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      })
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1400,
        easing: (t) => 1 - Math.pow(1 - t, 3)
      })
    }
  }, [map, is3DView, isFlying])

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
          onSelectEntity={onSelect}
        />
      )}
    </div>
  )
}
