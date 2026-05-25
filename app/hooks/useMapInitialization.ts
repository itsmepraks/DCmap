'use client'

import { useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import { useMap } from '@/app/lib/MapContext'
import { applyWorldBorder, DC_CENTER, ZOOM_LEVELS } from '@/app/lib/worldBorder'

interface UseMapInitializationOptions {
  styleUrl?: string
}

export const STANDARD_STYLE = 'mapbox://styles/mapbox/standard'
export const SATELLITE_STYLE = 'mapbox://styles/mapbox/standard-satellite'

// Our custom-bound source name for mapbox-streets-v8. Do NOT use 'composite'
// (Standard reserves that name and breaks if we collide).
export const STREETS_SOURCE = 'dc-streets'

/**
 * Initialize the Mapbox map using the Standard style.
 *
 * Standard renders photorealistic 3D buildings, real 3D tree models,
 * realistic shadows, atmospheric fog, and time-of-day lighting natively.
 * Strict-mode safe: cancellation flag prevents the second mount from
 * orphaning a Mapbox instance, and cleanup clears the map from context.
 */
export function useMapInitialization(
  containerRef: React.RefObject<HTMLDivElement>,
  options: UseMapInitializationOptions = {}
) {
  const { setMap } = useMap()
  const styleUrl = options.styleUrl

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token || token.includes('placeholder')) {
      console.error(
        'Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env.local file. ' +
          'Get a token from https://account.mapbox.com/access-tokens/'
      )
      return
    }
    mapboxgl.accessToken = token

    let cancelled = false
    let mapInstance: mapboxgl.Map | null = null

    try {
      mapInstance = new mapboxgl.Map({
        container,
        style: styleUrl || STANDARD_STYLE,
        center: [-77.0353, 38.8895],
        zoom: 16.25,
        pitch: 68,
        bearing: -28,
        antialias: true,
        maxPitch: 85,
        minZoom: ZOOM_LEVELS.min,
        maxZoom: ZOOM_LEVELS.max,
        renderWorldCopies: false,
        attributionControl: true,
        config: {
          basemap: {
            lightPreset: 'day',
            show3dObjects: true,
            show3dBuildings: true,
            show3dTrees: true,
            show3dLandmarks: true,
            show3dFacades: false,
            showPedestrianRoads: true,
            showPointOfInterestLabels: false,
            showTransitLabels: false,
          },
        } as any,
      })

      // Make available to consumers immediately; downstream hooks gate work on
      // map.loaded() or 'style.load' events anyway.
      setMap(mapInstance)
      applyWorldBorder(mapInstance)

      const onStyleLoad = () => {
        if (!mapInstance || cancelled) return
        try {
          mapInstance.setConfigProperty('basemap', 'lightPreset', 'day')
          mapInstance.setConfigProperty('basemap', 'show3dObjects', true)
          mapInstance.setConfigProperty('basemap', 'show3dBuildings', true)
          mapInstance.setConfigProperty('basemap', 'show3dTrees', true)
          mapInstance.setConfigProperty('basemap', 'show3dLandmarks', true)
          mapInstance.setConfigProperty('basemap', 'show3dFacades', false)
          mapInstance.setConfigProperty('basemap', 'showPedestrianRoads', true)
          mapInstance.setConfigProperty('basemap', 'showPointOfInterestLabels', false)
          mapInstance.setConfigProperty('basemap', 'showTransitLabels', false)
        } catch {
          // setConfigProperty only exists on Standard / config-aware styles.
        }

        // Bind Mapbox Streets v8 under our own source id. Earlier versions
        // tried to attach this as 'composite' but Standard reserves that
        // name for its internal 3D model + tile system, and our override
        // triggered "t.json.meshes is not iterable" runtime errors.
        if (!mapInstance.getSource(STREETS_SOURCE)) {
          try {
            mapInstance.addSource(STREETS_SOURCE, {
              type: 'vector',
              url: 'mapbox://mapbox.mapbox-streets-v8',
            })
          } catch {
            // Already attached; safe to ignore.
          }
        }
      }
      mapInstance.on('style.load', onStyleLoad)
      mapInstance.on('error', (e) => {
        // Suppress a known Mapbox Standard internal 3D-model loader error
        // ("t.json.meshes is not iterable") that fires when a specific 3D
        // model tile is missing meshes data. It's cosmetic — does not affect
        // rendering — and we can't fix it from our side.
        const msg = e.error?.message || ''
        if (msg.includes('meshes is not iterable')) return
        console.error('Map error:', e.error)
      })
    } catch (error) {
      console.error('Error creating map:', error)
    }

    return () => {
      cancelled = true
      if (mapInstance) {
        mapInstance.remove()
        mapInstance = null
      }
      setMap(null)
    }
  }, [containerRef, styleUrl, setMap])
}
