'use client'

import { useEffect } from 'react'
import type mapboxgl from 'mapbox-gl'

type Season = 'spring' | 'summer' | 'fall' | 'winter'

interface Props {
  map: mapboxgl.Map | null
  season: Season
}

const SOURCE_ID = 'seasonal-vegetation-source'
const LAYER_ID = 'seasonal-vegetation-layer'

type Zone = {
  center: [number, number]
  radiusLng: number
  radiusLat: number
  count: number
}

const ZONES: Zone[] = [
  { center: [-77.0397, 38.8846], radiusLng: 0.009, radiusLat: 0.0045, count: 24 }, // Tidal Basin
  { center: [-77.0353, 38.8895], radiusLng: 0.010, radiusLat: 0.0038, count: 22 }, // Washington Monument grounds
  { center: [-77.0232, 38.8895], radiusLng: 0.012, radiusLat: 0.0035, count: 22 }, // National Mall
  { center: [-77.0488, 38.8896], radiusLng: 0.009, radiusLat: 0.0038, count: 18 }, // West Potomac Park
  { center: [-77.0365, 38.8951], radiusLng: 0.006, radiusLat: 0.0036, count: 14 }, // Ellipse
  { center: [-77.0089, 38.8899], radiusLng: 0.006, radiusLat: 0.0038, count: 12 }, // Capitol grounds
]

function seeded(seed: number) {
  const x = Math.sin(seed * 999.13) * 10000
  return x - Math.floor(x)
}

function buildFeatures(season: Season): GeoJSON.Feature[] {
  if (season === 'summer') return []

  const features: GeoJSON.Feature[] = []
  let seed = 1
  for (const zone of ZONES) {
    const count =
      season === 'spring' && zone.center[0] < -77.032 ? Math.round(zone.count * 0.75)
        : season === 'spring' ? Math.round(zone.count * 0.35)
        : season === 'winter' ? Math.round(zone.count * 0.72)
        : zone.count

    for (let i = 0; i < count; i++) {
      seed += 1
      const angle = seeded(seed) * Math.PI * 2
      const radius = Math.sqrt(seeded(seed + 100))
      const lng = zone.center[0] + Math.cos(angle) * radius * zone.radiusLng
      const lat = zone.center[1] + Math.sin(angle) * radius * zone.radiusLat

      features.push({
        type: 'Feature',
        properties: {
          icon: `seasonal-tree-${season}`,
          rotate: Math.round(seeded(seed + 200) * 40 - 20),
          size: 0.86 + seeded(seed + 300) * 0.34,
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      })
    }
  }

  return features
}

function featureCollection(season: Season): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: buildFeatures(season),
  }
}

function loadIcon(map: mapboxgl.Map, name: string, path: string) {
  if (map.hasImage(name)) return Promise.resolve()

  return new Promise<void>((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (!map.hasImage(name)) {
        map.addImage(name, img, { sdf: false })
      }
      resolve()
    }
    img.onerror = () => resolve()
    img.src = path
  })
}

export default function SeasonalCanopyHighlights({ map, season }: Props) {
  useEffect(() => {
    if (!map) return

    let cancelled = false

    const apply = async () => {
      if (!map.isStyleLoaded()) return

      await Promise.all([
        loadIcon(map, 'seasonal-tree-spring', '/icons/tree-spring.svg'),
        loadIcon(map, 'seasonal-tree-fall', '/icons/tree-fall.svg'),
        loadIcon(map, 'seasonal-tree-winter', '/icons/tree-winter.svg'),
      ])
      if (cancelled) return

      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: featureCollection(season),
        })
      } else {
        const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource
        source.setData(featureCollection(season))
      }

      if (!map.getLayer(LAYER_ID)) {
        const beforeId = map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id
        map.addLayer({
          id: LAYER_ID,
          type: 'symbol',
          source: SOURCE_ID,
          minzoom: 13,
          layout: {
            'icon-image': ['get', 'icon'],
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              13, ['*', ['get', 'size'], 0.24],
              15, ['*', ['get', 'size'], 0.42],
              17, ['*', ['get', 'size'], 0.70],
            ],
            'icon-rotate': ['get', 'rotate'],
            'icon-pitch-alignment': 'map',
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': false,
            'icon-ignore-placement': false,
          },
          paint: {
            'icon-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              13, 0.35,
              14.2, 0.72,
              16, 0.92,
            ],
          },
        }, beforeId)
      }
    }

    if (map.isStyleLoaded()) apply()
    map.on('style.load', apply)
    map.on('idle', apply)

    return () => {
      cancelled = true
      map.off('style.load', apply)
      map.off('idle', apply)
    }
  }, [map, season])

  return null
}
