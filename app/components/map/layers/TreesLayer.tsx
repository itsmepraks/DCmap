'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'
import mapboxgl from 'mapbox-gl'
import type { SelectedEntity } from '@/app/components/ui/EntityInfoPanel'

interface TreesLayerProps {
  visible: boolean
  season?: 'spring' | 'summer' | 'fall' | 'winter'
  onSelect?: (entity: SelectedEntity | null) => void
}

const TREE_POINT_SOURCE_ID = 'dmv-tree-points'
const TREE_POINT_LAYER_ID = 'dmv-tree-points-layer'
const TREE_CLUSTER_LAYER_ID = 'dmv-tree-clusters'
const TREE_CLUSTER_COUNT_LAYER_ID = 'dmv-tree-cluster-count'

/**
 * TreesLayer - Mixes DMV landcover shading with real tree/park data
 *
 * - Uses Mapbox landcover for broad canopy shading
 * - Loads public/data/dmv_trees.geojson for real tree clusters
 * - Seasonal palettes recolor both canopy + icons
 */
export default function TreesLayer({ visible, season = 'summer', onSelect }: TreesLayerProps) {
  const { map } = useMap()
  const isInitialized = useRef(false)
  
  // Track selected tree/cluster
  const selectedIdRef = useRef<string | number | null>(null)

  const treeFilter = useMemo(() => {
    return ['in', ['get', 'class'], 'forest', 'wood', 'scrub', 'grass', 'crop']
  }, [])

  const seasonColors = useMemo(
    () => ({
      spring: { base: '#FFB7C5', shadow: '#E08DA0', highlight: '#FFDEEB' }, // Cherry blossom pinks
      summer: { base: '#4F8A4F', shadow: '#2F4F2F', highlight: '#7BC47B' },
      fall: { base: '#E28D3D', shadow: '#8C4B10', highlight: '#FFC27D' },
      winter: { base: '#CBD3DD', shadow: '#687078', highlight: '#E2E8F0' }
    }),
    []
  )

  const createSeasonIcons = () => {
    if (!map) return
    Object.entries(seasonColors).forEach(([seasonName, palette]) => {
      const iconId = `tree-icon-${seasonName}`
      if (map.hasImage(iconId)) return

      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // trunk
      const trunkGradient = ctx.createLinearGradient(30, 40, 34, 60)
      trunkGradient.addColorStop(0, '#8B5A2B')
      trunkGradient.addColorStop(1, '#4A2F17')
      ctx.fillStyle = trunkGradient
      ctx.fillRect(29, 40, 6, 18)

      // canopy layers
      const drawCanopy = (radius: number, offsetX: number, offsetY: number, color: string, alpha = 1) => {
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.globalAlpha = alpha
        ctx.arc(32 + offsetX, 32 + offsetY, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      drawCanopy(16, -8, 0, palette.shadow, 0.95)
      drawCanopy(18, 0, -6, palette.base, 0.95)
      drawCanopy(16, 8, 0, palette.shadow, 0.95)
      drawCanopy(10, 0, -10, palette.highlight, 0.9)

      // outline
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(32, 30, 20, 0, Math.PI * 2)
      ctx.stroke()

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      map.addImage(iconId, {
        width: canvas.width,
        height: canvas.height,
        data: imageData.data
      })
    })
  }

  useEffect(() => {
    if (!map || isInitialized.current) return

    const initializeLayer = async () => {
      if (!map) return
      
      // If style isn't loaded, wait for it
      if (!map.isStyleLoaded()) {
        console.log('🌲 Style not loaded yet, waiting for style.load...')
        map.once('style.load', initializeLayer)
        return
      }

      try {
        console.log('🌲 Initializing DMV-wide tree canopy + dataset...')
        createSeasonIcons()

        const layers = map.getStyle().layers ?? []
        // Find building layer to place trees BEFORE buildings (for proper occlusion)
        // Buildings should render on top of trees to occlude them
        const buildingLayerId = layers.find((layer) => 
          layer.id === 'realistic-buildings' || 
          (layer.type === 'fill-extrusion' && layer['source-layer'] === 'building')
        )?.id
        
        // If building layer exists, place trees BEFORE it
        // Otherwise, find first symbol layer (which comes after most base layers)
        const firstSymbolId = layers.find((layer) => layer.type === 'symbol')?.id
        const beforeId = buildingLayerId || firstSymbolId
        
        const addLayer = (layer: mapboxgl.AnyLayer) => {
          if (!map.getLayer(layer.id)) {
            // Place trees BEFORE buildings so buildings render on top and occlude trees
            map.addLayer(layer, beforeId)
          }
        }

        const colors = seasonColors[season]

        addLayer({
          id: 'dmv-tree-canopy-base',
          type: 'fill',
          source: 'composite',
          'source-layer': 'landcover',
          filter: ['in', ['get', 'class'], ['literal', ['forest', 'wood', 'scrub', 'grass', 'crop']]],
          paint: {
            'fill-color': colors.base,
            'fill-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8, 0.4,
              12, 0.6,
              16, 0.75
            ]
          }
        })

        addLayer({
          id: 'dmv-tree-canopy-volume',
          type: 'fill-extrusion',
          source: 'composite',
          'source-layer': 'landcover',
          filter: ['in', ['get', 'class'], ['literal', ['forest', 'wood', 'scrub', 'grass', 'crop']]],
          minzoom: 10,
          paint: {
            'fill-extrusion-color': colors.highlight,
            'fill-extrusion-base': 0,
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 1.5,
              13, 5,
              15, 10
            ],
            'fill-extrusion-opacity': 0.85,
            'fill-extrusion-vertical-gradient': true,
            'fill-extrusion-ambient-occlusion-intensity': 0.6
          }
        })

        addLayer({
          id: 'dmv-tree-canopy-shadow',
          type: 'line',
          source: 'composite',
          'source-layer': 'landcover',
          filter: ['in', ['get', 'class'], ['literal', ['forest', 'wood', 'scrub', 'grass', 'crop']]],
          paint: {
            'line-color': colors.shadow,
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              9, 0.25,
              13, 0.7,
              16, 1.2
            ],
            'line-opacity': 0.5
          }
        })

        const treeResponse = await fetch('/data/dmv_trees.geojson')
        if (!treeResponse.ok) {
          throw new Error('Failed to load DMV tree data')
        }
        const treeData = await treeResponse.json()

        if (!map.getSource(TREE_POINT_SOURCE_ID)) {
          map.addSource(TREE_POINT_SOURCE_ID, {
            type: 'geojson',
            data: treeData,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
            generateId: true // Needed for feature-state
          })
        }

        if (!map.getLayer(TREE_CLUSTER_LAYER_ID)) {
          map.addLayer({
            id: TREE_CLUSTER_LAYER_ID,
            type: 'circle',
            source: TREE_POINT_SOURCE_ID,
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': colors.highlight,
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                12,
                25, 18,
                75, 26
              ],
              'circle-opacity': 0.85,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
          })
        }

        if (!map.getLayer(TREE_CLUSTER_COUNT_LAYER_ID)) {
          map.addLayer({
            id: TREE_CLUSTER_COUNT_LAYER_ID,
            type: 'symbol',
            source: TREE_POINT_SOURCE_ID,
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            },
            paint: {
              'text-color': '#1f2933',
              'text-halo-color': '#ffffff',
              'text-halo-width': 1.5
            }
          })
        }

        if (!map.getLayer(TREE_POINT_LAYER_ID)) {
          map.addLayer({
            id: TREE_POINT_LAYER_ID,
            type: 'symbol',
            source: TREE_POINT_SOURCE_ID,
            filter: ['!', ['has', 'point_count']],
            layout: {
              'icon-image': `tree-icon-${season}`,
              'icon-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 0.7,
                14, 1.1,
                18, 1.8
              ],
              'icon-allow-overlap': true,
              'icon-pitch-alignment': 'viewport',
              'icon-rotation-alignment': 'viewport'
            },
            paint: {
              'icon-opacity': 0.95,
              'icon-halo-color': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                '#FFD700', // Gold glow
                '#ffffff'
              ],
              'icon-halo-width': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                4,
                2
              ],
              'icon-halo-blur': 1
            }
          })
        }

        // Add interaction handlers
        const handleTreeClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
          if (!e.features || e.features.length === 0) return
          
          const feature = e.features[0]
          const properties = feature.properties
          if (!properties) return

          e.originalEvent.stopPropagation()

          // Handle visual selection state
          if (selectedIdRef.current !== null) {
            map.setFeatureState(
              { source: TREE_POINT_SOURCE_ID, id: selectedIdRef.current },
              { selected: false }
            )
          }

          if (feature.id !== undefined) {
            selectedIdRef.current = feature.id
            map.setFeatureState(
              { source: TREE_POINT_SOURCE_ID, id: feature.id },
              { selected: true }
            )
          }

          const coordinates = (feature.geometry as any).coordinates.slice()

          if (onSelect) {
            onSelect({
              id: String(feature.id || Math.random()),
              type: 'tree',
              name: properties.COMMON_NAME || 'Unknown Tree',
              description: `A ${properties.CONDITION || 'healthy'} ${properties.SPECIES || 'tree'} in Washington DC.`,
              coordinates: coordinates,
              metadata: {
                species: properties.SPECIES,
                diameter: properties.DBH ? `${properties.DBH} inches` : 'Unknown',
                condition: properties.CONDITION
              }
            })
          }
        }

        // Cluster click -> zoom
        const handleClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
          if (!e.features || e.features.length === 0) return
          const feature = e.features[0]
          const clusterId = feature.properties?.cluster_id
          
          const source = map.getSource(TREE_POINT_SOURCE_ID) as mapboxgl.GeoJSONSource
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || zoom == null) return
            
            map.easeTo({
              center: (feature.geometry as any).coordinates,
              zoom: zoom,
              duration: 1000
            })
          })
        }

        // Interaction events
        map.on('click', TREE_POINT_LAYER_ID, handleTreeClick)
        map.on('click', TREE_CLUSTER_LAYER_ID, handleClusterClick)
        
        map.on('mouseenter', TREE_POINT_LAYER_ID, () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', TREE_POINT_LAYER_ID, () => { map.getCanvas().style.cursor = '' })
        
        map.on('mouseenter', TREE_CLUSTER_LAYER_ID, () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', TREE_CLUSTER_LAYER_ID, () => { map.getCanvas().style.cursor = '' })

        // Handle deselection on map click
        map.on('click', (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: [TREE_POINT_LAYER_ID, TREE_CLUSTER_LAYER_ID]
          })
          
          if (features.length === 0 && selectedIdRef.current !== null) {
            map.setFeatureState(
              { source: TREE_POINT_SOURCE_ID, id: selectedIdRef.current },
              { selected: false }
            )
            selectedIdRef.current = null
          }
        })

        isInitialized.current = true
        console.log('✅ DMV tree layers ready')
      } catch (error) {
        console.error('❌ Failed to initialize TreesLayer:', error)
      }
    }

    initializeLayer()
  }, [map, season, seasonColors, treeFilter])

  useEffect(() => {
    if (!map || !isInitialized.current) return
    const visibility = visible ? 'visible' : 'none'
    ;[
      'dmv-tree-canopy-base',
      'dmv-tree-canopy-volume',
      'dmv-tree-canopy-shadow',
      TREE_CLUSTER_LAYER_ID,
      TREE_CLUSTER_COUNT_LAYER_ID,
      TREE_POINT_LAYER_ID
    ].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visibility)
      }
    })
  }, [map, visible])

  useEffect(() => {
    if (!map || !isInitialized.current) return
    createSeasonIcons()

    const colors = seasonColors[season]
    if (map.getLayer('dmv-tree-canopy-base')) {
      map.setPaintProperty('dmv-tree-canopy-base', 'fill-color', colors.base)
    }
    if (map.getLayer('dmv-tree-canopy-volume')) {
      map.setPaintProperty('dmv-tree-canopy-volume', 'fill-extrusion-color', colors.highlight)
    }
    if (map.getLayer('dmv-tree-canopy-shadow')) {
      map.setPaintProperty('dmv-tree-canopy-shadow', 'line-color', colors.shadow)
    }
    if (map.getLayer(TREE_CLUSTER_LAYER_ID)) {
      map.setPaintProperty(TREE_CLUSTER_LAYER_ID, 'circle-color', colors.highlight)
    }
    if (map.getLayer(TREE_POINT_LAYER_ID)) {
      map.setLayoutProperty(TREE_POINT_LAYER_ID, 'icon-image', `tree-icon-${season}`)
    }
    console.log(`🍂 TreesLayer season updated to: ${season}`)
  }, [map, season, seasonColors])

  return null
}
