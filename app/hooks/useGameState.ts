'use client'

import { useState, useEffect } from 'react'
import {
  loadGameProgress,
  resetGameProgress,
  visitLandmark,
  visitTree,
  type GameProgress
} from '@/app/lib/gameState'

interface Achievement {
  name: string
  icon: string
  funFact: string
}

export function useGameState() {
  const [gameProgress, setGameProgress] = useState<GameProgress>(() => loadGameProgress())
  const [achievement, setAchievement] = useState<Achievement | null>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)

  const handleVisitLandmark = (landmarkId: string) => {
    if (gameProgress.visitedLandmarks.has(landmarkId)) {
      return false // Already visited
    }

    const newProgress = visitLandmark(landmarkId, gameProgress)
    setGameProgress(newProgress)
    return true // Successfully visited
  }

  const handleVisitTree = (treeId: string) => {
    if (gameProgress.visitedTrees && gameProgress.visitedTrees.has(treeId)) {
      return false
    }
    const newProgress = visitTree(treeId, gameProgress)
    setGameProgress(newProgress)
    return true
  }

  const showAchievement = (landmarkData: Achievement) => {
    setAchievement(landmarkData)
  }

  const dismissAchievement = () => {
    setAchievement(null)
  }

  const openStatsModal = () => {
    setShowStatsModal(true)
  }

  const closeStatsModal = () => {
    setShowStatsModal(false)
  }

  const handleResetProgress = () => {
    const newProgress = resetGameProgress()
    setGameProgress(newProgress)
    return newProgress
  }

  return {
    gameProgress,
    achievement,
    showStatsModal,
    handleVisitLandmark,
    handleVisitTree,
    showAchievement,
    dismissAchievement,
    openStatsModal,
    closeStatsModal,
    handleResetProgress
  }
}
