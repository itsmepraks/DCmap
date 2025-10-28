'use client'

import { useState, useEffect } from 'react'
import Map from './components/map/Map'
import Sidebar from './components/ui/Sidebar'
import SidebarToggle from './components/ui/SidebarToggle'
import ThreeDToggle from './components/ui/ThreeDToggle'
import WalkModeToggle from './components/ui/WalkModeToggle'
import WalkModeHUD from './components/ui/WalkModeHUD'
import Minimap from './components/ui/Minimap'
import CompassHUD from './components/ui/CompassHUD'
import GameProgressHUD from './components/ui/GameProgressHUD'
import AchievementToast from './components/ui/AchievementToast'
import StatsModal from './components/ui/StatsModal'
import { MapProvider } from './lib/MapContext'
import { loadGameProgress, visitLandmark, resetGameProgress, type GameProgress } from './lib/gameState'

export default function Home() {
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
  const [playerPosition, setPlayerPosition] = useState({ lng: -77.0369, lat: 38.9072 })
  const [currentBearing, setCurrentBearing] = useState(0)
  const [nearestLandmark, setNearestLandmark] = useState<any>(null)
  const [achievement, setAchievement] = useState<any>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)

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

  // Handle landmark discovery
  const handleLandmarkDiscovered = (landmarkId: string, landmarkData: any) => {
    if (gameProgress.visitedLandmarks.has(landmarkId)) return

    const newProgress = visitLandmark(landmarkId, gameProgress)
    setGameProgress(newProgress)

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

  // Handle player position updates
  const handlePlayerPositionChange = (position: any) => {
    setPlayerPosition({ lng: position.lng, lat: position.lat })
    setCurrentBearing(position.bearing)
    setNearestLandmark(position.nearestLandmark)
  }

  // Handle game reset
  const handleResetProgress = () => {
    const newProgress = resetGameProgress()
    setGameProgress(newProgress)
  }

  // ESC key to exit walk mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWalkMode) {
        setIsWalkMode(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isWalkMode])

  // Prepare landmarks with visited status
  const landmarksWithStatus = landmarks.map(l => ({
    ...l,
    visited: gameProgress.visitedLandmarks.has(l.id)
  }))

  return (
    <MapProvider>
      <main 
        className="relative w-full h-screen overflow-hidden" 
        style={{ background: '#EFE6D5' }}
      >
        <Map 
          layersVisible={layersVisible} 
          currentSeason={currentSeason} 
          is3D={is3DView} 
          isWalking={isWalkMode}
          landmarks={landmarks}
          visitedLandmarks={gameProgress.visitedLandmarks}
          onLandmarkDiscovered={handleLandmarkDiscovered}
          onPlayerPositionChange={handlePlayerPositionChange}
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
        
        {/* Game HUD Components - Show during walk mode */}
        <WalkModeHUD isVisible={isWalkMode} />
        <GameProgressHUD
          isVisible={isWalkMode}
          visitedCount={gameProgress.visitedLandmarks.size}
          totalCount={10}
          currentLocation={nearestLandmark?.name}
        />
        <CompassHUD
          isVisible={isWalkMode}
          bearing={currentBearing}
          nearestLandmark={nearestLandmark}
        />
        <Minimap
          isVisible={isWalkMode}
          playerPosition={playerPosition}
          landmarks={landmarksWithStatus}
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
      </main>
    </MapProvider>
  )
}

