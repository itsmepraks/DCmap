'use client'

import { useEffect } from 'react'
import type mapboxgl from 'mapbox-gl'

type Season = 'spring' | 'summer' | 'fall' | 'winter'

interface Props {
  map: mapboxgl.Map | null
  season: Season
}

const SOURCE_ID = 'seasonal-canopy-source'
const LAYER_ID = 'seasonal-canopy-highlights'

const SEASON_STOPS: Record<Season, { color: string; opacity: number; blur: number; stroke: string }> = {
  spring: { color: '#F3A8BC', opacity: 0.50, blur: 0.66, stroke: '#FFE2EA' },
  summer: { color: '#5FA867', opacity: 0.24, blur: 0.82, stroke: '#B9D98F' },
  fall: { color: '#B7642C', opacity: 0.48, blur: 0.58, stroke: '#E8A14F' },
  winter: { color: '#DCE9EF', opacity: 0.38, blur: 0.70, stroke: '#FFFFFF' },
}

const FEATURE_COLLECTION: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { zone: 'Tidal Basin blossoms', weight: 1.2 },
      geometry: { type: 'Point', coordinates: [-77.0397, 38.8846] },
    },
    {
      type: 'Feature',
      properties: { zone: 'East Potomac canopy', weight: 0.9 },
      geometry: { type: 'Point', coordinates: [-77.035, 38.8734] },
    },
    {
      type: 'Feature',
      properties: { zone: 'National Mall canopy', weight: 1 },
      geometry: { type: 'Point', coordinates: [-77.0232, 38.8895] },
    },
    {
      type: 'Feature',
      properties: { zone: 'Constitution Gardens', weight: 0.85 },
      geometry: { type: 'Point', coordinates: [-77.0431, 38.8913] },
    },
    {
      type: 'Feature',
      properties: { zone: 'Ellipse and White House grounds', weight: 0.75 },
      geometry: { type: 'Point', coordinates: [-77.0365, 38.8951] },
    },
    {
      type: 'Feature',
      properties: { zone: 'West Potomac Park', weight: 1.05 },
      geometry: { type: 'Point', coordinates: [-77.0488, 38.8896] },
    },
    {
      type: 'Feature',
      properties: { zone: 'Smithsonian gardens', weight: 0.7 },
      geometry: { type: 'Point', coordinates: [-77.0258, 38.8883] },
    },
    {
      type: 'Feature',
      properties: { zone: 'Capitol grounds', weight: 0.85 },
      geometry: { type: 'Point', coordinates: [-77.0089, 38.8899] },
    },
  ],
}

export default function SeasonalCanopyHighlights({ map, season }: Props) {
  useEffect(() => {
    if (!map) return

    const apply = () => {
      if (!map.isStyleLoaded()) return

      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: FEATURE_COLLECTION,
        })
      }

      if (!map.getLayer(LAYER_ID)) {
        map.addLayer({
          id: LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          paint: {
            'circle-pitch-alignment': 'map',
            'circle-radius': [
              'interpolate',
              ['exponential', 1.4],
              ['zoom'],
              11, ['*', ['get', 'weight'], 52],
              13, ['*', ['get', 'weight'], 94],
              15, ['*', ['get', 'weight'], 172],
              17, ['*', ['get', 'weight'], 270],
            ],
            'circle-color': SEASON_STOPS[season].color,
            'circle-blur': SEASON_STOPS[season].blur,
            'circle-opacity': SEASON_STOPS[season].opacity,
            'circle-stroke-color': SEASON_STOPS[season].stroke,
            'circle-stroke-opacity': 0.18,
            'circle-stroke-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12, 1,
              17, 5,
            ],
          },
        })
      }

      const next = SEASON_STOPS[season]
      map.setPaintProperty(LAYER_ID, 'circle-color', next.color)
      map.setPaintProperty(LAYER_ID, 'circle-blur', next.blur)
      map.setPaintProperty(LAYER_ID, 'circle-stroke-color', next.stroke)
      map.setPaintProperty(LAYER_ID, 'circle-opacity-transition', { duration: 1400, delay: 0 } as any)
      map.setPaintProperty(LAYER_ID, 'circle-opacity', next.opacity)
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
