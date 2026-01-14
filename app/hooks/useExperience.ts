'use client'

import { useState } from 'react'
import {
  loadExperience,
  addXP,
  resetExperience,
  getXPFromLandmark,
  type ExperienceData
} from '@/app/lib/experienceSystem'

export function useExperience() {
  const [experience, setExperience] = useState<ExperienceData>(() => loadExperience())

  const awardLandmarkXP = () => {
    const xp = getXPFromLandmark()
    setExperience(prev => addXP(xp, 'landmark', prev))
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
    awardCustomXP,
    reset
  }
}

