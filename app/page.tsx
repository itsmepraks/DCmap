'use client'

import { useState, useEffect } from 'react'
import Map from './components/map/Map'
import Sidebar from './components/ui/Sidebar'
import SidebarToggle from './components/ui/SidebarToggle'
import ThreeDToggle from './components/ui/ThreeDToggle'
import WalkModeToggle from './components/ui/WalkModeToggle'
import AchievementToast from './components/ui/AchievementToast'
import StatsModal from './components/ui/StatsModal'
import GameOverlay from './components/ui/GameOverlay'
import QuestPanel from './components/ui/QuestPanel'
import GameHUD from './components/ui/GameHUD'
import OnboardingTutorial from './components/ui/OnboardingTutorial'
import { MapProvider } from './lib/MapContext'
import { loadGameProgress, visitLandmark, resetGameProgress, type GameProgress } from './lib/gameState'
import { loadQuestProgress, saveQuestProgress, startQuest, checkQuestProgress, type Quest, type QuestProgress } from './lib/questSystem'

export default function Home() {
  return (
    <MapProvider>
      <HomeContent />
    </MapProvider>
  )
}

function HomeContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [layersVisible, setLayersVisible] = useState({
    museums: false,
    trees: false,
    heatmap: false,
    landmarks: true, // Landmarks visible by default for game mode
  })
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>('summer')
  const [is3DView, setIs3DView] = useState(false)
  const [isWalkMode, setIsWalkMode] = useState(false)

  // Game state
  const [gameProgress, setGameProgress] = useState<GameProgress>(() => loadGameProgress())
  const [landmarks, setLandmarks] = useState<any[]>([])
  const [achievement, setAchievement] = useState<any>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)
  
  // Quest state
  const [quests, setQuests] = useState<Quest[]>([])
  const [questProgress, setQuestProgress] = useState<QuestProgress>(() => loadQuestProgress())
  const [questCompletion, setQuestCompletion] = useState<any>(null)

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

  const handleToggleWalk = () => {
    setIsWalkMode(prev => !prev)
  }

  // Load landmarks data
  useEffect(() => {
    fetch('/data/landmarks.geojson')
      .then(res => res.json())
      .then(data => {
        setLandmarks(data.features.map((f: any) => ({
          id: f.properties.id,
          name: f.properties.name,
          description: f.properties.description,
          funFact: f.properties.funFact,
          category: f.properties.category,
          icon: f.properties.icon,
          coordinates: f.geometry.coordinates
        })))
      })
      .catch(err => console.error('Failed to load landmarks:', err))
  }, [])

  // Load quests data
  useEffect(() => {
    fetch('/data/quests.json')
      .then(res => res.json())
      .then(data => setQuests(data))
      .catch(err => console.error('Failed to load quests:', err))
  }, [])

  // Handle landmark discovery
  const handleLandmarkDiscovered = (landmarkId: string, landmarkData: any) => {
    if (gameProgress.visitedLandmarks.has(landmarkId)) return

    const newProgress = visitLandmark(landmarkId, gameProgress)
    setGameProgress(newProgress)

    // Check quest progress
    const questResult = checkQuestProgress(landmarkId, quests, questProgress)
    setQuestProgress(questResult.progress)
    
    // Update quest objectives in state
    if (questResult.updatedQuests.length > 0 || questResult.completedQuests.length > 0) {
      setQuests(prevQuests => [...prevQuests]) // Trigger re-render
    }

    // Show quest completion if any
    if (questResult.completedQuests.length > 0) {
      const completedQuest = questResult.completedQuests[0]
      setQuestCompletion({
        title: completedQuest.title,
        icon: completedQuest.icon,
        rewards: completedQuest.rewards
      })
    }

    // Show achievement toast
    const landmark = landmarks.find(l => l.id === landmarkId)
    if (landmark) {
      setAchievement({
        name: landmark.name,
        icon: landmark.icon,
        funFact: landmark.funFact
      })
    }

    console.log('🏆 Landmark discovered:', landmarkData.name || landmarkId)
  }

  // Handle starting a quest
  const handleStartQuest = (questId: string) => {
    const newProgress = startQuest(questId, questProgress)
    setQuestProgress(newProgress)
  }

  // Handle game reset
  const handleResetProgress = () => {
    const newProgress = resetGameProgress()
    setGameProgress(newProgress)
    // Also reset quests
    const newQuestProgress = loadQuestProgress()
    setQuestProgress(newQuestProgress)
    // Reload quests to reset objectives
    fetch('/data/quests.json')
      .then(res => res.json())
      .then(data => setQuests(data))
      .catch(err => console.error('Failed to reload quests:', err))
  }

  // Prepare landmarks with visited status
  const landmarksWithStatus = landmarks.map(l => ({
    ...l,
    visited: gameProgress.visitedLandmarks.has(l.id)
  }))

  return (
    <main 
        className="relative w-full h-screen overflow-hidden" 
        style={{ background: '#F5F0E8' }}
      >
        <Map 
          layersVisible={layersVisible} 
          currentSeason={currentSeason} 
          is3D={is3DView} 
          isWalking={isWalkMode}
          landmarks={landmarks}
          visitedLandmarks={gameProgress.visitedLandmarks}
          onLandmarkDiscovered={handleLandmarkDiscovered}
        />
        
        {/* UI Controls */}
        <SidebarToggle
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <ThreeDToggle
          is3D={is3DView}
          onToggle={handleToggle3D}
        />
        <WalkModeToggle
          isWalking={isWalkMode}
          onToggle={handleToggleWalk}
        />
        
        {/* Game HUD - Top Center */}
        <GameHUD
          visitedCount={gameProgress.visitedLandmarks.size}
          totalCount={10}
          points={questProgress.totalPoints}
          activeQuestCount={questProgress.activeQuests.length}
        />
        
        {/* Quest Panel */}
        <QuestPanel
          quests={quests}
          activeQuestIds={questProgress.activeQuests}
          onStartQuest={handleStartQuest}
        />
        
        {/* Achievement Toast */}
        <AchievementToast
          isVisible={!!achievement}
          landmarkName={achievement?.name || ''}
          landmarkIcon={achievement?.icon || ''}
          funFact={achievement?.funFact || ''}
          onDismiss={() => setAchievement(null)}
        />
        
        {/* Stats Modal */}
        <StatsModal
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          landmarks={landmarksWithStatus}
          visitedCount={gameProgress.visitedLandmarks.size}
          totalCount={10}
          onReset={handleResetProgress}
          questStats={{
            totalPoints: questProgress.totalPoints,
            completedQuestsCount: questProgress.completedQuests.size,
            totalQuestsCount: quests.length,
            unlockedBadges: questProgress.unlockedBadges
          }}
        />
        
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          layersVisible={layersVisible}
          onToggleLayer={handleToggleLayer}
          currentSeason={currentSeason}
          onSeasonChange={handleSeasonChange}
          onOpenStats={() => setShowStatsModal(true)}
          gameStats={{
            visited: gameProgress.visitedLandmarks.size,
            total: 10
          }}
        />
        
        {/* GTA-style Game Overlay - Visual effects */}
        <GameOverlay />
        
        {/* Onboarding Tutorial */}
        <OnboardingTutorial />
      </main>
  )
}

