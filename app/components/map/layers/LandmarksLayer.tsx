'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

interface LandmarksLayerProps {
  map: mapboxgl.Map | null
  visible: boolean
  visitedLandmarks: Set<string>
}

export default function LandmarksLayer({ map, visible, visitedLandmarks }: LandmarksLayerProps) {
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

        // Load landmark icons
        const iconUrls = {
          unvisited: '/icons/landmark-gray.png',
          visited: '/icons/landmark-gold.png'
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
            data: landmarksData
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
              'icon-size': 1,
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
              'text-halo-width': 2
            }
          })
        }

        // Add click handler for popups
        map.on('click', 'landmarks-layer', (e) => {
          if (!e.features || e.features.length === 0) return

          const feature = e.features[0]
          const properties = feature.properties
          if (!properties) return

          const coordinates = (feature.geometry as any).coordinates.slice()
          const isVisited = visitedLandmarks.has(properties.id)

          // Create popup HTML
          const popupHTML = `
            <div class="popup-wrapper" style="padding: 0; margin: -15px; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, ${isVisited ? '#FFD700' : '#999'} 0%, ${isVisited ? '#FFA500' : '#777'} 100%); padding: 16px; border-bottom: 3px solid ${isVisited ? '#B8860B' : '#555'};">
                <h3 style="margin: 0; color: white; font-size: 18px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  ${properties.icon} ${properties.name}
                </h3>
              </div>
              <div style="padding: 16px; background: white;">
                ${isVisited ? `
                  <div style="margin-bottom: 12px;">
                    <p style="margin: 0 0 8px 0; color: #2C1810; font-size: 14px; line-height: 1.5;">${properties.description}</p>
                  </div>
                  <div style="padding: 12px; background: rgba(255, 215, 0, 0.1); border-left: 3px solid #FFD700; border-radius: 4px;">
                    <p style="margin: 0; color: #5D4037; font-size: 13px; font-weight: 500;">💡 ${properties.funFact}</p>
                  </div>
                  <div style="margin-top: 12px; text-align: center;">
                    <span style="display: inline-block; padding: 6px 12px; background: #FFD700; color: #2C1810; border-radius: 8px; font-weight: bold; font-size: 12px;">
                      ✓ DISCOVERED
                    </span>
                  </div>
                ` : `
                  <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 40px; margin-bottom: 12px;">🔒</div>
                    <p style="margin: 0; color: #999; font-size: 14px; font-weight: 500;">
                      Walk within 50m to discover this landmark!
                    </p>
                  </div>
                `}
              </div>
            </div>
          `

          new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true,
            maxWidth: '320px'
          })
            .setLngLat(coordinates)
            .setHTML(popupHTML)
            .addTo(map)
        })

        // Change cursor on hover
        map.on('mouseenter', 'landmarks-layer', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'landmarks-layer', () => {
          map.getCanvas().style.cursor = ''
        })

        console.log('✅ Landmarks layer initialized')
        isInitialized.current = true
      } catch (error) {
        console.error('❌ Error initializing LandmarksLayer:', error)
      }
    }

    initializeLayer()
  }, [map])

  // Update icon visibility based on visited status
  useEffect(() => {
    if (!map || !isInitialized.current) return

    const source = map.getSource('landmarks') as mapboxgl.GeoJSONSource
    if (!source) return

    // We'll update the icon in a more dynamic way
    // For now, we rely on the popup showing visited status
    console.log('📍 Landmarks visited status updated:', visitedLandmarks.size)
  }, [map, visitedLandmarks])

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


