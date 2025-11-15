export type AvatarType = 'human' | 'scooter'

export interface AvatarConfig {
  id: AvatarType
  name: string
  emoji: string
  camera: {
    pitch: number
    zoom: number
    description: string
  }
  speed: {
    walk: number
    run: number
  }
  size: {
    width: number
    height: number
  }
}

export const AVATAR_CONFIGS: Record<AvatarType, AvatarConfig> = {
  human: {
    id: 'human',
    name: 'Human',
    emoji: '🚶',
    camera: {
      pitch: 65,
      zoom: 18.5,
      description: 'Eye-level perspective (5.5ft high)'
    },
    speed: {
      walk: 0.00015,
      run: 0.0003
    },
    size: {
      width: 80,
      height: 80
    }
  },
  scooter: {
    id: 'scooter',
    name: 'Moped',
    emoji: '🛵',
    camera: {
      pitch: 55,
      zoom: 18.5,
      description: 'Low chase cam with wide view'
    },
    speed: {
      walk: 0.00032,
      run: 0.00065
    },
    size: {
      width: 90,
      height: 70
    }
  }
}

