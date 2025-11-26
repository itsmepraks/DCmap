'use client'

import { useEffect, useRef } from 'react'
import type { Quest } from '@/app/lib/questSystem'
import type { Landmark } from '@/app/hooks/useLandmarks'

interface QuestWaypointsProps {
  activeQuests: Quest[]
  landmarks: Landmark[]
  onAddWaypoint: (name: string, coordinates: [number, number], color: string, icon: string) => void
  onRemoveWaypoint: (waypointId: string) => void
}

export default function QuestWaypoints({
  activeQuests,
  landmarks,
  onAddWaypoint,
  onRemoveWaypoint
}: QuestWaypointsProps) {
  const waypointIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Generate waypoints for active quest objectives
    const currentWaypointIds = new Set<string>()
    
    activeQuests.forEach(quest => {
      quest.objectives.forEach((objective, index) => {
        if (!objective.completed && objective.type === 'visit') {
          const landmark = landmarks.find(l => l.id === objective.target)
          if (!landmark) return

          const waypointId = `quest-${quest.id}-${index}`
          currentWaypointIds.add(waypointId)

          // Only add if it doesn't exist yet
          if (!waypointIdsRef.current.has(waypointId)) {
            const waypointName = `${quest.icon} ${objective.description}`
            onAddWaypoint(
              waypointName,
              landmark.coordinates,
              '#FFD700', // Gold for quest waypoints
              '🎯'
            )
            waypointIdsRef.current.add(waypointId)
          }
        }
      })
    })

    // Remove waypoints for completed objectives or inactive quests
    waypointIdsRef.current.forEach(waypointId => {
      if (!currentWaypointIds.has(waypointId)) {
        onRemoveWaypoint(waypointId)
        waypointIdsRef.current.delete(waypointId)
      }
    })
  }, [activeQuests, landmarks, onAddWaypoint, onRemoveWaypoint])

  return null
}
