'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import type { Waypoint } from '@/app/lib/waypointSystem'

// Clean Google Maps-style colors (matching LandmarksLayer)
const COLORS = {
  primary: '#FBBC04',      // Google Yellow for primary waypoint
  secondary: '#4285F4',    // Google Blue for secondary
  white: '#FFFFFF'
}

export interface ProgressiveWaypointMarker extends Waypoint {
  isPrimary?: boolean
  opacity?: number
  isVisible?: boolean
}

interface WaypointLayerProps {
  map: mapboxgl.Map | null
  waypoints: ProgressiveWaypointMarker[]
  activeWaypointId: string | null
  onWaypointClick?: (waypoint: ProgressiveWaypointMarker) => void
}

// Minimal CSS for subtle animations
const PULSE_ANIMATION_ID = 'waypoint-pulse-animation'

function injectPulseAnimation() {
  if (document.getElementById(PULSE_ANIMATION_ID)) return

  const style = document.createElement('style')
  style.id = PULSE_ANIMATION_ID
  style.textContent = `
    @keyframes waypoint-subtle-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    
    .waypoint-marker {
      transition: transform 0.2s ease-out, opacity 0.3s ease;
      cursor: pointer;
    }
    
    .waypoint-marker:hover {
      transform: scale(1.15);
    }
    
    .waypoint-primary-marker {
      animation: waypoint-subtle-pulse 2s ease-in-out infinite;
    }
  `
  document.head.appendChild(style)
}

// Create clean pin SVG element
function createPinElement(color: string, isPrimary: boolean, size: number = 28): HTMLDivElement {
  const container = document.createElement('div')
  container.className = `waypoint-marker ${isPrimary ? 'waypoint-primary-marker' : ''}`
  container.style.width = `${size}px`
  container.style.height = `${Math.round(size * 1.43)}px`

  container.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 1.43)}" viewBox="0 0 28 40">
      <defs>
        <filter id="shadow-${isPrimary ? 'p' : 's'}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z" 
            fill="${color}" stroke="${COLORS.white}" stroke-width="2" filter="url(#shadow-${isPrimary ? 'p' : 's'})"/>
      <circle cx="14" cy="14" r="4" fill="${COLORS.white}"/>
    </svg>
  `

  return container
}

export default function WaypointLayer({
  map,
  waypoints,
  activeWaypointId,
  onWaypointClick
}: WaypointLayerProps) {
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const prevWaypointIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!map) return

    // Inject animation styles
    injectPulseAnimation()

    const currentWaypointIds = new Set(waypoints.map(w => w.id))

    // Remove markers that are no longer in the list
    markersRef.current.forEach((marker, id) => {
      if (!currentWaypointIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    })

    // Add or update markers
    waypoints.forEach(waypoint => {
      // Skip invisible waypoints
      if (waypoint.isVisible === false) {
        const existingMarker = markersRef.current.get(waypoint.id)
        if (existingMarker) {
          existingMarker.remove()
          markersRef.current.delete(waypoint.id)
        }
        return
      }

      const isPrimary = waypoint.isPrimary ?? false
      const opacity = waypoint.opacity ?? 1.0
      const isActive = waypoint.id === activeWaypointId

      // Size based on type
      const size = isPrimary ? 32 : 24
      const color = isPrimary ? COLORS.primary : COLORS.secondary

      // Check if marker already exists
      let marker = markersRef.current.get(waypoint.id)

      if (marker) {
        // Update existing marker position and opacity
        const el = marker.getElement()
        el.style.opacity = String(opacity)
        marker.setLngLat(waypoint.coordinates)
      } else {
        // Create new marker element
        const el = createPinElement(color, isPrimary, size)
        el.style.opacity = String(opacity)
        el.style.zIndex = isPrimary ? '1000' : (isActive ? '900' : '100')

        if (onWaypointClick) {
          el.addEventListener('click', (e) => {
            e.stopPropagation()
            onWaypointClick(waypoint)
          })
        }

        marker = new mapboxgl.Marker({
          element: el,
          anchor: 'bottom'
        })
          .setLngLat(waypoint.coordinates)
          .addTo(map)

        markersRef.current.set(waypoint.id, marker)
      }
    })

    // Update previous waypoint IDs for next comparison
    prevWaypointIdsRef.current = currentWaypointIds

    const markers = markersRef.current

    return () => {
      markers.forEach(marker => marker.remove())
      markers.clear()
    }
  }, [map, waypoints, activeWaypointId, onWaypointClick])

  return null
}
