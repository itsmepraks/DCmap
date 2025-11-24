'use client'

import { useState, useEffect } from 'react'
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

  // Update proximity hints based on map center
  useEffect(() => {
    if (!map || !landmarks.length) return

    const updateProximity = () => {
      const center = map.getCenter()
      const currentPos: [number, number] = [center.lng, center.lat]
      
      const nearby = getNearbyLandmarks(
        currentPos,
        landmarks,
        1000, // 1km radius
        visitedLandmarks
      )
      
      // Only update if nearby landmarks actually changed
      setNearbyLandmarks(prev => {
        if (JSON.stringify(prev.map(l => l.id)) === JSON.stringify(nearby.map(l => l.id))) {
          return prev
        }
        return nearby
      })
      
      // Check for world border warning
      const nearBorder = isNearBorder(center.lng, center.lat)
      setShowBorderWarning(nearBorder)
      if (nearBorder) {
        const direction = getBorderDirection(center.lng, center.lat)
        if (direction) setBorderDirection(direction)
      }
    }

    // Update on map move
    map.on('move', updateProximity)
    updateProximity() // Initial update

    return () => {
      map.off('move', updateProximity)
    }
  }, [map, landmarks])

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
    getLandmarkById
  }
}

