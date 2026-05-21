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

function applyPreset(map: mapboxgl.Map | null, preset: LightPreset) {
  if (!map) return
  try {
    map.setConfigProperty('basemap', 'lightPreset', preset)
  } catch {
    // Standard / config-aware styles only.
  }
  // NOTE: we deliberately do not call map.setFog here. Standard manages its
  // own atmosphere bound to lightPreset; overriding it conflicts with the
  // 3D model loader and produces "t.json.meshes is not iterable".
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
