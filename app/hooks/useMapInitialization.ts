'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { useMap } from '@/app/lib/MapContext'
import { applyWorldBorder, DC_CENTER, ZOOM_LEVELS } from '@/app/lib/worldBorder'

interface UseMapInitializationOptions {
  styleUrl?: string
}

export const STANDARD_STYLE = 'mapbox://styles/mapbox/standard'
export const SATELLITE_STYLE = 'mapbox://styles/mapbox/standard-satellite'

/**
 * Initialize the Mapbox map using the Standard style.
 *
 * Standard renders photorealistic 3D buildings, real 3D tree models,
 * realistic shadows, atmospheric fog, and time-of-day lighting natively.
 * Light preset, label visibility, and emissive strength are configured
 * downstream via `map.setConfigProperty('basemap', ...)`.
 */
export function useMapInitialization(
  containerRef: React.RefObject<HTMLDivElement>,
  options: UseMapInitializationOptions = {}
) {
  const { map, setMap } = useMap()
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current || map || !containerRef.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token || token.includes('placeholder')) {
      console.error(
        'Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env.local file. ' +
          'Get a token from https://account.mapbox.com/access-tokens/'
      )
      return
    }

    isInitialized.current = true
    mapboxgl.accessToken = token

    const container = containerRef.current
    let mapInstance: mapboxgl.Map | null = null

    try {
      mapInstance = new mapboxgl.Map({
        container,
        style: options.styleUrl || STANDARD_STYLE,
        center: DC_CENTER,
        zoom: ZOOM_LEVELS.default,
        pitch: 60,
        bearing: -17.6,
        antialias: true,
        maxPitch: 85,
        minZoom: ZOOM_LEVELS.min,
        maxZoom: ZOOM_LEVELS.max,
        renderWorldCopies: false,
        attributionControl: true,
      })

      setMap(mapInstance)
      applyWorldBorder(mapInstance)
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

      mapInstance.on('style.load', () => {
        if (!mapInstance) return
        // Standard exposes a small set of config properties for cinematic vibe.
        try {
          mapInstance.setConfigProperty('basemap', 'lightPreset', 'dusk')
          mapInstance.setConfigProperty('basemap', 'show3dObjects', true)
          mapInstance.setConfigProperty('basemap', 'showPedestrianRoads', true)
          mapInstance.setConfigProperty('basemap', 'showPointOfInterestLabels', false)
          mapInstance.setConfigProperty('basemap', 'showTransitLabels', false)
        } catch {
          // setConfigProperty exists only on Standard / config-aware styles.
        }

        // Add high-res terrain on top of Standard's base 3D.
        try {
          if (!mapInstance.getSource('mapbox-dem')) {
            mapInstance.addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512,
              maxzoom: 14,
            })
            mapInstance.setTerrain({ source: 'mapbox-dem', exaggeration: 1.3 })
          }
        } catch {
          // Terrain can fail silently on slow connections; not fatal.
        }
      })

      mapInstance.on('error', (e) => {
        console.error('Map error:', e.error)
      })
    } catch (error) {
      console.error('Error creating map:', error)
      isInitialized.current = false
    }

    return () => {
      if (mapInstance) mapInstance.remove()
      isInitialized.current = false
    }
  }, [containerRef, options.styleUrl, setMap, map])
}
