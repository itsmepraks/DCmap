'use client'

import Link from 'next/link'
import { MapProvider } from '@/app/lib/MapContext'
import { PlayerProvider } from '@/app/lib/playerState'
import { FeedbackProvider } from '@/app/lib/FeedbackProvider'
import { LiveAnnouncerProvider } from '@/app/components/ui/LiveAnnouncer'
import StateManager from '@/app/components/layout/StateManager'
import MapSection from '@/app/components/layout/MapSection'
import GameUI from '@/app/components/layout/GameUI'
import HUDSystem from '@/app/components/layout/HUDSystem'
import StatsModal from '@/app/components/ui/StatsModal'
import GameOverlay from '@/app/components/ui/GameOverlay'
import OnboardingTutorial from '@/app/components/ui/OnboardingTutorial'
import FeedbackToastContainer from '@/app/components/ui/FeedbackToast'
import SeasonalParticles from '@/app/components/map/effects/SeasonalParticles'
import TimeOfDayGrade from '@/app/components/map/effects/TimeOfDayGrade'
import SearchPalette from '@/app/components/ui/SearchPalette'
import MysteryCard from '@/app/components/game/MysteryCard'
import GuideCard from '@/app/components/game/GuideCard'
import GuideAvailablePill from '@/app/components/game/GuideAvailablePill'
import FeedbackTriggers from '@/app/components/ui/FeedbackTriggers'
import ErrorBoundary from '@/app/components/ui/ErrorBoundary'


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
                  <Link href="/" className="fixed right-4 top-4 z-50 rounded border-2 border-[#B8431A] bg-[#EFE6D5] px-4 py-2 font-bold text-[#2C1810]">Enter 3D world ↗</Link>
                  {/* Map and Effects */}
                  <MapSection
                    isFlying={state.isFlyMode}
                    layersVisible={state.layersVisible}
                    currentSeason={state.currentSeason}
                    is3D={state.is3DView}
                    landmarks={state.landmarksState.landmarks}
                    visitedLandmarks={state.gameState.gameProgress.visitedLandmarks}
                    onLandmarkDiscovered={state.handleLandmarkDiscovered}
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

                  {/* Cinematic color grading — time-of-day only. Seasonal color is handled in the map layers. */}
                  <TimeOfDayGrade preset={state.lightPreset} />

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
                    suppressProximityHint={state.isFlyMode || !!state.guide.availableTour || !!state.guide.activeTour}
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
                  {!state.isFlyMode && <MysteryCard
                    landmarks={state.landmarksState.landmarks}
                    visited={state.gameState.gameProgress.visitedLandmarks}
                    onNavigate={state.handleNavigateToLandmark}
                  />}

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
