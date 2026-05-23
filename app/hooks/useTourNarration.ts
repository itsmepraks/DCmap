'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Tour narration via plain HTMLAudioElement playing pre-generated .m4a files
 * from /public/audio/. Replaced the previous Web Speech API (speechSynthesis)
 * implementation which was inherently flaky — silent failures across browsers,
 * Chrome's 15s auto-pause bug, garbage-collection of utterances, autoplay
 * policies.
 *
 * Audio files are produced offline by `pnpm run build:tour-audio`
 * (macOS `say -v Samantha` + `afconvert` -> AAC m4a, ~50KB per clip).
 * <audio> playback is one of the most reliable APIs the web has — no
 * browser-specific workarounds needed here.
 */
export type NarrationState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'

export function useTourNarration() {
  const [state, setState] = useState<NarrationState>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const onEndRef = useRef<(() => void) | null>(null)

  const cleanup = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    a.pause()
    a.src = ''
    a.load()
    audioRef.current = null
  }, [])

  const play = useCallback(
    (src: string, opts?: { onEnd?: () => void }) => {
      cleanup()
      onEndRef.current = opts?.onEnd ?? null

      const audio = new Audio(src)
      audio.preload = 'auto'
      audio.onplay = () => setState('playing')
      audio.onpause = () => {
        // pause can also fire on .pause() right before src=''; only flip
        // state if there's still audio queued.
        if (audio.src) setState('paused')
      }
      audio.onended = () => {
        setState('ended')
        onEndRef.current?.()
      }
      audio.onerror = () => {
        console.warn('[guide] audio load failed:', src)
        setState('error')
      }
      audio.onloadstart = () => setState('loading')

      audioRef.current = audio
      audio.play().catch((err) => {
        console.warn('[guide] audio.play() rejected:', err)
        setState('error')
      })
    },
    [cleanup]
  )

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const resume = useCallback(() => {
    audioRef.current?.play().catch((err) => {
      console.warn('[guide] resume rejected:', err)
    })
  }, [])

  const stop = useCallback(() => {
    cleanup()
    setState('idle')
  }, [cleanup])

  // Clean up on unmount so nothing is leaked across navigation / unmount.
  useEffect(() => () => cleanup(), [cleanup])

  const supported = typeof window !== 'undefined' && typeof Audio !== 'undefined'

  return {
    state,
    play,
    pause,
    resume,
    stop,
    supported,
    isPlaying: state === 'playing',
    isPaused: state === 'paused',
  }
}

/** Derive the audio URL for a given tour id + card kind. */
export function tourAudioSrc(tourId: string, kind: string): string {
  return `/audio/${tourId}-${kind}.m4a`
}
