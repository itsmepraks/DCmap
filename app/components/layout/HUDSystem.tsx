'use client'

import MiniStatsBar from '../ui/hud/MiniStatsBar'
import ControlDock from '../ui/ControlDock'
import FloatingControlPanel from '../ui/FloatingControlPanel'
import UnifiedHUD from '../ui/hud/UnifiedHUD'
import WorldBorderWarning from '../ui/WorldBorderWarning'
import MapLoadingSkeleton from '../ui/MapLoadingSkeleton'

type LayerVisibility = {
  museums: boolean
  landmarks: boolean
}

interface HUDSystemProps {
  // Loading state
  isMapLoaded: boolean

  // Stats bar
  streak: number
  points: number
  discoveredLandmarks: number
  totalLandmarks: number
  discoveredMuseums: number
  totalMuseums: number
  onOpenStats: () => void

  // Control dock
  is3D: boolean
  onToggle3D: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onOrbit360: () => void
  isOrbiting360: boolean
  isFlying: boolean
  onToggleFly: () => void
  onToggleLayers: () => void
  timeOfDayIcon?: string
  timeOfDayLabel?: string
  onCycleTimeOfDay?: () => void

  // Floating panel
  isControlPanelOpen: boolean
  onCloseControlPanel: () => void
  layersVisible: LayerVisibility
  onToggleLayer: (layerId: keyof LayerVisibility) => void
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  onSeasonChange: (season: 'spring' | 'summer' | 'fall' | 'winter') => void
  isSatelliteView?: boolean
  onToggleSatellite?: () => void

  // Unified HUD
  flyControllerState: any
  landmarksState: any
  gameState: any
  onNavigateToLandmark: (coordinates: [number, number]) => void

  // World border
  showBorderWarning: boolean
  borderDirection: string

  // Progressive Waypoint System (NEW)
  nearestUndiscovered?: { id: string; name: string; distance: number; coordinates: [number, number] } | null
  recommendedLandmark?: { id: string; name: string; distance: number; coordinates: [number, number] } | null
}

export default function HUDSystem({
  isMapLoaded,
  streak,
  points,
  discoveredLandmarks,
  totalLandmarks,
  discoveredMuseums,
  totalMuseums,
  onOpenStats,
  is3D,
  onToggle3D,
  onZoomIn,
  onZoomOut,
  onOrbit360,
  isOrbiting360,
  isFlying,
  onToggleFly,
  onToggleLayers,
  timeOfDayIcon,
  timeOfDayLabel,
  onCycleTimeOfDay,
  isControlPanelOpen,
  onCloseControlPanel,
  layersVisible,
  onToggleLayer,
  currentSeason,
  onSeasonChange,
  isSatelliteView,
  onToggleSatellite,
  flyControllerState,
  landmarksState,
  gameState,
  onNavigateToLandmark,
  showBorderWarning,
  borderDirection,
  nearestUndiscovered,
  recommendedLandmark
}: HUDSystemProps) {
  return (
    <>
      {/* Loading skeleton */}
      {!isMapLoaded && <MapLoadingSkeleton />}

      {/* New Compact Stats Bar - Replaces scattered HUDs */}
      <MiniStatsBar
        streak={streak}
        points={points}
        discoveredLandmarks={discoveredLandmarks}
        totalLandmarks={totalLandmarks}
        discoveredMuseums={discoveredMuseums}
        totalMuseums={totalMuseums}
        onOpenStats={onOpenStats}
      />

      {/* Unified Bottom Right Control Dock */}
      <ControlDock
        is3D={is3D}
        onToggle3D={onToggle3D}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onOrbit360={onOrbit360}
        isOrbiting360={isOrbiting360}
        isFlying={isFlying}
        onToggleFly={onToggleFly}
        onToggleLayers={onToggleLayers}
        timeOfDayIcon={timeOfDayIcon}
        timeOfDayLabel={timeOfDayLabel}
        onCycleTimeOfDay={onCycleTimeOfDay}
      />

      {/* Floating Control Panel - Replaces old Sidebar */}
      <FloatingControlPanel
        isOpen={isControlPanelOpen}
        onClose={onCloseControlPanel}
        layersVisible={layersVisible}
        onToggleLayer={onToggleLayer}
        currentSeason={currentSeason}
        onSeasonChange={onSeasonChange}
        isSatelliteView={isSatelliteView}
        onToggleSatellite={onToggleSatellite}
      />

      {/* Unified HUD - Consolidates recommendations, fly controls, and stats */}
      <UnifiedHUD
        mode={isFlying ? 'fly' : 'map'}
        recommendedLandmark={recommendedLandmark ?? null}
        recommendationDistance={recommendedLandmark?.distance ?? null}
        onNavigateToRecommendation={onNavigateToLandmark}
        flySpeed={flyControllerState.speed}
        flyAltitude={flyControllerState.altitude}
        onSetFlightAltitude={flyControllerState.setFlightAltitude}
        onFlightControl={flyControllerState.setControl}
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
