'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

interface AnnouncerContextValue {
  announce: (message: string) => void
}

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null)

export function LiveAnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const clearRef = useRef<number | null>(null)

  const announce = useCallback((next: string) => {
    if (!next) return
    setMessage('')
    // Force re-announcement even when the text is unchanged.
    queueMicrotask(() => setMessage(next))
    if (clearRef.current) window.clearTimeout(clearRef.current)
    clearRef.current = window.setTimeout(() => setMessage(''), 4000)
  }, [])

  useEffect(() => () => {
    if (clearRef.current) window.clearTimeout(clearRef.current)
  }, [])

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        {message}
      </div>
    </AnnouncerContext.Provider>
  )
}

export function useAnnounce() {
  const ctx = useContext(AnnouncerContext)
  return ctx?.announce ?? (() => {})
}
