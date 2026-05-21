'use client'

import { useCallback, useEffect, useState } from 'react'
import { useMap } from '@/app/lib/MapContext'

export type LightPreset = 'dawn' | 'day' | 'dusk' | 'night'

export const LIGHT_PRESETS: LightPreset[] = ['dawn', 'day', 'dusk', 'night']

const LABEL: Record<LightPreset, string> = {
  dawn: 'Dawn',
  day: 'Day',
  dusk: 'Dusk',
  night: 'Night',
}

const ICON: Record<LightPreset, string> = {
  dawn: '🌅',
  day: '☀️',
  dusk: '🌇',
  night: '🌙',
}

// Fog tint per preset — matches Standard's sun position so the horizon feels
// like an extension of the sky instead of a flat colour.
const FOG: Record<LightPreset, { color: string; high: string; horizonBlend: number; spaceColor: string }> = {
  dawn: { color: '#ffd9a8', high: '#9ec8ff', horizonBlend: 0.16, spaceColor: '#13243f' },
  day: { color: '#d7e6fb', high: '#9ec8ff', horizonBlend: 0.04, spaceColor: '#0f1d35' },
  dusk: { color: '#f3a76b', high: '#874b9d', horizonBlend: 0.2, spaceColor: '#1a0d2a' },
  night: { color: '#1d2640', high: '#0a1230', horizonBlend: 0.25, spaceColor: '#02020a' },
}

function applyPreset(map: mapboxgl.Map | null, preset: LightPreset) {
  if (!map) return
  try {
    map.setConfigProperty('basemap', 'lightPreset', preset)
  } catch {
    // Standard / config-aware styles only.
  }
  try {
    const fog = FOG[preset]
    map.setFog({
      range: [0.5, 8],
      color: fog.color,
      'high-color': fog.high,
      'horizon-blend': fog.horizonBlend,
      'space-color': fog.spaceColor,
      'star-intensity': preset === 'night' ? 0.5 : preset === 'dusk' ? 0.2 : 0,
    })
  } catch {
    // Some styles may not support setFog.
  }
}

/** Manage time-of-day lighting on the Standard style. */
export function useTimeOfDay(initial: LightPreset = 'dusk') {
  const { map } = useMap()
  const [preset, setPreset] = useState<LightPreset>(initial)

  // Re-apply whenever the style re-loads (e.g. when toggling Satellite).
  useEffect(() => {
    if (!map) return
    applyPreset(map, preset)
    const onStyleLoad = () => applyPreset(map, preset)
    map.on('style.load', onStyleLoad)
    return () => {
      map.off('style.load', onStyleLoad)
    }
  }, [map, preset])

  const cycle = useCallback(() => {
    setPreset((p) => LIGHT_PRESETS[(LIGHT_PRESETS.indexOf(p) + 1) % LIGHT_PRESETS.length])
  }, [])

  return { preset, setPreset, cycle, label: LABEL[preset], icon: ICON[preset] }
}
