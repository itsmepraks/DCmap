'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { insideBuilding } from '@/app/lib/buildingCollision'
import { STREETS_SOURCE } from './useMapInitialization'
import { checkNearbyLandmarks } from '@/app/lib/proximity'
import { usePlayerState } from '@/app/lib/playerState'
import { DC_BOUNDS } from '@/app/lib/worldBorder'
import { BOOST_SPEED, FLIGHT_SPEED, MIN_FLIGHT_ALTITUDE, MAX_FLIGHT_ALTITUDE, damp, movementInput, movePosition } from '@/app/lib/flightPhysics'

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
const CONTROL_KEYS = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'shift', 'q', 'e', 'r'])
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export function useFlyController(options: UseFlyControllerOptions) {
  const { map, isActive } = options
  const altitudeCommand = useRef<number | null>(null)
  const heldControls = useRef(new Set<string>())
  const setFlightAltitude = useCallback((height: number) => { altitudeCommand.current = height }, [])
  const setControl = useCallback((key: string, pressed: boolean) => {
    if (pressed) heldControls.current.add(key)
    else heldControls.current.delete(key)
  }, [])
  const { updatePose } = usePlayerState()
  const latest = useRef({ ...options, updatePose })
  useEffect(() => { latest.current = { ...options, updatePose } })
  const [state, setState] = useState<FlyControllerState>({ isMoving: false, speed: 0, altitude: 40 })

  useEffect(() => {
    if (!map || !isActive) return
    map.stop()
    const canvas = map.getCanvas()
    const oldCursor = canvas.style.cursor
    const oldMaxZoom = map.getMaxZoom()
    // A low camera needs a closer zoom limit than the overview map.
    map.setMaxZoom(24)
    const handlers = [map.dragPan, map.dragRotate, map.scrollZoom, map.doubleClickZoom, map.touchZoomRotate, map.keyboard, map.touchPitch, map.boxZoom]
    const enabled = handlers.map(handler => handler.isEnabled())
    handlers.forEach(handler => handler.disable())
    const keys = heldControls.current
    keys.clear()
    altitudeCommand.current = null
    const camera = map.getFreeCameraOptions()
    const initial = camera.position?.toLngLat() ?? map.getCenter()
    let position = { lng: initial.lng, lat: initial.lat }
    let altitude = clamp(camera.position?.toAltitude() ?? 40, MIN_FLIGHT_ALTITUDE, MAX_FLIGHT_ALTITUDE)
    let targetAltitude = altitude
    let targetPitch = clamp(map.getPitch(), 35, 85)
    let bearing = map.getBearing()
    let pitch = clamp(map.getPitch(), 35, 85)
    let forward = 0
    let right = 0
    let vertical = 0
    let dirty = true
    let dragging = false
    let lastTime = performance.now()
    let lastUI = -Infinity
    let lastDiscovery = -Infinity
    let lastCollision = -Infinity
    let groundClearance = MIN_FLIGHT_ALTITUDE
    let buildings: mapboxgl.MapboxGeoJSONFeature[] = []
    let buildingsDirty = true
    const sourceChanged = (event: mapboxgl.MapSourceDataEvent) => {
      if (event.sourceId === STREETS_SOURCE) buildingsDirty = true
    }
    map.on('sourcedata', sourceChanged)
    const collisionLayer = 'dc-flight-footprints'
    const loadFootprints = () => {
      if (map.getSource(STREETS_SOURCE) && !map.getLayer(collisionLayer)) {
        map.addLayer({ id: collisionLayer, type: 'fill', source: STREETS_SOURCE, 'source-layer': 'building', paint: { 'fill-opacity': 0 } })
      }
      buildingsDirty = true
    }
    loadFootprints()
    map.on('style.load', loadFootprints)
    let frame = 0
    let lastPublished = ''
    const discovered = new Set<string>()

    const clearInput = () => { keys.clear(); dragging = false; canvas.style.cursor = 'grab' }
    const keyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.closest?.('input, textarea, select, button, [contenteditable="true"], [role="dialog"]')) return
      if (event.metaKey || event.altKey) return
      const key = event.key.toLowerCase()
      if (CONTROL_KEYS.has(key)) { event.preventDefault(); keys.add(key) }
    }
    const keyUp = (event: KeyboardEvent) => { keys.delete(event.key.toLowerCase()) }
    let lastPointerX = 0
    let lastPointerY = 0
    const mouseDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      dragging = true
      lastPointerX = event.clientX
      lastPointerY = event.clientY
      canvas.setPointerCapture(event.pointerId)
      canvas.focus({ preventScroll: true })
      canvas.style.cursor = 'grabbing'
    }
    const mouseUp = () => { dragging = false; canvas.style.cursor = 'grab' }
    const mouseMove = (event: PointerEvent) => {
      if (!dragging) return
      const dx = event.clientX - lastPointerX
      const dy = event.clientY - lastPointerY
      lastPointerX = event.clientX
      lastPointerY = event.clientY
      bearing = ((bearing + dx * 0.18) % 360 + 360) % 360
      targetPitch = clamp(targetPitch - dy * 0.15, 20, 85)
      dirty = true
    }
    const visibility = () => { clearInput(); lastTime = performance.now() }
    canvas.style.cursor = 'grab'
    canvas.focus({ preventScroll: true })

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      if (!document.hidden) {
        if (altitudeCommand.current !== null) {
          targetAltitude = clamp(altitudeCommand.current, MIN_FLIGHT_ALTITUDE, MAX_FLIGHT_ALTITUDE)
          targetPitch = targetAltitude < 20 ? 83 : 65
          altitudeCommand.current = null
        }
        const input = movementInput(
          Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown')),
          Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft')),
          (keys.has('r') ? BOOST_SPEED : FLIGHT_SPEED) * (altitude < 20 ? 0.22 : 1),
        )
        forward = damp(forward, input.forward, 8, dt)
        right = damp(right, input.right, 8, dt)
        vertical = damp(vertical, (Number(keys.has(' ') || keys.has('e')) - Number(keys.has('shift') || keys.has('q'))) * 22, 8, dt)
        // Independent 4 Hz footprint query, with a short look-ahead to clear roofs.
        // Standard's imported model layers are not queryable by root layer ID.
        if (now - lastCollision >= 250 && map.getSource(STREETS_SOURCE)) {
          lastCollision = now
          const ahead = movePosition(position.lng, position.lat, forward, right, bearing, 0.5)
          groundClearance = MIN_FLIGHT_ALTITUDE
          if (buildingsDirty) {
            buildings = map.querySourceFeatures(STREETS_SOURCE, { sourceLayer: 'building' })
            buildingsDirty = false
          }
          for (const feature of buildings) {
            if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') continue
            if (insideBuilding([position.lng, position.lat], feature.geometry) || insideBuilding([ahead.lng, ahead.lat], feature.geometry)) {
              const height = Number(feature.properties?.height ?? feature.properties?.render_height ?? 0)
              if (Number.isFinite(height)) groundClearance = Math.max(groundClearance, height + 6)
            }
          }
        }
        targetAltitude = clamp(targetAltitude + vertical * dt, groundClearance, MAX_FLIGHT_ALTITUDE)
        const nextAltitude = damp(altitude, targetAltitude, 3, dt)
        const nextPitch = damp(pitch, targetPitch, 5, dt)
        if (altitude !== nextAltitude || pitch !== nextPitch) dirty = true
        altitude = Math.max(groundClearance, nextAltitude)
        pitch = nextPitch
        const moving = Math.hypot(forward, right, vertical) > 0
        if (moving || dirty) {
          const next = movePosition(position.lng, position.lat, forward, right, bearing, dt)
          position = {
            lng: clamp(next.lng, DC_BOUNDS[0][0] + 0.001, DC_BOUNDS[1][0] - 0.001),
            lat: clamp(next.lat, DC_BOUNDS[0][1] + 0.001, DC_BOUNDS[1][1] - 0.001),
          }
          camera.position = mapboxgl.MercatorCoordinate.fromLngLat(position, altitude)
          camera.setPitchBearing(pitch, bearing)
          map.setFreeCameraOptions(camera)
          // Read back the applied camera, including Mapbox's zoom/bounds constraints.
          const applied = map.getFreeCameraOptions().position
          if (applied) {
            const actual = applied.toLngLat()
            position = { lng: actual.lng, lat: actual.lat }
            altitude = applied.toAltitude()
          }
          dirty = false
        }
        // React, proximity, and context run at 5 Hz, never at rendering frequency.
        if (now - lastUI >= 200) {
          lastUI = now
          const snapshot = { isMoving: moving, speed: Math.round(Math.hypot(forward, right) * 3.6), altitude: Math.round(altitude), position: { ...position }, bearing }
          const signature = JSON.stringify(snapshot)
          if (signature !== lastPublished) {
            lastPublished = signature
            setState(snapshot)
            latest.current.updatePose({ position: { ...position }, heading: bearing, velocity: (() => { const v = movePosition(0, position.lat, forward, right, bearing, 1); return { lng: v.lng, lat: v.lat - position.lat } })() })
            latest.current.onPositionChange?.({ ...position, bearing })
          }
        }
        if (now - lastDiscovery >= 500) {
          lastDiscovery = now
          const { landmarks, visitedLandmarks, onLandmarkDiscovered } = latest.current
          for (const hit of checkNearbyLandmarks(position, landmarks, visitedLandmarks, 40)) {
            if (discovered.has(hit.id)) continue
            const landmark = landmarks.find(item => item.id === hit.id)
            if (landmark) { discovered.add(hit.id); onLandmarkDiscovered(hit.id, landmark) }
          }
        }
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('blur', clearInput)
    document.addEventListener('visibilitychange', visibility)
    canvas.addEventListener('pointerdown', mouseDown)
    window.addEventListener('pointerup', mouseUp)
    canvas.addEventListener('pointercancel', mouseUp)
    canvas.addEventListener('lostpointercapture', mouseUp)
    window.addEventListener('pointermove', mouseMove)
    return () => {
      cancelAnimationFrame(frame)
      keys.clear()
      map.off('sourcedata', sourceChanged)
      map.off('style.load', loadFootprints)
      if (map.getLayer(collisionLayer)) map.removeLayer(collisionLayer)
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('blur', clearInput)
      document.removeEventListener('visibilitychange', visibility)
      canvas.removeEventListener('pointerdown', mouseDown)
      window.removeEventListener('pointerup', mouseUp)
      canvas.removeEventListener('pointercancel', mouseUp)
      canvas.removeEventListener('lostpointercapture', mouseUp)
      window.removeEventListener('pointermove', mouseMove)
      handlers.forEach((handler, index) => { if (enabled[index]) handler.enable() })
      map.setMaxZoom(oldMaxZoom)
      canvas.style.cursor = oldCursor
      latest.current.updatePose({ velocity: { lng: 0, lat: 0 } })
    }
  }, [map, isActive])
  return { ...state, setFlightAltitude, setControl }
}
