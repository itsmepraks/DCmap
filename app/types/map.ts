import type { Map as MapboxMap } from 'mapbox-gl'

export interface MapContextValue {
  map: MapboxMap | null
  setMap: (map: MapboxMap | null) => void
}

export interface LayerVisibility {
  museums: boolean
  trees: boolean
  heatmap: boolean
  landmarks: boolean
}

export type LayerId = keyof LayerVisibility

export interface MuseumProperties {
  NAME: string
  ADDRESS?: string
  DESCRIPTION?: string
}

export interface TreeProperties {
  COMMON_NAME?: string
  SPECIES?: string
  DBH?: number
  CONDITION?: string
}

export interface HeatmapProperties {
  temp_jan?: number
  temp_feb?: number
  temp_mar?: number
  temp_apr?: number
  temp_may?: number
  temp_jun?: number
  temp_jul?: number
  temp_aug?: number
  temp_sep?: number
  temp_oct?: number
  temp_nov?: number
  temp_dec?: number
}

export interface GeoJSONFeature<T = Record<string, unknown>> {
  type: 'Feature'
  geometry: {
    type: 'Point' | 'Polygon' | 'LineString' | 'MultiPoint' | 'MultiPolygon' | 'MultiLineString'
    coordinates: number[] | number[][] | number[][][]
  }
  properties: T
}

export interface GeoJSONFeatureCollection<T = Record<string, unknown>> {
  type: 'FeatureCollection'
  features: GeoJSONFeature<T>[]
}

export interface LayerConfig {
  id: LayerId
  label: string
  description?: string
  enabled: boolean
}

