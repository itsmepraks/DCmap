import { memo } from 'react'
import type mapboxgl from 'mapbox-gl'
import type { LayerVisibility } from '@/app/types/map'
import MuseumsLayer from './layers/MuseumsLayer'
import RoadDetailsLayer from './layers/RoadDetailsLayer'
import Museum3DMarkers from './layers/Museum3DMarkers'
import TreesLayer from './layers/TreesLayer'
import LandmarksLayer from './layers/LandmarksLayer'
import ParksLayer from './layers/ParksLayer'
import HiddenLandmarksLayer from './layers/HiddenLandmarksLayer'
import HeatmapLayer from './layers/HeatmapLayer'
import type { SelectedEntity } from '@/app/components/ui/EntityInfoPanel'

interface MapLayersProps {
  map: mapboxgl.Map
  layersVisible: LayerVisibility
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  visitedLandmarks: Set<string>
  onLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
  onSelectEntity: (entity: SelectedEntity | null) => void
}

export const MapLayers = memo(function MapLayers({
  map,
  layersVisible,
  currentSeason,
  visitedLandmarks,
  onLandmarkDiscovered,
  onSelectEntity
}: MapLayersProps) {
  return (
    <>
      <ParksLayer visible={layersVisible.trees} season={currentSeason} />
      <TreesLayer 
        visible={layersVisible.trees} 
        season={currentSeason} 
        onSelect={onSelectEntity}
      />
      <HeatmapLayer visible={layersVisible.heatmap} />
      <RoadDetailsLayer visible={true} />
      <MuseumsLayer 
        visible={layersVisible.museums} 
        onSelect={onSelectEntity}
      />
      <Museum3DMarkers visible={layersVisible.museums} />
      <LandmarksLayer 
        map={map} 
        visible={layersVisible.landmarks} 
        visitedLandmarks={visitedLandmarks} 
        onLandmarkDiscovered={onLandmarkDiscovered}
        onSelect={onSelectEntity}
      />
      <HiddenLandmarksLayer 
        map={map} 
        isVisible={layersVisible.hiddenGems} 
        visitedLandmarks={Array.from(visitedLandmarks)}
        onDiscovered={(landmarkId) => {
          onLandmarkDiscovered(landmarkId, { id: landmarkId, name: 'Hidden Gem', coordinates: [0, 0] } as any)
        }}
      />
    </>
  )
})
