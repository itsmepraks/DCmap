'use client'

import { useEffect } from 'react'
import { useMap } from '@/app/lib/MapContext'

interface TreesLayerProps {
  visible: boolean
  season?: 'spring' | 'summer' | 'fall' | 'winter'
}

/**
 * TreesLayer - Phase 2 Feature
 * 
 * This component will display D.C.'s tree canopy data with seasonal variations.
 * Features:
 * - Clustering for performance (cluster: true, clusterMaxZoom: 14, clusterRadius: 50)
 * - Seasonal icon changes based on tree species
 * - Individual tree data on zoom
 * 
 * TODO: Implement in Phase 2
 */
export default function TreesLayer({ visible, season = 'summer' }: TreesLayerProps) {
  const { map } = useMap()

  useEffect(() => {
    if (!map) return
    
    // Phase 2: Load and display tree data with clustering
    console.log('TreesLayer ready for Phase 2 implementation', { visible, season })
  }, [map, visible, season])

  return null
}

