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

        // Load landmark icons from SVG files (bronze for unvisited, gold for visited)
        const loadIconFromSvg = async (iconName: string, svgPath: string): Promise<void> => {
          if (map.hasImage(iconName)) return

          return new Promise((resolve) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              const canvas = document.createElement('canvas')
              const iconSize = 96
              canvas.width = iconSize
              canvas.height = iconSize
              const ctx = canvas.getContext('2d')
              if (ctx) {
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                ctx.drawImage(img, 0, 0, iconSize, iconSize)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                if (!map.hasImage(iconName)) {
                  map.addImage(iconName, imageData, { sdf: false })
                }
                console.log(`✅ ${iconName} icon loaded`)
              }
              resolve()
            }
            img.onerror = () => {
              console.warn(`Failed to load ${iconName} icon`)
              resolve()
            }
            img.src = svgPath
          })
        }

        // Load both bronze (unvisited) and gold (visited) landmark icons
        await Promise.all([
          loadIconFromSvg('landmark-icon', '/icons/landmark.svg'),
          loadIconFromSvg('landmark-visited-icon', '/icons/landmark-visited.svg')
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
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#CD9B6A', // Light bronze for small clusters
                10,
                '#B87333', // Bronze for medium
                30,
                '#9A6B31'  // Dark bronze for large
              ],
              'circle-radius': [
                'step', ['get', 'point_count'],
                18,   // 18px for clusters with < 10 points
                10, 22,  // 22px for clusters with 10+ points
                30, 28   // 28px for clusters with 30+ points
              ],
              'circle-stroke-width': 3,
              'circle-stroke-color': '#FFFFFF'
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
              // Use data-driven icon-image based on visited property
              'icon-image': [
                'case',
                ['boolean', ['get', 'visited'], false],
                'landmark-visited-icon', // Gold icon for visited
                'landmark-icon'          // Bronze icon for unvisited
              ],
              'icon-size': [
                'interpolate', ['linear'], ['zoom'],
                8, 0.35,   // Visible at far zoom
                10, 0.45,
                12, 0.55,
                14, 0.65,
                16, 0.75,
                18, 0.85   // Full size when close
              ],
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'icon-pitch-alignment': 'viewport',
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

  // Update source data and icons based on visited status
  useEffect(() => {
    if (!map || !isInitialized.current) return

    const source = map.getSource('landmarks') as mapboxgl.GeoJSONSource
    if (!source) return

    // Fetch current data and update with visited status
    const updateVisitedStatus = async () => {
      try {
        const response = await fetch('/data/landmarks.geojson')
        const data = await response.json()

        // Update features with visited property
        const updatedFeatures = data.features.map((feature: any) => ({
          ...feature,
          properties: {
            ...feature.properties,
            visited: visitedLandmarks.has(feature.properties.id)
          }
        }))

        source.setData({
          type: 'FeatureCollection',
          features: updatedFeatures
        })

        console.log(`✅ Updated landmark visited status (${visitedLandmarks.size} visited)`)
      } catch (error) {
        console.warn('Failed to update landmark visited status:', error)
      }
    }

    updateVisitedStatus()
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

