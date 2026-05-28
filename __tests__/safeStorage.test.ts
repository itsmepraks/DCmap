import { loadExperience } from '@/app/lib/experienceSystem'
import { loadGameProgress } from '@/app/lib/gameState'
import { readJsonFromStorage } from '@/app/lib/safeStorage'
import { STORAGE_KEYS } from '@/app/lib/storageKeys'
import { loadWaypoints } from '@/app/lib/waypointSystem'

function installLocalStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial))

  Object.defineProperty(global, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key),
        clear: () => store.clear(),
        key: (index: number) => Array.from(store.keys())[index] ?? null,
        get length() {
          return store.size
        },
      },
    },
  })

  Object.defineProperty(global, 'localStorage', {
    configurable: true,
    get: () => (global as typeof globalThis & { window: Window }).window.localStorage,
  })

  return store
}

afterEach(() => {
  delete (global as typeof globalThis & { window?: Window }).window
  delete (global as typeof globalThis & { localStorage?: Storage }).localStorage
})

describe('safe storage', () => {
  it('returns fallback and removes corrupt JSON', () => {
    const store = installLocalStorage({ broken: '' })

    expect(readJsonFromStorage('broken', { ok: true })).toEqual({ ok: true })
    expect(store.has('broken')).toBe(false)
  })

  it('keeps the app bootable with corrupt saved game state', () => {
    const store = installLocalStorage({
      [STORAGE_KEYS.gameProgress]: '',
      [STORAGE_KEYS.experience]: '{',
      [STORAGE_KEYS.waypoints]: 'not json',
    })

    expect(loadGameProgress().visitedLandmarks.size).toBe(0)
    expect(loadExperience().totalXP).toBe(0)
    expect(loadWaypoints().waypoints).toEqual([])
    expect(store.has(STORAGE_KEYS.gameProgress)).toBe(false)
    expect(store.has(STORAGE_KEYS.experience)).toBe(false)
    expect(store.has(STORAGE_KEYS.waypoints)).toBe(false)
  })
})
