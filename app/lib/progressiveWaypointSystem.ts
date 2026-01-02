'use client'

import type { Quest, QuestObjective } from './questSystem'
import { calculateDistance, type Coordinates } from './proximityDetector'

// Configuration constants
export const REVEAL_RADIUS_METERS = 500 // Secondary waypoints appear within 500m
export const PRIMARY_WAYPOINT_SIZE = 40 // Larger icon for current objective
export const SECONDARY_WAYPOINT_SIZE = 28 // Smaller icon for upcoming objectives

export interface ProgressiveWaypoint {
  id: string
  questId: string
  objectiveIndex: number
  name: string
  description: string
  coordinates: [number, number]
  icon: string
  isPrimary: boolean
  opacity: number
  distanceFromPlayer: number
  isVisible: boolean
}

export interface CurrentObjectiveInfo {
  quest: Quest
  objective: QuestObjective
  objectiveIndex: number
  coordinates: [number, number] | null
  distanceFromPlayer: number | null
  progressPercentage: number
  completedCount: number
  totalCount: number
}

/**
 * Get the first uncompleted objective from a quest
 */
export function getCurrentObjective(quest: Quest): { objective: QuestObjective; index: number } | null {
  const index = quest.objectives.findIndex(obj => !obj.completed)
  if (index === -1) return null
  return { objective: quest.objectives[index], index }
}

/**
 * Get all uncompleted objectives after the current one
 */
export function getUpcomingObjectives(quest: Quest): { objective: QuestObjective; index: number }[] {
  const currentIndex = quest.objectives.findIndex(obj => !obj.completed)
  if (currentIndex === -1) return []
  
  return quest.objectives
    .slice(currentIndex + 1)
    .filter(obj => !obj.completed)
    .map((objective, i) => ({ objective, index: currentIndex + 1 + i }))
}

/**
 * Calculate waypoint opacity based on distance from player
 * - Within reveal radius: Fades from 0.3 (at edge) to 0.6 (close)
 * - Beyond reveal radius: 0 (hidden)
 */
export function calculateWaypointOpacity(distance: number, isPrimary: boolean): number {
  if (isPrimary) return 1.0 // Primary waypoint always fully visible
  
  if (distance > REVEAL_RADIUS_METERS) return 0 // Beyond reveal radius
  
  // Linear fade from 0.3 at edge to 0.6 when close
  const normalizedDistance = distance / REVEAL_RADIUS_METERS
  return 0.6 - (normalizedDistance * 0.3)
}

/**
 * Check if a waypoint should be visible based on distance
 */
export function isWaypointVisible(distance: number, isPrimary: boolean): boolean {
  if (isPrimary) return true
  return distance <= REVEAL_RADIUS_METERS
}

/**
 * Get landmark coordinates by ID from the landmarks array
 */
export function getLandmarkCoordinates(
  landmarkId: string,
  landmarks: Array<{ id: string; coordinates: [number, number] }>
): [number, number] | null {
  const landmark = landmarks.find(l => l.id === landmarkId)
  return landmark?.coordinates || null
}

/**
 * Build the list of progressive waypoints for active quests
 * Returns waypoints sorted by priority: primary first, then by distance
 */
export function buildProgressiveWaypoints(
  activeQuests: Quest[],
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>,
  playerPosition: Coordinates
): ProgressiveWaypoint[] {
  const waypoints: ProgressiveWaypoint[] = []

  activeQuests.forEach(quest => {
    // Get current objective (primary waypoint)
    const current = getCurrentObjective(quest)
    if (current && current.objective.type === 'visit') {
      const coords = getLandmarkCoordinates(current.objective.target, landmarks)
      if (coords) {
        const distance = calculateDistance(playerPosition, { lng: coords[0], lat: coords[1] })
        waypoints.push({
          id: `quest-${quest.id}-${current.index}`,
          questId: quest.id,
          objectiveIndex: current.index,
          name: `${quest.icon} ${current.objective.description}`,
          description: current.objective.description,
          coordinates: coords,
          icon: '🎯',
          isPrimary: true,
          opacity: 1.0,
          distanceFromPlayer: distance,
          isVisible: true
        })
      }
    }

    // Get upcoming objectives (secondary waypoints, distance-based visibility)
    const upcoming = getUpcomingObjectives(quest)
    upcoming.forEach(({ objective, index }) => {
      if (objective.type !== 'visit') return
      
      const coords = getLandmarkCoordinates(objective.target, landmarks)
      if (!coords) return

      const distance = calculateDistance(playerPosition, { lng: coords[0], lat: coords[1] })
      const isVisible = isWaypointVisible(distance, false)
      const opacity = calculateWaypointOpacity(distance, false)

      waypoints.push({
        id: `quest-${quest.id}-${index}`,
        questId: quest.id,
        objectiveIndex: index,
        name: objective.description,
        description: objective.description,
        coordinates: coords,
        icon: '📍',
        isPrimary: false,
        opacity,
        distanceFromPlayer: distance,
        isVisible
      })
    })
  })

  // Sort: primary first, then by distance
  return waypoints.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return a.distanceFromPlayer - b.distanceFromPlayer
  })
}

/**
 * Get detailed info about the current objective for HUD display
 */
export function getCurrentObjectiveInfo(
  activeQuests: Quest[],
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>,
  playerPosition: Coordinates | null
): CurrentObjectiveInfo | null {
  if (activeQuests.length === 0) return null

  // Get the first active quest with an uncompleted objective
  for (const quest of activeQuests) {
    const current = getCurrentObjective(quest)
    if (!current) continue

    const coords = getLandmarkCoordinates(current.objective.target, landmarks)
    const completedCount = quest.objectives.filter(o => o.completed).length
    const totalCount = quest.objectives.length
    const progressPercentage = (completedCount / totalCount) * 100

    let distanceFromPlayer: number | null = null
    if (playerPosition && coords) {
      distanceFromPlayer = calculateDistance(playerPosition, { lng: coords[0], lat: coords[1] })
    }

    return {
      quest,
      objective: current.objective,
      objectiveIndex: current.index,
      coordinates: coords,
      distanceFromPlayer,
      progressPercentage,
      completedCount,
      totalCount
    }
  }

  return null
}

