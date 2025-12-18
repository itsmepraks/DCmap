'use client'

import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { AvatarType } from '@/app/types/avatar'

export type LocomotionMode = 'human' | 'scooter'

export interface CameraRigConfig {
  mode: 'chase' | 'first-person'
  distance: number
  height: number
  stiffness: number
  lookAhead: number
}

export interface PlayerVector2 {
  lng: number
  lat: number
}

export interface PlayerState {
  position: PlayerVector2
  velocity: PlayerVector2
  heading: number
  speed: number
  avatarType: AvatarType
  locomotionMode: LocomotionMode
  cameraRig: CameraRigConfig
}

interface UpdatePosePayload {
  position?: PlayerVector2
  velocity?: PlayerVector2
  heading?: number
}

interface PlayerContextValue {
  state: PlayerState
  setAvatarType: (avatarType: AvatarType) => void
  setLocomotionMode: (mode: LocomotionMode) => void
  updatePose: (payload: UpdatePosePayload) => void
  setCameraRig: (config: Partial<CameraRigConfig>) => void
  resetPlayer: () => void
}

const DEFAULT_POSITION: PlayerVector2 = { lng: -77.0369, lat: 38.9072 }

const DEFAULT_STATE: PlayerState = {
  position: DEFAULT_POSITION,
  velocity: { lng: 0, lat: 0 },
  heading: 0,
  speed: 0,
  avatarType: 'human',
  locomotionMode: 'human',
  cameraRig: {
    mode: 'chase',
    distance: 18,
    height: 6,
    stiffness: 0.15,
    lookAhead: 12
  }
}

type PlayerAction =
  | { type: 'SET_AVATAR'; avatarType: AvatarType }
  | { type: 'SET_LOCOMOTION'; locomotionMode: LocomotionMode }
  | { type: 'UPDATE_POSE'; payload: UpdatePosePayload }
  | { type: 'SET_CAMERA_RIG'; payload: Partial<CameraRigConfig> }
  | { type: 'RESET' }

function getSpeedFromVelocity(velocity: PlayerVector2) {
  return Math.hypot(velocity.lng, velocity.lat)
}

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_AVATAR':
      return {
        ...state,
        avatarType: action.avatarType,
        locomotionMode: action.avatarType === 'scooter' ? 'scooter' : 'human'
      }
    case 'SET_LOCOMOTION':
      return {
        ...state,
        locomotionMode: action.locomotionMode
      }
    case 'UPDATE_POSE': {
      const nextPosition = action.payload.position ?? state.position
      const nextVelocity = action.payload.velocity ?? state.velocity
      const nextHeading = action.payload.heading ?? state.heading
      return {
        ...state,
        position: nextPosition,
        velocity: nextVelocity,
        heading: nextHeading,
        speed: getSpeedFromVelocity(nextVelocity)
      }
    }
    case 'SET_CAMERA_RIG':
      return {
        ...state,
        cameraRig: {
          ...state.cameraRig,
          ...action.payload
        }
      }
    case 'RESET':
      return DEFAULT_STATE
    default:
      return state
  }
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, DEFAULT_STATE)

  const setAvatarType = (avatarType: AvatarType) => dispatch({ type: 'SET_AVATAR', avatarType })
  const setLocomotionMode = (mode: LocomotionMode) => dispatch({ type: 'SET_LOCOMOTION', locomotionMode: mode })
  const updatePose = (payload: UpdatePosePayload) => dispatch({ type: 'UPDATE_POSE', payload })
  const setCameraRig = (config: Partial<CameraRigConfig>) => dispatch({ type: 'SET_CAMERA_RIG', payload: config })
  const resetPlayer = () => dispatch({ type: 'RESET' })

  const value: PlayerContextValue = {
    state,
    setAvatarType,
    setLocomotionMode,
    updatePose,
    setCameraRig,
    resetPlayer
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayerState() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayerState must be used within a PlayerProvider')
  }
  return context
}


