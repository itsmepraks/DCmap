'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { checkNearbyLandmarks, findNearestLandmark } from '@/app/lib/proximityDetector'
import { usePlayerState } from '@/app/lib/playerState'

interface UseFlyControllerOptions {
  map: mapboxgl.Map | null
  isActive: boolean
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>
  visitedLandmarks: Set<string>
  onLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
  onPositionChange?: (position: { lng: number; lat: number; bearing: number }) => void
}

export interface FlyControllerState {
  isMoving: boolean
  speed: number
  altitude: number
  position?: { lng: number; lat: number }
  bearing?: number
}

const METERS_PER_DEG_LAT = 111132
const MOVE_SPEED = 600 // meters per second - responsive, matches key presses
const CAMERA_PITCH = 75 // degrees - looking down at street level
const CAMERA_ZOOM = 18.5 // close zoom for street view
const MIN_ALTITUDE = 3 // minimum altitude in meters
const MAX_ALTITUDE = 200 // maximum altitude in meters
const SAFE_BUILDING_CLEARANCE = 5 // meters above buildings
const COLLISION_CHECK_RADIUS = 25 // meters - check buildings within this radius

// Smooth interpolation function
function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

// Get building height at a position
function getBuildingHeightAtPosition(
  map: mapboxgl.Map,
  position: [number, number],
  radius: number
): number {
  try {
    const point = map.project(position)
    const pixels = radius * (map.getZoom() / 18) // Convert meters to pixels
    
    // Query buildings in a small area around the position
    const features = map.queryRenderedFeatures(
      [
        [point.x - pixels, point.y - pixels],
        [point.x + pixels, point.y + pixels]
      ],
      {
        layers: ['realistic-buildings', 'building-roofs'],
        filter: ['has', 'height']
      }
    )

    if (features.length === 0) return 0

    // Find the tallest building
    let maxHeight = 0
    features.forEach(feature => {
      const height = feature.properties?.height
      if (typeof height === 'number' && height > maxHeight) {
        maxHeight = height
      }
    })

    return maxHeight
  } catch (error) {
    console.debug('Building height query failed:', error)
    return 0
  }
}

export function useFlyController({
  map,
  isActive,
  landmarks,
  visitedLandmarks,
  onLandmarkDiscovered,
  onPositionChange
}: UseFlyControllerOptions) {
  const { updatePose } = usePlayerState()
  const [controllerState, setControllerState] = useState<FlyControllerState>({
    isMoving: false,
    speed: 0,
    altitude: 6,
    position: undefined,
    bearing: undefined
  })

  const landmarkCallbackRef = useRef(onLandmarkDiscovered)
  const positionCallbackRef = useRef(onPositionChange)

  useEffect(() => {
    landmarkCallbackRef.current = onLandmarkDiscovered
  }, [onLandmarkDiscovered])

  useEffect(() => {
    positionCallbackRef.current = onPositionChange
  }, [onPositionChange])

  useEffect(() => {
    if (typeof window === 'undefined' || !map || !isActive) return

    console.log('🦅 Fly mode activated')

    // Track pressed keys
    const keys = new Set<string>()
    
    // Track player position and altitude
    const center = map.getCenter()
    let position: [number, number] = [center.lng, center.lat]
    let bearing = map.getBearing()
    let targetAltitude = 6 // Target altitude we want to reach
    let currentAltitude = 6 // Current altitude (smoothly interpolated)
    
    // Store original interaction state
    const originalState = {
      dragPan: map.dragPan.isEnabled(),
      dragRotate: map.dragRotate.isEnabled(),
      scrollZoom: map.scrollZoom.isEnabled(),
      doubleClickZoom: map.doubleClickZoom.isEnabled(),
      touchZoomRotate: map.touchZoomRotate.isEnabled()
    }

    // Disable map controls
    map.dragPan.disable()
    map.dragRotate.disable()
    map.scrollZoom.disable()
    map.doubleClickZoom.disable()
    map.touchZoomRotate.disable()

    // Set initial camera for street view
    map.easeTo({
      center: position,
      zoom: CAMERA_ZOOM,
      pitch: CAMERA_PITCH,
      bearing: bearing,
      duration: 800
    })

    // Mouse look
    let isMouseDown = false
    const canvas = map.getCanvas()

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault()
        keys.add(key)
      }
      // Altitude control
      if (key === ' ' || key === 'space') {
        e.preventDefault()
        targetAltitude = Math.min(targetAltitude + 10, MAX_ALTITUDE)
      }
      if (key === 'shift') {
        e.preventDefault()
        targetAltitude = Math.max(targetAltitude - 10, MIN_ALTITUDE)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase())
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDown = true
        canvas.style.cursor = 'grabbing'
      }
    }

    const handleMouseUp = () => {
      isMouseDown = false
      canvas.style.cursor = ''
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return
      bearing += e.movementX * 0.5 // Smooth mouse look
      const currentPitch = map.getPitch()
      const newPitch = Math.max(50, Math.min(85, currentPitch - e.movementY * 0.3))
      map.setBearing(bearing)
      map.setPitch(newPitch)
    }

    // Animation loop with smooth interpolation
    let lastTime = performance.now()
    let animationFrameId: number
    let lastLandmarkCheck = 0

    const animate = (currentTime: number) => {
      if (!map || !isActive) return

      const dt = Math.min((currentTime - lastTime) / 1000, 0.016) // Cap at 60fps for smoothness
      // Use actual delta time for more accurate movement matching key presses
      lastTime = currentTime

      // Calculate movement direction
      let forward = 0
      let right = 0

      if (keys.has('w') || keys.has('arrowup')) forward = 1
      if (keys.has('s') || keys.has('arrowdown')) forward = -1
      if (keys.has('a') || keys.has('arrowleft')) right = -1
      if (keys.has('d') || keys.has('arrowright')) right = 1

      const isMoving = forward !== 0 || right !== 0

      // Smooth altitude interpolation
      const altitudeLerpFactor = Math.min(dt * 8, 1) // Smooth altitude changes
      currentAltitude = lerp(currentAltitude, targetAltitude, altitudeLerpFactor)

      // Check for building collisions and adjust altitude
      if (currentTime - lastLandmarkCheck > 100) { // Check every 100ms
        const buildingHeight = getBuildingHeightAtPosition(map, position, COLLISION_CHECK_RADIUS)
        const requiredAltitude = buildingHeight + SAFE_BUILDING_CLEARANCE
        
        if (requiredAltitude > targetAltitude) {
          targetAltitude = Math.min(requiredAltitude, MAX_ALTITUDE)
        }
        
        lastLandmarkCheck = currentTime
      }

      if (isMoving) {
        // Calculate movement in meters
        const moveDistance = MOVE_SPEED * dt
        const bearingRad = (bearing * Math.PI) / 180
        const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((position[1] * Math.PI) / 180)

        // Forward/backward movement
        const forwardLng = (Math.sin(bearingRad) * forward * moveDistance) / metersPerDegLng
        const forwardLat = (Math.cos(bearingRad) * forward * moveDistance) / METERS_PER_DEG_LAT

        // Left/right strafe movement
        const strafeBearingRad = bearingRad + Math.PI / 2
        const strafeLng = (Math.sin(strafeBearingRad) * right * moveDistance) / metersPerDegLng
        const strafeLat = (Math.cos(strafeBearingRad) * right * moveDistance) / METERS_PER_DEG_LAT

        // Update position
        position[0] += forwardLng + strafeLng
        position[1] += forwardLat + strafeLat

        // IMMEDIATE camera update - no smoothing, matches key presses exactly
        // Use jumpTo for instant camera movement (no easing)
        map.jumpTo({
          center: [position[0], position[1]],
          bearing: bearing
        })

        // Update camera altitude by adjusting pitch/zoom based on altitude
        // Higher altitude = less pitch, more zoom out
        const altitudeFactor = Math.max(0, Math.min(1, (currentAltitude - 3) / 50))
        const dynamicPitch = CAMERA_PITCH - (altitudeFactor * 20) // Reduce pitch at higher altitudes
        const dynamicZoom = CAMERA_ZOOM - (altitudeFactor * 2) // Zoom out at higher altitudes
        
        map.setPitch(dynamicPitch)
        map.setZoom(dynamicZoom)

        // Update player state
        updatePose({
          position: { lng: position[0], lat: position[1] },
          heading: bearing,
          velocity: {
            lng: (forwardLng + strafeLng) / dt,
            lat: (forwardLat + strafeLat) / dt
          }
        })

        setControllerState({
          isMoving: true,
          speed: MOVE_SPEED,
          altitude: currentAltitude,
          position: { lng: position[0], lat: position[1] },
          bearing: bearing
        })
      } else {
        // When stopped, IMMEDIATELY stop camera movement
        // Use jumpTo to ensure camera stops exactly where it is (no drift)
        map.jumpTo({
          center: [position[0], position[1]],
          bearing: bearing
        })

        // Still update altitude even when not moving
        setControllerState(prev => ({ 
          ...prev, 
          isMoving: false, 
          speed: 0,
          altitude: currentAltitude,
          position: { lng: position[0], lat: position[1] },
          bearing: bearing
        }))
      }

          // Update position callback in real-time for proximity hints (every frame)
          if (positionCallbackRef.current) {
            positionCallbackRef.current({ 
              lng: position[0], 
              lat: position[1], 
              bearing 
            })
          }

          // Check landmarks (throttled)
          if (currentTime - lastLandmarkCheck > 500) {
            const playerPos = { lng: position[0], lat: position[1] }
            const nearby = checkNearbyLandmarks(playerPos, landmarks, visitedLandmarks, 40)
            nearby.forEach(hit => {
              const landmarkData = landmarks.find(l => l.id === hit.id)
              if (landmarkData) {
                landmarkCallbackRef.current?.(hit.id, landmarkData)
              }
            })
          }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      console.log('🦅 Fly mode deactivated')
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)

      // Restore map controls
      if (originalState.dragPan) map.dragPan.enable()
      if (originalState.dragRotate) map.dragRotate.enable()
      if (originalState.scrollZoom) map.scrollZoom.enable()
      if (originalState.doubleClickZoom) map.doubleClickZoom.enable()
      if (originalState.touchZoomRotate) map.touchZoomRotate.enable()

      canvas.style.cursor = ''
    }
  }, [map, isActive, landmarks, visitedLandmarks, updatePose])

  return controllerState
}
