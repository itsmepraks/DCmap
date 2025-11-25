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
const MOVE_SPEED = 2000 // meters per second - extremely fast, 50x faster
const CAMERA_PITCH = 75 // degrees - looking down at street level
const CAMERA_ZOOM = 18.5 // close zoom for street view

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
    
    // Track player position
    const center = map.getCenter()
    let position: [number, number] = [center.lng, center.lat]
    let bearing = map.getBearing()

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

    // Initialize position in state
    setControllerState({
      isMoving: false,
      speed: 0,
      altitude: 6,
      position: { lng: position[0], lat: position[1] },
      bearing: bearing
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
      // More responsive mouse look - 2x faster
      bearing += e.movementX * 0.6
      const currentPitch = map.getPitch()
      const newPitch = Math.max(50, Math.min(85, currentPitch - e.movementY * 0.4))
      map.setBearing(bearing)
      map.setPitch(newPitch)
    }

    // Animation loop
    let lastTime = performance.now()
    let animationFrameId: number

    const animate = (currentTime: number) => {
      if (!map || !isActive) return

      const dt = Math.min((currentTime - lastTime) / 1000, 0.008) // Cap at ~120fps for ultra-smooth movement
      lastTime = currentTime

      // Calculate movement direction
      let forward = 0
      let right = 0

      if (keys.has('w') || keys.has('arrowup')) forward = 1
      if (keys.has('s') || keys.has('arrowdown')) forward = -1
      if (keys.has('a') || keys.has('arrowleft')) right = -1
      if (keys.has('d') || keys.has('arrowright')) right = 1

      const isMoving = forward !== 0 || right !== 0

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

        // Update map center with smooth interpolation for ultra-responsive feel
        const currentCenter = map.getCenter()
        const targetLng = position[0]
        const targetLat = position[1]
        
        // Immediate update for maximum responsiveness
        map.setCenter([targetLng, targetLat])
        map.setBearing(bearing)

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
          altitude: 6,
          position: { lng: position[0], lat: position[1] },
          bearing: bearing
        })
      } else {
        setControllerState(prev => ({ 
          ...prev, 
          isMoving: false, 
          speed: 0,
          position: { lng: position[0], lat: position[1] },
          bearing: bearing
        }))
      }

      // Check landmarks (throttled)
      const now = Date.now()
      if (now % 500 < dt * 1000) {
        const playerPos = { lng: position[0], lat: position[1] }
        const nearby = checkNearbyLandmarks(playerPos, landmarks, visitedLandmarks, 40)
        nearby.forEach(hit => {
          const landmarkData = landmarks.find(l => l.id === hit.id)
          if (landmarkData) {
            landmarkCallbackRef.current?.(hit.id, landmarkData)
          }
        })

        const nearest = findNearestLandmark(playerPos, landmarks)
        if (nearest && positionCallbackRef.current) {
          positionCallbackRef.current({ ...playerPos, bearing })
        }
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
