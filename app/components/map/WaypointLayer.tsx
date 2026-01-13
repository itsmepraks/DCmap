'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import type { Waypoint } from '@/app/lib/waypointSystem'
import {
  PRIMARY_WAYPOINT_SIZE,
  SECONDARY_WAYPOINT_SIZE
} from '@/app/lib/progressiveWaypointSystem'

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

// CSS for pulsing animation (injected once)
const PULSE_ANIMATION_ID = 'waypoint-pulse-animation'

function injectPulseAnimation() {
  if (document.getElementById(PULSE_ANIMATION_ID)) return
  
  const style = document.createElement('style')
  style.id = PULSE_ANIMATION_ID
  style.textContent = `
    @keyframes waypoint-pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7);
      }
      50% {
        transform: scale(1.15);
        box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.3);
      }
    }
    
    @keyframes waypoint-glow {
      0%, 100% {
        filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
      }
      50% {
        filter: drop-shadow(0 0 16px rgba(255, 215, 0, 1));
      }
    }
    
    .waypoint-primary {
      animation: waypoint-pulse 2s ease-in-out infinite, waypoint-glow 2s ease-in-out infinite;
    }
    
    .waypoint-secondary {
      transition: opacity 0.5s ease-in-out, transform 0.3s ease-out;
    }
    
    .waypoint-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.5);
      }
      to {
        opacity: var(--waypoint-opacity, 0.5);
        transform: scale(1);
      }
    }
  `
  document.head.appendChild(style)
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
      const isNew = !prevWaypointIdsRef.current.has(waypoint.id)
      const isActive = waypoint.id === activeWaypointId
      
      // Determine size based on type
      const size = isPrimary ? PRIMARY_WAYPOINT_SIZE : SECONDARY_WAYPOINT_SIZE
      const fontSize = isPrimary ? 28 : 20

      // Check if marker already exists
      let marker = markersRef.current.get(waypoint.id)
      
      if (marker) {
        // Update existing marker
        const el = marker.getElement()
        el.style.opacity = String(opacity)
        el.className = isPrimary ? 'waypoint-primary' : 'waypoint-secondary'
        el.style.setProperty('--waypoint-opacity', String(opacity))
        marker.setLngLat(waypoint.coordinates)
      } else {
        // Create new marker element
        const el = document.createElement('div')
        el.style.width = `${size}px`
        el.style.height = `${size}px`
        el.style.fontSize = `${fontSize}px`
        el.style.textAlign = 'center'
        el.style.lineHeight = `${size}px`
        el.style.cursor = 'pointer'
        el.style.opacity = String(opacity)
        el.style.setProperty('--waypoint-opacity', String(opacity))
        el.style.zIndex = isPrimary ? '1000' : (isActive ? '900' : '100')
        
        // Apply appropriate class for animation
        if (isPrimary) {
          el.className = 'waypoint-primary'
        } else {
          el.className = isNew ? 'waypoint-secondary waypoint-fade-in' : 'waypoint-secondary'
        }
        
        el.innerHTML = waypoint.icon || '📍'
        
        if (onWaypointClick) {
          el.addEventListener('click', (e) => {
            e.stopPropagation()
            onWaypointClick(waypoint)
          })
        }

        marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center'
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

