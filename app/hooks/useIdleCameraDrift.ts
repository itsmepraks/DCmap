'use client'

import { useEffect, useRef } from 'react'
import type mapboxgl from 'mapbox-gl'

const IDLE_TIMEOUT_MS = 12_000 // 12s of no interaction before drift kicks in
const DRIFT_DEGREES_PER_SECOND = 1.5 // gentle orbit

interface Options {
  map: mapboxgl.Map | null
  /** When true (fly mode, active panel, etc.) the drift is paused. */
  disabled?: boolean
}

/**
 * Slowly rotate the camera around the current center when the user is idle.
 * Cancels on any input. Pause / resume cleanly without re-binding events.
 */
export function useIdleCameraDrift({ map, disabled }: Options) {
  const lastInteractionRef = useRef<number>(Date.now())
  const driftingRef = useRef(false)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!map) return

    const bump = () => {
      lastInteractionRef.current = Date.now()
      if (driftingRef.current) {
        driftingRef.current = false
      }
    }

    // Any interaction with the canvas counts.
    const canvas = map.getCanvas()
    const events = ['mousedown', 'wheel', 'touchstart', 'keydown'] as const
    events.forEach((evt) => canvas.addEventListener(evt, bump, { passive: true }))
    map.on('movestart', bump)

    let lastFrame = performance.now()
    const tick = (now: number) => {
      const dt = (now - lastFrame) / 1000
      lastFrame = now

      const idleFor = Date.now() - lastInteractionRef.current
      const shouldDrift = !disabled && idleFor > IDLE_TIMEOUT_MS

      if (shouldDrift) {
        if (!driftingRef.current) driftingRef.current = true
        const nextBearing = (map.getBearing() + DRIFT_DEGREES_PER_SECOND * dt) % 360
        map.setBearing(nextBearing)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      events.forEach((evt) => canvas.removeEventListener(evt, bump))
      map.off('movestart', bump)
    }
  }, [map, disabled])
}
