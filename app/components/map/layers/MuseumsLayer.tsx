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
      
      // Handle cluster click (zoom in)
      if (properties.cluster) {
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
        // Load custom museum icon
        const iconImage = await loadImage('/icons/museum.svg')
        if (!map.hasImage('museum-icon')) {
          map.addImage('museum-icon', iconImage)
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

        // 1. Clusters Layer (Circles)
        if (!map.getLayer(CLUSTER_LAYER_ID)) {
          map.addLayer({
            id: CLUSTER_LAYER_ID,
            type: 'circle',
            source: SOURCE_ID,
            filter: ['has', 'point_count'],
            paint: {
              // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
              // with three steps to implement three types of circles:
              //   * Blue, 20px circles when point count is less than 5
              //   * Yellow, 30px circles when point count is between 5 and 10
              //   * Pink, 40px circles when point count is greater than or equal to 10
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#B4A088', // Beige/Brown for small clusters
                5,
                '#A0522D', // Sienna for medium
                10,
                '#8B4513'  // SaddleBrown for large
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

        // 2. Cluster Count Layer (Text)
        if (!map.getLayer(CLUSTER_COUNT_LAYER_ID)) {
          map.addLayer({
            id: CLUSTER_COUNT_LAYER_ID,
            type: 'symbol',
            source: SOURCE_ID,
            filter: ['has', 'point_count'],
            layout: {
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
              8, 0.4,
              12, 0.6,
              16, 0.8, // Reduced max size for cleaner look
              20, 1.0
            ],
            'icon-allow-overlap': true, // Allow overlap to ensure they show up
            'icon-ignore-placement': false, // Respect other icons to reduce clutter
            'icon-pitch-alignment': 'viewport',
            visibility: 'none'
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
        console.log('✅ Museums layer initialized with clusters')

      } catch (error) {
        console.error('❌ Error initializing museums layer:', error)
      }
    }

    initializeLayer()

    return () => {
      if (map && layerInitialized.current) {
        if (handlersRef.current.click) map.off('click', LAYER_ID, handlersRef.current.click)
        if (handlersRef.current.clusterClick) map.off('click', CLUSTER_LAYER_ID, handlersRef.current.clusterClick)
        
        if (handlersRef.current.mouseEnter) {
          map.off('mouseenter', LAYER_ID, handlersRef.current.mouseEnter)
          map.off('mouseenter', CLUSTER_LAYER_ID, handlersRef.current.mouseEnter)
        }
        if (handlersRef.current.mouseLeave) {
          map.off('mouseleave', LAYER_ID, handlersRef.current.mouseLeave)
          map.off('mouseleave', CLUSTER_LAYER_ID, handlersRef.current.mouseLeave)
        }
      }
    }
  }, [map, visible, onSelect])

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
