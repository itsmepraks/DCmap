'use client'

import { STORAGE_KEYS } from './storageKeys'
import { readJsonFromStorage } from './safeStorage'

const STORAGE_KEY = STORAGE_KEYS.waypoints
const EMPTY_WAYPOINT_STATE: WaypointState = { waypoints: [], activeWaypointId: null }

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
    return EMPTY_WAYPOINT_STATE
  }

  const state = readJsonFromStorage<Partial<WaypointState> | null>(STORAGE_KEY, null)
  if (!state) {
    return EMPTY_WAYPOINT_STATE
  }

  return {
    waypoints: Array.isArray(state.waypoints) ? state.waypoints : [],
    activeWaypointId: typeof state.activeWaypointId === 'string' ? state.activeWaypointId : null
  }
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
