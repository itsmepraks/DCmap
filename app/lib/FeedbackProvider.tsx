'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface FeedbackToast {
    id: string
    type: 'hint' | 'toast'
    title?: string
    message: string
    icon?: string
    duration: number
    dismissable: boolean
}

interface FeedbackContextType {
    toasts: FeedbackToast[]
    addToast: (toast: FeedbackToast) => void
    removeToast: (id: string) => void
}

const FeedbackContext = createContext<FeedbackContextType | null>(null)

export function useFeedback() {
    const context = useContext(FeedbackContext)
    if (!context) {
        throw new Error('useFeedback must be used within a FeedbackProvider')
    }
    return context
}

interface FeedbackProviderProps {
    children: ReactNode
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
    const [toasts, setToasts] = useState<FeedbackToast[]>([])

    const addToast = useCallback((toast: FeedbackToast) => {
        setToasts(prev => {
            // Prevent duplicate hints
            if (toast.type === 'hint' && prev.some(t => t.type === 'hint')) {
                // Queue the hint after current one
                return [...prev, toast]
            }
            // Limit max toasts to 3
            const newToasts = [...prev, toast]
            if (newToasts.length > 3) {
                return newToasts.slice(-3)
            }
            return newToasts
        })

        // Auto-remove after duration
        setTimeout(() => {
            removeToast(toast.id)
        }, toast.duration)
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <FeedbackContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </FeedbackContext.Provider>
    )
}
