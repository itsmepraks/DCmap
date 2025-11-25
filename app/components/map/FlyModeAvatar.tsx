'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

interface FlyModeAvatarProps {
  map: mapboxgl.Map | null
  position: { lng: number; lat: number } | undefined
  bearing: number | undefined
  isActive: boolean
}

export default function FlyModeAvatar({
  map,
  position,
  bearing,
  isActive
}: FlyModeAvatarProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (!map || !isActive || !position) {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      return
    }

    // Create simple static bird point marker
    if (!markerRef.current) {
      const el = document.createElement('div')
      el.style.width = '24px'
      el.style.height = '24px'
      el.style.fontSize = '20px'
      el.style.textAlign = 'center'
      el.style.lineHeight = '24px'
      el.style.cursor = 'pointer'
      el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))'
      el.style.transition = 'none' // No transition for instant positioning
      el.style.pointerEvents = 'none' // Don't interfere with map interactions
      el.innerHTML = '🦅'

      markerRef.current = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
        offset: [0, 0] // Explicit offset to center
      }).setLngLat([position.lng, position.lat])
        .addTo(map)
    }

    // Update position immediately - no delay
    if (markerRef.current) {
      // Use setLngLat with exact coordinates
      markerRef.current.setLngLat([position.lng, position.lat])
      
      // Rotate to face direction
      if (bearing !== undefined) {
        const el = markerRef.current.getElement()
        if (el) {
          el.style.transform = `rotate(${bearing}deg)`
        }
      }
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [map, isActive, position, bearing])

  return null
}
