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
    isThirdPersonView: false
  })
  const landmarkCallbackRef = useRef(onLandmarkDiscovered)
  const positionCallbackRef = useRef(onPlayerPositionChange)
  
  // Use refs to track state without causing re-renders on every frame
  const localStateRef = useRef({
    isMoving: false,
    isRunning: false,
    isThirdPersonView: false
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

    // Road-level street view camera - like Google Street View
    const STREET_VIEW_PITCH = 80  // Almost horizontal - see buildings from road level
    const STREET_VIEW_ZOOM = 19   // Close zoom for immersive street view

    const updateControllerState = (partial: Partial<WalkControllerState>) => {
      // Update local ref immediately
      Object.assign(localStateRef.current, partial)
      // Batch React state updates to prevent excessive re-renders
      setControllerState((prev) => {
        const next = { ...prev, ...partial }
        // Only trigger re-render if state actually changed
        if (prev.isMoving === next.isMoving && 
            prev.isRunning === next.isRunning && 
            prev.isThirdPersonView === next.isThirdPersonView) {
          return prev
        }
        return next
      })
    }

    // Initialize street-level camera
    map.easeTo({
      pitch: STREET_VIEW_PITCH,
      zoom: STREET_VIEW_ZOOM,
      bearing: 0,
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

    map.scrollZoom.enable()
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

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        map.getCanvas().style.cursor = 'crosshair'
        map.dragRotate.disable()
        map.dragPan.disable()
      }
    }

    const handleMouseUp = () => {
      map.getCanvas().style.cursor = ''
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (e.buttons !== 1) return
      const deltaX = e.movementX
      const deltaY = e.movementY
      // Allow rotating camera left/right
      map.setBearing(map.getBearing() + deltaX * 0.35)
      // Allow limited pitch adjustment for street view
      const currentPitch = map.getPitch()
      const minPitch = 70  // Keep it mostly horizontal (street level)
      const maxPitch = 85  // Maximum pitch for road view
      const newPitch = Math.max(minPitch, Math.min(maxPitch, currentPitch - deltaY * 0.35))
      map.setPitch(newPitch)
    }

    const snapToGraph = (candidate: [number, number]) => {
      if (!map) return null
      if (graphSegments.length === 0) {
        return snapLngLatToRoad(map, candidate)
      }

      const targetPoint = map.project(candidate)
      let closestDistance = Number.POSITIVE_INFINITY
      let snappedLngLat: [number, number] | null = null

      for (const segment of graphSegments) {
        const startPoint = map.project([segment.start.lng, segment.start.lat])
        const endPoint = map.project([segment.end.lng, segment.end.lat])

        const abx = endPoint.x - startPoint.x
        const aby = endPoint.y - startPoint.y
        const abSq = abx * abx + aby * aby
        if (abSq === 0) {
          continue
        }

        const apx = targetPoint.x - startPoint.x
        const apy = targetPoint.y - startPoint.y
        let t = (apx * abx + apy * aby) / abSq
        t = Math.max(0, Math.min(1, t))

        const projPoint = {
          x: startPoint.x + abx * t,
          y: startPoint.y + aby * t
        }

        const distance = Math.hypot(targetPoint.x - projPoint.x, targetPoint.y - projPoint.y)
        if (distance < closestDistance) {
          closestDistance = distance
          // Convert to PointLike format (array)
          const lngLat = map.unproject([projPoint.x, projPoint.y])
          snappedLngLat = [lngLat.lng, lngLat.lat]
        }
      }

      return snappedLngLat
    }

    const alignToRoad = () => {
      const startCenter = map.getCenter()
      const snappedStart = snapToGraph([startCenter.lng, startCenter.lat])
      if (snappedStart) {
        map.jumpTo({ center: snappedStart })
        updatePose({
          position: { lng: snappedStart[0], lat: snappedStart[1] },
          heading: map.getBearing(),
          velocity: { lng: 0, lat: 0 }
        })
      }
    }
    alignToRoad()

    let animationFrameId = 0

    const animate = (timestamp: number) => {
      if (!map) return
      if (lastTimestamp === null) {
        lastTimestamp = timestamp
      }
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
        // Move the player position on the map
        const center = map.getCenter()
        const tentativeLng = center.lng + deltaLng
        const tentativeLat = center.lat + deltaLat
        const snapped = snapToGraph([tentativeLng, tentativeLat])

        if (snapped) {
          // Direct camera update for smooth, lag-free movement
          // Using setCenter instead of easeTo to avoid overlapping animations
          map.setCenter(snapped)
          
          updatePose({
            position: { lng: snapped[0], lat: snapped[1] },
            velocity: { lng: deltaLng, lat: deltaLat },
            heading: bearing
          })
        } else {
          updateControllerState({ isMoving: false })
        }
      } else {
        updatePose({ heading: bearing })
      }

      const now = Date.now()
      if (now - lastProximityCheck > 500) {
        lastProximityCheck = now
        const center = map.getCenter()
        const playerPos = { lng: center.lng, lat: center.lat }
        const nearby = checkNearbyLandmarks(playerPos, landmarks, visitedLandmarks, 50)
        nearby.forEach((discovery) => {
          const landmarkData = landmarks.find((l) => l.id === discovery.id)
          if (landmarkData) {
            landmarkCallbackRef.current?.(discovery.id, landmarkData)
          }
        })

        const nearest = findNearestLandmark(playerPos, landmarks)
        if (nearest && positionCallbackRef.current) {
          const landmarkBearing = getBearing(playerPos, nearest.coordinates)
          positionCallbackRef.current({
            lng: playerPos.lng,
            lat: playerPos.lat,
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
      interactionState.scrollZoom ? map.scrollZoom.enable() : map.scrollZoom.disable()
      interactionState.boxZoom ? map.boxZoom.enable() : map.boxZoom.disable()
      interactionState.dragRotate ? map.dragRotate.enable() : map.dragRotate.disable()
      interactionState.dragPan ? map.dragPan.enable() : map.dragPan.disable()
      interactionState.keyboard ? map.keyboard.enable() : map.keyboard.disable()
      interactionState.doubleClickZoom ? map.doubleClickZoom.enable() : map.doubleClickZoom.disable()
      interactionState.touchZoomRotate ? map.touchZoomRotate.enable() : map.touchZoomRotate.disable()
      setControllerState({
        isMoving: false,
        isRunning: false,
        isThirdPersonView: false
      })
    }
  }, [
    map,
    isActive,
    avatarType,
    graphSegments,
    landmarks,
    visitedLandmarks,
    updatePose
  ])

  return controllerState
}


