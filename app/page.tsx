'use client'

import { MapProvider } from './lib/MapContext'
import { PlayerProvider } from './lib/playerState'
import StateManager from './components/layout/StateManager'
import MapSection from './components/layout/MapSection'
import GameUI from './components/layout/GameUI'
import HUDSystem from './components/layout/HUDSystem'
import StatsModal from './components/ui/StatsModal'
import GameOverlay from './components/ui/GameOverlay'
import OnboardingTutorial from './components/ui/OnboardingTutorial'
import ErrorBoundary from './components/ui/ErrorBoundary'

export default function Home() {
  return (
    <ErrorBoundary>
      <PlayerProvider>
        <MapProvider>
          <StateManager>
            {(state) => (
              <main
                className="relative w-full h-screen overflow-hidden"
                style={{ background: '#F5F0E8' }}
              >
                {/* Map and Effects */}
                <MapSection
                  layersVisible={state.layersVisible}
                  currentSeason={state.currentSeason}
                  is3D={state.is3DView}
                  isFlying={state.isFlyMode}
                  landmarks={state.landmarksState.landmarks}
                  visitedLandmarks={state.gameState.gameProgress.visitedLandmarks}
                  activeQuestObjects={state.questSystem.activeQuestObjects}
                  onLandmarkDiscovered={state.handleLandmarkDiscovered}
                  onNavigateToLandmark={state.handleNavigateToLandmark}
                  waypoints={state.waypointSystem.waypoints}
                  activeWaypointId={state.waypointSystem.activeWaypointId}
                  onAddWaypoint={state.waypointSystem.addWaypoint}
                  onRemoveWaypoint={state.waypointSystem.removeWaypoint}
                  gameProgress={state.gameState.gameProgress}
                  landmarksState={state.landmarksState}
                  playerPosition={state.playerPosition}
                  progressiveWaypoints={state.progressiveWaypoints}
                  onProgressiveWaypointsUpdate={state.handleProgressiveWaypointsUpdate}
                  onSelectEntity={state.gameState.setSelectedEntity}
                />

                {/* Game UI Elements */}
                <GameUI
                  quests={state.questSystem.quests}
                  activeQuestIds={state.questSystem.questProgress.activeQuests}
                  onStartQuest={state.questSystem.handleStartQuest}
                  achievement={state.gameState.achievement}
                  onDismissAchievement={state.gameState.dismissAchievement}
                  showCompletion={state.showCompletion}
                  allLandmarksVisited={state.allLandmarksVisited}
                  hasCompletedQuest={state.hasCompletedQuest}
                  onCloseCompletion={() => state.setShowCompletion(false)}
                  nearbyLandmarks={state.landmarksState.nearbyLandmarks}
                  visitedLandmarks={state.gameState.gameProgress.visitedLandmarks}
                  onNavigateToLandmark={state.handleNavigateToLandmark}
                  landmarks={state.landmarksState.landmarksWithStatus}
                  showDiscovery={state.landmarksState.showDiscovery}
                  discoveryData={state.landmarksState.discoveryData}
                  selectedEntity={state.gameState.selectedEntity}
                  onCloseEntityPanel={state.gameState.clearSelectedEntity}
                  onSelectEntity={state.gameState.setSelectedEntity}
                  layersVisible={state.layersVisible}
                />

                {/* HUD and Controls */}
                <HUDSystem
                  isMapLoaded={state.isMapLoaded}
                  streak={state.dailyChallenges.currentStreak.current}
                  points={state.questSystem.questProgress.totalPoints + state.experience.experience.totalXP}
                  discoveredLandmarks={state.landmarksState.landmarksWithStatus.filter((l: any) => l.visited).length}
                  totalLandmarks={state.landmarksState.landmarks.length || 10}
                  discoveredMuseums={state.museumsState?.visitedMuseumsCount || 0}
                  totalMuseums={state.museumsState?.totalMuseums || 36}
                  activeQuests={state.questSystem.questProgress.activeQuests.length}
                  onOpenStats={state.gameState.openStatsModal}
                  is3D={state.is3DView}
                  onToggle3D={state.handleToggle3D}
                  isFlying={state.isFlyMode}
                  onToggleFly={state.handleToggleFly}
                  onToggleLayers={() => state.setIsControlPanelOpen(!state.isControlPanelOpen)}
                  isControlPanelOpen={state.isControlPanelOpen}
                  onCloseControlPanel={() => state.setIsControlPanelOpen(false)}
                  layersVisible={state.layersVisible}
                  onToggleLayer={state.handleToggleLayer}
                  currentSeason={state.currentSeason}
                  onSeasonChange={state.handleSeasonChange}
                  flyControllerState={state.flyControllerState}
                  landmarksState={state.landmarksState}
                  questSystem={state.questSystem}
                  gameState={state.gameState}
                  onNavigateToLandmark={state.handleNavigateToLandmark}
                  showBorderWarning={state.landmarksState.showBorderWarning}
                  borderDirection={state.landmarksState.borderDirection}
                  currentObjective={state.currentObjective}
                  nearestUndiscovered={state.nearestUndiscovered}
                />

                {/* Modal Overlays */}
                <StatsModal
                  isOpen={state.gameState.showStatsModal}
                  onClose={state.gameState.closeStatsModal}
                  landmarks={state.landmarksState?.landmarksWithStatus || []}
                  museums={state.museumsState?.museumsWithStatus || []}
                  visitedLandmarksCount={state.landmarksState?.landmarksWithStatus?.filter((l: any) => l.visited).length || 0}
                  visitedMuseumsCount={state.museumsState?.visitedMuseumsCount || 0}
                  totalLandmarks={state.landmarksState?.landmarks.length || 10}
                  totalMuseums={state.museumsState?.totalMuseums || 36}
                  onReset={state.handleResetProgress}
                />

                {/* Global Overlays */}
                <GameOverlay />
                <OnboardingTutorial />
              </main>
            )}
          </StateManager>
        </MapProvider>
      </PlayerProvider>
    </ErrorBoundary>
  )
}
