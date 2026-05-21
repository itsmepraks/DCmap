'use client'

interface Landmark {
  id: string
  name: string
  category?: string
  coordinates: [number, number]
}

// Deterministic daily index across UTC. Same landmark for everyone on the same date.
function dayIndex(now = new Date()): number {
  const epoch = Date.UTC(2026, 0, 1)
  const ms = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - epoch
  return Math.floor(ms / 86_400_000)
}

const CLUES: Record<string, string[]> = {
  Memorial: [
    'It honors a figure carved into stone, framed by columns.',
    "It's by water and reflective light when the sun sets.",
    'Crowds gather here to read the words on the wall.',
  ],
  Monument: [
    'Tall, pale, and visible from miles away — find it.',
    'A spike of marble pointing at the sky.',
  ],
  Museum: [
    'Inside, history is kept behind glass.',
    'A place where a long quiet line forms by 10am.',
  ],
  Building: [
    'A dome and pillars; the heart of the legislature.',
    'A familiar facade you have seen in newscasts.',
  ],
  default: [
    'Find this place — its name will reveal itself when you arrive.',
    'A familiar silhouette in the heart of DC.',
  ],
}

/** Pick a daily mystery landmark from the candidate pool. */
export function pickMystery(landmarks: Landmark[], visited: Set<string>) {
  const pool = landmarks.filter((l) => !visited.has(l.id))
  if (pool.length === 0) return null

  const idx = dayIndex() % pool.length
  const target = pool[idx]
  const clueSet = CLUES[target.category || 'default'] || CLUES.default
  const clue = clueSet[dayIndex() % clueSet.length]

  return { landmark: target, clue }
}
