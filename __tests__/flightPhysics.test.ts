import { damp, movementInput, movePosition, FLIGHT_SPEED } from '../app/lib/flightPhysics'
import { insideBuilding } from '../app/lib/buildingCollision'

describe('flight movement', () => {
  it('keeps diagonal travel at the same speed as forward travel', () => {
    const diagonal = movementInput(1, 1, FLIGHT_SPEED)
    expect(Math.hypot(diagonal.forward, diagonal.right)).toBeCloseTo(FLIGHT_SPEED)
  })
  it('responds equally at 30 and 144 fps', () => {
    const simulate = (fps: number) => {
      let speed = 0
      for (let i = 0; i < fps; i++) speed = damp(speed, 12, 8, 1 / fps)
      return speed
    }
    expect(simulate(30)).toBeCloseTo(simulate(144), 8)
  })
  it('brakes to a complete stop instead of drifting forever', () => {
    let speed = 40
    for (let i = 0; i < 120; i++) speed = damp(speed, 0, 8, 1 / 60)
    expect(speed).toBe(0)
  })
  it('moves in camera-relative directions at DC latitude', () => {
    const north = movePosition(-77, 38.9, 12, 0, 0, 1)
    const east = movePosition(-77, 38.9, 12, 0, 90, 1)
    const strafe = movePosition(-77, 38.9, 0, 12, 0, 1)
    expect(north.lng).toBe(-77)
    expect(north.lat).toBeGreaterThan(38.9)
    expect(east.lng).toBeGreaterThan(-77)
    expect(east.lat).toBeCloseTo(38.9)
    expect(strafe).toEqual(east)
  })
})

describe('building clearance', () => {
  const outer = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]
  const courtyard = [[3, 3], [7, 3], [7, 7], [3, 7], [3, 3]]
  it('detects roofs while leaving courtyards and streets open', () => {
    const geometry = { type: 'Polygon' as const, coordinates: [outer, courtyard] }
    expect(insideBuilding([1, 1], geometry)).toBe(true)
    expect(insideBuilding([5, 5], geometry)).toBe(false)
    expect(insideBuilding([11, 1], geometry)).toBe(false)
  })
  it('supports multi-part buildings', () => {
    expect(insideBuilding([1, 1], { type: 'MultiPolygon', coordinates: [[outer]] })).toBe(true)
  })
})
