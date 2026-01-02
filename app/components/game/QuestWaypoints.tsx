'use client'

import { useEffect, useRef, useMemo } from 'react'
import type { Quest } from '@/app/lib/questSystem'
import type { Landmark } from '@/app/hooks/useLandmarks'
import {
  buildProgressiveWaypoints,
  type ProgressiveWaypoint
} from '@/app/lib/progressiveWaypointSystem'
import type { Coordinates } from '@/app/lib/proximityDetector'

export interface ProgressiveWaypointData {
  id: string
  name: string
  coordinates: [number, number]
  color: string
  icon: string
  isPrimary: boolean
  opacity: number
  isVisible: boolean
}

interface QuestWaypointsProps {
  activeQuests: Quest[]
  landmarks: Landmark[]
  playerPosition: Coordinates | null
  onWaypointsUpdate: (waypoints: ProgressiveWaypointData[]) => void
}

/**
 * Progressive Quest Waypoints Component
 * 
 * Instead of adding all waypoints at once, this component:
 * 1. Shows only the current objective as primary (always visible, pulsing)
 * 2. Shows upcoming objectives only when player is within 500m (faded)
 * 3. Hides objectives beyond the reveal radius
 */
export default function QuestWaypoints({
  activeQuests,
  landmarks,
  playerPosition,
  onWaypointsUpdate
}: QuestWaypointsProps) {
  const prevWaypointsRef = useRef<string>('')

  // Build progressive waypoints based on player position
  const progressiveWaypoints = useMemo(() => {
    if (!playerPosition) {
      // If no player position, just show primary waypoints for each quest
      const waypoints: ProgressiveWaypointData[] = []
      
      activeQuests.forEach(quest => {
        const firstUncompleted = quest.objectives.findIndex(o => !o.completed)
        if (firstUncompleted === -1) return
        
        const objective = quest.objectives[firstUncompleted]
        if (objective.type !== 'visit') return
        
        const landmark = landmarks.find(l => l.id === objective.target)
        if (!landmark) return

        waypoints.push({
          id: `quest-${quest.id}-${firstUncompleted}`,
          name: `${quest.icon} ${objective.description}`,
          coordinates: landmark.coordinates,
          color: '#FFD700', // Gold for primary
          icon: '🎯',
          isPrimary: true,
          opacity: 1.0,
          isVisible: true
        })
      })
      
      return waypoints
    }

    // Build full progressive waypoints with distance-based visibility
    const landmarkData = landmarks.map(l => ({
      id: l.id,
      name: l.name,
      coordinates: l.coordinates
    }))

    const rawWaypoints = buildProgressiveWaypoints(
      activeQuests,
      landmarkData,
      playerPosition
    )

    // Transform to the waypoint data format
    return rawWaypoints
      .filter(wp => wp.isVisible)
      .map(wp => ({
        id: wp.id,
        name: wp.name,
        coordinates: wp.coordinates,
        color: wp.isPrimary ? '#FFD700' : '#FFA500', // Gold for primary, orange for secondary
        icon: wp.icon,
        isPrimary: wp.isPrimary,
        opacity: wp.opacity,
        isVisible: wp.isVisible
      }))
  }, [activeQuests, landmarks, playerPosition])

  // Notify parent of waypoint changes
  useEffect(() => {
    const waypointsKey = JSON.stringify(progressiveWaypoints.map(w => w.id))
    
    // Only update if waypoints actually changed
    if (waypointsKey !== prevWaypointsRef.current) {
      prevWaypointsRef.current = waypointsKey
      onWaypointsUpdate(progressiveWaypoints)
    }
  }, [progressiveWaypoints, onWaypointsUpdate])

  return null
}
