'use client'

import { STORAGE_KEYS } from './storageKeys'
import { readJsonFromStorage } from './safeStorage'

const STORAGE_KEY = STORAGE_KEYS.gameProgress

export interface VisitedLandmark {
  id: string
  visitedAt: number
}

export interface GameProgress {
  visitedLandmarks: Set<string>
  visitedLandmarksWithTime: VisitedLandmark[]
  timestamp: number
}

export interface LandmarkInfo {
  id: string
  name: string
  description: string
  funFact: string
  category: string
  icon: string
}

interface StoredGameProgress {
  visited?: string[]
  visitedWithTime?: VisitedLandmark[]
  timestamp?: number
}

function createEmptyProgress(): GameProgress {
  return {
    visitedLandmarks: new Set(),
    visitedLandmarksWithTime: [],
    timestamp: Date.now()
  }
}

// Load game progress from localStorage
export function loadGameProgress(): GameProgress {
  if (typeof window === 'undefined') {
    return createEmptyProgress()
  }

  const data = readJsonFromStorage<StoredGameProgress | null>(STORAGE_KEY, null)
  if (!data) {
    return createEmptyProgress()
  }

  return {
    visitedLandmarks: new Set(Array.isArray(data.visited) ? data.visited : []),
    visitedLandmarksWithTime: Array.isArray(data.visitedWithTime) ? data.visitedWithTime : [],
    timestamp: typeof data.timestamp === 'number' ? data.timestamp : Date.now()
  }
}

// Save game progress to localStorage
export function saveGameProgress(progress: GameProgress): void {
  if (typeof window === 'undefined') return

  try {
    const data = {
      visited: Array.from(progress.visitedLandmarks),
      visitedWithTime: progress.visitedLandmarksWithTime,
      timestamp: progress.timestamp
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save game progress:', error)
  }
}

// Mark a landmark as visited
export function visitLandmark(landmarkId: string, currentProgress: GameProgress): GameProgress {
  const newVisited = new Set(currentProgress.visitedLandmarks)
  const alreadyVisited = newVisited.has(landmarkId)
  newVisited.add(landmarkId)

  const newProgress = {
    visitedLandmarks: newVisited,
    visitedLandmarksWithTime: alreadyVisited
      ? currentProgress.visitedLandmarksWithTime
      : [...currentProgress.visitedLandmarksWithTime, { id: landmarkId, visitedAt: Date.now() }],
    timestamp: Date.now()
  }

  saveGameProgress(newProgress)
  return newProgress
}

// Check if a landmark has been visited
export function isLandmarkVisited(landmarkId: string, progress: GameProgress): boolean {
  return progress.visitedLandmarks.has(landmarkId)
}

// Calculate completion percentage
export function getCompletionPercentage(progress: GameProgress, totalLandmarks: number = 10): number {
  return Math.round((progress.visitedLandmarks.size / totalLandmarks) * 100)
}

// Get game statistics
export function getGameStats(progress: GameProgress) {
  return {
    visited: progress.visitedLandmarks.size,
    total: 10,
    percentage: getCompletionPercentage(progress, 10),
    lastPlayed: new Date(progress.timestamp).toLocaleDateString()
  }
}

// Reset game progress
export function resetGameProgress(): GameProgress {
  // Clear all related storage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.gameProgress)
    localStorage.removeItem(STORAGE_KEYS.quests)
    localStorage.removeItem(STORAGE_KEYS.challenges)
    localStorage.removeItem(STORAGE_KEYS.streak)
    localStorage.removeItem(STORAGE_KEYS.experience)
    localStorage.removeItem(STORAGE_KEYS.waypoints)
  }

  const newProgress = {
    visitedLandmarks: new Set<string>(),
    visitedLandmarksWithTime: [],
    timestamp: Date.now()
  }
  saveGameProgress(newProgress)
  return newProgress
}
