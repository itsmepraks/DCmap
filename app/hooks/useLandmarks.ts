'use client'

import { useState, useEffect } from 'react'
import { useMap } from '@/app/lib/MapContext'
import { getNearbyLandmarks, type NearbyLandmark } from '@/app/lib/proximity'
import { isNearBorder, getBorderDirection } from '@/app/lib/worldBorder'

export interface Landmark {
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
    const ac = new AbortController()
    fetch('/data/landmarks.geojson', { signal: ac.signal })
      .then(res => {
        if (!res.ok) throw new Error(`landmarks: HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        if (!data?.features) return
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
      .catch(err => {
        if (err.name === 'AbortError') return
        console.warn('Failed to load landmarks:', err)
      })
    return () => ac.abort()
  }, [])

  // Recompute proximity when the map moves or the fly-mode position changes.
  // Throttled to ~5Hz; no idle work — replaces the previous always-on rAF loop.
  useEffect(() => {
    if (!map || !landmarks.length) return

    const THROTTLE_MS = 200
    let lastRun = 0
    let pending = false
    let lastNearbyIds = ''

    const recompute = () => {
      pending = false
      lastRun = performance.now()

      const center = map.getCenter()
      const currentPos: [number, number] = currentPosition || [center.lng, center.lat]

      const nearby = getNearbyLandmarks(currentPos, landmarks, 1000, visitedLandmarks)

      const nextIds = nearby.map(l => l.id).join('|')
      if (nextIds !== lastNearbyIds) {
        lastNearbyIds = nextIds
        setNearbyLandmarks(nearby)
      }

      const nearBorder = isNearBorder(center.lng, center.lat)
      setShowBorderWarning(nearBorder)
      if (nearBorder) {
        const direction = getBorderDirection(center.lng, center.lat)
        if (direction) setBorderDirection(direction)
      }
    }

    const schedule = () => {
      if (pending) return
      const wait = Math.max(0, THROTTLE_MS - (performance.now() - lastRun))
      pending = true
      window.setTimeout(recompute, wait)
    }

    // Initial compute, then drive updates from map.move only.
    recompute()
    map.on('move', schedule)

    return () => {
      map.off('move', schedule)
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
  const updateCurrentPosition = (position: [number, number] | null) => {
    setCurrentPosition(position)
  }

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

