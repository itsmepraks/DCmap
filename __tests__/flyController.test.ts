const mockSnapshots: any[] = []
const mockCleanups: Array<() => void> = []
const mockPose = jest.fn()
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: (initial: any) => [initial, (next: any) => mockSnapshots.push(next)],
  useRef: (current: any) => ({ current }),
  useCallback: (callback: any) => callback,
  useEffect: (callback: any) => { const cleanup = callback(); if (cleanup) mockCleanups.push(cleanup) },
}))
jest.mock('../app/lib/playerState', () => ({ usePlayerState: () => ({ updatePose: mockPose }) }))
jest.mock('../app/hooks/useMapInitialization', () => ({ STREETS_SOURCE: 'dc-streets' }))
jest.mock('mapbox-gl', () => ({
  __esModule: true,
  default: { MercatorCoordinate: { fromLngLat: (position: any, altitude: number) => ({
    toLngLat: () => position, toAltitude: () => altitude,
  }) } },
}))
import { useFlyController } from '../app/hooks/useFlyController'

describe('flight controller lifecycle', () => {
  let frame: FrameRequestCallback
  let now: number
  let map: any
  let canvas: any
  let controls: ReturnType<typeof useFlyController>
  const key = (type: string, value: string) => {
    const event = new Event(type, { cancelable: true })
    Object.defineProperty(event, 'key', { value })
    window.dispatchEvent(event)
  }
  const advance = (milliseconds: number) => {
    const until = now + milliseconds
    while (now < until) { now += 1000 / 60; frame(now) }
  }
  beforeEach(() => {
    now = 0
    mockSnapshots.length = 0
    mockPose.mockClear()
    jest.spyOn(performance, 'now').mockImplementation(() => now)
    Object.assign(global, {
      window: new EventTarget(), document: Object.assign(new EventTarget(), { hidden: false }),
      requestAnimationFrame: jest.fn((callback: FrameRequestCallback) => { frame = callback; return 1 }),
      cancelAnimationFrame: jest.fn(),
    })
    canvas = Object.assign(new EventTarget(), { style: { cursor: '' }, focus: jest.fn(), setPointerCapture: jest.fn() })
    const handler = () => ({ isEnabled: () => true, disable: jest.fn(), enable: jest.fn() })
    const camera = { position: { toLngLat: () => ({ lng: -77.035, lat: 38.89 }), toAltitude: () => 100 }, setPitchBearing: jest.fn() }
    map = {
      stop: jest.fn(), getCanvas: () => canvas, getMaxZoom: () => 20, setMaxZoom: jest.fn(),
      getFreeCameraOptions: () => camera, setFreeCameraOptions: jest.fn(), getBearing: () => 0, getPitch: () => 65,
      getSource: () => true, getLayer: () => true, on: jest.fn(), off: jest.fn(), removeLayer: jest.fn(),
      querySourceFeatures: jest.fn(() => []),
      dragPan: handler(), dragRotate: handler(), scrollZoom: handler(), doubleClickZoom: handler(),
      touchZoomRotate: handler(), keyboard: handler(), touchPitch: handler(), boxZoom: handler(),
    }
    controls = useFlyController({ map, isActive: true, landmarks: [], visitedLandmarks: new Set(), onLandmarkDiscovered: jest.fn() })
  })
  afterEach(() => {
    while (mockCleanups.length) mockCleanups.pop()!()
    jest.restoreAllMocks()
  })
  it('does not repaint or republish an unchanged hover', () => {
    advance(2000)
    expect(map.setFreeCameraOptions).toHaveBeenCalledTimes(1)
    expect(mockSnapshots).toHaveLength(1)
    expect(map.querySourceFeatures).toHaveBeenCalledTimes(1)
  })
  it('updates the camera smoothly but publishes the HUD at at most 5 Hz', () => {
    key('keydown', 'w')
    advance(1000)
    expect(map.setFreeCameraOptions.mock.calls.length).toBeGreaterThan(50)
    expect(mockSnapshots.length).toBeLessThanOrEqual(5)
    expect(mockSnapshots.at(-1).speed).toBe(43)
    key('keyup', 'w')
    advance(2000)
    expect(mockSnapshots.at(-1).speed).toBe(0)
  })
  it('changes altitude without requiring forward motion', () => {
    controls.setFlightAltitude(8)
    advance(3000)
    expect(mockSnapshots.at(-1).altitude).toBeLessThan(10)
    expect(mockSnapshots.at(-1).position.lng).toBe(-77.035)
    expect(mockSnapshots.at(-1).speed).toBe(0)
  })
  it('releases movement on focus loss and restores native controls on exit', () => {
    key('keydown', 'w')
    advance(500)
    window.dispatchEvent(new Event('blur'))
    advance(2000)
    expect(mockSnapshots.at(-1).speed).toBe(0)
    while (mockCleanups.length) mockCleanups.pop()!()
    expect(map.keyboard.enable).toHaveBeenCalled()
    expect(map.setMaxZoom).toHaveBeenLastCalledWith(20)
  })
})
