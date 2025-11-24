'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'
import mapboxgl, { type SymbolLayout, type SymbolPaint } from 'mapbox-gl'
import type { MuseumProperties } from '@/app/types/map'
import type { SelectedEntity } from '@/app/components/ui/EntityInfoPanel'

interface MuseumsLayerProps {
  visible: boolean
  onSelect?: (entity: SelectedEntity | null) => void
}

const LAYER_ID = 'museums-layer'
const SOURCE_ID = 'museums-source'

export default function MuseumsLayer({ visible, onSelect }: MuseumsLayerProps) {
  const { map } = useMap()
  const layerInitialized = useRef(false)
  const handlersRef = useRef<{
    click?: (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => void
    mouseEnter?: () => void
    mouseLeave?: () => void
  }>({})

  // Track selected feature ID locally to handle deselect logic if needed, 
  // though mapbox feature-state is the source of truth for visual rendering.
  const selectedIdRef = useRef<string | number | null>(null)

  useEffect(() => {
    if (!map) {
      console.log('🏛️ Museums layer waiting for map...')
      return
    }
    
    if (layerInitialized.current) {
      console.log('🏛️ Museums layer already initialized')
      return
    }

    console.log('🏛️ Initializing museums layer...')

    const handleClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return

      const feature = e.features[0]
      const properties = feature.properties as MuseumProperties
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

      // Notify parent
      if (onSelect) {
        onSelect({
          id: String(feature.id || properties.NAME),
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
    }

    const initializeLayer = async () => {
      try {
        console.log('🏛️ Loading museum icon...')
        // Load custom museum icon
        const iconImage = await loadImage('/icons/museum.svg')
        if (!map.hasImage('museum-icon')) {
          map.addImage('museum-icon', iconImage)
          console.log('✅ Museum icon loaded')
        }

        console.log('🏛️ Fetching museums GeoJSON...')
        // Fetch museums GeoJSON data
        const response = await fetch('/data/museums.geojson')
        if (!response.ok) {
          throw new Error(`Failed to fetch museums.geojson: ${response.status}`)
        }
        const data = await response.json()
        console.log('✅ Museums data loaded:', data.features?.length, 'features')

        // Add source
        if (!map.getSource(SOURCE_ID)) {
          map.addSource(SOURCE_ID, {
            type: 'geojson',
            data: data,
            generateId: true // Critical for feature-state
          })
          console.log('✅ Museums source added')
        }

        // Add layer with enhanced 3D visibility
        if (!map.getLayer(LAYER_ID)) {
          const styleHasGlyphs = Boolean(map.getStyle()?.glyphs)

          const layout: SymbolLayout = {
            'icon-image': 'museum-icon',
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 0.8,
              14, 1.5,
              18, 2.5
            ],
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-pitch-alignment': 'viewport',
            visibility: 'none'
          }

          const paint: SymbolPaint = {
            'icon-opacity': 1,
            'icon-halo-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#FFD700', // Gold select halo
              '#5DA5DB'  // Default blue halo
            ],
            'icon-halo-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              6, // Thicker select halo
              3
            ],
            'icon-halo-blur': 2
          }

          if (styleHasGlyphs) {
            layout['text-field'] = ['get', 'NAME']
            layout['text-font'] = ['Open Sans Bold', 'Arial Unicode MS Bold']
            layout['text-size'] = [
              'interpolate',
              ['linear'],
              ['zoom'],
              10,
              0,
              14,
              12,
              18,
              16
            ]
            layout['text-offset'] = [0, 2]
            layout['text-anchor'] = 'top'
            layout['text-optional'] = true

            paint['text-color'] = '#2C1810'
            paint['text-halo-color'] = '#FFFFFF'
            paint['text-halo-width'] = 3
            paint['text-halo-blur'] = 1
          }

          map.addLayer({
            id: LAYER_ID,
            type: 'symbol',
            source: SOURCE_ID,
            layout,
            paint
          })
          console.log('✅ Museums layer added with Selection System')
        }

        // Add click handler for popups
        handlersRef.current.click = handleClick
        map.on('click', LAYER_ID, handlersRef.current.click)

        // Deselect on map background click
        map.on('click', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_ID] })
          if (features.length === 0 && selectedIdRef.current !== null) {
            map.setFeatureState(
              { source: SOURCE_ID, id: selectedIdRef.current },
              { selected: false }
            )
            selectedIdRef.current = null
            // We rely on the page/parent to handle null selection via its own map click handler 
            // or we can call onSelect(null) here if we want this layer to drive deselection explicitly
            // but usually it's better if one central handler does the "nothing clicked" logic.
          }
        })

        // Change cursor on hover
        handlersRef.current.mouseEnter = () => {
          map.getCanvas().style.cursor = 'pointer'
        }
        handlersRef.current.mouseLeave = () => {
          map.getCanvas().style.cursor = ''
        }
        map.on('mouseenter', LAYER_ID, handlersRef.current.mouseEnter)
        map.on('mouseleave', LAYER_ID, handlersRef.current.mouseLeave)

        layerInitialized.current = true
      } catch (error) {
        console.error('❌ Error initializing museums layer:', error)
      }
    }

    initializeLayer()

    return () => {
      if (map && layerInitialized.current) {
        if (handlersRef.current.click) {
          map.off('click', LAYER_ID, handlersRef.current.click)
        }
        if (handlersRef.current.mouseEnter) {
          map.off('mouseenter', LAYER_ID, handlersRef.current.mouseEnter)
        }
        if (handlersRef.current.mouseLeave) {
          map.off('mouseleave', LAYER_ID, handlersRef.current.mouseLeave)
        }
      }
    }
  }, [map, visible])

  // Update visibility when prop changes
  useEffect(() => {
    if (!map || !layerInitialized.current) return

    if (map.getLayer(LAYER_ID)) {
      const visibility = visible ? 'visible' : 'none'
      map.setLayoutProperty(
        LAYER_ID,
        'visibility',
        visibility
      )
    }
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
