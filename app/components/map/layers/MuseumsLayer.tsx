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
  const handlersRef = useRef<{
    click?: (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => void
    mouseEnter?: () => void
    mouseLeave?: () => void
  }>({})

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

      // Create popup HTML with bold styling
      const popupHTML = `
        <div class="popup-wrapper" style="padding: 0; margin: -15px; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #5DA5DB 0%, #3A7CA5 100%); padding: 16px; border-bottom: 3px solid #3A7CA5;">
            <h3 style="margin: 0; color: white; font-size: 18px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              🏛️ ${properties.NAME}
            </h3>
          </div>
          <div style="padding: 16px; background: white;">
            ${properties.ADDRESS ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #8D7B68; font-size: 12px; font-weight: 600; text-transform: uppercase;">Address</span>
                <p style="margin: 4px 0 0 0; color: #2C1810; font-size: 14px; font-weight: 500;">${properties.ADDRESS}</p>
              </div>
            ` : ''}
            ${properties.DESCRIPTION ? `
              <div>
                <span style="color: #8D7B68; font-size: 12px; font-weight: 600; text-transform: uppercase;">About</span>
                <p style="margin: 4px 0 0 0; color: #2C1810; font-size: 14px; line-height: 1.5;">${properties.DESCRIPTION}</p>
              </div>
            ` : ''}
          </div>
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
        maxWidth: '340px',
        className: 'custom-popup'
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
        handlersRef.current.click = handleClick
        map.on('click', LAYER_ID, handlersRef.current.click)

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
        console.log('✅ Museums layer fully initialized!')
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

