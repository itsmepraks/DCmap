export type QuestDifficulty = 'easy' | 'medium' | 'hard'
export type ObjectiveType = 'visit' | 'discover' | 'learn'

export interface QuestObjective {
  type: ObjectiveType
  target: string  // landmark ID
  description: string
  completed: boolean
}

export interface QuestRewards {
  points: number
  badge?: string
}

export interface Quest {
  id: string
  title: string
  description: string
  icon: string
  difficulty: QuestDifficulty
  rewards: QuestRewards
  objectives: QuestObjective[]
  isUnlocked: boolean
  isCompleted: boolean
  category?: string
}

export interface QuestProgress {
  activeQuests: string[]  // Quest IDs
  completedQuests: Set<string>  // Quest IDs
  totalPoints: number
  unlockedBadges: string[]
}

const QUESTS_STORAGE_KEY = 'dc-explorer-quests'

export function loadQuestProgress(): QuestProgress {
  if (typeof window === 'undefined') {
    return getDefaultQuestProgress()
  }

  try {
    const stored = localStorage.getItem(QUESTS_STORAGE_KEY)
    if (!stored) return getDefaultQuestProgress()

    const parsed = JSON.parse(stored)
    return {
      ...parsed,
      completedQuests: new Set(parsed.completedQuests || [])
    }
  } catch (error) {
    console.error('Failed to load quest progress:', error)
    return getDefaultQuestProgress()
  }
}

export function saveQuestProgress(progress: QuestProgress): void {
  if (typeof window === 'undefined') return

  try {
    const toStore = {
      ...progress,
      completedQuests: Array.from(progress.completedQuests)
    }
    localStorage.setItem(QUESTS_STORAGE_KEY, JSON.stringify(toStore))
  } catch (error) {
    console.error('Failed to save quest progress:', error)
  }
}

export function getDefaultQuestProgress(): QuestProgress {
  return {
    activeQuests: [],
    completedQuests: new Set(),
    totalPoints: 0,
    unlockedBadges: []
  }
}

export function startQuest(questId: string, progress: QuestProgress): QuestProgress {
  if (progress.activeQuests.includes(questId)) {
    return progress
  }

  const newProgress = {
    ...progress,
    activeQuests: [...progress.activeQuests, questId]
  }

  saveQuestProgress(newProgress)
  return newProgress
}

export function completeObjective(
  questId: string,
  objectiveIndex: number,
  quests: Quest[],
  progress: QuestProgress
): { progress: QuestProgress; questCompleted: boolean; rewards?: QuestRewards } {
  const quest = quests.find(q => q.id === questId)
  if (!quest) {
    return { progress, questCompleted: false }
  }

  // Mark objective as completed
  quest.objectives[objectiveIndex].completed = true

  // Check if all objectives are completed
  const allCompleted = quest.objectives.every(obj => obj.completed)
  
  if (allCompleted) {
    const newProgress = {
      ...progress,
      activeQuests: progress.activeQuests.filter(id => id !== questId),
      completedQuests: new Set([...progress.completedQuests, questId]),
      totalPoints: progress.totalPoints + quest.rewards.points,
      unlockedBadges: quest.rewards.badge 
        ? [...progress.unlockedBadges, quest.rewards.badge]
        : progress.unlockedBadges
    }

    saveQuestProgress(newProgress)
    return {
      progress: newProgress,
      questCompleted: true,
      rewards: quest.rewards
    }
  }

  saveQuestProgress(progress)
  return { progress, questCompleted: false }
}

export function checkQuestProgress(
  landmarkId: string,
  quests: Quest[],
  progress: QuestProgress
): { progress: QuestProgress; completedQuests: Quest[]; updatedQuests: Quest[] } {
  const completedQuestsList: Quest[] = []
  const updatedQuestsList: Quest[] = []

  // Check active quests for objectives matching this landmark
  progress.activeQuests.forEach(questId => {
    const quest = quests.find(q => q.id === questId)
    if (!quest) return

    let questUpdated = false
    quest.objectives.forEach((objective, index) => {
      if (!objective.completed && objective.target === landmarkId) {
        const result = completeObjective(questId, index, quests, progress)
        progress = result.progress
        questUpdated = true

        if (result.questCompleted) {
          completedQuestsList.push(quest)
        }
      }
    })

    if (questUpdated && !completedQuestsList.includes(quest)) {
      updatedQuestsList.push(quest)
    }
  })

  return {
    progress,
    completedQuests: completedQuestsList,
    updatedQuests: updatedQuestsList
  }
}

export function resetQuestProgress(): QuestProgress {
  const newProgress = getDefaultQuestProgress()
  saveQuestProgress(newProgress)
  return newProgress
}

