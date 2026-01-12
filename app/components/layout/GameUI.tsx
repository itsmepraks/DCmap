'use client'

import QuestPanel from '../game/QuestPanel'
import LandmarkExplorer from '../game/LandmarkExplorer'
import MuseumExplorer from '../game/MuseumExplorer'
import AchievementToast from '../game/AchievementToast'
import CompletionNotification from '../game/CompletionNotification'
import ProximityHint from '../ui/ProximityHint'
import DiscoveryAnimation from '../ui/DiscoveryAnimation'
import EntityInfoPanel, { type SelectedEntity } from '../ui/EntityInfoPanel'

interface GameUIProps {
  // Quest system
  quests: any[]
  activeQuestIds: string[]
  onStartQuest: (questId: string) => void

  // Achievement system
  achievement: any
  onDismissAchievement: () => void

  // Completion status
  showCompletion: boolean
  allLandmarksVisited: boolean
  hasCompletedQuest: boolean
  onCloseCompletion: () => void

  // Proximity system
  nearbyLandmarks: any[]
  visitedLandmarks: Set<string>
  onNavigateToLandmark: (coordinates: [number, number]) => void
  landmarks: Array<{ id: string; name: string; icon: string; coordinates: [number, number]; visited: boolean }>
  
  // Discovery animation
  showDiscovery: boolean
  discoveryData: any

  // Entity Selection
  selectedEntity: SelectedEntity | null
  onCloseEntityPanel: () => void
  onSelectEntity: (entity: SelectedEntity) => void

  // Layer State
  layersVisible: {
    museums: boolean
    trees: boolean
    landmarks: boolean
    parks: boolean
  }
}

export default function GameUI({
  quests,
  activeQuestIds,
  onStartQuest,
  achievement,
  onDismissAchievement,
  showCompletion,
  allLandmarksVisited,
  hasCompletedQuest,
  onCloseCompletion,
  nearbyLandmarks,
  visitedLandmarks,
  onNavigateToLandmark,
  landmarks,
  showDiscovery,
  discoveryData,
  selectedEntity,
  onCloseEntityPanel,
  onSelectEntity,
  layersVisible
}: GameUIProps) {
  // Create wrapper function for ProximityHint that takes landmarkId and calls coordinate-based function
  const handleNavigateToLandmark = (landmarkId: string) => {
    const landmark = landmarks.find(l => l.id === landmarkId)
    if (landmark) {
      onNavigateToLandmark(landmark.coordinates)
    }
  }
  return (
    <>
      {/* Landmark Explorer (Replaces Quest Panel) */}
      <LandmarkExplorer
        landmarks={landmarks}
        onNavigate={onNavigateToLandmark}
      />

      {/* Museum Explorer (Only visible when museum layer is on) */}
      <MuseumExplorer
        isVisible={layersVisible.museums}
        onNavigate={onNavigateToLandmark}
        onSelect={onSelectEntity}
      />
      
      {/* Quest Panel (Hidden in favor of Landmark Explorer) */}
      {/* <QuestPanel
        quests={quests}
        activeQuestIds={activeQuestIds}
        onStartQuest={onStartQuest}
      /> */}

      {/* Completion Notifications */}
      {showCompletion && (
        <CompletionNotification
          allLandmarksVisited={allLandmarksVisited}
          questCompleted={hasCompletedQuest}
          onClose={onCloseCompletion}
        />
      )}

      {/* Entity Info Panel - Centered Popup */}
      <EntityInfoPanel
        entity={selectedEntity}
        onClose={onCloseEntityPanel}
        onNavigate={onNavigateToLandmark}
      />

      {/* Proximity Hints - Show nearby landmarks (Centered bottom pill) */}
      <ProximityHint
        nearbyLandmarks={nearbyLandmarks}
        visitedLandmarks={visitedLandmarks}
        onNavigate={handleNavigateToLandmark}
      />

      {/* Discovery Animation - Full screen celebration */}
      <DiscoveryAnimation
        isVisible={showDiscovery}
        landmarkName={discoveryData?.name || ''}
        landmarkIcon={discoveryData?.icon || ''}
        points={10}
      />

      {/* Achievement Toast */}
      <AchievementToast
        isVisible={!!achievement}
        landmarkName={achievement?.name || ''}
        landmarkIcon={achievement?.icon || ''}
        funFact={achievement?.funFact || ''}
        onDismiss={onDismissAchievement}
      />
    </>
  )
}
