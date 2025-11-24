'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import type { SelectedEntity } from '@/app/components/ui/EntityInfoPanel'
import { calculateDistance } from '@/app/lib/proximityCalculator'

interface LandmarksLayerProps {
  map: mapboxgl.Map | null
  visible: boolean
  visitedLandmarks: Set<string>
  onLandmarkDiscovered?: (landmarkId: string, landmarkData: any) => void
  onSelect?: (entity: SelectedEntity | null) => void
}

export default function LandmarksLayer({ map, visible, visitedLandmarks, onLandmarkDiscovered, onSelect }: LandmarksLayerProps) {
  const isInitialized = useRef(false)

  useEffect(() => {
    if (!map || isInitialized.current) return

    const initializeLayer = async () => {
      try {
        // Wait for map style to load
        if (!map.isStyleLoaded()) {
          map.once('idle', () => initializeLayer())
          return
        }

        // Create eye-catching solid landmark icons
        const createLandmarkIcon = (color: string, isVisited: boolean) => {
          const canvas = document.createElement('canvas')
          canvas.width = 60
          canvas.height = 70
          const ctx = canvas.getContext('2d')
          if (!ctx) return null

          // Add glow effect
          ctx.shadowColor = color
          ctx.shadowBlur = isVisited ? 20 : 10
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0

          // Draw solid pin base
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(30, 22, 18, 0, Math.PI * 2)
          ctx.fill()

          // Draw pin point
          ctx.beginPath()
          ctx.moveTo(30, 40)
          ctx.lineTo(20, 55)
          ctx.lineTo(40, 55)
          ctx.closePath()
          ctx.fill()

          // Add glossy highlight
          ctx.shadowBlur = 0
          const gradient = ctx.createRadialGradient(25, 18, 5, 30, 22, 18)
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)')
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(30, 22, 18, 0, Math.PI * 2)
          ctx.fill()

          // Draw center dot
          ctx.fillStyle = '#FFF'
          ctx.beginPath()
          ctx.arc(30, 22, 6, 0, Math.PI * 2)
          ctx.fill()

          // Add white border for definition
          ctx.strokeStyle = '#FFF'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(30, 22, 18, 0, Math.PI * 2)
          ctx.stroke()

          // Add star icon if visited
          if (isVisited) {
            ctx.font = 'bold 16px Arial'
            ctx.fillStyle = color
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('★', 30, 22)
          }

          return canvas
        }

        // Add images to map
        const unvisitedCanvas = createLandmarkIcon('#FF6347', false) // Tomato red
        const visitedCanvas = createLandmarkIcon('#FFD700', true) // Gold

        if (unvisitedCanvas && !map.hasImage('landmark-unvisited')) {
          const ctx = unvisitedCanvas.getContext('2d')!
          const imageData = ctx.getImageData(0, 0, unvisitedCanvas.width, unvisitedCanvas.height)
          map.addImage('landmark-unvisited', {
            width: unvisitedCanvas.width,
            height: unvisitedCanvas.height,
            data: imageData.data
          })
        }
        if (visitedCanvas && !map.hasImage('landmark-visited')) {
          const ctx = visitedCanvas.getContext('2d')!
          const imageData = ctx.getImageData(0, 0, visitedCanvas.width, visitedCanvas.height)
          map.addImage('landmark-visited', {
            width: visitedCanvas.width,
            height: visitedCanvas.height,
            data: imageData.data
          })
        }

        // Load landmarks data
        const response = await fetch('/data/landmarks.geojson')
        const landmarksData = await response.json()

        // Add source
        if (!map.getSource('landmarks')) {
          map.addSource('landmarks', {
            type: 'geojson',
            data: landmarksData,
            // Add generateId to ensure each feature has a unique ID for feature state
            generateId: true
          })
        }

        // Add layer
        if (!map.getLayer('landmarks-layer')) {
          map.addLayer({
            id: 'landmarks-layer',
            type: 'symbol',
            source: 'landmarks',
            layout: {
              'icon-image': 'landmark-unvisited',
              'icon-size': 1, // Fixed size (feature-state not allowed in layout)
              'icon-allow-overlap': true,
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 12,
              'text-offset': [0, 2],
              'text-anchor': 'top'
            },
            paint: {
              'text-color': '#2C1810',
              'text-halo-color': '#FFF',
              'text-halo-width': 2,
              // Add selection halo/glow
              'icon-halo-color': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                '#FFD700', // Gold glow when selected
                'rgba(0,0,0,0)'
              ],
              'icon-halo-width': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                4,
                0
              ],
              'icon-halo-blur': 2
            }
          })
        }

        // Global selected ID tracking
        let selectedFeatureId: string | number | null = null;

        // Add click handler
        map.on('click', 'landmarks-layer', (e) => {
          if (!e.features || e.features.length === 0) return

          const feature = e.features[0]
          const properties = feature.properties
          if (!properties) return

          // Reset previous selection
          if (selectedFeatureId !== null) {
            map.setFeatureState(
              { source: 'landmarks', id: selectedFeatureId },
              { selected: false }
            )
          }

          // Set new selection
          if (feature.id !== undefined) {
            selectedFeatureId = feature.id
            map.setFeatureState(
              { source: 'landmarks', id: feature.id },
              { selected: true }
            )
          }

          // Prevent map click propagation (which might close the panel)
          e.originalEvent.stopPropagation()

          // GeoJSON coordinates are [longitude, latitude]
          const coordinates = (feature.geometry as any).coordinates.slice()
          const [lng, lat] = coordinates
          const isVisited = visitedLandmarks.has(properties.id)
          
          // Check discovery
          if (!isVisited && onLandmarkDiscovered) {
            const center = map.getCenter()
            const distance = calculateDistance(
              [center.lng, center.lat],
              [lng, lat]
            )
            
            if (distance <= 50) {
              onLandmarkDiscovered(properties.id, properties)
            }
          }
          
          console.log(`📍 Selected landmark: ${properties.name}`)

          // Call onSelect instead of creating a popup
          if (onSelect) {
            onSelect({
              id: properties.id,
              type: 'landmark',
              name: properties.name,
              description: properties.description,
              coordinates: [lng, lat],
              visited: isVisited,
              metadata: {
                category: properties.category,
                funFact: properties.funFact,
                status: isVisited ? 'Discovered' : 'Locked'
              }
            })
          }
        })

        // Add map click listener to deselect when clicking empty space
        map.on('click', (e) => {
          // If clicking on nothing interactive
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['landmarks-layer', 'museums-layer', 'dmv-tree-points-layer']
          })
          
          if (features.length === 0 && selectedFeatureId !== null) {
            map.setFeatureState(
              { source: 'landmarks', id: selectedFeatureId },
              { selected: false }
            )
            selectedFeatureId = null
            if (onSelect) onSelect(null)
          }
        })

        // Change cursor on hover
        map.on('mouseenter', 'landmarks-layer', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'landmarks-layer', () => {
          map.getCanvas().style.cursor = ''
        })

        console.log('✅ Landmarks layer initialized with Selection System')
        isInitialized.current = true
      } catch (error) {
        console.error('❌ Error initializing LandmarksLayer:', error)
      }
    }

    initializeLayer()
  }, [map])

  // Update icon visibility based on visited status logic can remain similar...
  // (Omitted for brevity, but can be enhanced to update icon-image via style expression)

  // Toggle visibility
  useEffect(() => {
    if (!map || !isInitialized.current) return

    const visibility = visible ? 'visible' : 'none'
    if (map.getLayer('landmarks-layer')) {
      map.setLayoutProperty('landmarks-layer', 'visibility', visibility)
    }
  }, [map, visible])

  return null
}
