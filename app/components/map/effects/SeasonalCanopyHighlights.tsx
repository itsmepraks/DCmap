'use client'

import { useEffect } from 'react'
import type mapboxgl from 'mapbox-gl'
import { STREETS_SOURCE } from '@/app/hooks/useMapInitialization'

type Season = 'spring' | 'summer' | 'fall' | 'winter'

interface Props {
  map: mapboxgl.Map | null
  season: Season
}

const LANDUSE_LAYER = 'seasonal-landuse-canopy'
const BLOSSOM_SOURCE = 'seasonal-blossom-source'
const BLOSSOM_LAYER = 'seasonal-blossom-accents'

const PARK_CLASSES = ['park', 'wood', 'grass', 'cemetery', 'golf_course', 'pitch']

const SEASON_PAINT: Record<Season, { fill: string; opacity: number; outline: string; blossomOpacity: number }> = {
  spring: {
    fill: '#7FAE73',
    opacity: 0.34,
    outline: '#DFA5B8',
    blossomOpacity: 0.30,
  },
  summer: {
    fill: '#5E9E5D',
    opacity: 0.26,
    outline: '#9BC779',
    blossomOpacity: 0,
  },
  fall: {
    fill: '#A96A31',
    opacity: 0.42,
    outline: '#D79A43',
    blossomOpacity: 0.08,
  },
  winter: {
    fill: '#C9C1B2',
    opacity: 0.38,
    outline: '#E9ECEC',
    blossomOpacity: 0,
  },
}

const BLOSSOMS: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { weight: 1.3 },
      geometry: { type: 'Point', coordinates: [-77.0397, 38.8846] },
    },
    {
      type: 'Feature',
      properties: { weight: 0.9 },
      geometry: { type: 'Point', coordinates: [-77.0444, 38.884] },
    },
    {
      type: 'Feature',
      properties: { weight: 0.8 },
      geometry: { type: 'Point', coordinates: [-77.0334, 38.8837] },
    },
    {
      type: 'Feature',
      properties: { weight: 0.55 },
      geometry: { type: 'Point', coordinates: [-77.036, 38.8884] },
    },
  ],
}

function setPaint(map: mapboxgl.Map, season: Season) {
  const paint = SEASON_PAINT[season]
  if (map.getLayer(LANDUSE_LAYER)) {
    map.setPaintProperty(LANDUSE_LAYER, 'fill-color', paint.fill)
    map.setPaintProperty(LANDUSE_LAYER, 'fill-opacity-transition', { duration: 900, delay: 0 } as any)
    map.setPaintProperty(LANDUSE_LAYER, 'fill-opacity', paint.opacity)
    map.setPaintProperty(LANDUSE_LAYER, 'fill-outline-color', paint.outline)
  }

  if (map.getLayer(BLOSSOM_LAYER)) {
    map.setPaintProperty(BLOSSOM_LAYER, 'circle-opacity-transition', { duration: 900, delay: 0 } as any)
    map.setPaintProperty(BLOSSOM_LAYER, 'circle-opacity', paint.blossomOpacity)
  }
}

export default function SeasonalCanopyHighlights({ map, season }: Props) {
  useEffect(() => {
    if (!map) return

    const apply = () => {
      if (!map.isStyleLoaded() || !map.getSource(STREETS_SOURCE)) return

      const beforeId = map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id

      if (!map.getLayer(LANDUSE_LAYER)) {
        map.addLayer({
          id: LANDUSE_LAYER,
          type: 'fill',
          source: STREETS_SOURCE,
          'source-layer': 'landuse',
          filter: ['in', ['get', 'class'], ['literal', PARK_CLASSES]],
          paint: {
            'fill-color': SEASON_PAINT[season].fill,
            'fill-opacity': SEASON_PAINT[season].opacity,
            'fill-outline-color': SEASON_PAINT[season].outline,
          },
        }, beforeId)
      }

      if (!map.getSource(BLOSSOM_SOURCE)) {
        map.addSource(BLOSSOM_SOURCE, {
          type: 'geojson',
          data: BLOSSOMS,
        })
      }

      if (!map.getLayer(BLOSSOM_LAYER)) {
        map.addLayer({
          id: BLOSSOM_LAYER,
          type: 'circle',
          source: BLOSSOM_SOURCE,
          paint: {
            'circle-pitch-alignment': 'map',
            'circle-radius': [
              'interpolate',
              ['exponential', 1.35],
              ['zoom'],
              11, ['*', ['get', 'weight'], 20],
              14, ['*', ['get', 'weight'], 64],
              17, ['*', ['get', 'weight'], 142],
            ],
            'circle-color': '#F2A8BD',
            'circle-blur': 0.7,
            'circle-opacity': SEASON_PAINT[season].blossomOpacity,
            'circle-stroke-color': '#FFE8EF',
            'circle-stroke-opacity': 0.12,
            'circle-stroke-width': 2,
          },
        }, beforeId)
      }

      setPaint(map, season)
    }

    if (map.isStyleLoaded()) apply()
    map.on('style.load', apply)
    map.on('idle', apply)

    return () => {
      map.off('style.load', apply)
      map.off('idle', apply)
    }
  }, [map, season])

  return null
}
