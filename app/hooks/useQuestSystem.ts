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
    // Get latest state and check quest progress
    const currentQuests = quests
    const currentProgress = questProgress
    
    const questResult = checkQuestProgress(landmarkId, currentQuests, currentProgress)
    
    console.log('🎯 Quest check for landmark:', landmarkId)
    console.log('📊 Active quests:', currentProgress.activeQuests)
    console.log('📋 Current quest objectives:', currentQuests.find(q => currentProgress.activeQuests.includes(q.id))?.objectives)
    console.log('✅ Updated quests:', questResult.updatedQuests.length)
    console.log('🏆 Completed quests:', questResult.completedQuests.length)
    
    // Update quest progress first
    setQuestProgress(questResult.progress)
    
    // Then update quests to reflect completed objectives
    // CRITICAL: Merge objectives to preserve previously completed ones
    if (questResult.updatedQuests.length > 0 || questResult.completedQuests.length > 0) {
      setQuests(prevQuests => {
        const updatedQuests = prevQuests.map(quest => {
          // Check if this quest was updated
          const updatedQuest = questResult.updatedQuests.find(q => q.id === quest.id)
          if (updatedQuest) {
            console.log(`✨ Updating quest: ${quest.id}`, updatedQuest.objectives)
            // Merge objectives: preserve previously completed ones, add newly completed
            const mergedObjectives = quest.objectives.map((prevObj, idx) => {
              const newObj = updatedQuest.objectives[idx]
              // If this objective was already completed, keep it completed
              // Otherwise, use the new status from updatedQuest
              const isCompleted = prevObj.completed || (newObj && newObj.completed)
              return { ...prevObj, completed: isCompleted }
            })
            return { ...quest, objectives: mergedObjectives }
          }
          
          // Check if this quest was completed
          const completedQuest = questResult.completedQuests.find(q => q.id === quest.id)
          if (completedQuest) {
            console.log(`🏆 Quest completed: ${quest.id}`)
            // Merge objectives: preserve previously completed ones
            const mergedObjectives = quest.objectives.map((prevObj, idx) => {
              const newObj = completedQuest.objectives[idx]
              const isCompleted = prevObj.completed || (newObj && newObj.completed)
              return { ...prevObj, completed: isCompleted }
            })
            return { ...quest, isCompleted: true, objectives: mergedObjectives }
          }
          
          return quest
        })
        
        console.log('📝 Final quest state:', updatedQuests.map(q => ({
          id: q.id,
          objectives: q.objectives.map(obj => ({ target: obj.target, completed: obj.completed }))
        })))
        
        return updatedQuests
      })
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

