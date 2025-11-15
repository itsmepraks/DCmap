import mapboxgl from 'mapbox-gl'

export interface NearbyLandmark {
  id: string
  name: string
  icon: string
  distance: number
  direction: string
  coordinates: [number, number]
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  const [lon1, lat1] = point1
  const [lon2, lat2] = point2
  
  const R = 6371000 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Calculate bearing between two points
 * Returns cardinal direction (N, NE, E, SE, S, SW, W, NW)
 */
export function calculateBearing(
  from: [number, number],
  to: [number, number]
): string {
  const [lon1, lat1] = from
  const [lon2, lat2] = to
  
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

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

/**
 * Check if user is close enough to discover a landmark
 * @param currentPosition Current user position [lng, lat]
 * @param landmarkPosition Landmark position [lng, lat]
 * @param discoveryRadius Discovery radius in meters (default 50m)
 * @returns boolean indicating if landmark can be discovered
 */
export function canDiscoverLandmark(
  currentPosition: [number, number] | null,
  landmarkPosition: [number, number],
  discoveryRadius: number = 50
): boolean {
  if (!currentPosition) return false
  
  const distance = calculateDistance(currentPosition, landmarkPosition)
  return distance <= discoveryRadius
}

