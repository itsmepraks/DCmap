'use client'

import { useState, useEffect, useCallback } from 'react'
import Map from '../map/Map'
import ParticleEffect from '../map/effects/ParticleEffect'
import DiscoveryRadius from '../map/effects/DiscoveryRadius'
import BreadcrumbTrail from '../map/effects/BreadcrumbTrail'
import WaypointLayer from '../map/WaypointLayer'
import { useMap } from '@/app/lib/MapContext'

import type { Landmark } from '@/app/hooks/useLandmarks'
import type { Coordinates } from '@/app/lib/proximity'

import { type SelectedEntity } from '../ui/EntityInfoPanel'

interface MapSectionProps {
  // Map configuration
  layersVisible: {
    museums: boolean
    trees: boolean
    landmarks: boolean
    parks: boolean
  }
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  is3D: boolean
  isFlying: boolean

  // Game state
  landmarks: Landmark[]
  visitedLandmarks: Set<string>

  // Callbacks
  onLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
  onNavigateToLandmark: (coordinates: [number, number]) => void
  onSelectEntity?: (entity: SelectedEntity | null) => void
  
  // Waypoint system (legacy)
  waypoints: any[]
  activeWaypointId: string | null
  onAddWaypoint: (waypoint: any) => void
  onRemoveWaypoint: (id: string) => void

  // Game progress
  gameProgress: any
  landmarksState: any

  // Progressive Waypoint System (NEW)
  playerPosition: Coordinates | null
}

export default function MapSection({
  layersVisible,
  currentSeason,
  is3D,
  isFlying,
  landmarks,
  visitedLandmarks,
  onLandmarkDiscovered,
  onNavigateToLandmark,
  waypoints,
  activeWaypointId,
  onAddWaypoint,
  onRemoveWaypoint,
  gameProgress,
  landmarksState,
  playerPosition,
  onSelectEntity
}: MapSectionProps) {
  const [particleEffect, setParticleEffect] = useState<{ coordinates: [number, number]; icon: string } | null>(null)
  const { map } = useMap()

  // Clear particle effect after animation
  useEffect(() => {
    if (particleEffect) {
      const timeout = setTimeout(() => setParticleEffect(null), 3000)
      return () => clearTimeout(timeout)
    }
  }, [particleEffect])

  return (
    <>
      <Map
        layersVisible={layersVisible}
        currentSeason={currentSeason}
        is3D={is3D}
        isFlying={isFlying}
        landmarks={landmarks}
        visitedLandmarks={visitedLandmarks}
        onSelect={onSelectEntity}
        onLandmarkDiscovered={(landmarkId, landmarkData) => {
          onLandmarkDiscovered(landmarkId, landmarkData)
          // Trigger particle effect for new discoveries
          const landmark = landmarksState.getLandmarkById(landmarkId)
          if (landmark) {
            setParticleEffect({
              coordinates: landmark.coordinates,
              icon: landmark.icon
            })
          }
        }}
      />

      {/* Legacy manual waypoints (if any) */}
      {waypoints.length > 0 && (
        <WaypointLayer
          map={map}
          waypoints={waypoints}
          activeWaypointId={activeWaypointId}
          onWaypointClick={(waypoint) => onNavigateToLandmark(waypoint.coordinates)}
        />
      )}

      {/* Discovery Radius Visualization */}
      <DiscoveryRadius
        map={map}
        landmarks={landmarks.map(l => ({
          id: l.id,
          coordinates: l.coordinates,
          visited: visitedLandmarks.has(l.id)
        }))}
      />

      {/* Particle Effects */}
      {particleEffect && (
        <ParticleEffect
          coordinates={particleEffect.coordinates}
          icon={particleEffect.icon}
          isActive={true}
          map={map}
        />
      )}

      {/* Breadcrumb Trail */}
      <BreadcrumbTrail
        map={map}
        visitedLandmarks={gameProgress.visitedLandmarksWithTime.map((v: any) => ({
          id: v.id,
          coordinates: landmarksState.getLandmarkById(v.id)?.coordinates || [0, 0],
          visitedAt: v.visitedAt
        }))}
      />
    </>
  )
}
