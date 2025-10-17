'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { MapContextValue } from '@/app/types/map'

const MapContext = createContext<MapContextValue | undefined>(undefined)

export function MapProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<MapContextValue['map']>(null)

  return (
    <MapContext.Provider value={{ map, setMap }}>
      {children}
    </MapContext.Provider>
  )
}

export function useMap() {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider')
  }
  return context
}

