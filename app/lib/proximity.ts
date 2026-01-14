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

export interface NearbyLandmark {
  id: string
  name: string
  icon: string
  distance: number
  direction: string
  coordinates: [number, number]
}

// Calculate distance between two coordinates using Haversine formula
// Returns distance in meters
export function calculateDistance(pos1: Coordinates | [number, number], pos2: Coordinates | [number, number]): number {
  const p1 = Array.isArray(pos1) ? { lng: pos1[0], lat: pos1[1] } : pos1
  const p2 = Array.isArray(pos2) ? { lng: pos2[0], lat: pos2[1] } : pos2

  const R = 6371e3 // Earth's radius in meters
  const φ1 = (p1.lat * Math.PI) / 180
  const φ2 = (p2.lat * Math.PI) / 180
  const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180
  const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180

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

/**
 * Calculate bearing between two points
 * Returns cardinal direction (N, NE, E, SE, S, SW, W, NW)
 */
export function calculateBearing(
  from: [number, number] | Coordinates,
  to: [number, number] | Coordinates
): string {
  const p1 = Array.isArray(from) ? { lng: from[0], lat: from[1] } : from
  const p2 = Array.isArray(to) ? { lng: to[0], lat: to[1] } : to
  
  const φ1 = (p1.lat * Math.PI) / 180
  const φ2 = (p2.lat * Math.PI) / 180
  const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180

  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  
  let bearing = Math.atan2(y, x)
  bearing = (bearing * 180) / Math.PI
  bearing = (bearing + 360) % 360

  // Convert to cardinal direction
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(bearing / 45) % 8
  return directions[index]
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

/**
 * Get nearby landmarks within a certain radius
 * @param currentPosition Current user position [lng, lat]
 * @param landmarks Array of all landmarks
 * @param maxDistance Maximum distance in meters (default 1000m)
 * @param visitedLandmarks Set of visited landmark IDs
 * @returns Array of nearby unvisited landmarks sorted by distance
 */
export function getNearbyLandmarks(
  currentPosition: [number, number] | null,
  landmarks: any[],
  maxDistance: number = 1000,
  visitedLandmarks: Set<string> = new Set()
): NearbyLandmark[] {
  if (!currentPosition || !landmarks.length) return []

  const nearbyLandmarks: NearbyLandmark[] = []

  landmarks.forEach(landmark => {
    // Skip visited landmarks
    if (visitedLandmarks.has(landmark.id)) return

    const landmarkPos: [number, number] = [
      landmark.coordinates[0],
      landmark.coordinates[1]
    ]
    
    const distance = calculateDistance(currentPosition, landmarkPos)
    
    // Only include landmarks within maxDistance
    if (distance <= maxDistance) {
      const direction = calculateBearing(currentPosition, landmarkPos)
      
      nearbyLandmarks.push({
        id: landmark.id,
        name: landmark.name,
        icon: landmark.icon,
        distance,
        direction,
        coordinates: landmarkPos
      })
    }
  })

  // Sort by distance (closest first)
  return nearbyLandmarks.sort((a, b) => a.distance - b.distance)
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
