'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { checkNearbyLandmarks } from '@/app/lib/proximity'
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
  speed: number // Speed in km/h for display
  altitude: number
  position?: { lng: number; lat: number }
  bearing?: number
}

const METERS_PER_DEG_LAT = 111132
const MAX_SPEED = 35 // Maximum meters per second (126 km/h) - fast and fluid
const ACCELERATION = 50 // meters per second squared - snappy response
const DECELERATION = 20 // meters per second squared - smooth momentum
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

// Cubic ease-out for smooth transitions
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

// Get building height at a position
function getBuildingHeightAtPosition(
  map: mapboxgl.Map,
  position: [number, number],
  radius: number
): number {
  try {
    const point = map.project(position)
    const pixels = radius * (map.getZoom() / 18)

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
    altitude: 40,
    position: undefined,
    bearing: undefined
  })

  // Use refs for callbacks and changing data to prevent effect re-runs
  const landmarkCallbackRef = useRef(onLandmarkDiscovered)
  const positionCallbackRef = useRef(onPositionChange)
  const landmarksRef = useRef(landmarks)
  const visitedLandmarksRef = useRef(visitedLandmarks)
  const updatePoseRef = useRef(updatePose)

  // Keep refs in sync with latest values
  useEffect(() => {
    landmarkCallbackRef.current = onLandmarkDiscovered
  }, [onLandmarkDiscovered])

  useEffect(() => {
    positionCallbackRef.current = onPositionChange
  }, [onPositionChange])

  useEffect(() => {
    landmarksRef.current = landmarks
  }, [landmarks])

  useEffect(() => {
    visitedLandmarksRef.current = visitedLandmarks
  }, [visitedLandmarks])

  useEffect(() => {
    updatePoseRef.current = updatePose
  }, [updatePose])

  // Main fly controller effect - only depends on map and isActive
  useEffect(() => {
    if (typeof window === 'undefined' || !map || !isActive) return

    console.log('🦅 Fly mode activated - seamless transition')

    // Track pressed keys
    const keys = new Set<string>()

    // Track player position and altitude
    const center = map.getCenter()
    let position: [number, number] = [center.lng, center.lat]
    let bearing = map.getBearing()
    let targetAltitude = 40
    let currentAltitude = 40

    // Momentum system - velocity in meters per second
    let velocityForward = 0
    let velocityRight = 0
    let currentSpeed = 0 // Track actual speed for display

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

    // Smooth entry transition with longer duration and cubic easing
    map.easeTo({
      center: position,
      zoom: CAMERA_ZOOM,
      pitch: CAMERA_PITCH,
      bearing: bearing,
      duration: 1500,
      easing: easeOutCubic
    })

    // Mouse look
    let isMouseDown = false
    const canvas = map.getCanvas()

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      // Movement keys
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault()
        keys.add(key)
      }

      // Altitude UP - Space key
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        targetAltitude = Math.min(targetAltitude + 15, MAX_ALTITUDE)
        console.log('🔼 Altitude UP:', targetAltitude)
      }

      // Altitude DOWN - Shift key
      if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault()
        targetAltitude = Math.max(targetAltitude - 15, MIN_ALTITUDE)
        console.log('🔽 Altitude DOWN:', targetAltitude)
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
      bearing += e.movementX * 0.5
      const currentPitch = map.getPitch()
      const newPitch = Math.max(50, Math.min(85, currentPitch - e.movementY * 0.3))
      map.setBearing(bearing)
      map.setPitch(newPitch)
    }

    // Animation loop
    let lastTime = performance.now()
    let animationFrameId: number
    let lastLandmarkCheck = 0
    let frameCount = 0

    const animate = (currentTime: number) => {
      if (!map || !isActive) return

      const dt = Math.min((currentTime - lastTime) / 1000, 0.05) // Cap delta time
      lastTime = currentTime

      // Calculate target movement direction from keys
      let targetForward = 0
      let targetRight = 0

      if (keys.has('w') || keys.has('arrowup')) targetForward = 1
      if (keys.has('s') || keys.has('arrowdown')) targetForward = -1
      if (keys.has('a') || keys.has('arrowleft')) targetRight = -1
      if (keys.has('d') || keys.has('arrowright')) targetRight = 1

      const hasInput = targetForward !== 0 || targetRight !== 0

      // Apply acceleration/deceleration for momentum
      if (hasInput) {
        // Accelerate towards target velocity
        const targetVelocityForward = targetForward * MAX_SPEED
        const targetVelocityRight = targetRight * MAX_SPEED

        velocityForward = lerp(velocityForward, targetVelocityForward, Math.min(dt * ACCELERATION / MAX_SPEED, 1))
        velocityRight = lerp(velocityRight, targetVelocityRight, Math.min(dt * ACCELERATION / MAX_SPEED, 1))
      } else {
        // Decelerate with momentum (gradual slow down)
        const decelerationFactor = Math.min(dt * DECELERATION / MAX_SPEED, 1)
        velocityForward = lerp(velocityForward, 0, decelerationFactor)
        velocityRight = lerp(velocityRight, 0, decelerationFactor)

        // Snap to zero when very slow to avoid endless tiny movements
        if (Math.abs(velocityForward) < 0.1) velocityForward = 0
        if (Math.abs(velocityRight) < 0.1) velocityRight = 0
      }

      // Calculate actual speed from velocity
      currentSpeed = Math.sqrt(velocityForward * velocityForward + velocityRight * velocityRight)
      const isMoving = currentSpeed > 0.1

      // Smooth altitude interpolation
      const altitudeLerpFactor = Math.min(dt * 5, 1)
      currentAltitude = lerp(currentAltitude, targetAltitude, altitudeLerpFactor)

      // Check for building collisions (throttled)
      if (currentTime - lastLandmarkCheck > 200) {
        const buildingHeight = getBuildingHeightAtPosition(map, position, COLLISION_CHECK_RADIUS)
        const requiredAltitude = buildingHeight + SAFE_BUILDING_CLEARANCE

        if (requiredAltitude > targetAltitude) {
          targetAltitude = Math.min(requiredAltitude, MAX_ALTITUDE)
        }
      }

      if (isMoving) {
        // Calculate movement using velocity
        const bearingRad = (bearing * Math.PI) / 180
        const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((position[1] * Math.PI) / 180)

        // Forward/backward movement based on velocity
        const forwardLng = (Math.sin(bearingRad) * velocityForward * dt) / metersPerDegLng
        const forwardLat = (Math.cos(bearingRad) * velocityForward * dt) / METERS_PER_DEG_LAT

        // Left/right strafe movement based on velocity
        const strafeBearingRad = bearingRad + Math.PI / 2
        const strafeLng = (Math.sin(strafeBearingRad) * velocityRight * dt) / metersPerDegLng
        const strafeLat = (Math.cos(strafeBearingRad) * velocityRight * dt) / METERS_PER_DEG_LAT

        // Update position
        position[0] += forwardLng + strafeLng
        position[1] += forwardLat + strafeLat

        // Update camera
        map.setCenter([position[0], position[1]])
        map.setBearing(bearing)

        // Update camera altitude by adjusting pitch/zoom
        const altitudeFactor = Math.max(0, Math.min(1, (currentAltitude - MIN_ALTITUDE) / 100))
        const dynamicPitch = CAMERA_PITCH - (altitudeFactor * 25)
        const dynamicZoom = CAMERA_ZOOM - (altitudeFactor * 3)

        const currentPitch = map.getPitch()
        const currentZoom = map.getZoom()
        if (Math.abs(currentPitch - dynamicPitch) > 1) {
          map.setPitch(dynamicPitch)
        }
        if (Math.abs(currentZoom - dynamicZoom) > 0.2) {
          map.setZoom(dynamicZoom)
        }

        // Update player state via ref
        updatePoseRef.current({
          position: { lng: position[0], lat: position[1] },
          heading: bearing,
          velocity: {
            lng: (forwardLng + strafeLng) / dt,
            lat: (forwardLat + strafeLat) / dt
          }
        })

        // Reduced throttle for more responsive UI (every 3 frames instead of 5)
        frameCount++
        if (frameCount % 3 === 0) {
          // Calculate actual speed in km/h
          const speedKmh = Math.round(currentSpeed * 3.6)
          setControllerState({
            isMoving: true,
            speed: speedKmh,
            altitude: Math.round(currentAltitude),
            position: { lng: position[0], lat: position[1] },
            bearing: bearing
          })
        }
      } else {
        // When stopped
        map.setCenter([position[0], position[1]])
        map.setBearing(bearing)

        frameCount++
        if (frameCount % 6 === 0) {
          setControllerState(prev => ({
            ...prev,
            isMoving: false,
            speed: 0,
            altitude: Math.round(currentAltitude),
            position: { lng: position[0], lat: position[1] },
            bearing: bearing
          }))
        }
      }

      // Update position callback (throttled)
      if (positionCallbackRef.current && frameCount % 3 === 0) {
        positionCallbackRef.current({
          lng: position[0],
          lat: position[1],
          bearing
        })
      }

      // Check landmarks (throttled) - use refs to get latest values
      if (currentTime - lastLandmarkCheck > 500) {
        lastLandmarkCheck = currentTime
        const playerPos = { lng: position[0], lat: position[1] }
        const nearby = checkNearbyLandmarks(playerPos, landmarksRef.current, visitedLandmarksRef.current, 40)
        nearby.forEach(hit => {
          const landmarkData = landmarksRef.current.find(l => l.id === hit.id)
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
  }, [map, isActive]) // Only depend on map and isActive - everything else via refs

  return controllerState
}

