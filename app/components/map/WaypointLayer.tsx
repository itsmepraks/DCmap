'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import type { Waypoint } from '@/app/lib/waypointSystem'

interface WaypointLayerProps {
  map: mapboxgl.Map | null
  waypoints: Waypoint[]
  activeWaypointId: string | null
  onWaypointClick?: (waypoint: Waypoint) => void
}

export default function WaypointLayer({
  map,
  waypoints,
  activeWaypointId,
  onWaypointClick
}: WaypointLayerProps) {
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())

  useEffect(() => {
    if (!map) return

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current.clear()

    // Add new markers
    waypoints.forEach(waypoint => {
      const el = document.createElement('div')
      el.style.width = '32px'
      el.style.height = '32px'
      el.style.fontSize = '24px'
      el.style.textAlign = 'center'
      el.style.lineHeight = '32px'
      el.style.cursor = 'pointer'
      el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))'
      el.style.transition = 'transform 0.2s ease-out'
      
      const isActive = waypoint.id === activeWaypointId
      el.style.transform = isActive ? 'scale(1.3)' : 'scale(1)'
      el.style.zIndex = isActive ? '1000' : '100'
      
      el.innerHTML = waypoint.icon || '📍'
      
      if (onWaypointClick) {
        el.addEventListener('click', () => onWaypointClick(waypoint))
      }

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat(waypoint.coordinates)
        .addTo(map)

      markersRef.current.set(waypoint.id, marker)
    })

    return () => {
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current.clear()
    }
  }, [map, waypoints, activeWaypointId, onWaypointClick])

  return null
}

