'use client'

import { useEffect } from 'react'
import type mapboxgl from 'mapbox-gl'
import { useMap } from '@/app/lib/MapContext'
import type { LightPreset } from '@/app/hooks/useTimeOfDay'

interface Landmark {
  id: string
  name: string
  coordinates: [number, number]
}

interface Props {
  landmarks: Landmark[]
  lightPreset: LightPreset
}

const SOURCE_ID = 'monument-lights-source'
const GLOW_LAYER = 'monument-lights-glow'
const CORE_LAYER = 'monument-lights-core'

/**
 * Floodlit monument effect. At dusk and night, every landmark gets a warm
 * radial glow circle layered on top of the Standard buildings — mimicking
 * the real-world floodlights on the Washington Monument, Lincoln Memorial,
 * Jefferson Memorial, and Capitol at night.
 *
 * Glow opacity ramps with the time-of-day preset: 0 at day, 0.35 at dawn,
 * 0.65 at dusk, full 1.0 at night.
 */
function glowFor(preset: LightPreset): number {
  switch (preset) {
    case 'day': return 0
    case 'dawn': return 0.35
    case 'dusk': return 0.65
    case 'night': return 1
  }
}

function buildGeoJSON(landmarks: Landmark[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: landmarks.map((l) => ({
      type: 'Feature',
      properties: { id: l.id, name: l.name },
      geometry: { type: 'Point', coordinates: l.coordinates },
    })),
  }
}

function ensureLayers(map: mapboxgl.Map, geo: GeoJSON.FeatureCollection) {
  const existing = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined
  if (existing) {
    existing.setData(geo)
    return
  }
  map.addSource(SOURCE_ID, { type: 'geojson', data: geo })

  // Soft halo
  map.addLayer({
    id: GLOW_LAYER,
    type: 'circle',
    source: SOURCE_ID,
    paint: {
      'circle-color': '#FFD58A',
      'circle-blur': 1.4,
      'circle-radius': [
        'interpolate', ['exponential', 1.6], ['zoom'],
        12, 14,
        14, 30,
        16, 60,
        18, 120,
      ],
      'circle-opacity': 0, // animated externally via setPaintProperty
    },
  })

  // Hot core
  map.addLayer({
    id: CORE_LAYER,
    type: 'circle',
    source: SOURCE_ID,
    paint: {
      'circle-color': '#FFF1C4',
      'circle-blur': 0.8,
      'circle-radius': [
        'interpolate', ['exponential', 1.5], ['zoom'],
        12, 4,
        14, 9,
        16, 18,
        18, 36,
      ],
      'circle-opacity': 0,
    },
  })
}

export default function MonumentLights({ landmarks, lightPreset }: Props) {
  const { map } = useMap()

  useEffect(() => {
    if (!map || landmarks.length === 0) return

    const geo = buildGeoJSON(landmarks)
    const apply = () => {
      try {
        ensureLayers(map, geo)
        const target = glowFor(lightPreset)
        // We rely on Mapbox's transition spec for the cross-fade. setPaintProperty
        // honours the transition object on the layer.
        map.setPaintProperty(GLOW_LAYER, 'circle-opacity', target * 0.55, { validate: false } as any)
        map.setPaintProperty(CORE_LAYER, 'circle-opacity', target * 0.9, { validate: false } as any)
        map.setPaintProperty(GLOW_LAYER, 'circle-opacity-transition', { duration: 1600, delay: 0 } as any)
        map.setPaintProperty(CORE_LAYER, 'circle-opacity-transition', { duration: 1600, delay: 0 } as any)
      } catch {
        // Layers may not be ready before style.load; the style.load handler retries.
      }
    }

    if (map.isStyleLoaded()) apply()
    map.on('style.load', apply)
    return () => {
      map.off('style.load', apply)
    }
  }, [map, landmarks, lightPreset])

  return null
}
