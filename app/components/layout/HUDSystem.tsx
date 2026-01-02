'use client'

import MiniStatsBar from '../ui/hud/MiniStatsBar'
import ControlDock from '../ui/ControlDock'
import FloatingControlPanel from '../ui/FloatingControlPanel'
import UnifiedHUD from '../ui/hud/UnifiedHUD'
import WorldBorderWarning from '../ui/WorldBorderWarning'
import MapLoadingSkeleton from '../ui/MapLoadingSkeleton'
import type { CurrentObjectiveInfo } from '@/app/lib/progressiveWaypointSystem'

type LayerVisibility = {
  museums: boolean
  trees: boolean
  landmarks: boolean
  parks: boolean
}

interface HUDSystemProps {
  // Loading state
  isMapLoaded: boolean

  // Stats bar
  streak: number
  points: number
  discovered: number
  total: number
  activeQuests: number
  onOpenStats: () => void

  // Control dock
  is3D: boolean
  onToggle3D: () => void
  isFlying: boolean
  onToggleFly: () => void
  onToggleLayers: () => void

  // Floating panel
  isControlPanelOpen: boolean
  onCloseControlPanel: () => void
  layersVisible: LayerVisibility
  onToggleLayer: (layerId: keyof LayerVisibility) => void
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  onSeasonChange: (season: 'spring' | 'summer' | 'fall' | 'winter') => void

  // Unified HUD
  flyControllerState: any
  landmarksState: any
  questSystem: any
  gameState: any
  onNavigateToLandmark: (coordinates: [number, number]) => void

  // World border
  showBorderWarning: boolean
  borderDirection: string

  // Progressive Waypoint System (NEW)
  currentObjective?: CurrentObjectiveInfo | null
  nearestUndiscovered?: { id: string; name: string; distance: number; coordinates: [number, number] } | null
}

export default function HUDSystem({
  isMapLoaded,
  streak,
  points,
  discovered,
  total,
  activeQuests,
  onOpenStats,
  is3D,
  onToggle3D,
  isFlying,
  onToggleFly,
  onToggleLayers,
  isControlPanelOpen,
  onCloseControlPanel,
  layersVisible,
  onToggleLayer,
  currentSeason,
  onSeasonChange,
  flyControllerState,
  landmarksState,
  questSystem,
  gameState,
  onNavigateToLandmark,
  showBorderWarning,
  borderDirection,
  currentObjective,
  nearestUndiscovered
}: HUDSystemProps) {
  return (
    <>
      {/* Loading skeleton */}
      {!isMapLoaded && <MapLoadingSkeleton />}

      {/* New Compact Stats Bar - Replaces scattered HUDs */}
      <MiniStatsBar
        streak={streak}
        points={points}
        discovered={discovered}
        total={total}
        activeQuests={activeQuests}
        onOpenStats={onOpenStats}
      />

      {/* Unified Bottom Right Control Dock */}
      <ControlDock
        is3D={is3D}
        onToggle3D={onToggle3D}
        isFlying={isFlying}
        onToggleFly={onToggleFly}
        onToggleLayers={onToggleLayers}
      />

      {/* Floating Control Panel - Replaces old Sidebar */}
      <FloatingControlPanel
        isOpen={isControlPanelOpen}
        onClose={onCloseControlPanel}
        layersVisible={layersVisible}
        onToggleLayer={onToggleLayer}
        currentSeason={currentSeason}
        onSeasonChange={onSeasonChange}
      />

      {/* Unified HUD - Consolidates recommendations, fly controls, and stats */}
      <UnifiedHUD
        mode={isFlying ? 'fly' : 'map'}
        recommendedLandmark={
          (() => {
            const unvisited = landmarksState.landmarks.filter(
              (l: any) => !gameState.gameProgress.visitedLandmarks.has(l.id)
            )
            if (unvisited.length === 0) return null

            // PRIORITY 1: Find unvisited landmarks that are part of active quest objectives
            const questObjectiveLandmarks: typeof unvisited = []
            questSystem.activeQuestObjects.forEach((quest: any) => {
              quest.objectives.forEach((objective: any) => {
                if (!objective.completed && objective.type === 'visit') {
                  const landmark = unvisited.find((l: any) => l.id === objective.target)
                  if (landmark && !questObjectiveLandmarks.find((l: any) => l.id === landmark.id)) {
                    questObjectiveLandmarks.push(landmark)
                  }
                }
              })
            })

            // If we have quest objective landmarks, prioritize the nearest one
            if (questObjectiveLandmarks.length > 0 && flyControllerState.position) {
              let nearest: typeof questObjectiveLandmarks[0] | null = null
              let nearestDistance = Infinity

              questObjectiveLandmarks.forEach((landmark: any) => {
                const R = 6371000
                const dLat = (landmark.coordinates[1] - flyControllerState.position!.lat) * Math.PI / 180
                const dLng = (landmark.coordinates[0] - flyControllerState.position!.lng) * Math.PI / 180
                const a =
                  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(flyControllerState.position!.lat * Math.PI / 180) * Math.cos(landmark.coordinates[1] * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2)
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                const d = R * c
                if (d < nearestDistance) {
                  nearestDistance = d
                  nearest = landmark
                }
              })

              if (nearest) return nearest
            }

            // PRIORITY 2: Fall back to nearest unvisited landmark (not in quest)
            if (flyControllerState.position) {
              let nearest: typeof unvisited[0] | null = null
              let nearestDistance = Infinity

              unvisited.forEach((landmark: any) => {
                const R = 6371000
                const dLat = (landmark.coordinates[1] - flyControllerState.position!.lat) * Math.PI / 180
                const dLng = (landmark.coordinates[0] - flyControllerState.position!.lng) * Math.PI / 180
                const a =
                  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(flyControllerState.position!.lat * Math.PI / 180) * Math.cos(landmark.coordinates[1] * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2)
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                const d = R * c
                if (d < nearestDistance) {
                  nearestDistance = d
                  nearest = landmark
                }
              })

              return nearest ? nearest : null
            }
            return unvisited[0] || null
          })()
        }
        recommendationDistance={
          (() => {
            const unvisited = landmarksState.landmarks.filter(
              (l: any) => !gameState.gameProgress.visitedLandmarks.has(l.id)
            )
            if (unvisited.length === 0 || !flyControllerState.position) return null

            // Calculate distance to recommended landmark (which prioritizes quest objectives)
            type LandmarkType = typeof unvisited[0]
            const recommended = ((): LandmarkType | null => {
              // PRIORITY 1: Quest objective landmarks
              const questObjectiveLandmarks: LandmarkType[] = []
              questSystem.activeQuestObjects.forEach((quest: any) => {
                quest.objectives.forEach((objective: any) => {
                  if (!objective.completed && objective.type === 'visit') {
                    const landmark = unvisited.find((l: any) => l.id === objective.target)
                    if (landmark && !questObjectiveLandmarks.find((l: any) => l.id === landmark.id)) {
                      questObjectiveLandmarks.push(landmark)
                    }
                  }
                })
              })

              if (questObjectiveLandmarks.length > 0) {
                let nearest: LandmarkType | null = null
                let nearestDistance = Infinity

                questObjectiveLandmarks.forEach((landmark: any) => {
                  const R = 6371000
                  const dLat = (landmark.coordinates[1] - flyControllerState.position!.lat) * Math.PI / 180
                  const dLng = (landmark.coordinates[0] - flyControllerState.position!.lng) * Math.PI / 180
                  const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(flyControllerState.position!.lat * Math.PI / 180) * Math.cos(landmark.coordinates[1] * Math.PI / 180) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2)
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                  const d = R * c
                  if (d < nearestDistance) {
                    nearestDistance = d
                    nearest = landmark
                  }
                })

                if (nearest) return nearest
              }

              // PRIORITY 2: Nearest unvisited landmark
              let nearest: LandmarkType | null = null
              let nearestDistance = Infinity

              unvisited.forEach((landmark: any) => {
                const R = 6371000
                const dLat = (landmark.coordinates[1] - flyControllerState.position!.lat) * Math.PI / 180
                const dLng = (landmark.coordinates[0] - flyControllerState.position!.lng) * Math.PI / 180
                const a =
                  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(flyControllerState.position!.lat * Math.PI / 180) * Math.cos(landmark.coordinates[1] * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2)
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                const d = R * c
                if (d < nearestDistance) {
                  nearestDistance = d
                  nearest = landmark
                }
              })

              return nearest
            })()

            if (!recommended) return null

            // Calculate distance to recommended landmark
            const R = 6371000
            const dLat = (recommended.coordinates[1] - flyControllerState.position!.lat) * Math.PI / 180
            const dLng = (recommended.coordinates[0] - flyControllerState.position!.lng) * Math.PI / 180
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(flyControllerState.position!.lat * Math.PI / 180) * Math.cos(recommended.coordinates[1] * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            return R * c
          })()
        }
        onNavigateToRecommendation={onNavigateToLandmark}
        flySpeed={flyControllerState.speed}
        flyAltitude={flyControllerState.altitude}
        flyPosition={flyControllerState.position}
        flyBearing={flyControllerState.bearing || 0}
        nearestLandmark={
          landmarksState.nearbyLandmarks.length > 0
            ? {
                name: landmarksState.nearbyLandmarks[0].name,
                distance: landmarksState.nearbyLandmarks[0].distance
              }
            : undefined
        }
        currentObjective={currentObjective}
        onNavigateToObjective={onNavigateToLandmark}
        nearestUndiscovered={nearestUndiscovered}
        onNavigateToUndiscovered={onNavigateToLandmark}
      />

      {/* World Border Warning */}
      <WorldBorderWarning
        isVisible={showBorderWarning}
        direction={borderDirection}
      />
    </>
  )
}
