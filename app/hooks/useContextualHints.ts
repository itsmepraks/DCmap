'use client'

import { useCallback } from 'react'
import { useFeedback } from '@/app/lib/FeedbackProvider'

const HINTS_STORAGE_KEY = 'dc-explorer-hints-seen'

export interface HintOptions {
    icon?: string
    duration?: number
    dismissable?: boolean
}

export interface ToastOptions {
    icon?: string
    duration?: number
    type?: 'success' | 'info' | 'warning'
}

/**
 * Hook for showing contextual hints (first-time only) and action toasts (always)
 */
export function useContextualHints() {
    const { addToast } = useFeedback()

    /**
     * Get the set of seen hint IDs from localStorage
     */
    const getSeenHints = useCallback((): Set<string> => {
        if (typeof window === 'undefined') return new Set()
        try {
            const stored = localStorage.getItem(HINTS_STORAGE_KEY)
            return stored ? new Set(JSON.parse(stored)) : new Set()
        } catch {
            return new Set()
        }
    }, [])

    /**
     * Mark a hint as seen in localStorage
     */
    const markHintSeen = useCallback((hintId: string) => {
        if (typeof window === 'undefined') return
        try {
            const seen = getSeenHints()
            seen.add(hintId)
            localStorage.setItem(HINTS_STORAGE_KEY, JSON.stringify([...seen]))
        } catch {
            // Silently fail if localStorage unavailable
        }
    }, [getSeenHints])

    /**
     * Check if a hint has already been seen
     */
    const hasSeenHint = useCallback((hintId: string): boolean => {
        return getSeenHints().has(hintId)
    }, [getSeenHints])

    /**
     * Show an educational hint - only displays if not seen before
     * Returns true if hint was shown, false if already seen
     */
    const showHint = useCallback((
        hintId: string,
        title: string,
        message: string,
        options: HintOptions = {}
    ): boolean => {
        if (hasSeenHint(hintId)) return false

        addToast({
            id: `hint-${hintId}-${Date.now()}`,
            type: 'hint',
            title,
            message,
            icon: options.icon || '💡',
            duration: options.duration || 5000,
            dismissable: options.dismissable !== false
        })

        markHintSeen(hintId)
        return true
    }, [hasSeenHint, markHintSeen, addToast])

    /**
     * Show a quick action confirmation toast - always displays
     */
    const showToast = useCallback((
        message: string,
        options: ToastOptions = {}
    ) => {
        const iconMap = {
            success: '✨',
            info: '📍',
            warning: '⚠️'
        }

        addToast({
            id: `toast-${Date.now()}`,
            type: 'toast',
            message,
            icon: options.icon || iconMap[options.type || 'info'],
            duration: options.duration || 2500,
            dismissable: false
        })
    }, [addToast])

    /**
     * Reset all seen hints (for testing/debugging)
     */
    const resetHints = useCallback(() => {
        if (typeof window === 'undefined') return
        localStorage.removeItem(HINTS_STORAGE_KEY)
    }, [])

    return {
        showHint,
        showToast,
        hasSeenHint,
        resetHints
    }
}
