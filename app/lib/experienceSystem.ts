'use client'

import { STORAGE_KEYS } from './storageKeys'
import { readJsonFromStorage } from './safeStorage'

const STORAGE_KEY = STORAGE_KEYS.experience

export interface ExperienceData {
  totalXP: number
  level: number
  xpToNextLevel: number
  xpHistory: Array<{
    source: string
    amount: number
    timestamp: number
  }>
}

const XP_PER_LEVEL = 100
const XP_FROM_LANDMARK = 50

function createEmptyExperience(): ExperienceData {
  return {
    totalXP: 0,
    level: 1,
    xpToNextLevel: XP_PER_LEVEL,
    xpHistory: []
  }
}

export function loadExperience(): ExperienceData {
  if (typeof window === 'undefined') {
    return createEmptyExperience()
  }

  const data = readJsonFromStorage<Partial<ExperienceData> | null>(STORAGE_KEY, null)
  if (!data || typeof data.totalXP !== 'number') {
    return createEmptyExperience()
  }

  const totalXP = Math.max(0, data.totalXP)
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1
  const xpInCurrentLevel = totalXP % XP_PER_LEVEL
  const xpToNextLevel = XP_PER_LEVEL - xpInCurrentLevel

  return {
    totalXP,
    level,
    xpToNextLevel,
    xpHistory: Array.isArray(data.xpHistory) ? data.xpHistory : []
  }
}

export function saveExperience(data: ExperienceData): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save experience:', error)
  }
}

export function addXP(
  amount: number,
  source: string,
  currentData: ExperienceData
): ExperienceData {
  const newTotalXP = currentData.totalXP + amount
  const newLevel = Math.floor(newTotalXP / XP_PER_LEVEL) + 1
  const xpInCurrentLevel = newTotalXP % XP_PER_LEVEL
  const xpToNextLevel = XP_PER_LEVEL - xpInCurrentLevel

  const newData: ExperienceData = {
    totalXP: newTotalXP,
    level: newLevel,
    xpToNextLevel,
    xpHistory: [
      ...currentData.xpHistory.slice(-49), // Keep last 50 entries
      {
        source,
        amount,
        timestamp: Date.now()
      }
    ]
  }

  saveExperience(newData)
  return newData
}

export function getXPFromLandmark(): number {
  return XP_FROM_LANDMARK
}

export function resetExperience(): ExperienceData {
  const newData: ExperienceData = {
    totalXP: 0,
    level: 1,
    xpToNextLevel: XP_PER_LEVEL,
    xpHistory: []
  }
  saveExperience(newData)
  return newData
}
