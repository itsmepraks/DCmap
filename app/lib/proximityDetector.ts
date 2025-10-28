'use client'

export interface Coordinates {
  lng: number
  lat: number
}

export interface Landmark {
  id: string
  name: string
  coordinates: Coordinates
  distance?: number
}

// Calculate distance between two coordinates using Haversine formula
// Returns distance in meters
export function calculateDistance(pos1: Coordinates, pos2: Coordinates): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (pos1.lat * Math.PI) / 180
  const φ2 = (pos2.lat * Math.PI) / 180
  const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180
  const Δλ = ((pos2.lng - pos1.lng) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

// Check if player is within discovery range of a landmark
export function isInDiscoveryRange(playerPos: Coordinates, landmarkPos: Coordinates, range: number = 50): boolean {
  const distance = calculateDistance(playerPos, landmarkPos)
  return distance <= range
}

// Find the nearest landmark to the player
export function findNearestLandmark(
  playerPos: Coordinates,
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>
): Landmark | null {
  if (landmarks.length === 0) return null

  let nearest: Landmark | null = null
  let minDistance = Infinity

  landmarks.forEach((landmark) => {
    const landmarkPos: Coordinates = {
      lng: landmark.coordinates[0],
      lat: landmark.coordinates[1]
    }
    const distance = calculateDistance(playerPos, landmarkPos)

    if (distance < minDistance) {
      minDistance = distance
      nearest = {
        id: landmark.id,
        name: landmark.name,
        coordinates: landmarkPos,
        distance
      }
    }
  })

  return nearest
}

// Check for nearby landmarks within discovery range
export function checkNearbyLandmarks(
  playerPos: Coordinates,
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>,
  visitedIds: Set<string>,
  discoveryRange: number = 50
): Array<{ id: string; name: string; distance: number }> {
  const nearby: Array<{ id: string; name: string; distance: number }> = []

  landmarks.forEach((landmark) => {
    // Skip already visited landmarks
    if (visitedIds.has(landmark.id)) return

    const landmarkPos: Coordinates = {
      lng: landmark.coordinates[0],
      lat: landmark.coordinates[1]
    }
    const distance = calculateDistance(playerPos, landmarkPos)

    if (distance <= discoveryRange) {
      nearby.push({
        id: landmark.id,
        name: landmark.name,
        distance
      })
    }
  })

  return nearby
}

// Get bearing from player to landmark (for compass arrow)
export function getBearing(from: Coordinates, to: Coordinates): number {
  const φ1 = (from.lat * Math.PI) / 180
  const φ2 = (to.lat * Math.PI) / 180
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180

  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const θ = Math.atan2(y, x)

  return ((θ * 180) / Math.PI + 360) % 360 // Convert to degrees and normalize
}


