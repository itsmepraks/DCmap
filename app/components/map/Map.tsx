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
  const isInitialized = useRef(false)

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) {
      return
    }

    if (!mapContainer.current) {
      return
    }

    // Validate environment variable
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    console.log('🗺️ Initializing map...')
    console.log('Token exists:', !!token)
    console.log('Token length:', token?.length)
    console.log('Token preview:', token?.substring(0, 20) + '...')
    
    if (!token || token.includes('placeholder')) {
      console.error(
        '❌ Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env.local file. ' +
        'Get your token from https://account.mapbox.com/access-tokens/'
      )
      return
    }

    // Mark as initialized immediately to prevent double initialization
    isInitialized.current = true

    mapboxgl.accessToken = token

    try {
      console.log('🎨 Creating map with style:', process.env.NEXT_PUBLIC_MAPBOX_STYLE)
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
        console.log('✅ Map loaded successfully!')
        setMap(mapInstance)
      })

      mapInstance.on('error', (e) => {
        console.error('❌ Map error:', e.error)
      })

      // Cleanup on unmount
      return () => {
        console.log('🧹 Cleaning up map instance on unmount')
        mapInstance.remove()
        isInitialized.current = false
      }
    } catch (error) {
      console.error('❌ Error creating map:', error)
      isInitialized.current = false
    }
  }, [])

  return (
    <>
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />
      {map && <MuseumsLayer visible={layersVisible.museums} />}
    </>
  )
}

