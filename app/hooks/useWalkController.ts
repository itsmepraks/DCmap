'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { AVATAR_CONFIGS } from '@/app/types/avatar'
import { usePlayerState } from '@/app/lib/playerState'
import { loadWalkGraph, buildGraphSegments, type WalkGraphSegment } from '@/app/lib/walkGraph'
import { snapLngLatToRoad } from '@/app/lib/roadSnap'
import { checkNearbyLandmarks, findNearestLandmark, getBearing } from '@/app/lib/proximityDetector'
import { computeMovementDelta, getDeltaTimeScale } from '@/app/lib/movementMath'

interface UseWalkControllerOptions {
  map: mapboxgl.Map | null
  isActive: boolean
  avatarType: keyof typeof AVATAR_CONFIGS
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>
  visitedLandmarks: Set<string>
  onLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
  onPlayerPositionChange?: (position: { lng: number; lat: number; bearing: number; nearestLandmark: any }) => void
}

export interface WalkControllerState {
  isMoving: boolean
  isRunning: boolean
  isThirdPersonView: boolean
}

// Helper to calculate camera position behind player
function getFollowCameraPosition(
  center: [number, number], 
  bearing: number, 
  distanceMeters: number = 20 // Distance behind player
): [number, number] {
  const [lng, lat] = center
  const rad = (bearing + 180) * (Math.PI / 180) // Backwards
  
  // Approximate degrees per meter
  const mPerDegLat = 111132
  const mPerDegLng = 111132 * Math.cos(lat * (Math.PI / 180))
  
  const deltaLat = (Math.cos(rad) * distanceMeters) / mPerDegLat
  const deltaLng = (Math.sin(rad) * distanceMeters) / mPerDegLng
  
  return [lng + deltaLng, lat + deltaLat]
}

export function useWalkController({
  map,
  isActive,
  avatarType,
  landmarks,
  visitedLandmarks,
  onLandmarkDiscovered,
  onPlayerPositionChange
}: UseWalkControllerOptions) {
  const { updatePose } = usePlayerState()
  const [graphSegments, setGraphSegments] = useState<WalkGraphSegment[]>([])
  const [controllerState, setControllerState] = useState<WalkControllerState>({
    isMoving: false,
    isRunning: false,
    isThirdPersonView: true // Default to true for Follow Cam
  })
  const landmarkCallbackRef = useRef(onLandmarkDiscovered)
  const positionCallbackRef = useRef(onPlayerPositionChange)
  
  // Use refs to track state without causing re-renders on every frame
  const localStateRef = useRef({
    isMoving: false,
    isRunning: false,
    isThirdPersonView: true
  })

  useEffect(() => {
    landmarkCallbackRef.current = onLandmarkDiscovered
  }, [onLandmarkDiscovered])

  useEffect(() => {
    positionCallbackRef.current = onPlayerPositionChange
  }, [onPlayerPositionChange])

  useEffect(() => {
    let cancelled = false
    loadWalkGraph()
      .then((graph) => {
        if (cancelled) return
        setGraphSegments(buildGraphSegments(graph))
      })
      .catch((error) => console.error('Failed to load walk graph', error))

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!map || !isActive) return

    const avatarConfig = AVATAR_CONFIGS[avatarType]
    const { speed: avatarSpeed } = avatarConfig

    const keys: Record<string, boolean> = {}
    let isShiftPressed = false
    let lastTimestamp: number | null = null
    let lastProximityCheck = Date.now()

    // Grounded Third Person Camera
    const GROUNDED_PITCH = 65  // Looking down at ~65 degrees (not too flat, not top-down)
    const FOLLOW_DISTANCE = 25 // Meters behind player
    const FOLLOW_ZOOM = 18     // Zoom level

    const updateControllerState = (partial: Partial<WalkControllerState>) => {
      Object.assign(localStateRef.current, partial)
      setControllerState((prev) => {
        const next = { ...prev, ...partial }
        if (prev.isMoving === next.isMoving && 
            prev.isRunning === next.isRunning && 
            prev.isThirdPersonView === next.isThirdPersonView) {
          return prev
        }
        return next
      })
    }

    // Initialize grounded follow camera
    const center = map.getCenter()
    const initialBearing = map.getBearing()
    const cameraPos = getFollowCameraPosition([center.lng, center.lat], initialBearing, FOLLOW_DISTANCE)
    
    map.easeTo({
      center: cameraPos,
      pitch: GROUNDED_PITCH,
      zoom: FOLLOW_ZOOM,
      bearing: initialBearing,
      duration: 1200,
      easing: (t) => t * (2 - t)
    })

    const interactionState = {
      scrollZoom: map.scrollZoom.isEnabled(),
      boxZoom: map.boxZoom.isEnabled(),
      dragRotate: map.dragRotate.isEnabled(),
      dragPan: map.dragPan.isEnabled(),
      keyboard: map.keyboard.isEnabled(),
      doubleClickZoom: map.doubleClickZoom.isEnabled(),
      touchZoomRotate: map.touchZoomRotate.isEnabled()
    }

    // Disable standard controls to take over with WASD + Mouse Look
    map.scrollZoom.enable() // Allow zoom adjustment
    map.boxZoom.disable()
    map.dragRotate.disable()
    map.dragPan.disable()
    map.keyboard.disable()
    map.doubleClickZoom.disable()
    map.touchZoomRotate.disable()

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault()
        keys[key] = true
      }
      if (e.key === 'Shift') {
        isShiftPressed = true
        updateControllerState({ isRunning: true })
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keys[key] = false
      if (e.key === 'Shift') {
        isShiftPressed = false
        updateControllerState({ isRunning: false })
      }
    }

    // Mouse Look Logic
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        map.getCanvas().style.cursor = 'crosshair'
      }
    }

    const handleMouseUp = () => {
      map.getCanvas().style.cursor = ''
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (e.buttons !== 1) return
      const deltaX = e.movementX
      const deltaY = e.movementY
      
      // Rotate bearing
      const currentBearing = map.getBearing()
      const newBearing = currentBearing + deltaX * 0.35
      map.setBearing(newBearing)
      
      // Pitch adjustment (clamped)
      const currentPitch = map.getPitch()
      const minPitch = 45  // Don't look too high (top-down)
      const maxPitch = 80  // Don't look too low (flat)
      const newPitch = Math.max(minPitch, Math.min(maxPitch, currentPitch - deltaY * 0.35))
      map.setPitch(newPitch)
      
      // Since we rotated the camera, we need to re-calculate camera position relative to player
      // to maintain the "follow" offset immediately
      // However, we don't have the exact player position here easily without recalculating it or storing it
      // For now, the animation loop handles the smooth follow catch-up
    }

    const snapToGraph = (candidate: [number, number]) => {
      if (!map) return null
      if (graphSegments.length === 0) {
        return snapLngLatToRoad(map, candidate)
      }
      // ... (existing snap logic) ...
      const targetPoint = map.project(candidate)
      let closestDistance = Number.POSITIVE_INFINITY
      let snappedLngLat: [number, number] | null = null

      for (const segment of graphSegments) {
        const startPoint = map.project([segment.start.lng, segment.start.lat])
        const endPoint = map.project([segment.end.lng, segment.end.lat])
        const abx = endPoint.x - startPoint.x
        const aby = endPoint.y - startPoint.y
        const abSq = abx * abx + aby * aby
        if (abSq === 0) continue

        const apx = targetPoint.x - startPoint.x
        const apy = targetPoint.y - startPoint.y
        let t = (apx * abx + apy * aby) / abSq
        t = Math.max(0, Math.min(1, t))

        const projPoint = { x: startPoint.x + abx * t, y: startPoint.y + aby * t }
        const distance = Math.hypot(targetPoint.x - projPoint.x, targetPoint.y - projPoint.y)
        if (distance < closestDistance) {
          closestDistance = distance
          const lngLat = map.unproject([projPoint.x, projPoint.y])
          snappedLngLat = [lngLat.lng, lngLat.lat]
        }
      }
      return snappedLngLat
    }

    // Initial alignment
    const alignToRoad = () => {
      const startCenter = map.getCenter()
      const snappedStart = snapToGraph([startCenter.lng, startCenter.lat])
      if (snappedStart) {
        // Instead of jumping center to player, jump camera to offset
        const bearing = map.getBearing()
        const cameraPos = getFollowCameraPosition(snappedStart, bearing, FOLLOW_DISTANCE)
        
        map.jumpTo({ center: cameraPos })
        updatePose({
          position: { lng: snappedStart[0], lat: snappedStart[1] },
          heading: bearing,
          velocity: { lng: 0, lat: 0 }
        })
        // Also track internal player pos for the loop to use
        // We'll store it in a mutable way for the animation loop if needed, 
        // or just rely on map center offset? 
        // Actually, since we move the camera, 'map.getCenter()' is no longer the player position.
        // We MUST track player position separately now.
      }
    }
    
    // We need to track player position locally because map.getCenter() is now the CAMERA position
    // Initialize from map center, then diverge
    let playerPosition: [number, number] = [map.getCenter().lng, map.getCenter().lat]
    
    // Try to snap initial position
    const initialSnap = snapToGraph(playerPosition)
    if (initialSnap) {
        playerPosition = initialSnap
    }

    let animationFrameId = 0

    const animate = (timestamp: number) => {
      if (!map) return
      if (lastTimestamp === null) lastTimestamp = timestamp
      const dtScale = getDeltaTimeScale(lastTimestamp, timestamp)
      lastTimestamp = timestamp

      const bearing = map.getBearing()
      const currentSpeed = isShiftPressed ? avatarSpeed.run : avatarSpeed.walk
      const { deltaLng, deltaLat, moving } = computeMovementDelta({
        forward: !!(keys['w'] || keys['arrowup']),
        backward: !!(keys['s'] || keys['arrowdown']),
        left: !!(keys['a'] || keys['arrowleft']),
        right: !!(keys['d'] || keys['arrowright']),
        bearing,
        baseSpeed: currentSpeed,
        dtScale
      })

      updateControllerState({ isMoving: moving })

      if (moving) {
        const tentativeLng = playerPosition[0] + deltaLng
        const tentativeLat = playerPosition[1] + deltaLat
        const snapped = snapToGraph([tentativeLng, tentativeLat])

        if (snapped) {
          playerPosition = snapped
          
          // Update global state
          updatePose({
            position: { lng: snapped[0], lat: snapped[1] },
            velocity: { lng: deltaLng, lat: deltaLat },
            heading: bearing
          })
        } else {
            // If unsnapped (e.g. too far from road), maybe slide or stop
            // For now, just stop to prevent walking into void
            updateControllerState({ isMoving: false })
        }
      } else {
        updatePose({ heading: bearing })
      }

      // CAMERA FOLLOW LOGIC
      // Calculate where the camera SHOULD be
      const targetCameraPos = getFollowCameraPosition(playerPosition, bearing, FOLLOW_DISTANCE)
      
      // Smoothly interpolate current camera pos to target
      // Or just set it if we want rigid follow
      // For smoothness, we can use map.easeTo with 0 duration (instant) but calculated interpolation
      // actually map.setCenter is best for per-frame updates
      
      // Linear interpolation (Lerp) for smooth camera lag
      const currentCamera = map.getCenter()
      const lerpFactor = 0.1 // Adjust for "weight" of camera
      
      const nextCameraLng = currentCamera.lng + (targetCameraPos[0] - currentCamera.lng) * lerpFactor
      const nextCameraLat = currentCamera.lat + (targetCameraPos[1] - currentCamera.lat) * lerpFactor
      
      map.setCenter([nextCameraLng, nextCameraLat])

      // Check Landmarks
      const now = Date.now()
      if (now - lastProximityCheck > 500) {
        lastProximityCheck = now
        const playerPosObj = { lng: playerPosition[0], lat: playerPosition[1] }
        const nearby = checkNearbyLandmarks(playerPosObj, landmarks, visitedLandmarks, 50)
        
        nearby.forEach((discovery) => {
          const landmarkData = landmarks.find((l) => l.id === discovery.id)
          if (landmarkData) {
            landmarkCallbackRef.current?.(discovery.id, landmarkData)
          }
        })

        const nearest = findNearestLandmark(playerPosObj, landmarks)
        if (nearest && positionCallbackRef.current) {
          const landmarkBearing = getBearing(playerPosObj, nearest.coordinates)
          positionCallbackRef.current({
            lng: playerPosition[0],
            lat: playerPosition[1],
            bearing: bearing,
            nearestLandmark: {
              name: nearest.name,
              distance: nearest.distance!,
              bearing: landmarkBearing
            }
          })
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    const canvas = map.getCanvas()
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      // Restore controls
      interactionState.scrollZoom ? map.scrollZoom.enable() : map.scrollZoom.disable()
      interactionState.boxZoom ? map.boxZoom.enable() : map.boxZoom.disable()
      interactionState.dragRotate ? map.dragRotate.enable() : map.dragRotate.disable()
      interactionState.dragPan ? map.dragPan.enable() : map.dragPan.disable()
      interactionState.keyboard ? map.keyboard.enable() : map.keyboard.disable()
      interactionState.doubleClickZoom ? map.doubleClickZoom.enable() : map.doubleClickZoom.disable()
      interactionState.touchZoomRotate ? map.touchZoomRotate.enable() : map.touchZoomRotate.disable()
      
      // Update ref instead of state to avoid re-render loop
      localStateRef.current = {
        isMoving: false,
        isRunning: false,
        isThirdPersonView: false
      }
    }
  }, [
    map,
    isActive,
    avatarType,
    graphSegments,
    landmarks,
    updatePose
  ])

  return controllerState
}

