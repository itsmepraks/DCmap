export type WorldPosition = { x: number; y: number; z: number }
export interface RouteStop {
  id: string
  name: string
  shortName: string
  position: WorldPosition
  arrival: WorldPosition
  lookAt: WorldPosition
  description: string
  audio?: string
}
// Local metric coordinates, east along the Mall. Geometry is an architectural
// interpretation at approximately real scale, not survey or navigation data.
export const ROUTE: RouteStop[] = [
  { id: 'lincoln-memorial', name: 'Lincoln Memorial', shortName: 'Lincoln', position: { x: 0, y: 8, z: 0 }, arrival: { x: 80, y: 1, z: 34 }, lookAt: { x: 0, y: 13, z: 0 }, description: 'Climb the broad marble steps and walk between the columns. Turn east for the long view down the Reflecting Pool.', audio: '/audio/lincoln-memorial-history.m4a' },
  { id: 'reflecting-pool', name: 'Reflecting Pool', shortName: 'The pool', position: { x: 460, y: 0, z: -36 }, arrival: { x: 230, y: 1, z: -38 }, lookAt: { x: 850, y: 12, z: 0 }, description: 'Follow the shaded path beside the water. The memorial and obelisk frame opposite ends of the Mall.' },
  { id: 'wwii-memorial', name: 'World War II Memorial', shortName: 'WWII', position: { x: 870, y: 0, z: 0 }, arrival: { x: 825, y: 1, z: -58 }, lookAt: { x: 870, y: 4, z: 0 }, description: 'Explore the circular plaza, its stone pillars, and the central fountain before continuing toward the monument.' },
  { id: 'washington-monument', name: 'Washington Monument', shortName: 'Washington', position: { x: 1280, y: 0, z: 0 }, arrival: { x: 1220, y: 1, z: 35 }, lookAt: { x: 1280, y: 48, z: 0 }, description: 'Walk around the obelisk and its ring of flags, or switch to flight for a view back along the route.', audio: '/audio/washington-monument-history.m4a' },
  { id: 'smithsonian-mall', name: 'Smithsonian gardens', shortName: 'Smithsonian', position: { x: 2090, y: 0, z: -5 }, arrival: { x: 2090, y: 1, z: -25 }, lookAt: { x: 2100, y: 20, z: 53 }, description: 'Pause by the red-sandstone Smithsonian Castle and its distinctive towers. Continue east along the museum-lined green toward the Capitol. The Castle is a stylized interpretation; surrounding buildings use DC GIS footprints.' },
  { id: 'us-capitol', audio: '/audio/us-capitol-history.m4a', name: 'United States Capitol', shortName: 'Capitol', position: { x: 3240, y: 0, z: 0 }, arrival: { x: 3200, y: 1, z: 25 }, lookAt: { x: 3330, y: 45, z: 0 }, description: 'Cross the west lawn toward the Capitol’s broad wings and ribbed dome. Look west for the full length of the Mall. This landmark is an original architectural interpretation.' },
]
export const WORLD_BOUNDS = { minX: -6200, maxX: 12400, minZ: -12000, maxZ: 9800 }
export function nearestStop(position: WorldPosition) {
  return ROUTE.map(stop => ({ stop, distance: Math.hypot(stop.position.x - position.x, stop.position.z - position.z) })).sort((a, b) => a.distance - b.distance)[0]
}
export function clampWorldPosition(position: WorldPosition): WorldPosition {
  return { x: Math.max(WORLD_BOUNDS.minX, Math.min(WORLD_BOUNDS.maxX, position.x)), y: Math.max(-4, Math.min(1600, position.y)), z: Math.max(WORLD_BOUNDS.minZ, Math.min(WORLD_BOUNDS.maxZ, position.z)) }
}
export function movementVector(forward: number, right: number, yaw: number, speed: number) {
  const length = Math.max(1, Math.hypot(forward, right))
  return { x: (-Math.sin(yaw) * forward + Math.cos(yaw) * right) / length * speed, z: (-Math.cos(yaw) * forward - Math.sin(yaw) * right) / length * speed }
}
