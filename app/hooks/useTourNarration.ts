'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Wraps the browser's free SpeechSynthesis API to narrate tour cards. No API
 * keys, no network calls — uses the on-device voices installed in the OS.
 *
 * Designed to be called from event handlers only (button clicks, onEnd
 * callbacks). Calling speak() from a useEffect can race with the cancel()
 * inside the next speak() call and produce silent failures.
 */
export type NarrationState = 'idle' | 'speaking' | 'paused' | 'unsupported'

export function useTourNarration() {
  const [state, setState] = useState<NarrationState>('idle')
  const [voice, setVoiceState] = useState<SpeechSynthesisVoice | null>(null)
  const voiceReadyRef = useRef(false)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)
  const keepAliveRef = useRef<number | null>(null)

  // Detect support + auto-pick a pleasant default voice.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setState('unsupported')
      return
    }

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length === 0) return
      voiceReadyRef.current = true
      console.info(`[guide] ${voices.length} TTS voices loaded`)
      const preferOrder = [
        (v: SpeechSynthesisVoice) => v.lang === 'en-US' && /natural|neural|samantha|aria|premium/i.test(v.name),
        (v: SpeechSynthesisVoice) => v.lang === 'en-US' && !v.name.toLowerCase().includes('compact'),
        (v: SpeechSynthesisVoice) => v.lang === 'en-US',
        (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
      ]
      for (const test of preferOrder) {
        const match = voices.find(test)
        if (match) {
          console.info(`[guide] selected voice: ${match.name} (${match.lang})`)
          setVoiceState(match)
          return
        }
      }
      setVoiceState(voices[0])
    }

    // Some browsers populate voices synchronously, others fire voiceschanged.
    pickVoice()
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', pickVoice)
      window.speechSynthesis.cancel()
    }
  }, [])

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current !== null) {
      window.clearInterval(keepAliveRef.current)
      keepAliveRef.current = null
    }
  }, [])

  const doSpeak = useCallback(
    (text: string, opts?: { rate?: number; pitch?: number; onEnd?: () => void }, voiceArg?: SpeechSynthesisVoice | null) => {
      const u = new SpeechSynthesisUtterance(text)
      const v = voiceArg ?? voice
      if (v) u.voice = v
      u.rate = opts?.rate ?? 0.95
      u.pitch = opts?.pitch ?? 1.05
      u.volume = 1
      u.onstart = () => {
        console.info('[guide] utterance started')
        setState('speaking')
      }
      u.onpause = () => setState('paused')
      u.onresume = () => setState('speaking')
      u.onend = () => {
        console.info('[guide] utterance ended')
        setState('idle')
        stopKeepAlive()
        opts?.onEnd?.()
      }
      u.onerror = (e) => {
        console.warn('[guide] speechSynthesis error:', (e as SpeechSynthesisErrorEvent).error || e)
        setState('idle')
        stopKeepAlive()
      }
      utterRef.current = u
      window.speechSynthesis.speak(u)

      // Chrome auto-pauses speechSynthesis after ~15s. Tickle pause/resume
      // every 5s to keep it talking through long utterances.
      keepAliveRef.current = window.setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause()
          window.speechSynthesis.resume()
        }
      }, 5000)
    },
    [voice, stopKeepAlive]
  )

  const speak = useCallback(
    (text: string, opts?: { rate?: number; pitch?: number; onEnd?: () => void }) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('[guide] speechSynthesis not available in this browser')
        return
      }
      const synth = window.speechSynthesis

      // If something is already speaking/queued, cancel first. Some browsers
      // (notably Safari + older Chrome) drop a new speak() if it's called
      // in the same microtask as cancel(); defer the new utterance one tick.
      const wasBusy = synth.speaking || synth.pending
      if (wasBusy) synth.cancel()
      stopKeepAlive()

      // If voices haven't been enumerated yet, give them one tick to load.
      if (!voiceReadyRef.current) {
        console.info('[guide] voices not loaded yet, waiting briefly...')
        setTimeout(() => doSpeak(text, opts), 120)
        return
      }

      if (wasBusy) {
        setTimeout(() => doSpeak(text, opts), 80)
      } else {
        doSpeak(text, opts)
      }
    },
    [doSpeak, stopKeepAlive]
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
