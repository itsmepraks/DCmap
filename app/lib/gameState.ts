'use client'

const STORAGE_KEY = 'dc-game-progress'

export interface VisitedLandmark {
  id: string
  visitedAt: number
}

export interface GameProgress {
  visitedLandmarks: Set<string>
  visitedLandmarksWithTime: VisitedLandmark[]
  visitedTrees: Set<string> // Track visited trees by hashed ID or cluster ID
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

// Load game progress from localStorage
export function loadGameProgress(): GameProgress {
  if (typeof window === 'undefined') {
    return {
      visitedLandmarks: new Set(),
      visitedLandmarksWithTime: [],
      visitedTrees: new Set(),
      timestamp: Date.now()
    }
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      return {
        visitedLandmarks: new Set(data.visited || []),
        visitedLandmarksWithTime: data.visitedWithTime || [],
        visitedTrees: new Set(data.visitedTrees || []),
        timestamp: data.timestamp || Date.now()
      }
    }
  } catch (error) {
    console.error('Failed to load game progress:', error)
  }

  return {
    visitedLandmarks: new Set(),
    visitedLandmarksWithTime: [],
    visitedTrees: new Set(),
    timestamp: Date.now()
  }
}

// Save game progress to localStorage
export function saveGameProgress(progress: GameProgress): void {
  if (typeof window === 'undefined') return

  try {
    const data = {
      visited: Array.from(progress.visitedLandmarks),
      visitedWithTime: progress.visitedLandmarksWithTime,
      visitedTrees: Array.from(progress.visitedTrees),
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
    visitedTrees: currentProgress.visitedTrees,
    timestamp: Date.now()
  }

  saveGameProgress(newProgress)
  return newProgress
}

// Mark a tree as visited
export function visitTree(treeId: string, currentProgress: GameProgress): GameProgress {
  const newVisitedTrees = new Set(currentProgress.visitedTrees)
  if (newVisitedTrees.has(treeId)) return currentProgress // No change

  newVisitedTrees.add(treeId)

  const newProgress = {
    ...currentProgress,
    visitedTrees: newVisitedTrees,
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
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('dc-explorer-quests')      // Fixed: correct quest storage key
    localStorage.removeItem('dc-daily-challenges')      // Fixed: correct challenges storage key
    localStorage.removeItem('dc-streak')                // Fixed: correct streak storage key
    localStorage.removeItem('dc-experience')            // Added: clear experience
    localStorage.removeItem('dc-waypoints')             // Added: clear waypoints
  }

  const newProgress = {
    visitedLandmarks: new Set<string>(),
    visitedLandmarksWithTime: [],
    visitedTrees: new Set<string>(),
    timestamp: Date.now()
  }
  saveGameProgress(newProgress)
  return newProgress
}