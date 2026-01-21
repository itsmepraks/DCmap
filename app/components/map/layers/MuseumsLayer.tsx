'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'
import mapboxgl, { type SymbolLayout, type SymbolPaint, type CirclePaint } from 'mapbox-gl'
import type { MuseumProperties } from '@/app/types/map'
import type { SelectedEntity } from '@/app/components/ui/EntityInfoPanel'

interface MuseumsLayerProps {
  visible: boolean
  onSelect?: (entity: SelectedEntity | null) => void
  onMuseumDiscovered?: (id: string, data: any) => void
}

const LAYER_ID = 'museums-layer'
const CLUSTER_LAYER_ID = 'museums-clusters'
const CLUSTER_COUNT_LAYER_ID = 'museums-cluster-count'
const SOURCE_ID = 'museums-source'

export default function MuseumsLayer({ visible, onSelect, onMuseumDiscovered }: MuseumsLayerProps) {
  const { map } = useMap()
  const layerInitialized = useRef(false)
  const handlersRef = useRef<{
    click?: (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => void
    clusterClick?: (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => void
    mouseEnter?: () => void
    mouseLeave?: () => void
  }>({})

  // Track selected feature ID locally
  const selectedIdRef = useRef<string | number | null>(null)

  // Store visible prop in ref for use during initialization
  const visibleRef = useRef(visible)
  useEffect(() => {
    visibleRef.current = visible
  }, [visible])

  useEffect(() => {
    if (!map) {
      return
    }

    if (layerInitialized.current) {
      return
    }

    console.log('🏛️ Initializing museums layer with clustering...')

    const handleClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return

      const feature = e.features[0]
      const properties = feature.properties as MuseumProperties

      // Skip if this is a cluster (shouldn't happen due to layer filter, but defensive check)
      if ('point_count' in properties) {
        return // Handled by clusterClick
      }

      const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number]

      e.originalEvent.stopPropagation()

      // Update selection state
      if (selectedIdRef.current !== null) {
        map.setFeatureState(
          { source: SOURCE_ID, id: selectedIdRef.current },
          { selected: false }
        )
      }

      if (feature.id !== undefined) {
        selectedIdRef.current = feature.id
        map.setFeatureState(
          { source: SOURCE_ID, id: feature.id },
          { selected: true }
        )
      }

      // Use name as ID for consistency with MuseumExplorer which loads from GeoJSON directly
      const museumId = properties.NAME ? String(properties.NAME) : String(feature.id);

      // Notify parent
      if (onSelect) {
        onSelect({
          id: museumId,
          type: 'museum',
          name: properties.NAME,
          description: properties.DESCRIPTION,
          coordinates: coordinates,
          metadata: {
            address: properties.ADDRESS,
            phone: properties.PHONE,
            url: properties.URL
          }
        })
      }

      // Mark as discovered/visited
      if (onMuseumDiscovered) {
        onMuseumDiscovered(museumId, {
          name: properties.NAME,
          type: 'museum'
        })
      }
    }

    const handleClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return

      const feature = e.features[0]
      const clusterId = feature.properties?.cluster_id

      if (!clusterId) return

      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !zoom) return

        map.easeTo({
          center: (feature.geometry as any).coordinates,
          zoom: zoom + 1 // Zoom in slightly past the expansion zoom
        })
      })
    }

    const initializeLayer = async () => {
      try {
        // Load custom bronze museum icon (SVG for proper transparency)
        if (!map.hasImage('museum-icon')) {
          const iconImage = await loadImage('/icons/museum.svg')
          // Render at good size for crisp display
          const canvas = document.createElement('canvas')
          const iconSize = 96 // Good balance of quality and performance
          canvas.width = iconSize
          canvas.height = iconSize
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            ctx.drawImage(iconImage, 0, 0, iconSize, iconSize)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            map.addImage('museum-icon', imageData, { sdf: false })
            console.log('✅ Bronze museum icon loaded at 96x96 size')
          } else {
            // Fallback if canvas context fails
            map.addImage('museum-icon', iconImage)
          }
        }

        // Fetch museums GeoJSON data
        const response = await fetch('/data/museums.geojson')
        if (!response.ok) {
          throw new Error(`Failed to fetch museums.geojson: ${response.status}`)
        }
        const data = await response.json()

        // Add source with clustering
        if (!map.getSource(SOURCE_ID)) {
          map.addSource(SOURCE_ID, {
            type: 'geojson',
            data: data,
            generateId: true, // Critical for feature-state
            cluster: true,
            clusterMaxZoom: 15, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
          })
        }

        // Get initial visibility - HIDDEN by default unless explicitly visible
        const initialVisibility = visibleRef.current ? 'visible' : 'none'

        // 1. Clusters Layer (Circles)
        if (!map.getLayer(CLUSTER_LAYER_ID)) {
          map.addLayer({
            id: CLUSTER_LAYER_ID,
            type: 'circle',
            source: SOURCE_ID,
            filter: ['has', 'point_count'],
            layout: {
              'visibility': initialVisibility
            },
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#CD9B6A', // Light bronze for small clusters
                5,
                '#B87333', // Bronze for medium
                10,
                '#9A6B31'  // Dark bronze for large
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                15, // radius
                5,
                20,
                10,
                25
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#FFF'
            }
          })
        }

        // 2. Cluster Count Layer (Text) - only add if style has glyphs
        const styleHasGlyphsForCluster = Boolean(map.getStyle()?.glyphs)
        if (!map.getLayer(CLUSTER_COUNT_LAYER_ID) && styleHasGlyphsForCluster) {
          map.addLayer({
            id: CLUSTER_COUNT_LAYER_ID,
            type: 'symbol',
            source: SOURCE_ID,
            filter: ['has', 'point_count'],
            layout: {
              'visibility': initialVisibility,
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            },
            paint: {
              'text-color': '#FFF'
            }
          })
        }

        // 3. Unclustered Point Layer (Museum Icons)
        if (!map.getLayer(LAYER_ID)) {
          const styleHasGlyphs = Boolean(map.getStyle()?.glyphs)

          const layout: SymbolLayout = {
            'icon-image': 'museum-icon',
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8, 0.35,   // Visible at far zoom
              10, 0.45,
              12, 0.55,
              14, 0.65,
              16, 0.75,
              18, 0.85   // Full size when close
            ],
            'icon-allow-overlap': true, // Always show museums
            'icon-ignore-placement': true, // Make sure they are always visible
            'icon-pitch-alignment': 'viewport',
            'visibility': initialVisibility
          }

          const paint: SymbolPaint = {
            'icon-opacity': 1,
            'icon-halo-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#FFD700', // Gold select halo
              'rgba(255, 255, 255, 0.8)'  // White halo for separation
            ],
            'icon-halo-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              6,
              2
            ],
            'icon-halo-blur': 1
          }

          if (styleHasGlyphs) {
            layout['text-field'] = ['get', 'NAME']
            layout['text-font'] = ['Open Sans Bold', 'Arial Unicode MS Bold']
            layout['text-size'] = 11
            layout['text-offset'] = [0, 2]
            layout['text-anchor'] = 'top'

            // HIDE labels at lower zoom levels entirely to reduce clutter
            // Only show labels when zoomed in significantly
            layout['text-variable-anchor'] = ['top', 'bottom', 'left', 'right']
            layout['text-radial-offset'] = 0.5
            layout['text-justify'] = 'auto'

            // Use an expression to hide text based on zoom
            paint['text-opacity'] = [
              'interpolate',
              ['linear'],
              ['zoom'],
              13, 0,    // Fully transparent below zoom 13
              14, 0,
              15, 1     // Visible at zoom 15+
            ]

            paint['text-color'] = '#4A3728' // Darker brown for text
            paint['text-halo-color'] = '#FFFFFF'
            paint['text-halo-width'] = 2
          }

          map.addLayer({
            id: LAYER_ID,
            type: 'symbol',
            source: SOURCE_ID,
            filter: ['!', ['has', 'point_count']], // Only show unclustered points
            layout,
            paint
          })
        }

        // Handlers
        handlersRef.current.click = handleClick
        handlersRef.current.clusterClick = handleClusterClick

        map.on('click', LAYER_ID, handlersRef.current.click)
        map.on('click', CLUSTER_LAYER_ID, handlersRef.current.clusterClick)

        // Cursor logic
        const onMouseEnter = () => { map.getCanvas().style.cursor = 'pointer' }
        const onMouseLeave = () => { map.getCanvas().style.cursor = '' }

        handlersRef.current.mouseEnter = onMouseEnter
        handlersRef.current.mouseLeave = onMouseLeave

        map.on('mouseenter', LAYER_ID, onMouseEnter)
        map.on('mouseleave', LAYER_ID, onMouseLeave)
        map.on('mouseenter', CLUSTER_LAYER_ID, onMouseEnter)
        map.on('mouseleave', CLUSTER_LAYER_ID, onMouseLeave)

        layerInitialized.current = true
        console.log(`✅ Museums layer initialized (visibility: ${initialVisibility})`)

      } catch (error) {
        console.error('❌ Error initializing museums layer:', error)
      }
    }

    initializeLayer()

    const handlers = handlersRef.current

    return () => {
      if (map && layerInitialized.current) {
        if (handlers.click) map.off('click', LAYER_ID, handlers.click)
        if (handlers.clusterClick) map.off('click', CLUSTER_LAYER_ID, handlers.clusterClick)

        if (handlers.mouseEnter) {
          map.off('mouseenter', LAYER_ID, handlers.mouseEnter)
          map.off('mouseenter', CLUSTER_LAYER_ID, handlers.mouseEnter)
        }
        if (handlers.mouseLeave) {
          map.off('mouseleave', LAYER_ID, handlers.mouseLeave)
          map.off('mouseleave', CLUSTER_LAYER_ID, handlers.mouseLeave)
        }
      }
    }
  }, [map, visible, onSelect, onMuseumDiscovered])

  // Update visibility
  useEffect(() => {
    if (!map || !layerInitialized.current) return

    const visibility = visible ? 'visible' : 'none'
    const layers = [LAYER_ID, CLUSTER_LAYER_ID, CLUSTER_COUNT_LAYER_ID]

    layers.forEach(layer => {
      if (map.getLayer(layer)) {
        map.setLayoutProperty(layer, 'visibility', visibility)
      }
    })
  }, [map, visible])

  return null
}

// Helper function to load image
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}
