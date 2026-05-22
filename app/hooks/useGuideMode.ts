'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '@/app/lib/storageKeys'
import { getTour, type Tour } from '@/app/lib/tours'

const PROXIMITY_M = 150 // metres — close enough to be "at" the landmark

interface NearbyLandmark {
  id: string
  name: string
  distance: number
}

interface UseGuideModeOpts {
  /** Sorted nearest-first by useLandmarks. */
  nearbyLandmarks: NearbyLandmark[]
  /** Disable guide while certain modals/modes are active. */
  disabled?: boolean
}

interface GuideState {
  /** User has explicitly enabled the audio guide. */
  enabled: boolean
  /** Toggle on/off (persisted). */
  toggle: () => void
  /** True if we should show the "Try the Guide" opt-in prompt right now. */
  showOptIn: boolean
  /** Landmark the opt-in / active tour is about. */
  pendingLandmark: { id: string; name: string } | null
  /** Active tour shown in GuideCard, if any. */
  activeTour: Tour | null
  /** Accept the opt-in: enable mode + open the pending landmark's tour. */
  acceptOptIn: () => void
  /** Dismiss the opt-in (silently — same landmark won't re-prompt). */
  dismissOptIn: () => void
  /** Close the active tour without disabling guide mode. */
  closeTour: () => void
}

export function useGuideMode({ nearbyLandmarks, disabled }: UseGuideModeOpts): GuideState {
  const [enabled, setEnabled] = useState(false)
  const [optInShown, setOptInShown] = useState(false)
  const [showOptIn, setShowOptIn] = useState(false)
  const [pendingLandmark, setPendingLandmark] = useState<{ id: string; name: string } | null>(null)
  const [activeTourId, setActiveTourId] = useState<string | null>(null)
  const [seenSession, setSeenSession] = useState<Set<string>>(() => new Set())

  // Hydrate persisted flags.
  useEffect(() => {
    if (typeof window === 'undefined') return
    setEnabled(localStorage.getItem(STORAGE_KEYS.guideMode) === 'true')
    setOptInShown(localStorage.getItem(STORAGE_KEYS.guideOptInShown) === 'true')
  }, [])

  // Closest landmark that is actually close enough to qualify.
  const nearest = useMemo(() => {
    return nearbyLandmarks.find((l) => l.distance < PROXIMITY_M) || null
  }, [nearbyLandmarks])

  // Proximity trigger: drives both the opt-in prompt and the active tour.
  useEffect(() => {
    if (disabled) return
    if (!nearest) return
    if (!getTour(nearest.id)) return // Only landmarks we have curated content for.
    if (seenSession.has(nearest.id)) return // Don't re-trigger within this session.

    setSeenSession((prev) => new Set(prev).add(nearest.id))

    if (enabled) {
      // Guide is on — open the tour directly.
      setActiveTourId(nearest.id)
    } else if (!optInShown) {
      // First time a landmark is in range — offer the guide.
      setPendingLandmark({ id: nearest.id, name: nearest.name })
      setShowOptIn(true)
    }
  }, [nearest, enabled, optInShown, seenSession, disabled])

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.guideMode, String(next))
      }
      return next
    })
  }, [])

  const acceptOptIn = useCallback(() => {
    setEnabled(true)
    setOptInShown(true)
    setShowOptIn(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.guideMode, 'true')
      localStorage.setItem(STORAGE_KEYS.guideOptInShown, 'true')
    }
    if (pendingLandmark) setActiveTourId(pendingLandmark.id)
  }, [pendingLandmark])

  const dismissOptIn = useCallback(() => {
    setOptInShown(true)
    setShowOptIn(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.guideOptInShown, 'true')
    }
  }, [])

  const closeTour = useCallback(() => setActiveTourId(null), [])

  const activeTour = activeTourId ? getTour(activeTourId) ?? null : null

  return {
    enabled,
    toggle,
    showOptIn,
    pendingLandmark,
    activeTour,
    acceptOptIn,
    dismissOptIn,
    closeTour,
  }
}
