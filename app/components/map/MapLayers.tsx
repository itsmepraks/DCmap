import { memo, useEffect } from 'react'
import type mapboxgl from 'mapbox-gl'
import type { LayerVisibility } from '@/app/types/map'
import MuseumsLayer from './layers/MuseumsLayer'
import RoadDetailsLayer from './layers/RoadDetailsLayer'
import TreesLayer from './layers/TreesLayer'
import LandmarksLayer from './layers/LandmarksLayer'
import ParksLayer from './layers/ParksLayer'
import type { SelectedEntity } from '@/app/components/ui/EntityInfoPanel'

interface MapLayersProps {
  map: mapboxgl.Map
  layersVisible: LayerVisibility
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  visitedLandmarks: Set<string>
  onLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
  onSelectEntity?: (entity: SelectedEntity | null) => void
}

export const MapLayers = memo(function MapLayers({
  map,
  layersVisible,
  currentSeason,
  visitedLandmarks,
  onLandmarkDiscovered,
  onSelectEntity
}: MapLayersProps) {
  useEffect(() => {
    // #region agent log
    // #endregion
  }, [layersVisible, currentSeason, map])

  return (
    <>
      <ParksLayer visible={layersVisible.trees} season={currentSeason} />
      <TreesLayer 
        visible={layersVisible.trees} 
        season={currentSeason} 
        onSelect={onSelectEntity}
      />
      <RoadDetailsLayer visible={true} />
      <MuseumsLayer 
        visible={layersVisible.museums} 
        onSelect={onSelectEntity}
        onMuseumDiscovered={onLandmarkDiscovered}
      />
      <LandmarksLayer 
        map={map} 
        visible={layersVisible.landmarks} 
        visitedLandmarks={visitedLandmarks} 
        onLandmarkDiscovered={onLandmarkDiscovered}
        onSelect={onSelectEntity}
      />
    </>
  )
})
