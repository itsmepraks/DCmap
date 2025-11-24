'use client'

import { useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

interface BreadcrumbTrailProps {
  map: mapboxgl.Map | null
  visitedLandmarks: Array<{
    id: string
    coordinates: [number, number]
    visitedAt: number
  }>
}

export default function BreadcrumbTrail({ map, visitedLandmarks }: BreadcrumbTrailProps) {
  useEffect(() => {
    if (!map || visitedLandmarks.length < 2) return

    // Wait for map to be fully loaded
    if (!map.loaded()) {
      map.once('load', () => addBreadcrumbTrail())
      return
    }

    addBreadcrumbTrail()

    function addBreadcrumbTrail() {
      if (!map) return

      // Remove existing layers and sources if they exist
      if (map.getLayer('breadcrumb-trail-line')) {
        map.removeLayer('breadcrumb-trail-line')
      }
      if (map.getLayer('breadcrumb-trail-glow')) {
        map.removeLayer('breadcrumb-trail-glow')
      }
      if (map.getLayer('breadcrumb-points')) {
        map.removeLayer('breadcrumb-points')
      }
      if (map.getSource('breadcrumb-trail')) {
        map.removeSource('breadcrumb-trail')
      }
      if (map.getSource('breadcrumb-points')) {
        map.removeSource('breadcrumb-points')
      }

      // Sort landmarks by visit time
      const sortedLandmarks = [...visitedLandmarks].sort((a, b) => a.visitedAt - b.visitedAt)
      
      // Create line connecting landmarks
      const lineCoordinates = sortedLandmarks.map(l => l.coordinates)

      // Add trail line source
      map.addSource('breadcrumb-trail', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: lineCoordinates
          }
        }
      })

      // Add glow effect (wider, semi-transparent line)
      map.addLayer({
        id: 'breadcrumb-trail-glow',
        type: 'line',
        source: 'breadcrumb-trail',
        paint: {
          'line-color': '#FFD700',
          'line-width': 8,
          'line-opacity': 0.3,
          'line-blur': 4
        }
      })

      // Add main trail line
      map.addLayer({
        id: 'breadcrumb-trail-line',
        type: 'line',
        source: 'breadcrumb-trail',
        paint: {
          'line-color': '#FFD700',
          'line-width': 4,
          'line-opacity': 0.8,
          'line-dasharray': [2, 1]
        }
      })

      // Add points for each landmark
      const pointFeatures = sortedLandmarks.map((landmark, index) => ({
        type: 'Feature' as const,
        properties: {
          order: index + 1
        },
        geometry: {
          type: 'Point' as const,
          coordinates: landmark.coordinates
        }
      }))

      map.addSource('breadcrumb-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: pointFeatures
        }
      })

      // Add numbered points
      map.addLayer({
        id: 'breadcrumb-points',
        type: 'circle',
        source: 'breadcrumb-points',
        paint: {
          'circle-radius': 8,
          'circle-color': '#FFD700',
          'circle-stroke-color': '#FFF',
          'circle-stroke-width': 2,
          'circle-opacity': 0.9
        }
      })

      // Add labels with order numbers
      map.addLayer({
        id: 'breadcrumb-labels',
        type: 'symbol',
        source: 'breadcrumb-points',
        layout: {
          'text-field': ['get', 'order'],
          'text-size': 10,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
        },
        paint: {
          'text-color': '#2C1810'
        }
      })
    }

    return () => {
      if (map.getLayer('breadcrumb-labels')) {
        map.removeLayer('breadcrumb-labels')
      }
      if (map.getLayer('breadcrumb-points')) {
        map.removeLayer('breadcrumb-points')
      }
      if (map.getLayer('breadcrumb-trail-line')) {
        map.removeLayer('breadcrumb-trail-line')
      }
      if (map.getLayer('breadcrumb-trail-glow')) {
        map.removeLayer('breadcrumb-trail-glow')
      }
      if (map.getSource('breadcrumb-trail')) {
        map.removeSource('breadcrumb-trail')
      }
      if (map.getSource('breadcrumb-points')) {
        map.removeSource('breadcrumb-points')
      }
    }
  }, [map, visitedLandmarks])

  return null
}

