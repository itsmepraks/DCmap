/** Frame-rate independent flight math. Speeds are meters per second. */
export const FLIGHT_SPEED = 12
export const BOOST_SPEED = 40
export const MIN_FLIGHT_ALTITUDE = 8
export const MAX_FLIGHT_ALTITUDE = 500
export function damp(value: number, target: number, response: number, dt: number) {
  const next = target + (value - target) * Math.exp(-response * dt)
  return Math.abs(next - target) < 0.01 ? target : next
}
export function movementInput(forward: number, right: number, speed: number) {
  const length = Math.max(1, Math.hypot(forward, right))
  return { forward: forward / length * speed, right: right / length * speed }
}
export function movePosition(lng: number, lat: number, forward: number, right: number, bearing: number, dt: number) {
  const radians = bearing * Math.PI / 180
  return {
    lng: lng + (Math.sin(radians) * forward + Math.cos(radians) * right) * dt / (111132 * Math.cos(lat * Math.PI / 180)),
    lat: lat + (Math.cos(radians) * forward - Math.sin(radians) * right) * dt / 111132,
  }
}
