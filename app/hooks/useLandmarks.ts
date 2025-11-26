'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMap } from '@/app/lib/MapContext'
import { getNearbyLandmarks, type NearbyLandmark } from '@/app/lib/proximityCalculator'
import { isNearBorder, getBorderDirection } from '@/app/lib/worldBorder'

interface Landmark {
  id: string
  name: string
  description: string
  funFact: string
  category: string
  icon: string
  coordinates: [number, number]
}

interface DiscoveryData {
  name: string
  icon: string
}

export function useLandmarks(visitedLandmarks: Set<string>) {
  const [landmarks, setLandmarks] = useState<Landmark[]>([])
  const [nearbyLandmarks, setNearbyLandmarks] = useState<NearbyLandmark[]>([])
  const [showDiscovery, setShowDiscovery] = useState(false)
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null)
  const [showBorderWarning, setShowBorderWarning] = useState(false)
  const [borderDirection, setBorderDirection] = useState('')
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null)
  
  const { map } = useMap()

  // Load landmarks data
  useEffect(() => {
    fetch('/data/landmarks.geojson')
      .then(res => res.json())
      .then(data => {
        setLandmarks(data.features.map((f: any) => ({
          id: f.properties.id,
          name: f.properties.name,
          description: f.properties.description,
          funFact: f.properties.funFact,
          category: f.properties.category,
          icon: f.properties.icon,
          coordinates: f.geometry.coordinates
        })))
      })
      .catch(err => console.error('Failed to load landmarks:', err))
  }, [])

  // Update proximity hints in real-time based on map center or fly position
  // Uses requestAnimationFrame for smooth real-time distance updates
  useEffect(() => {
    if (!map || !landmarks.length) return

    let animationFrameId: number | null = null
    let lastUpdateTime = 0
    const UPDATE_INTERVAL = 100 // Update every 100ms for smooth real-time feel

    const updateProximity = (currentTime: number) => {
      // Throttle updates to every 100ms for performance
      if (currentTime - lastUpdateTime < UPDATE_INTERVAL) {
        animationFrameId = requestAnimationFrame(updateProximity)
        return
      }
      lastUpdateTime = currentTime

      // Use currentPosition if set (from fly mode), otherwise use map center
      const center = map.getCenter()
      const currentPos: [number, number] = currentPosition || [center.lng, center.lat]
      
      const nearby = getNearbyLandmarks(
        currentPos,
        landmarks,
        1000, // 1km radius
        visitedLandmarks
      )
      
      // Always update to get real-time distance changes (not just when IDs change)
      setNearbyLandmarks(nearby)
      
      // Check for world border warning
      const nearBorder = isNearBorder(center.lng, center.lat)
      setShowBorderWarning(nearBorder)
      if (nearBorder) {
        const direction = getBorderDirection(center.lng, center.lat)
        if (direction) setBorderDirection(direction)
      }

      animationFrameId = requestAnimationFrame(updateProximity)
    }

    // Start continuous updates for real-time distance tracking
    animationFrameId = requestAnimationFrame(updateProximity)

    // Also update on map move for immediate response
    const handleMapMove = () => {
      const center = map.getCenter()
      const currentPos: [number, number] = currentPosition || [center.lng, center.lat]
      const nearby = getNearbyLandmarks(
        currentPos,
        landmarks,
        1000,
        visitedLandmarks
      )
      setNearbyLandmarks(nearby)
    }
    map.on('move', handleMapMove)

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
      map.off('move', handleMapMove)
    }
  }, [map, landmarks, visitedLandmarks, currentPosition])

  const showDiscoveryAnimation = (landmarkId: string) => {
    const landmark = landmarks.find(l => l.id === landmarkId)
    if (landmark) {
      setDiscoveryData({
        name: landmark.name,
        icon: landmark.icon
      })
      setShowDiscovery(true)
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setShowDiscovery(false)
      }, 3000)
    }
  }

  const navigateToLandmark = (landmarkId: string) => {
    const landmark = landmarks.find(l => l.id === landmarkId)
    if (landmark && map) {
      map.flyTo({
        center: landmark.coordinates,
        zoom: 17,
        duration: 2000,
        essential: true
      })
    }
  }

  const getLandmarkById = (id: string) => {
    return landmarks.find(l => l.id === id)
  }

  const landmarksWithStatus = landmarks.map(l => ({
    ...l,
    visited: visitedLandmarks.has(l.id)
  }))

  // Function to update current position (called from fly controller for real-time updates)
  const updateCurrentPosition = useCallback((position: [number, number] | null) => {
    setCurrentPosition(position)
  }, [])

  return {
    landmarks,
    landmarksWithStatus,
    nearbyLandmarks,
    showDiscovery,
    discoveryData,
    showBorderWarning,
    borderDirection,
    showDiscoveryAnimation,
    navigateToLandmark,
    getLandmarkById,
    updateCurrentPosition
  }
}

