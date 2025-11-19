'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'
import mapboxgl, { type SymbolLayout, type SymbolPaint } from 'mapbox-gl'
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

      // Create rich museum popup with Minecraft theme
      const popupHTML = `
        <div class="popup-wrapper" style="
          padding: 0; 
          margin: -15px; 
          border-radius: 8px; 
          overflow: hidden;
          font-family: monospace;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          border: 3px solid #5DA5DB;
          background: linear-gradient(145deg, #EFE6D5 0%, #F5EBD9 100%);
          min-width: 320px;
        ">
          <!-- Pixelated corners -->
          <div style="position: absolute; top: 0; left: 0; width: 2px; height: 2px; background: rgba(0,0,0,0.4);"></div>
          <div style="position: absolute; top: 0; right: 0; width: 2px; height: 2px; background: rgba(0,0,0,0.4);"></div>
          <div style="position: absolute; bottom: 0; left: 0; width: 2px; height: 2px; background: rgba(0,0,0,0.4);"></div>
          <div style="position: absolute; bottom: 0; right: 0; width: 2px; height: 2px; background: rgba(0,0,0,0.4);"></div>
          
          <!-- Header -->
          <div style="
            background: linear-gradient(135deg, #5DA5DB 0%, #3A7CA5 100%); 
            padding: 16px; 
            border-bottom: 4px solid #3A7CA5;
            position: relative;
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                🏛️
              </div>
              <div style="flex: 1;">
                <h3 style="
                  margin: 0 0 4px 0; 
                  color: white; 
                  font-size: 16px; 
                  font-weight: bold; 
                  text-shadow: 2px 2px 0 rgba(0,0,0,0.3);
                  font-family: monospace;
                  line-height: 1.3;
                ">
                  ${properties.NAME}
                </h3>
                <div style="
                  display: inline-block;
                  padding: 2px 8px;
                  background: rgba(255,255,255,0.2);
                  border-radius: 4px;
                  font-size: 10px;
                  color: rgba(255,255,255,0.9);
                  font-weight: bold;
                  text-transform: uppercase;
                ">
                  Museum
                </div>
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 16px; background: linear-gradient(145deg, #F5EBD9 0%, #EFE6D5 100%);">
            ${properties.ADDRESS ? `
              <!-- Address Section -->
              <div style="margin-bottom: 12px;">
                <div style="
                  font-size: 10px; 
                  font-weight: bold; 
                  color: #8B7355; 
                  text-transform: uppercase; 
                  margin-bottom: 6px;
                  font-family: monospace;
                ">
                  📍 Location
                </div>
                <p style="
                  margin: 0; 
                  color: #2C1810; 
                  font-size: 13px; 
                  line-height: 1.6;
                  font-family: monospace;
                  font-weight: 500;
                ">
                  ${properties.ADDRESS}
                </p>
              </div>
            ` : ''}
            
            ${properties.DESCRIPTION ? `
              <!-- Description Section -->
              <div style="
                padding: 12px; 
                background: linear-gradient(135deg, rgba(93, 165, 219, 0.15) 0%, rgba(58, 124, 165, 0.1) 100%); 
                border-left: 4px solid #5DA5DB; 
                border-radius: 4px;
                margin-bottom: 12px;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
              ">
                <div style="
                  font-size: 10px; 
                  font-weight: bold; 
                  color: #3A7CA5; 
                  text-transform: uppercase; 
                  margin-bottom: 4px;
                  font-family: monospace;
                ">
                  📖 About This Museum
                </div>
                <p style="
                  margin: 0; 
                  color: #2C1810; 
                  font-size: 12px; 
                  line-height: 1.6;
                  font-family: monospace;
                ">
                  ${properties.DESCRIPTION}
                </p>
              </div>
            ` : ''}
            
            <!-- Info Grid -->
            <div style="
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              margin-bottom: 12px;
            ">
              <!-- Admission Info -->
              <div style="
                padding: 8px;
                background: linear-gradient(135deg, rgba(126, 217, 87, 0.2) 0%, rgba(93, 160, 64, 0.1) 100%);
                border: 2px solid #7ED957;
                border-radius: 4px;
                text-align: center;
              ">
                <div style="font-size: 18px; margin-bottom: 4px;">🎫</div>
                <div style="
                  font-size: 9px;
                  font-weight: bold;
                  color: #5DA040;
                  font-family: monospace;
                ">
                  FREE ENTRY
                </div>
              </div>
              
              <!-- Hours Info -->
              <div style="
                padding: 8px;
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.1) 100%);
                border: 2px solid #FFD700;
                border-radius: 4px;
                text-align: center;
              ">
                <div style="font-size: 18px; margin-bottom: 4px;">🕐</div>
                <div style="
                  font-size: 9px;
                  font-weight: bold;
                  color: #B8860B;
                  font-family: monospace;
                ">
                  10AM-5PM
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            ">
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}" 
                target="_blank"
                style="
                  padding: 8px;
                  background: linear-gradient(135deg, #7ED957 0%, #5DA040 100%);
                  border: 2px solid #5DA040;
                  border-radius: 4px;
                  box-shadow: 0 3px 0 #5DA040, 0 4px 8px rgba(0,0,0,0.2);
                  color: #FFF;
                  font-family: monospace;
                  font-weight: bold;
                  font-size: 11px;
                  cursor: pointer;
                  text-decoration: none;
                  text-align: center;
                  text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
                  display: block;
                ">
                🧭 Directions
              </a>
              
              <a 
                href="https://www.google.com/search?q=${encodeURIComponent(properties.NAME + ' DC')}" 
                target="_blank"
                style="
                  padding: 8px;
                  background: linear-gradient(135deg, #5DA5DB 0%, #3A7CA5 100%);
                  border: 2px solid #3A7CA5;
                  border-radius: 4px;
                  box-shadow: 0 3px 0 #3A7CA5, 0 4px 8px rgba(0,0,0,0.2);
                  color: #FFF;
                  font-family: monospace;
                  font-weight: bold;
                  font-size: 11px;
                  cursor: pointer;
                  text-decoration: none;
                  text-align: center;
                  text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
                  display: block;
                ">
                🔍 Learn More
              </a>
            </div>
            
            <!-- Visit Tip -->
            <div style="
              margin-top: 12px;
              padding: 8px;
              background: linear-gradient(135deg, rgba(212, 80, 30, 0.1) 0%, rgba(184, 67, 26, 0.05) 100%);
              border-left: 3px solid #D4501E;
              border-radius: 4px;
            ">
              <p style="
                margin: 0;
                font-size: 10px;
                color: #2C1810;
                font-family: monospace;
                line-height: 1.5;
              ">
                💡 <strong>Tip:</strong> Most Smithsonian museums are free and open daily!
              </p>
            </div>
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

        // Add layer with enhanced 3D visibility
        if (!map.getLayer(LAYER_ID)) {
          const styleHasGlyphs = Boolean(map.getStyle()?.glyphs)

          const layout: SymbolLayout = {
            'icon-image': 'museum-icon',
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10,
              0.8,
              14,
              1.5,
              18,
              2.5
            ],
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-pitch-alignment': 'viewport',
            visibility: 'none'
          }

          const paint: SymbolPaint = {
            'icon-opacity': 1,
            'icon-halo-color': '#5DA5DB',
            'icon-halo-width': 3,
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
          } else {
            console.warn(
              'Museums layer: style missing glyphs definition – rendering icons without text labels.'
            )
          }

          map.addLayer({
            id: LAYER_ID,
            type: 'symbol',
            source: SOURCE_ID,
            layout,
            paint
          })
          console.log('✅ Museums layer added with ENHANCED 3D visibility')
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

