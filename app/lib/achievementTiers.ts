export type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export interface AchievementTier {
  level: TierLevel
  name: string
  minLandmarks: number
  minMuseums: number
  color: string
  icon: string
  perks: string[]
  description: string
}

// Total: 10 Landmarks + 36 Museums = 46 discoverable locations
export const ACHIEVEMENT_TIERS: AchievementTier[] = [
  {
    level: 'bronze',
    name: 'Bronze Explorer',
    minLandmarks: 0,
    minMuseums: 0,
    color: '#CD7F32',
    icon: '🥉',
    perks: ['Basic explorer status', 'Access to map features'],
    description: 'Just starting your DC adventure!'
  },
  {
    level: 'silver',
    name: 'Silver Navigator',
    minLandmarks: 3,
    minMuseums: 5,
    color: '#C0C0C0',
    icon: '🥈',
    perks: ['Silver badge unlocked', 'Intermediate explorer'],
    description: 'Visit 3 landmarks + 5 museums'
  },
  {
    level: 'gold',
    name: 'Gold Adventurer',
    minLandmarks: 5,
    minMuseums: 12,
    color: '#FFD700',
    icon: '🥇',
    perks: ['Gold badge unlocked', 'Seasoned explorer'],
    description: 'Visit 5 landmarks + 12 museums'
  },
  {
    level: 'platinum',
    name: 'Platinum Master',
    minLandmarks: 8,
    minMuseums: 24,
    color: '#E5E4E2',
    icon: '💎',
    perks: ['Platinum status', 'Expert explorer'],
    description: 'Visit 8 landmarks + 24 museums'
  },
  {
    level: 'diamond',
    name: 'Diamond Legend',
    minLandmarks: 10,
    minMuseums: 36,
    color: '#B9F2FF',
    icon: '👑',
    perks: ['Legendary status', 'DC Master!'],
    description: 'Visit ALL 10 landmarks + ALL 36 museums'
  }
]

export function getCurrentTier(landmarksVisited: number, museumsVisited: number): AchievementTier {
  // Find the highest tier the user qualifies for (must meet BOTH requirements)
  for (let i = ACHIEVEMENT_TIERS.length - 1; i >= 0; i--) {
    const tier = ACHIEVEMENT_TIERS[i]
    if (landmarksVisited >= tier.minLandmarks && museumsVisited >= tier.minMuseums) {
      return tier
    }
  }
  return ACHIEVEMENT_TIERS[0] // Default to bronze
}

export function getNextTier(currentTier: AchievementTier): AchievementTier | null {
  const currentIndex = ACHIEVEMENT_TIERS.findIndex(t => t.level === currentTier.level)
  if (currentIndex < ACHIEVEMENT_TIERS.length - 1) {
    return ACHIEVEMENT_TIERS[currentIndex + 1]
  }
  return null // Already at max tier
}

export function getProgressToNextTier(
  landmarksVisited: number,
  museumsVisited: number,
  currentTier: AchievementTier
): { landmarkProgress: number; museumProgress: number; landmarksNeeded: number; museumsNeeded: number } | null {
  const nextTier = getNextTier(currentTier)
  if (!nextTier) return null

  const landmarkProgress = nextTier.minLandmarks > 0 
    ? Math.min(100, (landmarksVisited / nextTier.minLandmarks) * 100)
    : 100
  const museumProgress = nextTier.minMuseums > 0 
    ? Math.min(100, (museumsVisited / nextTier.minMuseums) * 100)
    : 100

  return { 
    landmarkProgress, 
    museumProgress,
    landmarksNeeded: Math.max(0, nextTier.minLandmarks - landmarksVisited),
    museumsNeeded: Math.max(0, nextTier.minMuseums - museumsVisited)
  }
}
