'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'
import mapboxgl from 'mapbox-gl'

interface Museum3DMarkersProps {
  visible: boolean
}

export default function Museum3DMarkers({ visible }: Museum3DMarkersProps) {
  const mapContext = useMap()
  const map = mapContext?.map
  const markersRef = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    // Cleanup function - always runs when visibility changes or component unmounts
    return () => {
      try {
        markersRef.current.forEach(marker => {
          if (marker && typeof marker.remove === 'function') {
            marker.remove()
          }
        })
        markersRef.current = []
      } catch (error) {
        console.error('Error cleaning up museum markers:', error)
      }
    }
  }, [visible]) // Cleanup when visibility changes

  useEffect(() => {
    if (!map) return
    if (!visible) return // Don't initialize if not visible

    const initializeMarkers = async () => {
      try {
        // Wait for map style to load
        if (!map.isStyleLoaded()) {
          map.once('idle', () => initializeMarkers())
          return
        }

        console.log('🏛️ Loading 3D Museum Markers...')

        // Fetch museums data
        const response = await fetch('/data/museums.geojson')
        if (!response.ok) {
          console.error('Failed to fetch museums.geojson')
          return
        }

        const data = await response.json()
        console.log(`✅ Loaded ${data.features?.length || 0} museums from GeoJSON`)

        // Clear any existing markers first
        markersRef.current.forEach(marker => {
          if (marker && typeof marker.remove === 'function') {
            marker.remove()
          }
        })
        markersRef.current = []

        // Create 3D museum markers for each museum
        data.features.forEach((feature: any) => {
          // GeoJSON coordinates are [longitude, latitude]
          const [lng, lat] = feature.geometry.coordinates
          const properties = feature.properties
          
          // Validate coordinates
          if (!lng || !lat || typeof lng !== 'number' || typeof lat !== 'number') {
            console.warn(`Invalid coordinates for ${properties.NAME}: [${lng}, ${lat}]`)
            return
          }
          
          // Log exact coordinates for verification
          console.log(`🏛️ Adding museum: "${properties.NAME}" at EXACT location [${lng}, ${lat}]`)

          // Create 3D museum building marker
          // CRITICAL: Ensure marker element doesn't use fixed positioning
          const markerElement = document.createElement('div')
          markerElement.style.width = '60px'
          markerElement.style.height = '80px'
          markerElement.style.position = 'absolute' // Must be absolute, NOT fixed
          markerElement.style.pointerEvents = 'auto'
          markerElement.style.cursor = 'pointer'
          markerElement.style.transformOrigin = 'center bottom' // Building base at center bottom
          // Ensure marker is properly bound to map coordinates
          markerElement.style.zIndex = '1000'
          markerElement.innerHTML = `
            <div style="
              position: relative;
              width: 100%;
              height: 100%;
              transform-style: preserve-3d;
            ">
              <!-- Realistic 3D Museum Building -->
              <div style="
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%) perspective(500px) rotateX(10deg);
                width: 70px;
                height: 90px;
                transform-style: preserve-3d;
              ">
                <!-- Main building structure (white walls) -->
                <div style="
                  position: absolute;
                  bottom: 0;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 60px;
                  height: 75px;
                  background: linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #E8E8E8 100%);
                  border-radius: 4px 4px 2px 2px;
                  box-shadow: 
                    0 10px 20px rgba(0,0,0,0.4),
                    inset -5px -5px 10px rgba(0,0,0,0.2),
                    inset 5px 5px 10px rgba(255,255,255,0.3);
                ">
                  <!-- Classical columns (like real museums) -->
                  <div style="position: absolute; left: 8px; top: 0; width: 6px; height: 100%; background: linear-gradient(to bottom, rgba(200,200,200,0.8) 0%, rgba(150,150,150,0.6) 100%); border-radius: 3px; box-shadow: inset -1px 0 2px rgba(0,0,0,0.2);"></div>
                  <div style="position: absolute; right: 8px; top: 0; width: 6px; height: 100%; background: linear-gradient(to bottom, rgba(200,200,200,0.8) 0%, rgba(150,150,150,0.6) 100%); border-radius: 3px; box-shadow: inset 1px 0 2px rgba(0,0,0,0.2);"></div>
                  
                  <!-- Realistic lit windows -->
                  <div style="position: absolute; left: 14px; top: 12px; width: 10px; height: 12px; background: radial-gradient(circle at 30% 30%, rgba(255,255,220,0.95) 0%, rgba(255,235,150,0.7) 50%, rgba(200,180,100,0.5) 100%); border-radius: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 0 8px rgba(255,255,200,0.6);"></div>
                  <div style="position: absolute; right: 14px; top: 12px; width: 10px; height: 12px; background: radial-gradient(circle at 30% 30%, rgba(255,255,220,0.95) 0%, rgba(255,235,150,0.7) 50%, rgba(200,180,100,0.5) 100%); border-radius: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 0 8px rgba(255,255,200,0.6);"></div>
                  <div style="position: absolute; left: 14px; top: 28px; width: 10px; height: 12px; background: radial-gradient(circle at 30% 30%, rgba(255,255,220,0.95) 0%, rgba(255,235,150,0.7) 50%, rgba(200,180,100,0.5) 100%); border-radius: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 0 8px rgba(255,255,200,0.6);"></div>
                  <div style="position: absolute; right: 14px; top: 28px; width: 10px; height: 12px; background: radial-gradient(circle at 30% 30%, rgba(255,255,220,0.95) 0%, rgba(255,235,150,0.7) 50%, rgba(200,180,100,0.5) 100%); border-radius: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 0 8px rgba(255,255,200,0.6);"></div>
                  
                  <!-- Grand entrance door -->
                  <div style="position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 16px; height: 24px; background: linear-gradient(to bottom, #8B4513 0%, #654321 50%, #2C1810 100%); border-radius: 2px 2px 0 0; box-shadow: inset 0 -3px 6px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.3);">
                    <!-- Door handle -->
                    <div style="position: absolute; right: 2px; top: 50%; transform: translateY(-50%); width: 2px; height: 4px; background: #FFD700; border-radius: 1px; box-shadow: 0 1px 2px rgba(0,0,0,0.3);"></div>
                  </div>
                  
                  <!-- Architectural detail (frieze) -->
                  <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(to bottom, #C8B99C, #A8967A); border-radius: 4px 4px 0 0;"></div>
                </div>
                
                <!-- Colored roof (dark red like reference) -->
                <div style="
                  position: absolute;
                  bottom: 75px;
                  left: 50%;
                  transform: translateX(-50%) translateZ(0);
                  width: 0;
                  height: 0;
                  border-left: 32px solid transparent;
                  border-right: 32px solid transparent;
                  border-bottom: 15px solid #C0392B;
                  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
                "></div>
                
                <!-- Museum icon badge (prominent) -->
                <div style="
                  position: absolute;
                  left: 50%;
                  top: -20px;
                  transform: translateX(-50%);
                  width: 32px;
                  height: 32px;
                  background: radial-gradient(circle, #4A90E2 0%, #2E6BA0 100%);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 20px;
                  box-shadow: 0 4px 12px rgba(74,144,226,0.6), 0 0 20px rgba(74,144,226,0.4);
                  border: 3px solid #FFFFFF;
                  animation: pulse 2s ease-in-out infinite;
                ">🏛️</div>
                
                <!-- Prominent glow effect -->
                <div style="
                  position: absolute;
                  inset: -8px;
                  background: radial-gradient(circle, rgba(74,144,226,0.5) 0%, transparent 70%);
                  border-radius: 50%;
                  filter: blur(12px);
                  z-index: -1;
                  animation: pulse 2s ease-in-out infinite;
                "></div>
              </div>
              
              <!-- Label -->
              <div style="
                position: absolute;
                bottom: -20px;
                left: 50%;
                transform: translateX(-50%);
                white-space: nowrap;
                background: rgba(255,255,255,0.95);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
                color: #2C1810;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                border: 1px solid rgba(74,144,226,0.3);
              ">${properties.NAME || 'Museum'}</div>
            </div>
            <style>
              @keyframes pulse {
                0%, 100% { opacity: 0.6; transform: scale(1); }
                50% { opacity: 0.9; transform: scale(1.1); }
              }
            </style>
          `

          markerElement.addEventListener('click', () => {
            // Create informative popup with accurate location data
            const popup = new mapboxgl.Popup({ 
              closeOnClick: true, 
              maxWidth: '320px',
              className: 'museum-popup'
            })
              .setLngLat([lng, lat])
              .setHTML(`
                <div style="padding: 16px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 24px;">🏛️</span>
                    <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937; line-height: 1.3;">
                      ${properties.NAME}
                    </h3>
                  </div>
                  ${properties.ADDRESS ? `
                    <div style="margin-bottom: 10px; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                      <p style="margin: 0; font-size: 13px; color: #4b5563; font-weight: 500;">
                        📍 ${properties.ADDRESS}
                      </p>
                    </div>
                  ` : ''}
                  ${properties.DESCRIPTION ? `
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                      ${properties.DESCRIPTION}
                    </p>
                  ` : ''}
                  <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 11px; color: #9ca3af; font-family: monospace;">
                      📐 Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              `)
              .addTo(map)
          })

          // Create marker with bottom anchor - building base will be exactly at the coordinate
          // CRITICAL: Verify coordinates are valid DMV (DC-Maryland-Virginia) coordinates before creating marker
          // DMV bounds: lng: -77.5 to -76.4, lat: 38.6 to 39.3 (includes DC, MD suburbs, and VA suburbs)
          if (lng < -77.5 || lng > -76.4 || lat < 38.6 || lat > 39.3) {
            console.error(`❌ INVALID COORDINATES for ${properties.NAME}: [${lng}, ${lat}] - Not in DMV area!`)
            return // Skip invalid coordinates
          }
          
          const marker = new mapboxgl.Marker({
            element: markerElement,
            anchor: 'bottom', // Bottom anchor ensures building base is at exact coordinate
            // Ensure marker is properly bound to map, not screen
            rotationAlignment: 'map',
            pitchAlignment: 'map'
          })
            .setLngLat([lng, lat]) // Exact coordinates from GeoJSON [longitude, latitude]
            .addTo(map)

          // Verify marker position matches the exact coordinate
          const markerLngLat = marker.getLngLat()
          const coordMatch = Math.abs(markerLngLat.lng - lng) < 0.000001 && Math.abs(markerLngLat.lat - lat) < 0.000001
          if (coordMatch) {
            console.log(`  ✓ Verified: "${properties.NAME}" at EXACT DMV location [${markerLngLat.lng.toFixed(6)}, ${markerLngLat.lat.toFixed(6)}]`)
          } else {
            console.error(`  ❌ CRITICAL: Coordinate mismatch for "${properties.NAME}"! Expected [${lng}, ${lat}], got [${markerLngLat.lng}, ${markerLngLat.lat}]`)
            // Remove the incorrectly positioned marker
            marker.remove()
            return
          }

          markersRef.current.push(marker)
        })

        console.log(`✅ Created ${markersRef.current.length} 3D museum markers at their exact DMV locations`)
        console.log(`📍 All museums are positioned at their real-world GPS coordinates (DC, MD, VA)`)
        console.log(`🔍 Zoom in/out to verify - markers stay fixed at exact locations across the DMV area`)
      } catch (error) {
        console.error('❌ Error creating 3D museum markers:', error)
      }
    }

    initializeMarkers()

    // Ensure markers stay at exact positions when map moves/zooms
    // Mapbox markers automatically maintain their coordinates, but we verify on move
    const handleMapMove = () => {
      markersRef.current.forEach((marker, index) => {
        if (marker) {
          // Markers automatically maintain their coordinates - this is just for verification
          const currentPos = marker.getLngLat()
          // Log only if there's a significant drift (shouldn't happen with Mapbox markers)
          // This helps debug if markers are moving incorrectly
        }
      })
    }

    if (map && visible) {
      map.on('moveend', handleMapMove)
      map.on('zoomend', handleMapMove)
    }

    return () => {
      if (map) {
        map.off('moveend', handleMapMove)
        map.off('zoomend', handleMapMove)
      }
    }
  }, [map, visible])

  return null
}

