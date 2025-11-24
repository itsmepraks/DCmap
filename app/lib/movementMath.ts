export const FRAME_TIME_MS = 16.6667

export function getDeltaTimeScale(previousTimestamp: number | null, currentTimestamp: number) {
  if (previousTimestamp === null) {
    return 1
  }
  const delta = currentTimestamp - previousTimestamp
  if (delta <= 0) {
    return 1
  }
  return Math.min(delta / FRAME_TIME_MS, 2)
}

interface MovementInput {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  bearing: number
  baseSpeed: number
  dtScale: number
}

const DEG_TO_RAD = Math.PI / 180

export function computeMovementDelta({
  forward,
  backward,
  left,
  right,
  bearing,
  baseSpeed,
  dtScale
}: MovementInput) {
  let deltaLng = 0
  let deltaLat = 0
  let moving = false

  const applyMovement = (angleOffset: number) => {
    const rad = ((bearing + angleOffset) * DEG_TO_RAD)
    deltaLng += Math.sin(rad) * baseSpeed * dtScale
    deltaLat += Math.cos(rad) * baseSpeed * dtScale
    moving = true
  }

  if (forward) applyMovement(0)
  if (backward) applyMovement(180)
  if (left) applyMovement(-90)
  if (right) applyMovement(90)

  return { deltaLng, deltaLat, moving }
}






