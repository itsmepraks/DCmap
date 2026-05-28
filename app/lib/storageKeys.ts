// Single source of truth for every localStorage key in the app.
// When deleting a feature, remove its key here so reset routines
// don't grow stale references.
export const STORAGE_KEYS = {
  gameProgress: 'dc-game-progress',
  experience: 'dc-experience',
  waypoints: 'dc-waypoints',
  hintsSeen: 'dc-explorer-hints-seen',
  onboardingComplete: 'dc-explorer-onboarding-completed',
  quests: 'dc-explorer-quests',
  challenges: 'dc-daily-challenges',
  streak: 'dc-streak',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
