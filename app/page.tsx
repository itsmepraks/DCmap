'use client'

import { MapProvider } from './lib/MapContext'
import { PlayerProvider } from './lib/playerState'
import { FeedbackProvider } from './lib/FeedbackProvider'
import { LiveAnnouncerProvider } from './components/ui/LiveAnnouncer'
import StateManager from './components/layout/StateManager'
import MapSection from './components/layout/MapSection'
import GameUI from './components/layout/GameUI'
import HUDSystem from './components/layout/HUDSystem'
import StatsModal from './components/ui/StatsModal'
import GameOverlay from './components/ui/GameOverlay'
import OnboardingTutorial from './components/ui/OnboardingTutorial'
import FeedbackToastContainer from './components/ui/FeedbackToast'
import SeasonalParticles from './components/map/effects/SeasonalParticles'
import SeasonalGrade from './components/map/effects/SeasonalGrade'
import TimeOfDayGrade from './components/map/effects/TimeOfDayGrade'
import SearchPalette from './components/ui/SearchPalette'
import MysteryCard from './components/game/MysteryCard'
import GuideCard from './components/game/GuideCard'
import GuideAvailablePill from './components/game/GuideAvailablePill'
import FeedbackTriggers from './components/ui/FeedbackTriggers'
import ErrorBoundary from './components/ui/ErrorBoundary'


export default function Home() {
  return (
    <ErrorBoundary>
      <LiveAnnouncerProvider>
       <FeedbackProvider>
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
                    landmarks={state.landmarksState.landmarks}
                    visitedLandmarks={state.gameState.gameProgress.visitedLandmarks}
                    onLandmarkDiscovered={state.handleLandmarkDiscovered}
                    onTreeDiscovered={state.handleTreeDiscovered}
                    onNavigateToLandmark={state.handleNavigateToLandmark}
                    waypoints={state.waypointSystem.waypoints}
                    activeWaypointId={state.waypointSystem.activeWaypointId}
                    onAddWaypoint={state.waypointSystem.addWaypoint}
                    onRemoveWaypoint={state.waypointSystem.removeWaypoint}
                    gameProgress={state.gameState.gameProgress}
                    landmarksState={state.landmarksState}
                    playerPosition={state.playerPosition}
                    onSelectEntity={state.gameState.setSelectedEntity}
                    lightPreset={state.lightPreset}
                  />

                  {/* Cinematic color grading — time-of-day (under) + season (over). */}
                  <TimeOfDayGrade preset={state.lightPreset} />
                  <SeasonalGrade season={state.currentSeason} />

                  {/* Ambient seasonal particles (cherry petals / leaves / snow / dust) */}
                  <SeasonalParticles season={state.currentSeason} />

                  {/* Game UI Elements */}
                  <GameUI
                    achievement={state.gameState.achievement}
                    onDismissAchievement={state.gameState.dismissAchievement}
                    showCompletion={state.showCompletion}
                    allLandmarksVisited={state.allLandmarksVisited}
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
                    streak={0} // Streak system removed
                    points={state.experience.experience.totalXP}
                    discoveredLandmarks={state.landmarksState.landmarksWithStatus.filter((l: any) => l.visited).length}
                    totalLandmarks={state.landmarksState.landmarks.length || 10}
                    discoveredMuseums={state.museumsState?.visitedMuseumsCount || 0}
                    totalMuseums={state.museumsState?.totalMuseums || 36}
                    onOpenStats={state.gameState.openStatsModal}
                    is3D={state.is3DView}
                    onToggle3D={state.handleToggle3D}
                    onZoomIn={state.handleZoomIn}
                    onZoomOut={state.handleZoomOut}
                    onOrbit360={state.handleOrbit360}
                    isOrbiting360={state.isOrbiting360}
                    isFlying={state.isFlyMode}
                    onToggleFly={state.handleToggleFly}
                    timeOfDayIcon={state.timeOfDayIcon}
                    timeOfDayLabel={state.timeOfDayLabel}
                    onCycleTimeOfDay={state.cycleTimeOfDay}
                    isSatelliteView={state.isSatelliteView}
                    onToggleSatellite={state.toggleSatellite}
                    onToggleLayers={() => state.setIsControlPanelOpen(!state.isControlPanelOpen)}
                    isControlPanelOpen={state.isControlPanelOpen}
                    onCloseControlPanel={() => state.setIsControlPanelOpen(false)}
                    layersVisible={state.layersVisible}
                    onToggleLayer={state.handleToggleLayer}
                    currentSeason={state.currentSeason}
                    onSeasonChange={state.handleSeasonChange}
                    flyControllerState={state.flyControllerState}
                    landmarksState={state.landmarksState}
                    gameState={state.gameState}
                    onNavigateToLandmark={state.handleNavigateToLandmark}
                    showBorderWarning={state.landmarksState.showBorderWarning}
                    borderDirection={state.landmarksState.borderDirection}
                    nearestUndiscovered={state.nearestUndiscovered}
                    recommendedLandmark={state.recommendedLandmark}
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
                  <FeedbackToastContainer />

                  {/* Cmd/Ctrl+K landmark + museum search */}
                  <SearchPalette
                    landmarks={state.landmarksState.landmarks}
                    museums={state.museumsState?.museumsWithStatus || []}
                    onNavigate={state.handleNavigateToLandmark}
                  />

                  {/* Daily mystery clue */}
                  <MysteryCard
                    landmarks={state.landmarksState.landmarks}
                    visited={state.gameState.gameProgress.visitedLandmarks}
                    onNavigate={state.handleNavigateToLandmark}
                  />

                  {/* Audio tour — click-to-open pill while in range, then GuideCard plays narration on demand. */}
                  {state.guide.availableTour && !state.guide.activeTour && (
                    <GuideAvailablePill
                      landmarkName={state.guide.availableTour.name}
                      onOpen={state.guide.openTour}
                      onDismiss={state.guide.dismissAvailable}
                    />
                  )}
                  {state.guide.activeTour && (
                    <GuideCard
                      tour={state.guide.activeTour}
                      onClose={state.guide.closeTour}
                    />
                  )}

                  {/* Contextual Feedback System */}
                  <FeedbackTriggers
                    isMapLoaded={state.isMapLoaded}
                    visitedLandmarksCount={state.gameState.gameProgress.visitedLandmarks.size}
                    isFlyMode={state.isFlyMode}
                    is3DView={state.is3DView}
                    nearbyLandmarkDistance={
                      state.landmarksState.nearbyLandmarks[0]?.distance
                    }
                    onboardingComplete={true}
                  />
                </main>
              )}
            </StateManager>
          </MapProvider>
        </PlayerProvider>
       </FeedbackProvider>
      </LiveAnnouncerProvider>
    </ErrorBoundary>
  )
}
