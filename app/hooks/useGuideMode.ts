'use client'

import { useCallback, useMemo, useState } from 'react'
import { getTour, type Tour } from '@/app/lib/tours'

const PROXIMITY_M = 200 // metres — close enough to qualify as "at" the landmark

interface NearbyLandmark {
  id: string
  name: string
  distance: number
}

interface UseGuideModeOpts {
  /** Sorted nearest-first. */
  nearbyLandmarks: NearbyLandmark[]
  /** Disable while certain modes are active (e.g. modal flows). */
  disabled?: boolean
}

interface GuideState {
  /** Tour for the nearest landmark we have content for, or null. */
  availableTour: Tour | null
  /** Active tour currently shown to the user, or null. */
  activeTour: Tour | null
  /** Open the tour that's currently available. */
  openTour: () => void
  /** Close the active tour. */
  closeTour: () => void
  /** Dismiss the pill for this landmark in this session. */
  dismissAvailable: () => void
}

/**
 * Surfaces an "audio tour available" affordance when the user reaches a
 * landmark we have content for. Click-to-open only — never auto-opens.
 * Dismissed tours stay dismissed for the rest of the session for that
 * specific landmark.
 */
export function useGuideMode({ nearbyLandmarks, disabled }: UseGuideModeOpts): GuideState {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set())

  // Closest landmark in range that we have a tour for and that hasn't been
  // dismissed in this session.
  const candidate = useMemo(() => {
    if (disabled) return null
    for (const l of nearbyLandmarks) {
      if (l.distance >= PROXIMITY_M) break // sorted, so we can stop
      if (dismissed.has(l.id)) continue
      if (!getTour(l.id)) continue
      return l
    }
    return null
  }, [nearbyLandmarks, dismissed, disabled])

  const availableTour = candidate ? getTour(candidate.id) ?? null : null
  const activeTour = activeId ? getTour(activeId) ?? null : null

  const openTour = useCallback(() => {
    if (candidate) setActiveId(candidate.id)
  }, [candidate])

  const closeTour = useCallback(() => {
    setActiveId(null)
  }, [])

  const dismissAvailable = useCallback(() => {
    if (candidate) {
      setDismissed((prev) => {
        const next = new Set(prev)
        next.add(candidate.id)
        return next
      })
    }
  }, [candidate])

  return { availableTour, activeTour, openTour, closeTour, dismissAvailable }
}
