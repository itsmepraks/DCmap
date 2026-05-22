'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Wraps the browser's free SpeechSynthesis API to narrate tour cards. No API
 * keys, no network calls — uses the on-device voices installed in the OS.
 *
 * Cleanup is critical: leaving an utterance running across remounts (e.g.
 * React Strict Mode) leaves the browser's TTS queue stuck. We cancel on
 * unmount and whenever a new utterance is requested.
 */
export type NarrationState = 'idle' | 'speaking' | 'paused' | 'unsupported'

export function useTourNarration() {
  const [state, setState] = useState<NarrationState>('idle')
  const [voice, setVoiceState] = useState<SpeechSynthesisVoice | null>(null)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Detect support + auto-pick a pleasant default voice.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setState('unsupported')
      return
    }

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length === 0) return
      // Prefer en-US, then any English, with a slight bias toward natural/
      // neural voices that tend to score highest on common platforms.
      const preferOrder = [
        (v: SpeechSynthesisVoice) => v.lang === 'en-US' && /natural|neural|samantha|aria/i.test(v.name),
        (v: SpeechSynthesisVoice) => v.lang === 'en-US',
        (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
      ]
      for (const test of preferOrder) {
        const match = voices.find(test)
        if (match) {
          setVoiceState(match)
          return
        }
      }
      setVoiceState(voices[0])
    }

    pickVoice()
    // voiceschanged fires when the OS loads its voice list asynchronously.
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', pickVoice)
      window.speechSynthesis.cancel()
    }
  }, [])

  const keepAliveRef = useRef<number | null>(null)

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current !== null) {
      window.clearInterval(keepAliveRef.current)
      keepAliveRef.current = null
    }
  }, [])

  const speak = useCallback(
    (text: string, opts?: { rate?: number; pitch?: number; onEnd?: () => void }) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('speechSynthesis not available in this browser')
        return
      }
      window.speechSynthesis.cancel()
      stopKeepAlive()

      const u = new SpeechSynthesisUtterance(text)
      if (voice) u.voice = voice
      u.rate = opts?.rate ?? 0.95
      u.pitch = opts?.pitch ?? 1.05
      u.volume = 1
      u.onstart = () => setState('speaking')
      u.onpause = () => setState('paused')
      u.onresume = () => setState('speaking')
      u.onend = () => {
        setState('idle')
        stopKeepAlive()
        opts?.onEnd?.()
      }
      u.onerror = (e) => {
        // Surface the error so silent failures are debuggable.
        console.warn('speechSynthesis error:', e.error || e)
        setState('idle')
        stopKeepAlive()
      }
      utterRef.current = u
      window.speechSynthesis.speak(u)

      // Chrome auto-pauses speechSynthesis after ~15s for no good reason.
      // Tickling pause/resume on a 5s cadence keeps it talking through long
      // utterances. Harmless in browsers that don't have the bug.
      keepAliveRef.current = window.setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause()
          window.speechSynthesis.resume()
        }
      }, 5000)
    },
    [voice, stopKeepAlive]
  )

  const pause = useCallback(() => {
    if (typeof window === 'undefined') return
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause()
      setState('paused')
    }
  }, [])

  const resume = useCallback(() => {
    if (typeof window === 'undefined') return
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setState('speaking')
    }
  }, [])

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    utterRef.current = null
    stopKeepAlive()
    setState('idle')
  }, [stopKeepAlive])

  // Belt-and-braces cancel on unmount.
  useEffect(() => () => stop(), [stop])

  return { state, speak, pause, resume, stop, supported: state !== 'unsupported' }
}
