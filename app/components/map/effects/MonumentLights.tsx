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
const SKYLINE_LAYER = 'monument-lights-skyline' // huge soft halo visible from afar
const GLOW_LAYER = 'monument-lights-glow'        // medium ambient glow
const CORE_LAYER = 'monument-lights-core'         // bright hot core

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

  // 1. Skyline halo — huge soft glow visible from far zooms. This is what
  //    gives DC the city-of-lights feel when you're looking at the whole Mall.
  map.addLayer({
    id: SKYLINE_LAYER,
    type: 'circle',
    source: SOURCE_ID,
    paint: {
      'circle-color': '#FFC774',
      'circle-blur': 1.8,
      'circle-radius': [
        'interpolate', ['exponential', 1.6], ['zoom'],
        9, 22,
        11, 42,
        13, 70,
        15, 120,
        17, 200,
        19, 320,
      ],
      'circle-opacity': 0, // animated via setPaintProperty
    },
  })

  // 2. Medium ambient halo
  map.addLayer({
    id: GLOW_LAYER,
    type: 'circle',
    source: SOURCE_ID,
    paint: {
      'circle-color': '#FFD58A',
      'circle-blur': 1.2,
      'circle-radius': [
        'interpolate', ['exponential', 1.6], ['zoom'],
        9, 8,
        11, 16,
        13, 28,
        15, 52,
        17, 90,
        19, 150,
      ],
      'circle-opacity': 0,
    },
  })

  // 3. Hot core — bright, focused
  map.addLayer({
    id: CORE_LAYER,
    type: 'circle',
    source: SOURCE_ID,
    paint: {
      'circle-color': '#FFF1C4',
      'circle-blur': 0.6,
      'circle-radius': [
        'interpolate', ['exponential', 1.5], ['zoom'],
        9, 3,
        11, 6,
        13, 12,
        15, 22,
        17, 38,
        19, 60,
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
    let pulseInterval: number | null = null

    const apply = () => {
      try {
        ensureLayers(map, geo)
        const target = glowFor(lightPreset)
        map.setPaintProperty(SKYLINE_LAYER, 'circle-opacity-transition', { duration: 1600, delay: 0 } as any)
        map.setPaintProperty(GLOW_LAYER, 'circle-opacity-transition', { duration: 1600, delay: 0 } as any)
        map.setPaintProperty(CORE_LAYER, 'circle-opacity-transition', { duration: 1600, delay: 0 } as any)
        map.setPaintProperty(SKYLINE_LAYER, 'circle-opacity', target * 0.35)
        map.setPaintProperty(GLOW_LAYER, 'circle-opacity', target * 0.6)
        map.setPaintProperty(CORE_LAYER, 'circle-opacity', target * 0.95)
      } catch {
        // Layers may not be ready before style.load; the style.load handler retries.
      }
    }

    if (map.isStyleLoaded()) apply()
    map.on('style.load', apply)

    // Subtle slow pulse on the skyline halo at night — makes the monuments
    // feel alive rather than statically lit. Pulse is much weaker (or off)
    // during the day so it doesn't draw the eye when it shouldn't.
    const pulseAmplitude = lightPreset === 'night' ? 0.18 : lightPreset === 'dusk' ? 0.08 : 0
    if (pulseAmplitude > 0) {
      let t = 0
      pulseInterval = window.setInterval(() => {
        if (!map.isStyleLoaded()) return
        t += 0.05
        try {
          const base = glowFor(lightPreset) * 0.35
          const opacity = Math.max(0, base + Math.sin(t) * pulseAmplitude * base)
          map.setPaintProperty(SKYLINE_LAYER, 'circle-opacity', opacity)
        } catch {}
      }, 80)
    }

    return () => {
      map.off('style.load', apply)
      if (pulseInterval !== null) window.clearInterval(pulseInterval)
    }
  }, [map, landmarks, lightPreset])

  return null
}
