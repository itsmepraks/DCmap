'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  loadQuestProgress,
  startQuest,
  checkQuestProgress,
  resetQuestProgress,
  type Quest,
  type QuestProgress
} from '@/app/lib/questSystem'
import {
  getCurrentObjectiveInfo,
  type CurrentObjectiveInfo
} from '@/app/lib/progressiveWaypointSystem'
import type { Coordinates } from '@/app/lib/proximityDetector'

export function useQuestSystem() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [questProgress, setQuestProgress] = useState<QuestProgress>(() => loadQuestProgress())
  const [completedQuest, setCompletedQuest] = useState<Quest | null>(null)

  // Load quests data from JSON
  useEffect(() => {
    fetch('/data/quests.json')
      .then(res => res.json())
      .then(data => setQuests(data))
      .catch(err => console.error('Failed to load quests:', err))
  }, [])

  const handleStartQuest = (questId: string) => {
    const newProgress = startQuest(questId, questProgress)
    setQuestProgress(newProgress)
  }

  const handleLandmarkVisit = (landmarkId: string) => {
    const questResult = checkQuestProgress(landmarkId, quests, questProgress)
    
    setQuestProgress(questResult.progress)
    
    // Update quests state with the updated/completed quests returned from checkQuestProgress
    if (questResult.updatedQuests.length > 0 || questResult.completedQuests.length > 0) {
      setQuests(prevQuests => {
        const questMap = new Map(prevQuests.map(q => [q.id, q]))
        
        // Update quests that were modified
        questResult.updatedQuests.forEach(updatedQuest => {
          questMap.set(updatedQuest.id, updatedQuest)
        })
        
        // Mark completed quests
        questResult.completedQuests.forEach(completedQuest => {
          questMap.set(completedQuest.id, completedQuest)
        })
        
        return Array.from(questMap.values())
      })
    }

    // Store the first completed quest if any
    if (questResult.completedQuests.length > 0) {
      setCompletedQuest(questResult.completedQuests[0])
    }

    return questResult
  }

  const reloadQuests = async () => {
    try {
      const response = await fetch('/data/quests.json')
      const data = await response.json()
      setQuests(data)
    } catch (err) {
      console.error('Failed to reload quests:', err)
    }
  }

  const activeQuestObjects = useMemo(
    () => quests.filter(q => questProgress.activeQuests.includes(q.id)),
    [quests, questProgress.activeQuests]
  )

  const resetProgress = () => {
    const newProgress = resetQuestProgress()
    setQuestProgress(newProgress)
    setCompletedQuest(null)
    // Reload quests to reset objectives
    reloadQuests()
  }

  /**
   * Get current objective info for HUD display
   * Requires landmarks and player position to calculate distance
   */
  const getObjectiveInfo = useCallback((
    landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>,
    playerPosition: Coordinates | null
  ): CurrentObjectiveInfo | null => {
    return getCurrentObjectiveInfo(activeQuestObjects, landmarks, playerPosition)
  }, [activeQuestObjects])

  /**
   * Get quest progress percentage for the first active quest
   */
  const getQuestProgressPercentage = useCallback((): number => {
    if (activeQuestObjects.length === 0) return 0
    const quest = activeQuestObjects[0]
    const completed = quest.objectives.filter(o => o.completed).length
    return (completed / quest.objectives.length) * 100
  }, [activeQuestObjects])

  return {
    quests,
    questProgress,
    questCompletion: completedQuest,
    activeQuestObjects,
    handleStartQuest,
    handleLandmarkVisit,
    dismissQuestCompletion: () => setCompletedQuest(null),
    reloadQuests,
    resetProgress,
    // New progressive waypoint helpers
    getObjectiveInfo,
    getQuestProgressPercentage
  }
}

