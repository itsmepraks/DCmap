'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'

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
    const timersRef = useRef<Map<string, number>>(new Map())

    const removeToast = useCallback((id: string) => {
        const timer = timersRef.current.get(id)
        if (timer !== undefined) {
            window.clearTimeout(timer)
            timersRef.current.delete(id)
        }
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const addToast = useCallback((toast: FeedbackToast) => {
        setToasts(prev => {
            if (toast.type === 'hint' && prev.some(t => t.type === 'hint')) {
                return [...prev, toast]
            }
            const next = [...prev, toast]
            return next.length > 3 ? next.slice(-3) : next
        })

        const timer = window.setTimeout(() => {
            timersRef.current.delete(toast.id)
            setToasts(prev => prev.filter(t => t.id !== toast.id))
        }, toast.duration)
        timersRef.current.set(toast.id, timer)
    }, [])

    useEffect(() => () => {
        timersRef.current.forEach(t => window.clearTimeout(t))
        timersRef.current.clear()
    }, [])

    return (
        <FeedbackContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </FeedbackContext.Provider>
    )
}
