'use client'

import { useState, useEffect } from 'react'
import {
  loadQuestProgress,
  startQuest,
  checkQuestProgress,
  type Quest,
  type QuestProgress
} from '@/app/lib/questSystem'

interface QuestCompletion {
  title: string
  icon: string
  rewards: {
    points: number
    badge?: string
  }
}

export function useQuestSystem() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [questProgress, setQuestProgress] = useState<QuestProgress>(() => loadQuestProgress())
  const [questCompletion, setQuestCompletion] = useState<QuestCompletion | null>(null)

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

    return questResult
  }

  const dismissQuestCompletion = () => {
    setQuestCompletion(null)
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

  const activeQuestObjects = quests.filter(q => questProgress.activeQuests.includes(q.id))

  return {
    quests,
    questProgress,
    questCompletion,
    activeQuestObjects,
    handleStartQuest,
    handleLandmarkVisit,
    dismissQuestCompletion,
    reloadQuests
  }
}

