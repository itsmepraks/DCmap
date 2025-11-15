'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import type { AvatarType } from '@/app/types/avatar'
import { usePlayerState, type CameraRigConfig } from '@/app/lib/playerState'

interface UseChaseCameraOptions {
  map: mapboxgl.Map | null
  isActive: boolean
  avatarType: AvatarType
}

const lerp = (start: number, end: number, alpha: number) => start + (end - start) * alpha

const RIG_OVERRIDES: Record<AvatarType, Partial<CameraRigConfig>> = {
  human: { distance: 18, height: 6, lookAhead: 12, stiffness: 0.18 },
  scooter: { distance: 22, height: 5, lookAhead: 18, stiffness: 0.2 }
}

export function useChaseCamera({ map, isActive, avatarType }: UseChaseCameraOptions) {
  const { state: playerState } = usePlayerState()
  const cameraPositionRef = useRef<mapboxgl.MercatorCoordinate | null>(null)
  const positionRef = useRef(playerState.position)
  const headingRef = useRef(playerState.heading)
  const rigRef = useRef(playerState.cameraRig)

  useEffect(() => {
    positionRef.current = playerState.position
  }, [playerState.position])

  useEffect(() => {
    headingRef.current = playerState.heading
  }, [playerState.heading])

  useEffect(() => {
    rigRef.current = playerState.cameraRig
  }, [playerState.cameraRig])

  useEffect(() => {
    if (!map || !isActive) {
      cameraPositionRef.current = null
      return
    }

    let animationFrame: number

    const updateCamera = () => {
      if (!map) return
      const currentPosition = positionRef.current
      if (!currentPosition) {
        animationFrame = requestAnimationFrame(updateCamera)
        return
      }

      const heading = headingRef.current
      const override = RIG_OVERRIDES[avatarType] ?? {}
      const rig: CameraRigConfig = {
        ...rigRef.current,
        ...override
      }
      const merc = mapboxgl.MercatorCoordinate.fromLngLat(currentPosition, 0)
      const metersToUnits = merc.meterInMercatorCoordinateUnits()

      const distanceUnits = rig.distance * metersToUnits
      const heightUnits = rig.height * metersToUnits
      const lookAheadUnits = rig.lookAhead * metersToUnits
      const stiffness = rig.stiffness ?? 0.15

      const bearingRad = (heading * Math.PI) / 180
      const chasePosition = new mapboxgl.MercatorCoordinate(
        merc.x - Math.sin(bearingRad) * distanceUnits,
        merc.y - Math.cos(bearingRad) * distanceUnits,
        heightUnits
      )
      const lookAtPoint = new mapboxgl.MercatorCoordinate(
        merc.x + Math.sin(bearingRad) * lookAheadUnits,
        merc.y + Math.cos(bearingRad) * lookAheadUnits,
        0
      )

      const camera = map.getFreeCameraOptions()
      const previous = cameraPositionRef.current ?? chasePosition
      camera.position = new mapboxgl.MercatorCoordinate(
        lerp(previous.x, chasePosition.x, stiffness),
        lerp(previous.y, chasePosition.y, stiffness),
        lerp(previous.z, chasePosition.z, stiffness)
      )
      // Convert MercatorCoordinate to LngLat for lookAtPoint
      camera.lookAtPoint(lookAtPoint.toLngLat())
      map.setFreeCameraOptions(camera)
      cameraPositionRef.current = camera.position

      animationFrame = requestAnimationFrame(updateCamera)
    }

    animationFrame = requestAnimationFrame(updateCamera)

    return () => {
      cancelAnimationFrame(animationFrame)
      cameraPositionRef.current = null
      map.easeTo({
        pitch: 50,
        bearing: 0,
        duration: 600
      })
    }
  }, [map, isActive, avatarType])
}


