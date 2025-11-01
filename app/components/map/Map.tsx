'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { useMap } from '@/app/lib/MapContext'
import type { LayerVisibility } from '@/app/types/map'
import MuseumsLayer from './layers/MuseumsLayer'
import TreesLayer from './layers/TreesLayer'
import LandmarksLayer from './layers/LandmarksLayer'
import ParksLayer from './layers/ParksLayer'
import PlayerAvatar from './PlayerAvatar'
import { checkNearbyLandmarks, findNearestLandmark, getBearing } from '@/app/lib/proximityDetector'

interface MapProps {
  layersVisible: LayerVisibility
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  is3D: boolean
  isWalking: boolean
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>
  visitedLandmarks: Set<string>
  onLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
  onPlayerPositionChange?: (position: { lng: number; lat: number; bearing: number; nearestLandmark: any }) => void
}

export default function Map({ 
  layersVisible, 
  currentSeason, 
  is3D, 
  isWalking,
  landmarks,
  visitedLandmarks,
  onLandmarkDiscovered,
  onPlayerPositionChange
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const { map, setMap } = useMap()
  const isInitialized = useRef(false)
  const [playerPosition, setPlayerPosition] = useState({ lng: -77.0369, lat: 38.9072 })
  const [playerBearing, setPlayerBearing] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isThirdPersonView, setIsThirdPersonView] = useState(false)

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) {
      return
    }

    if (!mapContainer.current) {
      return
    }

    // Validate environment variable
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    console.log('🗺️ Initializing map...')
    console.log('Token exists:', !!token)
    console.log('Token length:', token?.length)
    console.log('Token preview:', token?.substring(0, 20) + '...')
    
    if (!token || token.includes('placeholder')) {
      console.error(
        '❌ Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env.local file. ' +
        'Get your token from https://account.mapbox.com/access-tokens/'
      )
      return
    }

    // Mark as initialized immediately to prevent double initialization
    isInitialized.current = true

    mapboxgl.accessToken = token

    try {
      console.log('🎨 Creating map with style:', process.env.NEXT_PUBLIC_MAPBOX_STYLE)
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: process.env.NEXT_PUBLIC_MAPBOX_STYLE || 'mapbox://styles/mapbox/light-v11',
        center: [-77.0369, 38.9072], // D.C. coordinates
        zoom: 11,
        pitch: 0, // Start flat, user can tilt manually
        bearing: 0,
        // Enable 3D terrain and buildings
        antialias: true, // Smooth 3D rendering
        maxPitch: 85, // Allow steep tilt like Apple Maps
      })

      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Add click-to-teleport functionality (when NOT walking)
      mapInstance.on('click', (e) => {
        if (!isWalking) {
          const { lng, lat } = e.lngLat
          setPlayerPosition({ lng, lat })
          
          // Smooth fly-to animation
          mapInstance.flyTo({
            center: [lng, lat],
            zoom: Math.max(mapInstance.getZoom(), 14),
            duration: 1500,
            essential: true
          })
          
          console.log(`📍 Teleported to: ${lng.toFixed(4)}, ${lat.toFixed(4)}`)
        }
      })

      mapInstance.on('load', () => {
        console.log('✅ Map loaded successfully!')
        
        // Add 3D terrain source
        mapInstance.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14
        })
        
        // Set the terrain on the map with exaggerated height
        mapInstance.setTerrain({ 
          source: 'mapbox-dem', 
          exaggeration: 1.5 // Make hills more pronounced like Apple Maps
        })
        
        // Add atmospheric sky layer for realism
        mapInstance.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
          }
        })
        
        // Add 3D building layer
        const layers = mapInstance.getStyle().layers
        // Find the first symbol layer to insert buildings before labels
        let firstSymbolId: string | undefined
        for (const layer of layers || []) {
          if (layer.type === 'symbol') {
            firstSymbolId = layer.id
            break
          }
        }
        
        // Add 3D buildings
        if (!mapInstance.getLayer('3d-buildings')) {
          mapInstance.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 13,
              paint: {
                'fill-extrusion-color': '#C1604A', // Terracotta color from your theme!
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  13, 0,
                  13.05, ['get', 'height']
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  13, 0,
                  13.05, ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.85,
                // Add lighting for depth and realism
                'fill-extrusion-ambient-occlusion-intensity': 0.5,
                'fill-extrusion-ambient-occlusion-radius': 3
              }
            },
            firstSymbolId
          )
        }
        
        console.log('🏗️ 3D buildings and terrain enabled!')
        setMap(mapInstance)
      })

      mapInstance.on('error', (e) => {
        console.error('❌ Map error:', e.error)
      })

      // Cleanup on unmount
      return () => {
        console.log('🧹 Cleaning up map instance on unmount')
        mapInstance.remove()
        isInitialized.current = false
      }
    } catch (error) {
      console.error('❌ Error creating map:', error)
      isInitialized.current = false
    }
  }, [])

  // Handle 3D view toggle with DRAMATIC smooth animation
  useEffect(() => {
    if (!map) return

    // Dramatic 3D transformation - tilt up and zoom for building view
    map.easeTo({
      pitch: is3D ? 65 : 0,           // More dramatic tilt in 3D
      zoom: is3D ? 16 : 11,            // Zoom in to see buildings better in 3D
      duration: 1500,                  // Longer transition for dramatic effect
      easing: (t) => t < 0.5 
        ? 4 * t * t * t                // Ease-in cubic
        : 1 - Math.pow(-2 * t + 2, 3) / 2  // Ease-out cubic
    })

    console.log(`🎮 ${is3D ? 'Entering DRAMATIC 3D mode' : 'Returning to 2D overview'}`)
  }, [map, is3D])

  // True first-person walking controls - realistic human perspective
  useEffect(() => {
    if (!map || !isWalking) return

    // Movement speed (meters per second) - Professional and smooth
    const WALK_SPEED = 0.00015 // Smooth walking speed
    const RUN_SPEED = 0.00030 // Smooth running speed (2x)
    const MOUSE_SENSITIVITY = 0.35 // Refined look around sensitivity
    const MOVEMENT_SMOOTHING = 0.15 // Interpolation for smooth movement

    // Keys currently pressed
    const keys: { [key: string]: boolean } = {}
    let isShiftPressed = false
    
    // Mouse state for smooth looking around
    let isDragging = false
    let lastMouseX = 0
    let lastMouseY = 0
    let currentMouseVelocityX = 0
    let currentMouseVelocityY = 0

    // Camera view modes
    let isBirdsEye = false
    let isThirdPerson = false  // Third-person mode where you see your character

    // Enter Street View-like perspective - natural human eye level
    const center = map.getCenter()
    map.easeTo({
      pitch: 70, // Better forward-looking angle for immersion
      zoom: 18.5, // Closer view for better detail
      bearing: 0,
      duration: 1200, // Faster transition
      easing: (t) => t * (2 - t) // Smooth ease-out curve
    })

    // Keep zoom enabled for better exploration!
    map.scrollZoom.enable()  // Allow zooming even while walking
    map.dragPan.disable()     // Disable drag to avoid conflicts

    console.log('🚶 TRUE First-Person Mode! Use WASD to move, Mouse to look around, Scroll to zoom')

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault()
        keys[key] = true
      }
      if (e.key === 'Shift') {
        isShiftPressed = true
        setIsRunning(true)
      }
      // V key to toggle between street view and overhead view
      if (key === 'v') {
        e.preventDefault()
        if (!isThirdPerson) {
          isBirdsEye = !isBirdsEye
          map.easeTo({
            pitch: isBirdsEye ? 85 : 60, // Overhead vs Street View
            zoom: isBirdsEye ? 16 : 18,
            duration: 800
          })
          console.log(`📷 Switched to ${isBirdsEye ? 'Overhead' : 'Street View'} perspective`)
        }
      }
      // T key to toggle third-person view (see your character)
      if (key === 't') {
        e.preventDefault()
        isThirdPerson = !isThirdPerson
        setIsThirdPersonView(isThirdPerson)
        if (isThirdPerson) {
          // Third-person: Camera behind and above character
          isBirdsEye = false
          map.easeTo({
            pitch: 45,  // Look down at character from behind
            zoom: 18,   // Far enough to see character
            duration: 1000
          })
          console.log('🎮 Switched to THIRD-PERSON view - You can see your character!')
        } else {
          // Return to street view
          map.easeTo({
            pitch: 60,
            zoom: 18,
            duration: 1000
          })
          console.log('👀 Returned to Street View')
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keys[key] = false
      if (e.key === 'Shift') {
        isShiftPressed = false
        setIsRunning(false)
      }
    }

    // Smooth mouse look controls - like FPS games
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click to activate looking
        isDragging = true
        lastMouseX = e.clientX
        lastMouseY = e.clientY
        map.getCanvas().style.cursor = 'crosshair'
        e.preventDefault()
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const deltaX = e.clientX - lastMouseX
      const deltaY = e.clientY - lastMouseY

      // Smooth velocity-based rotation (like modern FPS games)
      currentMouseVelocityX = deltaX * MOUSE_SENSITIVITY
      currentMouseVelocityY = deltaY * MOUSE_SENSITIVITY

      // Rotate view horizontally (bearing) - unlimited rotation
      const newBearing = map.getBearing() + currentMouseVelocityX
      map.setBearing(newBearing)

      // Look up/down (pitch) - natural Street View range
      const currentPitch = map.getPitch()
      const minPitch = isBirdsEye ? 40 : 30   // Natural street view minimum
      const maxPitch = isBirdsEye ? 85 : 80   // Can look up at buildings
      const newPitch = Math.max(minPitch, Math.min(maxPitch, currentPitch - currentMouseVelocityY))
      map.setPitch(newPitch)

      lastMouseX = e.clientX
      lastMouseY = e.clientY
    }

    const handleMouseUp = () => {
      isDragging = false
      currentMouseVelocityX = 0
      currentMouseVelocityY = 0
      map.getCanvas().style.cursor = ''
    }

    // Animation loop for smooth movement with realistic head bob
    let animationFrame: number
    let lastProximityCheck = Date.now()
    let walkCycle = 0 // For camera bobbing effect

    const moveCamera = () => {
      const bearing = map.getBearing()
      const center = map.getCenter()
      
      // Determine current speed (run or walk)
      const currentSpeed = isShiftPressed ? RUN_SPEED : WALK_SPEED
      
      let deltaLng = 0
      let deltaLat = 0
      let moving = false

      // Forward/Backward (W/S)
      if (keys['w'] || keys['arrowup']) {
        const rad = (bearing * Math.PI) / 180
        deltaLng += Math.sin(rad) * currentSpeed
        deltaLat += Math.cos(rad) * currentSpeed
        moving = true
      }
      if (keys['s'] || keys['arrowdown']) {
        const rad = (bearing * Math.PI) / 180
        deltaLng -= Math.sin(rad) * currentSpeed
        deltaLat -= Math.cos(rad) * currentSpeed
        moving = true
      }

      // Strafe Left/Right (A/D)
      if (keys['a'] || keys['arrowleft']) {
        const rad = ((bearing - 90) * Math.PI) / 180
        deltaLng += Math.sin(rad) * currentSpeed
        deltaLat += Math.cos(rad) * currentSpeed
        moving = true
      }
      if (keys['d'] || keys['arrowright']) {
        const rad = ((bearing + 90) * Math.PI) / 180
        deltaLng += Math.sin(rad) * currentSpeed
        deltaLat += Math.cos(rad) * currentSpeed
        moving = true
      }

      // Update moving state
      setIsMoving(moving)

      // Apply SMOOTH movement with interpolation
      if (deltaLng !== 0 || deltaLat !== 0) {
        // Increment walk cycle for bobbing effect
        walkCycle += isShiftPressed ? 0.20 : 0.12
        
        // Calculate subtle head bob (like real person walking)
        const bobIntensity = isShiftPressed ? 0.3 : 0.15
        const pitchBob = Math.sin(walkCycle) * bobIntensity
        const zoomBob = Math.sin(walkCycle * 2) * 0.05
        
        // Apply smooth camera bob - preserves current view mode
        const currentBasePitch = map.getPitch()
        const targetPitch = Math.max(0, Math.min(60, currentBasePitch + pitchBob))
        map.setPitch(targetPitch)
        
        // Don't override user's zoom - only bob slightly
        const currentZoom = map.getZoom()
        const targetZoom = currentZoom + zoomBob
        map.setZoom(targetZoom)
        
        // SMOOTH interpolation for position movement
        const newLng = center.lng + (deltaLng * (1 + MOVEMENT_SMOOTHING))
        const newLat = center.lat + (deltaLat * (1 + MOVEMENT_SMOOTHING))
        
        map.easeTo({
          center: [newLng, newLat],
          duration: 50, // Very short duration for smooth feel
          easing: t => t  // Linear easing for responsive feel
        })
        
        setPlayerPosition({ lng: newLng, lat: newLat })
      } else {
        // Reset to neutral position when stopped
        walkCycle = 0
      }

      // Update bearing
      const currentBearing = map.getBearing()
      setPlayerBearing(currentBearing)

      // Check for nearby landmarks every 500ms
      const now = Date.now()
      if (now - lastProximityCheck > 500) {
        lastProximityCheck = now
        
        const playerPos = { lng: center.lng, lat: center.lat }
        
        // Check for discoveries
        const nearby = checkNearbyLandmarks(playerPos, landmarks, visitedLandmarks, 50)
        nearby.forEach(discovery => {
          const landmarkData = landmarks.find(l => l.id === discovery.id)
          if (landmarkData) {
            onLandmarkDiscovered(discovery.id, landmarkData)
          }
        })

        // Find nearest landmark for compass
        const nearest = findNearestLandmark(playerPos, landmarks)
        if (nearest && onPlayerPositionChange) {
          const landmarkBearing = getBearing(playerPos, nearest.coordinates)
          onPlayerPositionChange({
            lng: playerPos.lng,
            lat: playerPos.lat,
            bearing: map.getBearing(),
            nearestLandmark: {
              name: nearest.name,
              distance: nearest.distance!,
              bearing: landmarkBearing
            }
          })
        }
      }

      animationFrame = requestAnimationFrame(moveCamera)
    }

    // Start animation loop
    animationFrame = requestAnimationFrame(moveCamera)

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    const canvas = map.getCanvas()
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    // Disable default map interactions while walking
    map.scrollZoom.disable()
    map.boxZoom.disable()
    map.dragRotate.disable()
    map.dragPan.disable()
    map.keyboard.disable()
    map.doubleClickZoom.disable()
    map.touchZoomRotate.disable()

    // Cleanup
    return () => {
      console.log('🚶 Exiting walking mode')
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      // Reset movement states
      setIsMoving(false)
      setIsRunning(false)
      setIsThirdPersonView(false)

      // Re-enable default interactions
      map.scrollZoom.enable()
      map.boxZoom.enable()
      map.dragRotate.enable()
      map.dragPan.enable()
      map.keyboard.enable()
      map.doubleClickZoom.enable()
      map.touchZoomRotate.enable()

      // Return to normal view
      map.easeTo({
        pitch: 0,
        zoom: 11,
        duration: 1000
      })
    }
  }, [map, isWalking, landmarks, visitedLandmarks, onLandmarkDiscovered, onPlayerPositionChange])

  return (
    <>
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full z-0" />
      {map && (
        <>
          <ParksLayer visible={layersVisible.trees} season={currentSeason} />
          <TreesLayer visible={layersVisible.trees} season={currentSeason} />
          <MuseumsLayer visible={layersVisible.museums} />
          <LandmarksLayer map={map} visible={layersVisible.landmarks} visitedLandmarks={visitedLandmarks} />
          {/* Show starting position when NOT walking */}
          {!isWalking && (
            <PlayerAvatar 
              map={map}
              position={playerPosition}
              bearing={playerBearing}
              isMoving={false}
              isRunning={false}
            />
          )}
          {/* Show character in third-person mode when walking */}
          {(isThirdPersonView && isWalking) && (
            <PlayerAvatar 
              map={map}
              position={playerPosition}
              bearing={playerBearing}
              isMoving={isMoving}
              isRunning={isRunning}
            />
          )}
        </>
      )}
    </>
  )
}

