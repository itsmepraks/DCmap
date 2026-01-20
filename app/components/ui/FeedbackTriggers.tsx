'use client'

import { useEffect, useRef, useState } from 'react'
import { useContextualHints } from '@/app/hooks/useContextualHints'

const ONBOARDING_STORAGE_KEY = 'dc-explorer-onboarding-completed'

interface FeedbackTriggersProps {
    // Map state
    isMapLoaded: boolean

    // Discovery tracking
    visitedLandmarksCount: number

    // Mode toggles
    isFlyMode: boolean
    is3DView: boolean

    // Proximity
    nearbyLandmarkDistance?: number

    // Onboarding completion - can be overridden, otherwise checks localStorage
    onboardingComplete?: boolean
}

/**
 * FeedbackTriggers - Centralized component that triggers hints and toasts
 * based on user actions and state changes throughout the app
 */
export default function FeedbackTriggers({
    isMapLoaded,
    visitedLandmarksCount,
    isFlyMode,
    is3DView,
    nearbyLandmarkDistance,
    onboardingComplete: onboardingCompleteProp
}: FeedbackTriggersProps) {
    const { showHint, showToast, hasSeenHint } = useContextualHints()

    // Check onboarding completion from localStorage
    const [onboardingComplete, setOnboardingComplete] = useState(false)

    useEffect(() => {
        const checkOnboarding = () => {
            const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true'
            setOnboardingComplete(onboardingCompleteProp ?? completed)
        }
        checkOnboarding()
        // Re-check periodically in case onboarding just finished
        const interval = setInterval(checkOnboarding, 1000)
        return () => clearInterval(interval)
    }, [onboardingCompleteProp])

    // Track previous values for change detection
    const prevVisited = useRef(visitedLandmarksCount)
    const prevFlyMode = useRef(isFlyMode)
    const prev3DView = useRef(is3DView)
    const hasShownExploreHint = useRef(false)

    // 1. Initial explore hint - after onboarding is complete and map is loaded
    useEffect(() => {
        if (isMapLoaded && onboardingComplete && !hasShownExploreHint.current) {
            // Small delay to let onboarding animation finish
            const timer = setTimeout(() => {
                const shown = showHint(
                    'explore-start',
                    'TIP',
                    'Tap the ⭐ markers on the map to discover iconic DC landmarks!'
                )
                if (shown) hasShownExploreHint.current = true
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [isMapLoaded, onboardingComplete, showHint])

    // 2. First discovery celebration
    useEffect(() => {
        if (visitedLandmarksCount > prevVisited.current) {
            // Check if this is the FIRST discovery
            if (prevVisited.current === 0 && visitedLandmarksCount === 1) {
                // First-time educational hint
                showHint(
                    'first-discovery',
                    '🎉 NICE!',
                    'You discovered your first landmark! Keep exploring to earn more points and unlock achievements.'
                )
            } else if (!hasSeenHint('first-discovery')) {
                // Subsequent discoveries get toast only
                showToast(`Landmark discovered! +50 XP`, { type: 'success' })
            }
            prevVisited.current = visitedLandmarksCount
        }
    }, [visitedLandmarksCount, showHint, showToast, hasSeenHint])

    // 3. Fly mode first activation
    useEffect(() => {
        if (isFlyMode && !prevFlyMode.current) {
            // Just activated fly mode
            const shown = showHint(
                'fly-intro',
                '🦅 FLY MODE',
                'Use WASD to move, mouse to look around. Space goes up, Shift goes down. Press ESC to exit.'
            )
            if (!shown) {
                // Already seen hint, just show quick toast
                showToast('Fly mode activated', { icon: '🦅', type: 'info' })
            }
        } else if (!isFlyMode && prevFlyMode.current) {
            // Just exited fly mode
            showToast('Fly mode exited', { icon: '🗺️', type: 'info' })
        }
        prevFlyMode.current = isFlyMode
    }, [isFlyMode, showHint, showToast])

    // 4. 3D mode first toggle
    useEffect(() => {
        if (is3DView && !prev3DView.current) {
            // Just enabled 3D
            const shown = showHint(
                '3d-intro',
                '🏙️ 3D VIEW',
                '3D mode shows real building heights! Right-click + drag to tilt the view.'
            )
            if (!shown) {
                showToast('3D view enabled', { icon: '🏙️', type: 'info' })
            }
        } else if (!is3DView && prev3DView.current) {
            showToast('2D view', { icon: '🗺️', type: 'info' })
        }
        prev3DView.current = is3DView
    }, [is3DView, showHint, showToast])

    // 5. Proximity hint - when really close to undiscovered landmark
    useEffect(() => {
        if (nearbyLandmarkDistance !== undefined && nearbyLandmarkDistance < 50) {
            showHint(
                'proximity-close',
                '🔥 SO CLOSE!',
                'You\'re right next to a landmark! Tap the marker to discover it!'
            )
        }
    }, [nearbyLandmarkDistance, showHint])

    // This component doesn't render anything visible
    return null
}
