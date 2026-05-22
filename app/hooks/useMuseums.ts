'use client'

import { useState, useEffect } from 'react'

export interface Museum {
  id: string
  name: string
  address?: string
  description?: string
  coordinates: [number, number]
}

export function useMuseums(visitedLandmarks: Set<string>) {
  const [museums, setMuseums] = useState<Museum[]>([])

  // Load museums data
  useEffect(() => {
    const ac = new AbortController()
    fetch('/data/museums.geojson', { signal: ac.signal })
      .then(res => {
        if (!res.ok) throw new Error(`museums: HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        if (!data?.features) return
        setMuseums(data.features.map((f: any, index: number) => ({
          id: f.properties.NAME || `museum-${index}`,
          name: f.properties.NAME || 'Unknown Museum',
          address: f.properties.ADDRESS,
          description: f.properties.DESCRIPTION,
          coordinates: f.geometry.coordinates
        })))
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        console.warn('Failed to load museums:', err)
      })
    return () => ac.abort()
  }, [])

  // Calculate visited count (using the same visitedLandmarks set)
  const visitedMuseumsCount = museums.filter(m => visitedLandmarks.has(String(m.id))).length

  // Museums with visited status
  const museumsWithStatus = museums.map(m => ({
    ...m,
    visited: visitedLandmarks.has(String(m.id))
  }))

  return {
    museums,
    museumsWithStatus,
    visitedMuseumsCount,
    totalMuseums: museums.length
  }
}
