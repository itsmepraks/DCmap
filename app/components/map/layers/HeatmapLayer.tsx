'use client'

import { useEffect } from 'react'
import { useMap } from '@/app/lib/MapContext'

interface HeatmapLayerProps {
  visible: boolean
  month?: number // 1-12
}

/**
 * HeatmapLayer - Phase 2 Feature
 * 
 * This component will display urban heat island data across D.C.
 * Features:
 * - Monthly temperature visualization
 * - Heatmap type layer
 * - Dynamic weight property based on selected month
 * 
 * TODO: Implement in Phase 2
 */
export default function HeatmapLayer({ visible, month = 7 }: HeatmapLayerProps) {
  const { map } = useMap()

  useEffect(() => {
    if (!map) return
    
    // Phase 2: Load and display heat map data
    console.log('HeatmapLayer ready for Phase 2 implementation', { visible, month })
  }, [map, visible, month])

  return null
}

