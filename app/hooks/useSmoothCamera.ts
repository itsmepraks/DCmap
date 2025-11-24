'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

interface UseSmoothCameraOptions {
  map: mapboxgl.Map | null
  isActive: boolean
  targetPosition: [number, number]
  targetBearing: number
  distance?: number
  height?: number
  smoothness?: number
}

export function useSmoothCamera({
  map,
  isActive,
  targetPosition,
  targetBearing,
  distance = 18,
  height = 6,
  smoothness = 0.15
}: UseSmoothCameraOptions) {
  const animationFrameRef = useRef<number>()
  const currentPositionRef = useRef<[number, number]>(targetPosition)
  const currentBearingRef = useRef<number>(targetBearing)

  useEffect(() => {
    if (!map || !isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const smoothUpdate = () => {
      const [targetLng, targetLat] = targetPosition
      const [currentLng, currentLat] = currentPositionRef.current

      // Smooth interpolation
      const newLng = currentLng + (targetLng - currentLng) * smoothness
      const newLat = currentLat + (targetLat - currentLat) * smoothness
      
      currentPositionRef.current = [newLng, newLat]

      // Smooth bearing interpolation
      let bearingDiff = targetBearing - currentBearingRef.current
      
      // Handle wrapping (shortest path)
      if (bearingDiff > 180) bearingDiff -= 360
      if (bearingDiff < -180) bearingDiff += 360
      
      const newBearing = currentBearingRef.current + bearingDiff * smoothness
      currentBearingRef.current = newBearing

      // Calculate camera position behind player
      const rad = (newBearing + 180) * (Math.PI / 180)
      const mPerDegLat = 111132
      const mPerDegLng = 111132 * Math.cos(newLat * (Math.PI / 180))
      
      const cameraDistance = distance
      const deltaLat = (Math.cos(rad) * cameraDistance) / mPerDegLat
      const deltaLng = (Math.sin(rad) * cameraDistance) / mPerDegLng
      
      const cameraLng = newLng + deltaLng
      const cameraLat = newLat + deltaLat

      // Update camera smoothly
      map.jumpTo({
        center: [cameraLng, cameraLat],
        bearing: newBearing,
        pitch: 60,
        zoom: 18
      })

      animationFrameRef.current = requestAnimationFrame(smoothUpdate)
    }

    animationFrameRef.current = requestAnimationFrame(smoothUpdate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [map, isActive, targetPosition, targetBearing, distance, smoothness])
}

