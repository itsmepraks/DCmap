import { computeMovementDelta, getDeltaTimeScale } from '@/app/lib/movementMath'

describe('movement math helpers', () => {
  it('scales delta time relative to 60fps', () => {
    expect(getDeltaTimeScale(null, 1000)).toBe(1)
    expect(getDeltaTimeScale(1000, 1016.6667)).toBeCloseTo(1)
    expect(getDeltaTimeScale(1000, 1033.3334)).toBeCloseTo(2, 2)
  })

  it('computes WASD deltas based on bearing', () => {
    const result = computeMovementDelta({
      forward: true,
      backward: false,
      left: true,
      right: false,
      bearing: 0,
      baseSpeed: 0.001,
      dtScale: 1
    })
    expect(result.moving).toBe(true)
    expect(result.deltaLat).toBeCloseTo(0.001, 6)
    expect(result.deltaLng).toBeCloseTo(0.001, 6)
  })
})




