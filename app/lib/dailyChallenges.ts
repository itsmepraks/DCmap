export interface DailyChallenge {
  id: string
  date: string
  title: string
  description: string
  icon: string
  type: 'visit' | 'discover' | 'explore'
  target: number
  current: number
  reward: {
    points: number
    badge?: string
  }
  completed: boolean
}

const CHALLENGES_STORAGE_KEY = 'dc-daily-challenges'
const STREAK_STORAGE_KEY = 'dc-streak'

export function generateDailyChallenges(date: string): DailyChallenge[] {
  // Seed random based on date for consistency
  let seed = date.split('-').reduce((acc, val) => acc + parseInt(val), 0)
  const random = () => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  const challengeTemplates = [
    { title: 'Monument Marathon', desc: 'Visit 3 monuments today', type: 'visit', target: 3, points: 50 },
    { title: 'Museum Explorer', desc: 'Discover 2 museums', type: 'discover', target: 2, points: 40 },
    { title: 'DC Navigator', desc: 'Explore 5 different areas', type: 'explore', target: 5, points: 60 },
    { title: 'Historic Hunter', desc: 'Find 4 historic sites', type: 'visit', target: 4, points: 55 },
    { title: 'Quick Tour', desc: 'Visit any 2 landmarks', type: 'visit', target: 2, points: 30 },
  ]

  // Pick 3 random challenges for the day
  const dailyChallenges: DailyChallenge[] = []
  const used = new Set<number>()
  
  for (let i = 0; i < 3; i++) {
    let index = Math.floor(random() * challengeTemplates.length)
    while (used.has(index)) {
      index = (index + 1) % challengeTemplates.length
    }
    used.add(index)
    
    const template = challengeTemplates[index]
    dailyChallenges.push({
      id: `daily-${date}-${i}`,
      date,
      title: template.title,
      description: template.desc,
      icon: ['🎯', '⭐', '🏆'][i],
      type: template.type as any,
      target: template.target,
      current: 0,
      reward: { points: template.points },
      completed: false
    })
  }

  return dailyChallenges
}

export function loadDailyChallenges(): DailyChallenge[] {
  if (typeof window === 'undefined') return []

  const today = new Date().toISOString().split('T')[0]
  
  try {
    const stored = localStorage.getItem(CHALLENGES_STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      // Check if challenges are from today
      if (data.date === today) {
        return data.challenges
      }
    }
  } catch (error) {
    console.error('Failed to load daily challenges:', error)
  }

  // Generate new challenges for today
  const challenges = generateDailyChallenges(today)
  saveDailyChallenges(challenges, today)
  return challenges
}

export function saveDailyChallenges(challenges: DailyChallenge[], date: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify({ date, challenges }))
  } catch (error) {
    console.error('Failed to save daily challenges:', error)
  }
}

export function updateChallengeProgress(
  challenges: DailyChallenge[],
  type: 'visit' | 'discover' | 'explore'
): { challenges: DailyChallenge[]; completedChallenges: DailyChallenge[] } {
  const completedChallenges: DailyChallenge[] = []
  const today = new Date().toISOString().split('T')[0]

  const updated = challenges.map(challenge => {
    if (challenge.completed || challenge.type !== type) return challenge

    const newCurrent = challenge.current + 1
    const isNowCompleted = newCurrent >= challenge.target

    if (isNowCompleted) {
      completedChallenges.push({ ...challenge, current: newCurrent, completed: true })
    }

    return {
      ...challenge,
      current: Math.min(newCurrent, challenge.target),
      completed: isNowCompleted
    }
  })

  saveDailyChallenges(updated, today)
  return { challenges: updated, completedChallenges }
}

// Streak system
export interface StreakData {
  current: number
  longest: number
  lastVisit: string
}

export function loadStreak(): StreakData {
  if (typeof window === 'undefined') {
    return { current: 0, longest: 0, lastVisit: '' }
  }

  try {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load streak:', error)
  }

  return { current: 0, longest: 0, lastVisit: '' }
}

export function updateStreak(): StreakData {
  const today = new Date().toISOString().split('T')[0]
  const streak = loadStreak()

  if (streak.lastVisit === today) {
    // Already visited today
    return streak
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  if (streak.lastVisit === yesterday) {
    // Continuing streak
    streak.current += 1
    streak.longest = Math.max(streak.longest, streak.current)
  } else if (streak.lastVisit) {
    // Streak broken
    streak.current = 1
  } else {
    // First visit
    streak.current = 1
  }

  streak.lastVisit = today
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak))
  }

  return streak
}

