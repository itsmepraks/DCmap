'use client'

import { useState, useEffect } from 'react'
import {
  loadWaypoints,
  saveWaypoints,
  addWaypoint,
  removeWaypoint,
  setActiveWaypoint,
  type Waypoint,
  type WaypointState
} from '@/app/lib/waypointSystem'

export function useWaypointSystem() {
  const [waypointState, setWaypointState] = useState<WaypointState>(() => loadWaypoints())

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveWaypoints(waypointState)
  }, [waypointState])

  const addNewWaypoint = (
    name: string,
    coordinates: [number, number],
    color?: string,
    icon?: string
  ) => {
    const newWaypoint = addWaypoint(name, coordinates, color, icon)
    setWaypointState(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, newWaypoint]
    }))
    return newWaypoint
  }

  const removeWaypointById = (waypointId: string) => {
    setWaypointState(prev => removeWaypoint(waypointId, prev))
  }

  const setActive = (waypointId: string | null) => {
    setWaypointState(prev => setActiveWaypoint(waypointId, prev))
  }

  const clearAllWaypoints = () => {
    setWaypointState({ waypoints: [], activeWaypointId: null })
  }

  const getActiveWaypoint = (): Waypoint | null => {
    if (!waypointState.activeWaypointId) return null
    return waypointState.waypoints.find(w => w.id === waypointState.activeWaypointId) || null
  }

  return {
    waypoints: waypointState.waypoints,
    activeWaypointId: waypointState.activeWaypointId,
    activeWaypoint: getActiveWaypoint(),
    addWaypoint: addNewWaypoint,
    removeWaypoint: removeWaypointById,
    setActiveWaypoint: setActive,
    clearAllWaypoints
  }
}

