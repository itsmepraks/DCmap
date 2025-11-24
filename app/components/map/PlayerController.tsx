'use client'

import { memo } from 'react'
import type mapboxgl from 'mapbox-gl'
import { AVATAR_CONFIGS } from '@/app/types/avatar'
import { usePlayerState } from '@/app/lib/playerState'
import { useWalkController } from '@/app/hooks/useWalkController'
import Realistic3DAvatars from './Realistic3DAvatars'

interface PlayerControllerProps {
  map: mapboxgl.Map
  isWalking: boolean
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>
  visitedLandmarks: Set<string>
  onLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
  onPlayerPositionChange?: (position: { lng: number; lat: number; bearing: number; nearestLandmark: any }) => void
}

export const PlayerController = memo(function PlayerController({
  map,
  isWalking,
  landmarks,
  visitedLandmarks,
  onLandmarkDiscovered,
  onPlayerPositionChange
}: PlayerControllerProps) {
  const { state: playerState } = usePlayerState()
  
  const { isMoving, isRunning } = useWalkController({
    map,
    isActive: isWalking,
    avatarType: playerState.avatarType,
    landmarks,
    visitedLandmarks,
    onLandmarkDiscovered,
    onPlayerPositionChange
  })

  if (!isWalking) return null

  return (
    <Realistic3DAvatars
      map={map}
      position={playerState.position}
      bearing={playerState.heading}
      isMoving={isMoving}
      isRunning={isRunning}
      avatarType={playerState.avatarType}
    />
  )
})

