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
import { useAnnounce } from '@/app/components/ui/LiveAnnouncer'
import { useTimeOfDay, type LightPreset } from '@/app/hooks/useTimeOfDay'
import { useIdleCameraDrift } from '@/app/hooks/useIdleCameraDrift'
import { STANDARD_STYLE, SATELLITE_STYLE } from '@/app/hooks/useMapInitialization'
import { useGuideMode } from '@/app/hooks/useGuideMode'

// Washington Monument — anchor point for the cinematic 3D entry.
const WASHINGTON_MONUMENT: [number, number] = [-77.0353, 38.8895]
import { track } from '@vercel/analytics'

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
  handleTreeDiscovered: (treeId: string, treeData: any) => void
  handleNavigateToLandmark: (coordinates: [number, number]) => void
  handleResetProgress: () => void

  // Completion status
  allLandmarksVisited: boolean
  showCompletion: boolean
  setShowCompletion: (show: boolean) => void

  // Progressive Waypoint System (NEW)
  playerPosition: Coordinates | null
  nearestUndiscovered: { id: string; name: string; distance: number; coordinates: [number, number] } | null
  recommendedLandmark: { id: string; name: string; coordinates: [number, number]; distance: number } | null

  // Entity Selection (New)
  selectedEntity: SelectedEntity | null
  setSelectedEntity: (entity: SelectedEntity | null) => void
  clearSelectedEntity: () => void

  // Time of day
  lightPreset: LightPreset
  cycleTimeOfDay: () => void
  timeOfDayIcon: string
  timeOfDayLabel: string

  // Satellite imagery toggle
  isSatelliteView: boolean
  toggleSatellite: () => void

  // Guide Mode
  guide: ReturnType<typeof useGuideMode>
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
  const [is3DView, setIs3DView] = useState(true)
  const [isFlyMode, setIsFlyMode] = useState(false)
  const [isSatelliteView, setIsSatelliteView] = useState(false)
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
  const announce = useAnnounce()
  const timeOfDay = useTimeOfDay('day')

  // Gentle orbit when the user is idle — disabled in fly mode and while modals are open.
  useIdleCameraDrift({ map, disabled: isFlyMode || isControlPanelOpen })

  const toggleSatellite = useCallback(() => {
    if (!map) return
    setIsSatelliteView(prev => {
      const next = !prev
      map.setStyle(next ? SATELLITE_STYLE : STANDARD_STYLE)
      track('satellite_toggled', { satellite: next })
      return next
    })
  }, [map])

  const cycleTimeOfDay = useCallback(() => {
    timeOfDay.cycle()
    track('time_of_day_cycled')
  }, [timeOfDay])

  // (guide proximity + hook are wired further down — they need playerPosition,
  // which is computed from flyControllerState below.)

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
    setIs3DView(prev => {
      const next = !prev
      if (map) {
        if (next) {
          map.flyTo({
            center: WASHINGTON_MONUMENT,
            zoom: 16.5,
            pitch: 70,
            bearing: -23,
            duration: 2500,
            essential: true,
            curve: 1.4,
          })
        } else {
          map.easeTo({ pitch: 0, bearing: 0, duration: 1500 })
        }
      }
      return next
    })
  }, [map])

  const handleToggleFly = useCallback(() => {
    setIsFlyMode(prev => {
      const newFlyMode = !prev
      // When activating fly mode, ensure 3D view is enabled
      if (newFlyMode && !is3DView) {
        setIs3DView(true)
      }
      announce(newFlyMode ? 'Fly mode activated. Use WASD to move.' : 'Fly mode deactivated.')
      track('fly_mode_toggled', { active: newFlyMode })
      return newFlyMode
    })
  }, [is3DView, announce])

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

    // Show discovery animation
    const landmark = landmarksState.getLandmarkById(landmarkId)
    if (landmark) {
      announce(`Landmark discovered: ${landmark.name}. Plus ${xpGained} XP.`)
      track('landmark_discovered', { id: landmarkId, name: landmark.name, xp: xpGained })
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

  }, [gameState, landmarksState, experience, announce])

  // Handle tree discovery (for Fly Mode and Map interaction)
  const handleTreeDiscovered = useCallback((treeId: string, treeData: any) => {
    // Check if new tree
    const isNewVisit = gameState.handleVisitTree(treeId)

    if (isNewVisit) {
      experience.awardTreeXP()
    }
  }, [gameState, experience])

  // Fly mode controller
  const flyControllerState = useFlyController({
    map,
    isActive: isFlyMode,
    landmarks: landmarksState.landmarks,
    visitedLandmarks: gameState.gameProgress.visitedLandmarks,
    onLandmarkDiscovered: handleLandmarkDiscovered,
    onTreeDiscovered: handleTreeDiscovered,
    onPositionChange: (pos) => {
      // Update landmarks hook with real-time fly position for accurate distance calculations
      if (pos && pos.lng && pos.lat) {
        landmarksState.updateCurrentPosition([pos.lng, pos.lat])
      }
    }
  })

  // Track the live map center so that anything depending on player position
  // (proximity hints, audio guide, recommendations) actually updates when the
  // user pans. Throttled to ~5Hz so this doesn't trigger a render storm.
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null)
  useEffect(() => {
    if (!map) return
    const c = map.getCenter()
    setMapCenter({ lng: c.lng, lat: c.lat })

    let last = 0
    const onMove = () => {
      const now = performance.now()
      if (now - last < 200) return
      last = now
      const center = map.getCenter()
      setMapCenter({ lng: center.lng, lat: center.lat })
    }
    map.on('move', onMove)
    map.on('moveend', onMove)
    return () => {
      map.off('move', onMove)
      map.off('moveend', onMove)
    }
  }, [map])

  // Player position prefers the fly-controller (sub-frame accurate) but
  // falls back to the live map centre when fly mode is off.
  const playerPosition = useMemo((): Coordinates | null => {
    if (flyControllerState.position) return flyControllerState.position
    return mapCenter
  }, [flyControllerState.position, mapCenter])

  // Compute nearest undiscovered landmark for HUD (single source for both
  // the "nearest undiscovered" card and the "recommended" card).
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

  // Audio tour guide proximity — independent of the `nearbyLandmarks` list
  // (that one filters visited landmarks, which would silently disable the
  // guide once you finish a tour). Includes ALL landmarks so users can
  // re-listen to places they have already discovered.
  const guideNearby = useMemo(() => {
    if (!playerPosition || !landmarksState.landmarks?.length) return []
    return landmarksState.landmarks
      .map((l: { id: string; name: string; coordinates: [number, number] }) => ({
        id: l.id,
        name: l.name,
        distance: calculateDistance(playerPosition, {
          lng: l.coordinates[0],
          lat: l.coordinates[1],
        }),
      }))
      .sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance)
  }, [playerPosition, landmarksState.landmarks])

  const guide = useGuideMode({ nearbyLandmarks: guideNearby })

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
    handleTreeDiscovered,
    handleNavigateToLandmark,
    handleResetProgress,

    // Completion status
    allLandmarksVisited,
    showCompletion,
    setShowCompletion,

    // Progressive Waypoint System (NEW)
    playerPosition,
    nearestUndiscovered,
    recommendedLandmark: nearestUndiscovered,

    // Entity Selection
    selectedEntity,
    setSelectedEntity,
    clearSelectedEntity,

    // Time of day
    lightPreset: timeOfDay.preset,
    cycleTimeOfDay,
    timeOfDayIcon: timeOfDay.icon,
    timeOfDayLabel: timeOfDay.label,

    // Satellite imagery
    isSatelliteView,
    toggleSatellite,

    // Guide
    guide,
  }

  return <>{children(props)}</>
}
