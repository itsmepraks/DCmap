'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import type { SelectedEntity } from '@/app/components/ui/EntityInfoPanel'
import { calculateDistance } from '@/app/lib/proximity'

interface LandmarksLayerProps {
  map: mapboxgl.Map | null
  visible: boolean
  visitedLandmarks: Set<string>
  onLandmarkDiscovered?: (landmarkId: string, landmarkData: any) => void
  onSelect?: (entity: SelectedEntity | null) => void
  playerPosition?: { lng: number; lat: number } | null
}

// Clean Google Maps-style colors
const COLORS = {
  unvisited: '#EA4335',      // Google Red
  visited: '#34A853',        // Google Green
  nearby: '#FBBC04',         // Google Yellow (for proximity highlight)
  cluster: '#4285F4',        // Google Blue
  white: '#FFFFFF',
  textDark: '#202124'
}

export default function LandmarksLayer({
  map,
  visible,
  visitedLandmarks,
  onLandmarkDiscovered,
  onSelect,
  playerPosition
}: LandmarksLayerProps) {
  const isInitialized = useRef(false)
  const onLandmarkDiscoveredRef = useRef(onLandmarkDiscovered)
  const onSelectRef = useRef(onSelect)
  const visitedLandmarksRef = useRef(visitedLandmarks)
  const playerPositionRef = useRef(playerPosition)

  useEffect(() => {
    onLandmarkDiscoveredRef.current = onLandmarkDiscovered
    onSelectRef.current = onSelect
    visitedLandmarksRef.current = visitedLandmarks
    playerPositionRef.current = playerPosition
  }, [onLandmarkDiscovered, onSelect, visitedLandmarks, playerPosition])

  useEffect(() => {
    if (!map || isInitialized.current) return

    const initializeLayer = async () => {
      try {
        if (!map.isStyleLoaded()) {
          map.once('idle', () => initializeLayer())
          return
        }

        // Ensure style is accessible
        if (!map.getStyle()) {
          console.warn('LandmarksLayer: Style not accessible, waiting...')
          map.once('idle', () => initializeLayer())
          return
        }

        // Create clean SVG pin icons
        const createPinIcon = (color: string, hasCheckmark: boolean = false): HTMLImageElement => {
          const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.3"/>
                </filter>
              </defs>
              <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z" 
                    fill="${color}" filter="url(#shadow)"/>
              <circle cx="14" cy="14" r="5" fill="${COLORS.white}"/>
              ${hasCheckmark ? `<text x="14" y="17" text-anchor="middle" font-size="8" font-weight="bold" fill="${color}">✓</text>` : ''}
            </svg>
          `
          const img = new Image(28, 40)
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
          return img
        }

        // Create small dot icon for low zoom
        const createDotIcon = (color: string): HTMLImageElement => {
          const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
              <circle cx="6" cy="6" r="5" fill="${color}" stroke="${COLORS.white}" stroke-width="2"/>
            </svg>
          `
          const img = new Image(12, 12)
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
          return img
        }

        // Create cluster icon
        const createClusterIcon = (count: number): HTMLImageElement => {
          const size = Math.min(50, 30 + count * 2)
          const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
              <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${COLORS.cluster}" stroke="${COLORS.white}" stroke-width="3"/>
              <text x="${size / 2}" y="${size / 2 + 4}" text-anchor="middle" font-size="14" font-weight="bold" fill="${COLORS.white}">${count}</text>
            </svg>
          `
          const img = new Image(size, size)
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
          return img
        }

        // Load icons into map
        const loadIcon = (name: string, img: HTMLImageElement): Promise<void> => {
          return new Promise((resolve) => {
            if (map.hasImage(name)) {
              resolve()
              return
            }
            img.onload = () => {
              if (!map.hasImage(name)) {
                map.addImage(name, img)
              }
              resolve()
            }
            img.onerror = () => resolve()
          })
        }

        await Promise.all([
          loadIcon('pin-unvisited', createPinIcon(COLORS.unvisited, false)),
          loadIcon('pin-visited', createPinIcon(COLORS.visited, true)),
          loadIcon('pin-nearby', createPinIcon(COLORS.nearby, false)),
          loadIcon('dot-unvisited', createDotIcon(COLORS.unvisited)),
          loadIcon('dot-visited', createDotIcon(COLORS.visited))
        ])

        // Load landmarks data
        const response = await fetch('/data/landmarks.geojson')
        const landmarksData = await response.json()

        // Add source with clustering enabled
        if (!map.getSource('landmarks')) {
          map.addSource('landmarks', {
            type: 'geojson',
            data: landmarksData,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
            generateId: true
          })
        }

        // Layer 1: Clusters (only visible at low zoom)
        if (!map.getLayer('landmarks-clusters')) {
          map.addLayer({
            id: 'landmarks-clusters',
            type: 'circle',
            source: 'landmarks',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': COLORS.cluster,
              'circle-radius': [
                'step', ['get', 'point_count'],
                18,   // 18px for clusters with < 10 points
                10, 22,  // 22px for clusters with 10+ points
                30, 28   // 28px for clusters with 30+ points
              ],
              'circle-stroke-width': 3,
              'circle-stroke-color': COLORS.white
            }
          })
        }

        // Layer 2: Cluster count labels
        if (!map.getLayer('landmarks-cluster-count')) {
          map.addLayer({
            id: 'landmarks-cluster-count',
            type: 'symbol',
            source: 'landmarks',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 13,
              'text-allow-overlap': true
            },
            paint: {
              'text-color': COLORS.white
            }
          })
        }

        // Layer 3: Individual landmarks (unclustered points)
        if (!map.getLayer('landmarks-layer')) {
          map.addLayer({
            id: 'landmarks-layer',
            type: 'symbol',
            source: 'landmarks',
            filter: ['!', ['has', 'point_count']],
            layout: {
              'icon-image': 'pin-unvisited',
              'icon-size': [
                'interpolate', ['linear'], ['zoom'],
                10, 0.4,   // Small at far zoom
                14, 0.7,   // Medium
                18, 1.0    // Full size when close
              ],
              'icon-allow-overlap': true,
              'icon-anchor': 'bottom',
              // Show text only at higher zoom levels
              'text-field': [
                'step', ['zoom'],
                '',      // No text below zoom 15
                15, ['get', 'name']  // Show name at zoom 15+
              ],
              'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
              'text-size': [
                'interpolate', ['linear'], ['zoom'],
                15, 10,
                18, 12
              ],
              'text-offset': [0, 0.8],
              'text-anchor': 'top',
              'text-max-width': 10,
              'text-optional': true
            },
            paint: {
              'text-color': COLORS.textDark,
              'text-halo-color': COLORS.white,
              'text-halo-width': 1.5,
              'icon-opacity': 1
            }
          })
        }

        // Click handler for clusters - zoom in
        map.on('click', 'landmarks-clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['landmarks-clusters']
          })
          if (!features.length) return

          const clusterId = features[0].properties?.cluster_id
          const source = map.getSource('landmarks') as mapboxgl.GeoJSONSource

          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || zoom === null || zoom === undefined) return
            map.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom
            })
          })
        })

        // Global selected ID tracking
        let selectedFeatureId: string | number | null = null

        // Click handler for individual landmarks
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

          e.originalEvent.stopPropagation()

          const coordinates = (feature.geometry as any).coordinates.slice()
          const [lng, lat] = coordinates
          const isVisited = visitedLandmarksRef.current.has(properties.id)

          // Check discovery
          if (!isVisited && onLandmarkDiscoveredRef.current) {
            const center = map.getCenter()
            const distance = calculateDistance(
              [center.lng, center.lat],
              [lng, lat]
            )

            if (distance <= 50) {
              onLandmarkDiscoveredRef.current(properties.id, properties)
            }
          }

          console.log(`📍 Selected landmark: ${properties.name}`)

          if (onSelectRef.current) {
            onSelectRef.current({
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

        // Deselect on map click
        map.on('click', (e) => {
          const availableLayers = ['landmarks-layer', 'landmarks-clusters', 'museums-layer'].filter(
            layerId => map.getLayer(layerId)
          )

          if (availableLayers.length === 0) return

          const features = map.queryRenderedFeatures(e.point, {
            layers: availableLayers
          })

          if (features.length === 0 && selectedFeatureId !== null) {
            map.setFeatureState(
              { source: 'landmarks', id: selectedFeatureId },
              { selected: false }
            )
            selectedFeatureId = null
            if (onSelectRef.current) onSelectRef.current(null)
          }
        })

        // Cursor changes
        map.on('mouseenter', 'landmarks-layer', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'landmarks-layer', () => {
          map.getCanvas().style.cursor = ''
        })
        map.on('mouseenter', 'landmarks-clusters', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'landmarks-clusters', () => {
          map.getCanvas().style.cursor = ''
        })

        console.log('✅ Dynamic landmarks layer initialized')
        isInitialized.current = true
      } catch (error) {
        console.error('❌ Error initializing LandmarksLayer:', error)
      }
    }

    initializeLayer()
  }, [map])

  // Update icon images based on visited status
  useEffect(() => {
    if (!map || !isInitialized.current) return

    // Update layer to use different icons based on visited status
    // This would require re-filtering the data or using data-driven styling
    // For now, we'll use a simpler approach with feature-state

  }, [map, visitedLandmarks])

  // Toggle visibility
  useEffect(() => {
    if (!map || !isInitialized.current) return

    const visibility = visible ? 'visible' : 'none'
    const layers = ['landmarks-layer', 'landmarks-clusters', 'landmarks-cluster-count']

    layers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visibility)
      }
    })
  }, [map, visible])

  return null
}

