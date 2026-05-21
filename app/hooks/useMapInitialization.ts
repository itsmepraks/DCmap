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

      // Make available to consumers immediately; downstream hooks gate work on
      // map.loaded() or 'style.load' events anyway.
      setMap(mapInstance)
      applyWorldBorder(mapInstance)
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

      const onStyleLoad = () => {
        if (!mapInstance || cancelled) return
        try {
          mapInstance.setConfigProperty('basemap', 'lightPreset', 'dusk')
          mapInstance.setConfigProperty('basemap', 'show3dObjects', true)
          mapInstance.setConfigProperty('basemap', 'showPedestrianRoads', true)
          mapInstance.setConfigProperty('basemap', 'showPointOfInterestLabels', false)
          mapInstance.setConfigProperty('basemap', 'showTransitLabels', false)
        } catch {
          // setConfigProperty only exists on Standard / config-aware styles.
        }

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
          // Terrain can fail silently; not fatal.
        }
      }
      mapInstance.on('style.load', onStyleLoad)
      mapInstance.on('error', (e) => console.error('Map error:', e.error))
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
