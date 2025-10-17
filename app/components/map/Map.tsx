'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { useMap } from '@/app/lib/MapContext'
import type { LayerVisibility } from '@/app/types/map'
import MuseumsLayer from './layers/MuseumsLayer'

interface MapProps {
  layersVisible: LayerVisibility
}

export default function Map({ layersVisible }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const { map, setMap } = useMap()

  useEffect(() => {
    if (!mapContainer.current || map) return

    // Validate environment variable
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token || token.includes('placeholder')) {
      console.error(
        'Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env.local file. ' +
        'Get your token from https://account.mapbox.com/access-tokens/'
      )
    }

    mapboxgl.accessToken = token || ''

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: process.env.NEXT_PUBLIC_MAPBOX_STYLE || 'mapbox://styles/mapbox/light-v11',
      center: [-77.0369, 38.9072], // D.C. coordinates
      zoom: 11,
      pitch: 0,
      bearing: 0,
    })

    // Add navigation controls
    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

    mapInstance.on('load', () => {
      setMap(mapInstance)
    })

    // Cleanup on unmount
    return () => {
      if (mapInstance) {
        mapInstance.remove()
        setMap(null)
      }
    }
  }, [map, setMap])

  return (
    <>
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />
      {map && <MuseumsLayer visible={layersVisible.museums} />}
    </>
  )
}

