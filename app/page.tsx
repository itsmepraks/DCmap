'use client'

import { useState, useEffect, useCallback } from 'react'
import Map from './components/map/Map'
import StatsModal from './components/ui/StatsModal'
import GameOverlay from './components/ui/GameOverlay'
import OnboardingTutorial from './components/ui/OnboardingTutorial'
import DiscoveryAnimation from './components/ui/DiscoveryAnimation'
import ProximityHint from './components/ui/ProximityHint'
import WorldBorderWarning from './components/ui/WorldBorderWarning'
import MapLoadingSkeleton from './components/ui/MapLoadingSkeleton'
import ControlDock from './components/ui/ControlDock'
import FloatingControlPanel from './components/ui/FloatingControlPanel'
import QuestPanel from './components/game/QuestPanel'
import DailyChallengesPanel from './components/game/DailyChallengesPanel'
import AchievementToast from './components/game/AchievementToast'
import ParticleEffect from './components/map/effects/ParticleEffect'
import DiscoveryRadius from './components/map/effects/DiscoveryRadius'
import BreadcrumbTrail from './components/map/effects/BreadcrumbTrail'
import SmartHUD from './components/ui/hud/SmartHUD'
import MiniStatsBar from './components/ui/hud/MiniStatsBar'
import { MapProvider, useMap } from './lib/MapContext'
import { PlayerProvider, usePlayerState } from './lib/playerState'
import { useGameState } from './hooks/useGameState'
import { useQuestSystem } from './hooks/useQuestSystem'
import { useDailyChallenges } from './hooks/useDailyChallenges'
import { useLandmarks } from './hooks/useLandmarks'
import { useFlyController } from './hooks/useFlyController'
import FlyModeAvatar from './components/map/FlyModeAvatar'
import LandmarkRecommendations from './components/game/LandmarkRecommendations'
import CompletionNotification from './components/game/CompletionNotification'

export default function Home() {
  return (
    <PlayerProvider>
      <MapProvider>
        <HomeContent />
      </MapProvider>
    </PlayerProvider>
  )
}

function HomeContent() {
  // UI State
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false)
  const [layersVisible, setLayersVisible] = useState({
    museums: false,
    trees: false,
    landmarks: true
  })
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>('summer')
  const [is3DView, setIs3DView] = useState(false)
  const [isFlyMode, setIsFlyMode] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [particleEffect, setParticleEffect] = useState<{ coordinates: [number, number]; icon: string } | null>(null)

  // Custom Hooks
  const gameState = useGameState()
  const questSystem = useQuestSystem()
  const dailyChallenges = useDailyChallenges()
  const landmarksState = useLandmarks(gameState.gameProgress.visitedLandmarks)
  
  const { map } = useMap()

  // Track map load state
  useEffect(() => {
    if (!map) return
    
    if (map.loaded()) {
      setIsMapLoaded(true)
    } else {
      map.once('load', () => {
        setIsMapLoaded(true)
      })
    }

    // Fallback: Force loading state to true after 5 seconds
    const timeout = setTimeout(() => {
      if (map && !isMapLoaded) {
        console.warn('⚠️ Map loading timeout - forcing ready state')
        setIsMapLoaded(true)
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [map, isMapLoaded])

  // ESC key handler - exit fly mode first, then close control panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return

      if (isFlyMode) {
        e.preventDefault()
        setIsFlyMode(false)
        return
      }

      if (isControlPanelOpen) {
        setIsControlPanelOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isFlyMode, isControlPanelOpen])

  // Handle layer toggles
  const handleToggleLayer = (layerId: keyof typeof layersVisible) => {
    setLayersVisible(prev => ({
      ...prev,
      [layerId]: !prev[layerId],
    }))
  }

  const handleSeasonChange = (season: 'spring' | 'summer' | 'fall' | 'winter') => {
    setCurrentSeason(season)
  }

  const handleToggle3D = () => {
    setIs3DView(prev => !prev)
  }

  const handleToggleFly = () => {
    setIsFlyMode(prev => !prev)
  }

  // Handle landmark discovery (memoized to prevent unnecessary re-renders)
  const handleLandmarkDiscovered = useCallback((landmarkId: string, landmarkData: any) => {
    // Check if already visited
    const isNewVisit = gameState.handleVisitLandmark(landmarkId)
    if (!isNewVisit) return

    // Update quest progress
    questSystem.handleLandmarkVisit(landmarkId)
    
    // Update daily challenges
    dailyChallenges.handleLandmarkVisit()
    
    // Show discovery animation
    const landmark = landmarksState.getLandmarkById(landmarkId)
    if (landmark) {
      // Trigger particle effect
      setParticleEffect({
        coordinates: landmark.coordinates,
        icon: landmark.icon
      })
      
      landmarksState.showDiscoveryAnimation(landmarkId)
      
      // Hide discovery animation after 3 seconds and show toast
      setTimeout(() => {
        gameState.showAchievement({
          name: landmark.name,
          icon: landmark.icon,
          funFact: landmark.funFact
        })
        // Clear particle effect
        setParticleEffect(null)
      }, 3000)
    }

    console.log('🏆 Landmark discovered:', landmarkData.name || landmarkId)
  }, [gameState, questSystem, dailyChallenges, landmarksState])

  // Fly mode controller (street-view movement)
  const flyControllerState = useFlyController({
    map,
    isActive: isFlyMode,
    landmarks: landmarksState.landmarks,
    visitedLandmarks: gameState.gameProgress.visitedLandmarks,
    onLandmarkDiscovered: handleLandmarkDiscovered
  })
  
  const { state: playerState } = usePlayerState()

  // Check completion status
  const allLandmarksVisited = landmarksState.landmarks.length > 0 && 
    gameState.gameProgress.visitedLandmarks.size >= landmarksState.landmarks.length
  const hasCompletedQuest = questSystem.questCompletion !== null
  const [showCompletion, setShowCompletion] = useState(false)
  const [lastCompletionState, setLastCompletionState] = useState({ 
    landmarks: false, 
    quest: false 
  })

  // Show completion notification when status changes
  useEffect(() => {
    if (allLandmarksVisited && !lastCompletionState.landmarks) {
      setShowCompletion(true)
      setLastCompletionState(prev => ({ ...prev, landmarks: true }))
    }
    if (hasCompletedQuest && !lastCompletionState.quest) {
      setShowCompletion(true)
      setLastCompletionState(prev => ({ ...prev, quest: true }))
    }
  }, [allLandmarksVisited, hasCompletedQuest, lastCompletionState])

  const handleNavigateToLandmark = useCallback((coordinates: [number, number]) => {
    if (!map) return
    map.flyTo({
      center: coordinates,
      zoom: 17,
      pitch: 60,
      bearing: 0,
      duration: 2000,
      essential: true
    })
  }, [map])

  // Handle game reset
  const handleResetProgress = () => {
    gameState.handleResetProgress()
    // Reload quests to reset objectives
    questSystem.reloadQuests()
  }

  return (
    <main 
      className="relative w-full h-screen overflow-hidden" 
      style={{ background: '#F5F0E8' }}
    >
      {/* Loading skeleton */}
      {!isMapLoaded && <MapLoadingSkeleton />}
      
      <Map 
        layersVisible={layersVisible} 
        currentSeason={currentSeason} 
        is3D={is3DView} 
        isFlying={isFlyMode}
        landmarks={landmarksState.landmarks}
        visitedLandmarks={gameState.gameProgress.visitedLandmarks}
        onLandmarkDiscovered={handleLandmarkDiscovered}
      />

      {/* Fly Mode Avatar - Shows where you're looking from */}
      {isFlyMode && (
        <FlyModeAvatar
          map={map}
          position={flyControllerState.position}
          bearing={flyControllerState.bearing}
          isActive={isFlyMode}
        />
      )}
      
      {/* Discovery Radius Visualization */}
      <DiscoveryRadius
        map={map}
        landmarks={landmarksState.landmarks.map(l => ({
          id: l.id,
          coordinates: l.coordinates,
          visited: gameState.gameProgress.visitedLandmarks.has(l.id)
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
        visitedLandmarks={gameState.gameProgress.visitedLandmarksWithTime.map(v => ({
          id: v.id,
          coordinates: landmarksState.getLandmarkById(v.id)?.coordinates || [0, 0],
          visitedAt: v.visitedAt
        }))}
      />
      
      {/* UI Controls */}
      
      {/* New Compact Stats Bar - Replaces scattered HUDs */}
      <MiniStatsBar
        streak={dailyChallenges.currentStreak.current}
        points={questSystem.questProgress.totalPoints}
        discovered={gameState.gameProgress.visitedLandmarks.size}
        total={10}
        activeQuests={questSystem.questProgress.activeQuests.length}
        onOpenStats={gameState.openStatsModal}
      />
      
      {/* Unified Bottom Right Control Dock */}
      <ControlDock
        is3D={is3DView}
        onToggle3D={handleToggle3D}
        isFlying={isFlyMode}
        onToggleFly={handleToggleFly}
        onToggleLayers={() => setIsControlPanelOpen(!isControlPanelOpen)}
      />
      
      {/* Floating Control Panel - Replaces old Sidebar */}
      <FloatingControlPanel
        isOpen={isControlPanelOpen}
        onClose={() => setIsControlPanelOpen(false)}
        layersVisible={layersVisible}
        onToggleLayer={handleToggleLayer}
        currentSeason={currentSeason}
        onSeasonChange={handleSeasonChange}
      />
      
      {/* Landmark Recommendations - Shows unvisited landmarks */}
      <LandmarkRecommendations
        landmarks={landmarksState.landmarks}
        visitedLandmarks={gameState.gameProgress.visitedLandmarks}
        currentPosition={flyControllerState.position}
        onNavigate={handleNavigateToLandmark}
      />

      {/* Completion Notifications */}
      {showCompletion && (
        <CompletionNotification
          allLandmarksVisited={allLandmarksVisited}
          questCompleted={hasCompletedQuest}
          onClose={() => setShowCompletion(false)}
        />
      )}

      {/* Smart HUD - Shows fly mode controls (street view) */}
      <SmartHUD
        mode={isFlyMode ? 'fly' : 'map'}
        visitedCount={gameState.gameProgress.visitedLandmarks.size}
        totalCount={landmarksState.landmarks.length || 10}
        points={questSystem.questProgress.totalPoints}
        activeQuestCount={questSystem.questProgress.activeQuests.length}
        nearestLandmark={
          landmarksState.nearbyLandmarks.length > 0
            ? {
                name: landmarksState.nearbyLandmarks[0].name,
                distance: landmarksState.nearbyLandmarks[0].distance
              }
            : undefined
        }
        flySpeed={flyControllerState.speed}
        flyAltitude={flyControllerState.altitude}
        flyPosition={flyControllerState.position}
      />
      
      {/* Daily Challenges Panel - Now minimized by default, click streak to expand */}
      {/* Temporarily hidden for cleaner UI - accessible via stats modal */}
      {false && (
        <DailyChallengesPanel
          challenges={dailyChallenges.dailyChallenges}
          streak={dailyChallenges.currentStreak.current}
        />
      )}
      
      {/* Quest Panel (Main) */}
      <QuestPanel
        quests={questSystem.quests}
        activeQuestIds={questSystem.questProgress.activeQuests}
        onStartQuest={questSystem.handleStartQuest}
      />
      
      {/* World Border Warning */}
      <WorldBorderWarning
        isVisible={landmarksState.showBorderWarning}
        direction={landmarksState.borderDirection}
      />
      
      {/* Proximity Hints - Show nearby landmarks (Centered bottom pill) */}
      <ProximityHint
        nearbyLandmarks={landmarksState.nearbyLandmarks}
        onNavigate={landmarksState.navigateToLandmark}
      />
      
      {/* Discovery Animation - Full screen celebration */}
      <DiscoveryAnimation
        isVisible={landmarksState.showDiscovery}
        landmarkName={landmarksState.discoveryData?.name || ''}
        landmarkIcon={landmarksState.discoveryData?.icon || ''}
        points={10}
      />
      
      {/* Achievement Toast */}
      <AchievementToast
        isVisible={!!gameState.achievement}
        landmarkName={gameState.achievement?.name || ''}
        landmarkIcon={gameState.achievement?.icon || ''}
        funFact={gameState.achievement?.funFact || ''}
        onDismiss={gameState.dismissAchievement}
      />
      
      {/* Stats Modal */}
      <StatsModal
        isOpen={gameState.showStatsModal}
        onClose={gameState.closeStatsModal}
        landmarks={landmarksState.landmarksWithStatus}
        visitedCount={gameState.gameProgress.visitedLandmarks.size}
        totalCount={10}
        onReset={handleResetProgress}
        questStats={{
          totalPoints: questSystem.questProgress.totalPoints,
          completedQuestsCount: questSystem.questProgress.completedQuests.size,
          totalQuestsCount: questSystem.quests.length,
          unlockedBadges: questSystem.questProgress.unlockedBadges
        }}
      />
      
      {/* GTA-style Game Overlay - Visual effects */}
      <GameOverlay />
      
      {/* Onboarding Tutorial */}
      <OnboardingTutorial />
    </main>
  )
}
