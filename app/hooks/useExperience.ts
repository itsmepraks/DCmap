'use client'

import { useState, useEffect } from 'react'
import {
  loadExperience,
  addXP,
  resetExperience,
  getXPFromLandmark,
  getXPFromQuest,
  getXPFromDailyChallenge,
  type ExperienceData
} from '@/app/lib/experienceSystem'

export function useExperience() {
  const [experience, setExperience] = useState<ExperienceData>(() => loadExperience())

  // Load from localStorage on mount
  useEffect(() => {
    setExperience(loadExperience())
  }, [])

  const awardLandmarkXP = () => {
    const xp = getXPFromLandmark()
    setExperience(prev => addXP(xp, 'landmark', prev))
    return xp
  }

  const awardQuestXP = () => {
    const xp = getXPFromQuest()
    setExperience(prev => addXP(xp, 'quest', prev))
    return xp
  }

  const awardDailyChallengeXP = () => {
    const xp = getXPFromDailyChallenge()
    setExperience(prev => addXP(xp, 'daily_challenge', prev))
    return xp
  }

  const awardCustomXP = (amount: number, source: string) => {
    setExperience(prev => addXP(amount, source, prev))
    return amount
  }

  const reset = () => {
    setExperience(resetExperience())
  }

  return {
    experience,
    awardLandmarkXP,
    awardQuestXP,
    awardDailyChallengeXP,
    awardCustomXP,
    reset
  }
}

