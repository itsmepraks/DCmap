'use client'

import { useState, useEffect } from 'react'
import {
  loadDailyChallenges,
  updateChallengeProgress,
  loadStreak,
  updateStreak,
  type DailyChallenge,
  type StreakData
} from '@/app/lib/dailyChallenges'

export function useDailyChallenges() {
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([])
  const [currentStreak, setCurrentStreak] = useState<StreakData>({ current: 0, longest: 0, lastVisit: '' })

  // Initialize on mount
  useEffect(() => {
    // Load daily challenges
    setDailyChallenges(loadDailyChallenges())
    
    // Update and load streak
    const streak = updateStreak()
    setCurrentStreak(streak)
  }, [])

  const handleLandmarkVisit = () => {
    const challengeResult = updateChallengeProgress(dailyChallenges, 'visit')
    setDailyChallenges(challengeResult.challenges)
    return challengeResult
  }

  const handleDiscover = () => {
    const challengeResult = updateChallengeProgress(dailyChallenges, 'discover')
    setDailyChallenges(challengeResult.challenges)
    return challengeResult
  }

  const handleExplore = () => {
    const challengeResult = updateChallengeProgress(dailyChallenges, 'explore')
    setDailyChallenges(challengeResult.challenges)
    return challengeResult
  }

  const refreshStreak = () => {
    const streak = updateStreak()
    setCurrentStreak(streak)
    return streak
  }

  return {
    dailyChallenges,
    currentStreak,
    handleLandmarkVisit,
    handleDiscover,
    handleExplore,
    refreshStreak
  }
}

