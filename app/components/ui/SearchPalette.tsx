'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useFocusTrap } from '@/app/hooks/useFocusTrap'

interface SearchItem {
  id: string
  name: string
  category?: string
  coordinates: [number, number]
}

interface SearchPaletteProps {
  landmarks: SearchItem[]
  museums?: SearchItem[]
  onNavigate: (coordinates: [number, number]) => void
}

function score(needle: string, hay: string): number {
  if (!needle) return 0
  const n = needle.toLowerCase()
  const h = hay.toLowerCase()
  if (h === n) return 1000
  if (h.startsWith(n)) return 500
  if (h.includes(n)) return 250
  // fuzzy: every needle char in order in hay
  let hi = 0
  for (const c of n) {
    const next = h.indexOf(c, hi)
    if (next < 0) return 0
    hi = next + 1
  }
  return 100 - (h.length - n.length)
}

export default function SearchPalette({ landmarks, museums = [], onNavigate }: SearchPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const reduceMotion = useReducedMotion()
  const dialogRef = useFocusTrap<HTMLDivElement>(open, () => setOpen(false))

  // Cmd/Ctrl-K opens; ESC closes (focus trap also handles ESC).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIdx(0)
      // Defer focus until the input mounts.
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const results = useMemo(() => {
    const items: Array<SearchItem & { kind: 'Landmark' | 'Museum'; score: number }> = []
    landmarks.forEach((l) => items.push({ ...l, kind: 'Landmark', score: score(query, l.name) }))
    museums.forEach((m) => items.push({ ...m, kind: 'Museum', score: score(query, m.name) }))
    const filtered = query
      ? items.filter((i) => i.score > 0)
      : items
    return filtered.sort((a, b) => b.score - a.score).slice(0, 8)
  }, [landmarks, museums, query])

  const choose = (item: SearchItem) => {
    onNavigate(item.coordinates)
    setOpen(false)
  }

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(results.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      e.preventDefault()
      choose(results[selectedIdx])
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search landmarks and museums"
            initial={reduceMotion ? { opacity: 0 } : { y: -20, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: -20, opacity: 0 }}
            transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', damping: 28, stiffness: 320 }}
            className="mt-24 w-[92%] max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0F1424]/95 shadow-2xl ring-1 ring-white/5"
            onKeyDown={onListKey}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <span aria-hidden="true" className="text-white/40">⌕</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIdx(0)
                }}
                placeholder="Find a landmark or museum…"
                className="w-full bg-transparent text-base text-white placeholder:text-white/35 focus:outline-none"
                aria-label="Search query"
              />
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/60">ESC</kbd>
            </div>

            <ul className="max-h-80 overflow-y-auto py-1" role="listbox">
              {results.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-white/40">
                  No matches.
                </li>
              )}
              {results.map((item, idx) => {
                const active = idx === selectedIdx
                return (
                  <li
                    key={`${item.kind}-${item.id}`}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    onClick={() => choose(item)}
                    className={
                      'flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm ' +
                      (active ? 'bg-white/10 text-white' : 'text-white/80')
                    }
                  >
                    <div className="min-w-0 truncate">{item.name}</div>
                    <span className="shrink-0 text-xs uppercase tracking-wider text-white/40">
                      {item.kind}
                    </span>
                  </li>
                )
              })}
            </ul>

            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-xs text-white/40">
              <span>
                <kbd className="rounded bg-white/10 px-1 py-0.5">↑↓</kbd> Navigate&nbsp;&nbsp;
                <kbd className="rounded bg-white/10 px-1 py-0.5">⏎</kbd> Open
              </span>
              <span>
                <kbd className="rounded bg-white/10 px-1 py-0.5">⌘</kbd>
                <kbd className="ml-1 rounded bg-white/10 px-1 py-0.5">K</kbd>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
