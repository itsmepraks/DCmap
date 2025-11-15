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

          // GeoJSON coordinates are [longitude, latitude]
          const coordinates = (feature.geometry as any).coordinates.slice()
          const [lng, lat] = coordinates
          const isVisited = visitedLandmarks.has(properties.id)
          
          console.log(`📍 Adding landmark: ${properties.name} at [${lng}, ${lat}]`)

          // Create rich popup HTML with Minecraft theme
          const popupHTML = `
            <div class="popup-wrapper" style="
              padding: 0; 
              margin: -15px; 
              border-radius: 8px; 
              overflow: hidden;
              font-family: monospace;
              box-shadow: 0 8px 24px rgba(0,0,0,0.3);
              border: 3px solid ${isVisited ? '#D4501E' : '#8B7355'};
              background: linear-gradient(145deg, #EFE6D5 0%, #F5EBD9 100%);
            ">
              <!-- Header -->
              <div style="
                background: linear-gradient(135deg, ${isVisited ? '#D4501E' : '#8B7355'} 0%, ${isVisited ? '#B8431A' : '#6B5A47'} 100%); 
                padding: 16px; 
                border-bottom: 4px solid ${isVisited ? '#B8431A' : '#6B5A47'};
                position: relative;
              ">
                <div style="position: absolute; top: 0; left: 0; width: 2px; height: 2px; background: rgba(0,0,0,0.4);"></div>
                <div style="position: absolute; top: 0; right: 0; width: 2px; height: 2px; background: rgba(0,0,0,0.4);"></div>
                <div style="position: absolute; bottom: 0; left: 0; width: 2px; height: 2px; background: rgba(0,0,0,0.4);"></div>
                <div style="position: absolute; bottom: 0; right: 0; width: 2px; height: 2px; background: rgba(0,0,0,0.4);"></div>
                
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                    ${properties.icon}
                  </div>
                  <div style="flex: 1;">
                    <h3 style="
                      margin: 0 0 4px 0; 
                      color: white; 
                      font-size: 16px; 
                      font-weight: bold; 
                      text-shadow: 2px 2px 0 rgba(0,0,0,0.3);
                      font-family: monospace;
                    ">
                      ${properties.name}
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
                      ${properties.category || 'Monument'}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Content -->
              <div style="padding: 16px; background: linear-gradient(145deg, #F5EBD9 0%, #EFE6D5 100%);">
                ${isVisited ? `
                  <!-- Description -->
                  <div style="margin-bottom: 12px;">
                    <div style="
                      font-size: 10px; 
                      font-weight: bold; 
                      color: #8B7355; 
                      text-transform: uppercase; 
                      margin-bottom: 6px;
                      font-family: monospace;
                    ">
                      📖 About
                    </div>
                    <p style="
                      margin: 0; 
                      color: #2C1810; 
                      font-size: 13px; 
                      line-height: 1.6;
                      font-family: monospace;
                    ">
                      ${properties.description}
                    </p>
                  </div>
                  
                  <!-- Fun Fact -->
                  <div style="
                    padding: 12px; 
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%); 
                    border-left: 4px solid #FFD700; 
                    border-radius: 4px;
                    margin-bottom: 12px;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
                  ">
                    <div style="
                      font-size: 10px; 
                      font-weight: bold; 
                      color: #B8860B; 
                      text-transform: uppercase; 
                      margin-bottom: 4px;
                      font-family: monospace;
                    ">
                      💡 Did You Know?
                    </div>
                    <p style="
                      margin: 0; 
                      color: #5D4037; 
                      font-size: 12px; 
                      font-weight: 500;
                      line-height: 1.5;
                      font-family: monospace;
                    ">
                      ${properties.funFact}
                    </p>
                  </div>
                  
                  <!-- Status Badge -->
                  <div style="
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between;
                    padding: 10px;
                    background: linear-gradient(135deg, #7ED957 0%, #5DA040 100%);
                    border-radius: 6px;
                    border: 2px solid #5DA040;
                    box-shadow: 0 4px 0 #5DA040, 0 6px 12px rgba(0,0,0,0.2);
                  ">
                    <span style="
                      color: white; 
                      font-weight: bold; 
                      font-size: 12px;
                      text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
                      font-family: monospace;
                    ">
                      ✓ DISCOVERED
                    </span>
                    <span style="
                      color: #FFD700; 
                      font-weight: bold; 
                      font-size: 12px;
                      text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
                      font-family: monospace;
                    ">
                      +10 XP
                    </span>
                  </div>
                ` : `
                  <!-- Locked State -->
                  <div style="text-align: center; padding: 20px 10px;">
                    <div style="
                      font-size: 48px; 
                      margin-bottom: 12px;
                      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
                    ">
                      🔒
                    </div>
                    <div style="
                      font-size: 14px; 
                      font-weight: bold; 
                      color: #8B7355; 
                      margin-bottom: 8px;
                      font-family: monospace;
                      text-transform: uppercase;
                    ">
                      Locked Location
                    </div>
                    <p style="
                      margin: 0 0 12px 0; 
                      color: #5D4037; 
                      font-size: 12px; 
                      line-height: 1.5;
                      font-family: monospace;
                    ">
                      Click on this landmark or get within 50 meters to discover its secrets!
                    </p>
                    <div style="
                      display: inline-block;
                      padding: 8px 16px;
                      background: linear-gradient(135deg, rgba(139, 115, 85, 0.2) 0%, rgba(107, 90, 71, 0.2) 100%);
                      border: 2px solid #8B7355;
                      border-radius: 6px;
                      font-size: 11px;
                      color: #5D4037;
                      font-weight: bold;
                      font-family: monospace;
                    ">
                      📍 ${properties.category || 'Historic Site'}
                    </div>
                  </div>
                `}
              </div>
              
              <!-- Pixelated corners -->
              <div style="position: absolute; top: 0; left: 0; width: 2px; height: 2px; background: rgba(0,0,0,0.4);"></div>
              <div style="position: absolute; top: 0; right: 0; width: 2px; height: 2px; background: rgba(0,0,0,0.4);"></div>
              <div style="position: absolute; bottom: 0; left: 0; width: 2px; height: 2px; background: rgba(0,0,0,0.4);"></div>
              <div style="position: absolute; bottom: 0; right: 0; width: 2px; height: 2px; background: rgba(0,0,0,0.4);"></div>
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
  }, [map, isInitialized, visitedLandmarks])

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


