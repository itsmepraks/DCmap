'use client'

import { usePlayerState } from '@/app/lib/playerState'

interface WalkTelemetryProps {
  isVisible: boolean
  controller: {
    isMoving: boolean
    isRunning: boolean
    isThirdPersonView: boolean
  }
}

export default function WalkTelemetry({ isVisible, controller }: WalkTelemetryProps) {
  const { state: playerState } = usePlayerState()

  if (!isVisible) {
    return null
  }

  const metersPerDegree = 111139
  const speedKmh = playerState.speed * metersPerDegree * 3.6

  return (
    <div
      className="fixed bottom-6 right-64 z-40 text-xs font-mono"
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        color: '#E2E8F0',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        minWidth: '220px'
      }}
    >
      <div className="text-[10px] tracking-widest text-amber-300 mb-2 uppercase">Walk Telemetry</div>
      <div className="space-y-1">
        <div>Pos: {playerState.position.lng.toFixed(5)}, {playerState.position.lat.toFixed(5)}</div>
        <div>Speed: {speedKmh.toFixed(1)} km/h</div>
        <div>Bearing: {playerState.heading.toFixed(1)}°</div>
        <div>Mode: {playerState.locomotionMode}</div>
        <div>Status: {controller.isMoving ? (controller.isRunning ? 'RUNNING' : 'WALKING') : 'IDLE'}</div>
        <div>Camera: {controller.isThirdPersonView ? '3RD-PERSON' : 'CHASE/FPS'}</div>
      </div>
    </div>
  )
}




