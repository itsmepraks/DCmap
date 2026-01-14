'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useGameState } from '@/app/hooks/useGameState'
import { useLandmarks } from '@/app/hooks/useLandmarks'
import { useMuseums } from '@/app/hooks/useMuseums'
import { useFlyController } from '@/app/hooks/useFlyController'
import { useWaypointSystem } from '@/app/hooks/useWaypointSystem'
import { useExperience } from '@/app/hooks/useExperience'
import { useMap } from '@/app/lib/MapContext'
import { usePlayerState } from '@/app/lib/playerState'
import { calculateDistance, type Coordinates } from '@/app/lib/proximity'

import { type SelectedEntity } from '../ui/EntityInfoPanel'

interface StateManagerProps {
  children: (props: StateManagerReturn) => React.ReactNode
}

type LayerVisibility = {
  museums: boolean
  trees: boolean
  landmarks: boolean
  parks: boolean
}

interface StateManagerReturn {
  // UI State
  isControlPanelOpen: boolean
  setIsControlPanelOpen: (open: boolean) => void
  layersVisible: LayerVisibility
  setLayersVisible: React.Dispatch<React.SetStateAction<LayerVisibility>>
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  setCurrentSeason: (season: 'spring' | 'summer' | 'fall' | 'winter') => void
  is3DView: boolean
  setIs3DView: (is3D: boolean) => void
  isFlyMode: boolean
  setIsFlyMode: (isFly: boolean) => void
  isMapLoaded: boolean

  // Game Systems
  gameState: any
  landmarksState: any
  museumsState: any
  waypointSystem: any
  experience: any

  // Controllers
  flyControllerState: any

  // Event Handlers
  handleToggleLayer: (layerId: keyof LayerVisibility) => void
  handleSeasonChange: (season: 'spring' | 'summer' | 'fall' | 'winter') => void
  handleToggle3D: () => void
  handleToggleFly: () => void
  handleLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
  handleNavigateToLandmark: (coordinates: [number, number]) => void
  handleResetProgress: () => void

  // Completion status
  allLandmarksVisited: boolean
  showCompletion: boolean
  setShowCompletion: (show: boolean) => void

  // Progressive Waypoint System (NEW)
  playerPosition: Coordinates | null
  nearestUndiscovered: { id: string; name: string; distance: number; coordinates: [number, number] } | null
  
  // Entity Selection (New)
  selectedEntity: SelectedEntity | null
  setSelectedEntity: (entity: SelectedEntity | null) => void
  clearSelectedEntity: () => void
}

export default function StateManager({ children }: StateManagerProps) {
  // UI State
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false)
  const [layersVisible, setLayersVisible] = useState({
    museums: false,
    trees: false,
    landmarks: true,
    parks: false
  })
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>('summer')
  const [is3DView, setIs3DView] = useState(false)
  const [isFlyMode, setIsFlyMode] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [lastCompletionState, setLastCompletionState] = useState({
    landmarks: false
  })
  
  // Entity Selection State
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null)
  const clearSelectedEntity = useCallback(() => setSelectedEntity(null), [])

  // Custom Hooks

  const gameState = useGameState()
  const landmarksState = useLandmarks(gameState.gameProgress.visitedLandmarks)
  const museumsState = useMuseums(gameState.gameProgress.visitedLandmarks)
  const waypointSystem = useWaypointSystem()
  const experience = useExperience()

  const { map } = useMap()
  const { state: playerState } = usePlayerState()

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
  const handleToggleLayer = useCallback((layerId: keyof typeof layersVisible) => {
    setLayersVisible(prev => {
      const next = { ...prev, [layerId]: !prev[layerId] }
      return next
    })
  }, [])

  const handleSeasonChange = useCallback((season: 'spring' | 'summer' | 'fall' | 'winter') => {
    setCurrentSeason(season)
  }, [])

  const handleToggle3D = useCallback(() => {
    setIs3DView(prev => !prev)
  }, [])

  const handleToggleFly = useCallback(() => {
    setIsFlyMode(prev => !prev)
  }, [])

  // Handle landmark discovery
  const handleLandmarkDiscovered = useCallback((landmarkId: string, landmarkData: any) => {
    // Check if already visited
    const isNewVisit = gameState.handleVisitLandmark(landmarkId)

    // Only award XP and show animations for NEW visits
    if (!isNewVisit) {
      return
    }

    // Award XP for landmark discovery
    const xpGained = experience.awardLandmarkXP()
    console.log(`✨ +${xpGained} XP from landmark discovery!`)

    // Show discovery animation
    const landmark = landmarksState.getLandmarkById(landmarkId)
    if (landmark) {
      landmarksState.showDiscoveryAnimation(landmarkId)

      // Show achievement after discovery animation
      setTimeout(() => {
        gameState.showAchievement({
          name: landmark.name,
          icon: landmark.icon,
          funFact: landmark.funFact
        })
      }, 3000)
    }

    console.log('🏆 Landmark discovered:', landmarkData.name || landmarkId)
  }, [gameState, landmarksState, experience])

  // Fly mode controller
  const flyControllerState = useFlyController({
    map,
    isActive: isFlyMode,
    landmarks: landmarksState.landmarks,
    visitedLandmarks: gameState.gameProgress.visitedLandmarks,
    onLandmarkDiscovered: handleLandmarkDiscovered,
    onPositionChange: (pos) => {
      // Update landmarks hook with real-time fly position for accurate distance calculations
      if (pos && pos.lng && pos.lat) {
        landmarksState.updateCurrentPosition([pos.lng, pos.lat])
      }
    }
  })

  // Compute player position from fly controller or map center
  const playerPosition = useMemo((): Coordinates | null => {
    if (flyControllerState.position) {
      return flyControllerState.position
    }
    if (map) {
      const center = map.getCenter()
      return { lng: center.lng, lat: center.lat }
    }
    return null
  }, [flyControllerState.position, map])

  // Compute nearest undiscovered landmark for HUD
  const nearestUndiscovered = useMemo(() => {
    if (!playerPosition || landmarksState.landmarks.length === 0) return null

    const undiscovered = landmarksState.landmarks.filter(
      (l: { id: string }) => !gameState.gameProgress.visitedLandmarks.has(l.id)
    )

    if (undiscovered.length === 0) return null

    let nearest = null
    let minDistance = Infinity

    undiscovered.forEach((landmark: { id: string; name: string; coordinates: [number, number] }) => {
      const distance = calculateDistance(playerPosition, {
        lng: landmark.coordinates[0],
        lat: landmark.coordinates[1]
      })
      if (distance < minDistance) {
        minDistance = distance
        nearest = {
          id: landmark.id,
          name: landmark.name,
          distance,
          coordinates: landmark.coordinates
        }
      }
    })

    return nearest
  }, [playerPosition, landmarksState.landmarks, gameState.gameProgress.visitedLandmarks])

  // Check completion status
  const allLandmarksVisited = landmarksState.landmarks.length > 0 &&
    gameState.gameProgress.visitedLandmarks.size >= landmarksState.landmarks.length

  // Show completion notification when status changes
  useEffect(() => {
    if (allLandmarksVisited && !lastCompletionState.landmarks) {
      setShowCompletion(true)
      setLastCompletionState(prev => ({ ...prev, landmarks: true }))
    }
  }, [allLandmarksVisited, lastCompletionState])

  const handleNavigateToLandmark = useCallback((coordinates: [number, number]) => {
    if (!map) return
    
    // Exit fly mode first - fly mode animation loop will override map.flyTo()
    if (isFlyMode) {
      setIsFlyMode(false)
      // Give fly mode a moment to cleanup before flying to location
      setTimeout(() => {
        map.flyTo({
          center: coordinates,
          zoom: 17,
          pitch: 60,
          bearing: 0,
          duration: 2000,
          essential: true
        })
      }, 100)
    } else {
      map.flyTo({
        center: coordinates,
        zoom: 17,
        pitch: 60,
        bearing: 0,
        duration: 2000,
        essential: true
      })
    }
  }, [map, isFlyMode])

  // Handle game reset - reset ALL systems
  const handleResetProgress = useCallback(() => {
    gameState.handleResetProgress()        // Reset visited landmarks
    experience.reset()                      // Reset XP and levels
    waypointSystem.clearAllWaypoints()     // Clear all waypoints
  }, [gameState, experience, waypointSystem])

  const props: StateManagerReturn = {
    // UI State
    isControlPanelOpen,
    setIsControlPanelOpen,
    layersVisible,
    setLayersVisible,
    currentSeason,
    setCurrentSeason,
    is3DView,
    setIs3DView,
    isFlyMode,
    setIsFlyMode,
    isMapLoaded,

    // Game Systems
    gameState: {
      ...gameState,
      selectedEntity,
      setSelectedEntity,
      clearSelectedEntity
    },
    landmarksState,
    museumsState,
    waypointSystem,
    experience,

    // Controllers
    flyControllerState,

    // Event Handlers
    handleToggleLayer,
    handleSeasonChange,
    handleToggle3D,
    handleToggleFly,
    handleLandmarkDiscovered,
    handleNavigateToLandmark,
    handleResetProgress,

    // Completion status
    allLandmarksVisited,
    showCompletion,
    setShowCompletion,

    // Progressive Waypoint System (NEW)
    playerPosition,
    nearestUndiscovered,
    
    // Entity Selection
    selectedEntity,
    setSelectedEntity,
    clearSelectedEntity
  }

  return <>{children(props)}</>
}
