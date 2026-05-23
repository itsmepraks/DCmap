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
    onEndRef.current = null
    if (!a) return
    a.onplay = null
    a.onpause = null
    a.onended = null
    a.onerror = null
    a.onloadstart = null
    a.oncanplay = null
    a.onplaying = null
    a.onwaiting = null
    a.pause()
    a.src = ''
    a.load()
    a.remove()
    audioRef.current = null
  }, [])

  const play = useCallback(
    (src: string, opts?: { onEnd?: () => void }) => {
      cleanup()
      onEndRef.current = opts?.onEnd ?? null

      const audio = document.createElement('audio')
      const setCurrentState = (next: NarrationState) => {
        if (audioRef.current === audio) setState(next)
      }
      audio.src = src
      audio.preload = 'auto'
      audio.setAttribute('playsinline', 'true')
      audio.dataset.tourAudio = 'active'
      audio.onplay = () => setCurrentState('playing')
      audio.onplaying = () => setCurrentState('playing')
      audio.oncanplay = () => {
        if (!audio.paused) setCurrentState('playing')
      }
      audio.onwaiting = () => setCurrentState('loading')
      audio.onpause = () => {
        // pause can also fire on .pause() right before src=''; only flip
        // state if there's still audio queued.
        if (audio.src) setCurrentState('paused')
      }
      audio.onended = () => {
        if (audioRef.current !== audio) return
        setState('ended')
        const onEnd = onEndRef.current
        onEndRef.current = null
        onEnd?.()
      }
      audio.onerror = () => {
        if (audioRef.current !== audio) return
        console.warn('[guide] audio load failed:', src)
        setState('error')
      }
      audio.onloadstart = () => setCurrentState('loading')

      document.body.appendChild(audio)
      audioRef.current = audio
      audio
        .play()
        .then(() => setCurrentState('playing'))
        .catch((err) => {
          if (audioRef.current !== audio) return
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
