import mapboxgl from 'mapbox-gl'

// DC Metro Area Boundaries (Minecraft-style world border)
export const DC_BOUNDS: [[number, number], [number, number]] = [
  [-77.35, 38.75],  // Southwest corner (extended to cover entire metro)
  [-76.85, 39.1]    // Northeast corner
]

// Tighter bounds for core DC
export const DC_CORE_BOUNDS: [[number, number], [number, number]] = [
  [-77.12, 38.82],  // Southwest
  [-76.91, 38.995]  // Northeast
]

// Default center on National Mall
export const DC_CENTER: [number, number] = [-77.0365, 38.8895]

// Optimal zoom levels
export const ZOOM_LEVELS = {
  min: 11,      // Can't zoom out beyond metro view
  max: 20,      // Street-level detail
  default: 13,  // Good overview of DC
  landmark: 17  // Close-up for landmarks
}

// Border warning distance (in map units)
export const BORDER_WARNING_DISTANCE = 0.02

/**
 * Check if coordinates are near the world border
 */
export function isNearBorder(lng: number, lat: number): boolean {
  const [[minLng, minLat], [maxLng, maxLat]] = DC_BOUNDS
  
  const distToWest = lng - minLng
  const distToEast = maxLng - lng
  const distToSouth = lat - minLat
  const distToNorth = maxLat - lat
  
  return Math.min(distToWest, distToEast, distToSouth, distToNorth) < BORDER_WARNING_DISTANCE
}

/**
 * Get border direction if near border
 */
export function getBorderDirection(lng: number, lat: number): string | null {
  if (!isNearBorder(lng, lat)) return null
  
  const [[minLng, minLat], [maxLng, maxLat]] = DC_BOUNDS
  
  const distToWest = lng - minLng
  const distToEast = maxLng - lng
  const distToSouth = lat - minLat
  const distToNorth = maxLat - lat
  
  const minDist = Math.min(distToWest, distToEast, distToSouth, distToNorth)
  
  if (minDist === distToWest) return 'west'
  if (minDist === distToEast) return 'east'
  if (minDist === distToSouth) return 'south'
  return 'north'
}

/**
 * Apply world border settings to map
 */
export function applyWorldBorder(map: mapboxgl.Map): void {
  // Set max bounds
  map.setMaxBounds(DC_BOUNDS)
  
  // Set zoom constraints
  map.setMinZoom(ZOOM_LEVELS.min)
  map.setMaxZoom(ZOOM_LEVELS.max)
  
  console.log('🌍 World border activated: DC Metro Area')
}

/**
 * Check if position is within playable area
 */
export function isWithinBounds(lng: number, lat: number): boolean {
  const [[minLng, minLat], [maxLng, maxLat]] = DC_BOUNDS
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat
}

