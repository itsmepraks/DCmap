'use client'

export function readJsonFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback

  const saved = window.localStorage.getItem(key)
  if (saved === null) return fallback
  if (saved.trim() === '') {
    window.localStorage.removeItem(key)
    return fallback
  }

  try {
    return JSON.parse(saved) as T
  } catch {
    window.localStorage.removeItem(key)
    return fallback
  }
}
