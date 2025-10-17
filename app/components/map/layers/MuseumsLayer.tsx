'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'
import mapboxgl from 'mapbox-gl'
import type { MuseumProperties } from '@/app/types/map'

interface MuseumsLayerProps {
  visible: boolean
}

const LAYER_ID = 'museums-layer'
const SOURCE_ID = 'museums-source'

export default function MuseumsLayer({ visible }: MuseumsLayerProps) {
  const { map } = useMap()
  const layerInitialized = useRef(false)
  const popupRef = useRef<mapboxgl.Popup | null>(null)

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

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      // Create popup HTML
      const popupHTML = `
        <div class="museum-popup">
          <h3 class="text-base font-bold text-gray-900 mb-2">${properties.NAME}</h3>
          ${properties.ADDRESS ? `<p class="text-xs text-gray-600 mb-2">${properties.ADDRESS}</p>` : ''}
          ${properties.DESCRIPTION ? `<p class="text-sm text-gray-700">${properties.DESCRIPTION}</p>` : ''}
        </div>
      `

      // Remove existing popup if any
      if (popupRef.current) {
        popupRef.current.remove()
      }

      // Create and show new popup
      popupRef.current = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: '300px',
      })
        .setLngLat(coordinates)
        .setHTML(popupHTML)
        .addTo(map!)
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
          })
          console.log('✅ Museums source added')
        }

        // Add layer
        if (!map.getLayer(LAYER_ID)) {
          map.addLayer({
            id: LAYER_ID,
            type: 'symbol',
            source: SOURCE_ID,
            layout: {
              'icon-image': 'museum-icon',
              'icon-size': 1,
              'icon-allow-overlap': true,
              visibility: visible ? 'visible' : 'none',
            },
          })
          console.log('✅ Museums layer added with visibility:', visible ? 'visible' : 'none')
        }

        // Add click handler for popups
        map.on('click', LAYER_ID, handleClick)

        // Change cursor on hover
        map.on('mouseenter', LAYER_ID, () => {
          map.getCanvas().style.cursor = 'pointer'
        })

        map.on('mouseleave', LAYER_ID, () => {
          map.getCanvas().style.cursor = ''
        })

        layerInitialized.current = true
        console.log('✅ Museums layer fully initialized!')
      } catch (error) {
        console.error('❌ Error initializing museums layer:', error)
      }
    }

    initializeLayer()

    return () => {
      if (map && layerInitialized.current) {
        map.off('click', LAYER_ID, handleClick)
        map.off('mouseenter', LAYER_ID, () => {})
        map.off('mouseleave', LAYER_ID, () => {})

        if (popupRef.current) {
          popupRef.current.remove()
        }
      }
    }
  }, [map, visible])

  // Update visibility when prop changes
  useEffect(() => {
    if (!map || !layerInitialized.current) return

    if (map.getLayer(LAYER_ID)) {
      const visibility = visible ? 'visible' : 'none'
      console.log('🏛️ Updating museums visibility to:', visibility)
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

