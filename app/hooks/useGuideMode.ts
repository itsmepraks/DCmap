'use client'

import { useCallback, useMemo, useState } from 'react'
import { getTour, type Tour } from '@/app/lib/tours'

const PROXIMITY_M = 200 // metres — close enough to qualify as "at" the place

interface NearbyGuidePlace {
  id: string
  name: string
  distance: number
  tour?: Tour
}

interface UseGuideModeOpts {
  /** Sorted nearest-first. */
  nearbyPlaces: NearbyGuidePlace[]
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
 * landmark or museum we have content for. Click-to-open only — never auto-opens.
 * Dismissed tours stay dismissed for the rest of the session for that
 * specific place.
 */
export function useGuideMode({ nearbyPlaces, disabled }: UseGuideModeOpts): GuideState {
  const [activeTour, setActiveTour] = useState<Tour | null>(null)
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set())

  // Closest place in range that has a tour and hasn't been
  // dismissed in this session.
  const candidate = useMemo(() => {
    if (disabled) return null
    for (const place of nearbyPlaces) {
      if (place.distance >= PROXIMITY_M) break // sorted, so we can stop
      if (dismissed.has(place.id)) continue
      const tour = place.tour ?? getTour(place.id)
      if (!tour) continue
      return { ...place, tour }
    }
    return null
  }, [nearbyPlaces, dismissed, disabled])

  const availableTour = candidate?.tour ?? null

  const openTour = useCallback(() => {
    if (candidate?.tour) setActiveTour(candidate.tour)
  }, [candidate])

  const closeTour = useCallback(() => {
    setActiveTour(null)
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
