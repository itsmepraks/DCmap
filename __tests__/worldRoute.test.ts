import { ROUTE, clampWorldPosition, movementVector, nearestStop } from '../app/lib/world/mallRoute'

describe('National Mall route', () => {
  it('orders the west-to-east route and keeps every arrival within the world', () => {
    const positions = ROUTE.map(stop => stop.position.x)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    for (const stop of ROUTE) expect(clampWorldPosition(stop.arrival)).toEqual(stop.arrival)
  })
  it('normalizes diagonal walking and rotates input into the camera heading', () => {
    const diagonal = movementVector(1, 1, 0, 2.8)
    expect(Math.hypot(diagonal.x, diagonal.z)).toBeCloseTo(2.8)
    const east = movementVector(1, 0, -Math.PI / 2, 2.8)
    expect(east.x).toBeCloseTo(2.8)
    expect(east.z).toBeCloseTo(0)
  })
  it('finds the actual nearby stop for discovery', () => {
    expect(nearestStop({ x: 1270, y: 2, z: 0 }).stop.id).toBe('washington-monument')
    expect(nearestStop({ x: 0, y: 2, z: 0 }).distance).toBe(0)
  })
})
