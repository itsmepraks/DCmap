import type { Map as MapboxMap } from 'mapbox-gl'

export interface MapContextValue {
  map: MapboxMap | null
  setMap: (map: MapboxMap | null) => void
}

export interface LayerVisibility {
  museums: boolean
  landmarks: boolean
}

export type LayerId = keyof LayerVisibility

export interface MuseumProperties {
  NAME: string
  ADDRESS?: string
  DESCRIPTION?: string
  PHONE?: string
  URL?: string
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
