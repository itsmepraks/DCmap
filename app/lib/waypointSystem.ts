'use client'

const STORAGE_KEY = 'dc-waypoints'

export interface Waypoint {
  id: string
  name: string
  coordinates: [number, number]
  color?: string
  icon?: string
  createdAt: number
}

export interface WaypointState {
  waypoints: Waypoint[]
  activeWaypointId: string | null
}

export function loadWaypoints(): WaypointState {
  if (typeof window === 'undefined') {
    return { waypoints: [], activeWaypointId: null }
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load waypoints:', error)
  }

  return { waypoints: [], activeWaypointId: null }
}

export function saveWaypoints(state: WaypointState): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save waypoints:', error)
  }
}

export function addWaypoint(
  name: string,
  coordinates: [number, number],
  color: string = '#FF6B6B',
  icon: string = '📍'
): Waypoint {
  return {
    id: `waypoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    coordinates,
    color,
    icon,
    createdAt: Date.now()
  }
}

export function removeWaypoint(waypointId: string, state: WaypointState): WaypointState {
  const newState = {
    waypoints: state.waypoints.filter(w => w.id !== waypointId),
    activeWaypointId: state.activeWaypointId === waypointId ? null : state.activeWaypointId
  }
  saveWaypoints(newState)
  return newState
}

export function setActiveWaypoint(waypointId: string | null, state: WaypointState): WaypointState {
  const newState = { ...state, activeWaypointId: waypointId }
  saveWaypoints(newState)
  return newState
}

