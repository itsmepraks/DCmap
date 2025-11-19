export type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export interface AchievementTier {
  level: TierLevel
  name: string
  minLandmarks: number
  minPoints: number
  color: string
  icon: string
  perks: string[]
}

export const ACHIEVEMENT_TIERS: AchievementTier[] = [
  {
    level: 'bronze',
    name: 'Bronze Explorer',
    minLandmarks: 1,
    minPoints: 0,
    color: '#CD7F32',
    icon: '🥉',
    perks: ['Basic explorer status', 'Access to daily challenges']
  },
  {
    level: 'silver',
    name: 'Silver Navigator',
    minLandmarks: 3,
    minPoints: 100,
    color: '#C0C0C0',
    icon: '🥈',
    perks: ['Silver badge unlocked', 'Special trail effects', '2x quest XP']
  },
  {
    level: 'gold',
    name: 'Gold Adventurer',
    minLandmarks: 5,
    minPoints: 250,
    color: '#FFD700',
    icon: '🥇',
    perks: ['Gold badge unlocked', 'Exclusive landmarks', 'Bonus challenges']
  },
  {
    level: 'platinum',
    name: 'Platinum Master',
    minLandmarks: 8,
    minPoints: 500,
    color: '#E5E4E2',
    icon: '💎',
    perks: ['Platinum status', 'Master explorer title', 'All quests unlocked']
  },
  {
    level: 'diamond',
    name: 'Diamond Legend',
    minLandmarks: 10,
    minPoints: 1000,
    color: '#B9F2FF',
    icon: '👑',
    perks: ['Legendary status', 'DC Master title', 'Everything unlocked!']
  }
]

export function getCurrentTier(landmarksVisited: number, totalPoints: number): AchievementTier {
  // Find the highest tier the user qualifies for
  for (let i = ACHIEVEMENT_TIERS.length - 1; i >= 0; i--) {
    const tier = ACHIEVEMENT_TIERS[i]
    if (landmarksVisited >= tier.minLandmarks && totalPoints >= tier.minPoints) {
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
  totalPoints: number,
  currentTier: AchievementTier
): { landmarkProgress: number; pointProgress: number } | null {
  const nextTier = getNextTier(currentTier)
  if (!nextTier) return null

  const landmarkProgress = Math.min(100, (landmarksVisited / nextTier.minLandmarks) * 100)
  const pointProgress = Math.min(100, (totalPoints / nextTier.minPoints) * 100)

  return { landmarkProgress, pointProgress }
}

