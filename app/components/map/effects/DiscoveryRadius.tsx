'use client'

import { useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

interface DiscoveryRadiusProps {
  map: mapboxgl.Map | null
  landmarks: Array<{
    id: string
    coordinates: [number, number]
    visited: boolean
  }>
}

const DISCOVERY_RADIUS_METERS = 50

export default function DiscoveryRadius({ map, landmarks }: DiscoveryRadiusProps) {
  useEffect(() => {
    if (!map || !landmarks.length) return

    // Wait for map to be fully loaded
    if (!map.loaded()) {
      map.once('load', () => addRadiusLayers())
      return
    }

    addRadiusLayers()

    function addRadiusLayers() {
      if (!map) return

      // Check if style is available
      try {
        const style = map.getStyle()
        if (!style) return
      } catch {
        return // Style not ready
      }

      // Remove existing layers FIRST (in reverse order of addition), then source
      // Must remove ALL layers using the source before removing the source
      try {
        if (map.getLayer('discovery-radius-outline')) {
          map.removeLayer('discovery-radius-outline')
        }
        if (map.getLayer('discovery-radius-layer')) {
          map.removeLayer('discovery-radius-layer')
        }
        if (map.getSource('discovery-radius')) {
          map.removeSource('discovery-radius')
        }
      } catch (error) {
        console.warn('DiscoveryRadius: Error cleaning up layers', error)
        return
      }

      // Create GeoJSON features for unvisited landmarks
      const features = landmarks
        .filter(landmark => !landmark.visited)
        .map(landmark => {
          const [lng, lat] = landmark.coordinates

          // Create a circle polygon approximation
          const steps = 64
          const radius = DISCOVERY_RADIUS_METERS / 111320 // Convert meters to degrees
          const coordinates: [number, number][] = []

          for (let i = 0; i < steps; i++) {
            const angle = (i / steps) * 2 * Math.PI
            const dx = radius * Math.cos(angle)
            const dy = radius * Math.sin(angle)
            coordinates.push([lng + dx, lat + dy])
          }
          coordinates.push(coordinates[0]) // Close the polygon

          return {
            type: 'Feature' as const,
            properties: {
              id: landmark.id
            },
            geometry: {
              type: 'Polygon' as const,
              coordinates: [coordinates]
            }
          }
        })

      if (features.length === 0) return

      // Add source
      map.addSource('discovery-radius', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        }
      })

      // Add layer with pulsing animation
      map.addLayer({
        id: 'discovery-radius-layer',
        type: 'fill',
        source: 'discovery-radius',
        paint: {
          'fill-color': '#FFD700',
          'fill-opacity': 0.15,
          'fill-outline-color': '#FFD700'
        }
      })

      // Add outline
      map.addLayer({
        id: 'discovery-radius-outline',
        type: 'line',
        source: 'discovery-radius',
        paint: {
          'line-color': '#FFD700',
          'line-width': 2,
          'line-opacity': 0.6,
          'line-dasharray': [2, 2]
        }
      })
    }

    return () => {
      if (!map || !map.getStyle()) return
      if (map.getLayer('discovery-radius-outline')) {
        map.removeLayer('discovery-radius-outline')
      }
      if (map.getLayer('discovery-radius-layer')) {
        map.removeLayer('discovery-radius-layer')
      }
      if (map.getSource('discovery-radius')) {
        map.removeSource('discovery-radius')
      }
    }
  }, [map, landmarks])

  return null
}

