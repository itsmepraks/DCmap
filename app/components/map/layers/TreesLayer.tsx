'use client'

import { useEffect, useMemo, useRef, useCallback } from 'react'
import { useMap } from '@/app/lib/MapContext'
import mapboxgl from 'mapbox-gl'
import type { SelectedEntity } from '@/app/components/ui/EntityInfoPanel'
import { calculateDistance } from '@/app/lib/proximity'

interface TreesLayerProps {
  visible: boolean
  season?: 'spring' | 'summer' | 'fall' | 'winter'
  onSelect?: (entity: SelectedEntity | null) => void
  onTreeDiscovered?: (treeId: string, treeData: any) => void
}

const TREE_POINT_SOURCE_ID = 'dmv-tree-points'
const TREE_POINT_LAYER_ID = 'dmv-tree-points-layer'
const TREE_CLUSTER_LAYER_ID = 'dmv-tree-clusters'
const TREE_CLUSTER_COUNT_LAYER_ID = 'dmv-tree-cluster-count'

const TREE_AURA_LAYER_ID = 'dmv-tree-points-aura'

// All layer IDs for this component
const ALL_TREE_LAYERS = [
  TREE_CLUSTER_LAYER_ID,
  TREE_CLUSTER_COUNT_LAYER_ID,
  TREE_AURA_LAYER_ID,
  TREE_POINT_LAYER_ID,
]

const AURA_COLOR: Record<'spring' | 'summer' | 'fall' | 'winter', string> = {
  spring: '#E8B7C4',
  summer: '#A7D29B',
  fall: '#B46D39',
  winter: '#D7E2E8',
}

/**
 * TreesLayer - Mixes DMV landcover shading with real tree/park data
 *
 * - Uses Mapbox landcover for broad canopy shading
 * - Loads public/data/dmv_trees.geojson for real tree clusters
 * - Seasonal palettes recolor both canopy + icons
 */
export default function TreesLayer({ visible, season = 'summer', onSelect, onTreeDiscovered }: TreesLayerProps) {
  const { map } = useMap()
  const isInitialized = useRef(false)
  const onTreeDiscoveredRef = useRef(onTreeDiscovered)

  useEffect(() => {
    onTreeDiscoveredRef.current = onTreeDiscovered
  }, [onTreeDiscovered])

  // Store visible prop in ref so it's accessible during initialization
  const visibleRef = useRef(visible)
  useEffect(() => {
    visibleRef.current = visible
  }, [visible])

  // Track selected tree/cluster
  const selectedIdRef = useRef<string | number | null>(null)

  // Store onSelect in a ref so click handlers always use the latest callback
  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  const treeFilter = useMemo(() => {
    return ['in', ['get', 'class'], 'forest', 'wood', 'scrub', 'grass', 'crop']
  }, [])

  const seasonColors = useMemo(
    () => ({
      spring: { base: '#FFB7C5', shadow: '#E08DA0', highlight: '#FFDEEB' }, // Cherry blossom PINK for spring
      summer: { base: '#2D5A27', shadow: '#1A3317', highlight: '#4E8F44' }, // Deep realistic summer green
      fall: { base: '#D67229', shadow: '#8B4513', highlight: '#FF8C00' }, // Rich fall orange
      winter: { base: '#708090', shadow: '#4A5560', highlight: '#A9B7C6' } // Slate grey winter
    }),
    []
  )

  const createSeasonIcons = useCallback(() => {
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
  }, [map, seasonColors])

  useEffect(() => {
    if (!map || isInitialized.current) return

    const initializeLayer = async () => {
      if (!map) return

      // If style isn't loaded, wait for it
      if (!map.isStyleLoaded()) {
        console.log('🌲 Style not loaded yet, waiting for map idle...')
        map.once('idle', initializeLayer)
        return
      }

      try {
        console.log('🌲 Initializing DMV-wide tree canopy + dataset...')
        createSeasonIcons()

        const layers = map.getStyle().layers ?? []
        // Find building layer to place trees BEFORE buildings (for proper occlusion)
        const buildingLayerId = layers.find((layer) =>
          layer.id === 'realistic-buildings' ||
          (layer.type === 'fill-extrusion' && layer['source-layer'] === 'building')
        )?.id

        const firstSymbolId = layers.find((layer) => layer.type === 'symbol')?.id
        const beforeId = buildingLayerId || firstSymbolId

        // Get initial visibility - HIDDEN by default unless explicitly visible
        const initialVisibility = visibleRef.current ? 'visible' : 'none'

        const addLayer = (layer: mapboxgl.AnyLayer) => {
          if (!map.getLayer(layer.id)) {
            map.addLayer(layer, beforeId)
            // Immediately set visibility after adding
            map.setLayoutProperty(layer.id, 'visibility', initialVisibility)
          }
        }

        // NOTE: We intentionally do NOT paint custom canopy fills over
        // Standard's landcover. Standard already renders 3D tree models in
        // green; recoloring landcover polygons doesn't affect those models
        // (you'd see green trees on orange ground in fall — worse than no
        // seasonal change at all). Seasonal feel is driven by the
        // SeasonalGrade + SeasonalParticles overlays, which tint the whole
        // composited scene including Standard's trees.

        // Load DC tree data
        const treeResponse = await fetch('/data/dc_trees.geojson')
        if (!treeResponse.ok) {
          throw new Error('Failed to load DC tree data')
        }
        const treeData = await treeResponse.json()
        console.log(`🌲 Loaded ${treeData.features?.length || 0} trees from dc_trees.geojson`)

        if (!map.getSource(TREE_POINT_SOURCE_ID)) {
          map.addSource(TREE_POINT_SOURCE_ID, {
            type: 'geojson',
            data: treeData,
            cluster: true,
            clusterMaxZoom: 13,
            clusterRadius: 40,
            generateId: true
          })
        }

        if (!map.getLayer(TREE_CLUSTER_LAYER_ID)) {
          map.addLayer({
            id: TREE_CLUSTER_LAYER_ID,
            type: 'circle',
            source: TREE_POINT_SOURCE_ID,
            filter: ['has', 'point_count'],
            layout: { visibility: initialVisibility },
            paint: {
              // Neutral muted green so clusters read as "trees", not as a
              // seasonal call-out fighting Standard's permanently-green tree
              // models.
              'circle-color': '#3d6b3a',
              'circle-radius': [
                'step', ['get', 'point_count'],
                10,
                25, 14,
                75, 20,
              ],
              'circle-opacity': 0.55,
              'circle-stroke-width': 1.5,
              'circle-stroke-color': 'rgba(255,255,255,0.75)',
            }
          })
        }

        // Only add cluster count text layer if style has glyphs defined
        const styleHasGlyphs = Boolean(map.getStyle()?.glyphs)
        if (!map.getLayer(TREE_CLUSTER_COUNT_LAYER_ID) && styleHasGlyphs) {
          map.addLayer({
            id: TREE_CLUSTER_COUNT_LAYER_ID,
            type: 'symbol',
            source: TREE_POINT_SOURCE_ID,
            filter: ['has', 'point_count'],
            layout: {
              'visibility': initialVisibility,
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

        // Two-circle composition: a season-coloured aura sits underneath a
        // small neutral-green core. The core reads as "tree", the aura reads
        // as "season", and neither competes with Standard's 3D tree models.
        if (!map.getLayer(TREE_AURA_LAYER_ID)) {
          map.addLayer({
            id: TREE_AURA_LAYER_ID,
            type: 'circle',
            source: TREE_POINT_SOURCE_ID,
            filter: ['!', ['has', 'point_count']],
            layout: { visibility: initialVisibility },
            paint: {
              'circle-color': AURA_COLOR[season],
              'circle-blur': 0.8,
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                12, 2.5,
                15, 5,
                17, 7,
                19, 10,
              ],
              'circle-opacity': [
                'interpolate', ['linear'], ['zoom'],
                12, 0.18,
                15, 0.32,
                17, 0.42,
              ],
            },
          })
        }
        if (!map.getLayer(TREE_POINT_LAYER_ID)) {
          map.addLayer({
            id: TREE_POINT_LAYER_ID,
            type: 'circle',
            source: TREE_POINT_SOURCE_ID,
            filter: ['!', ['has', 'point_count']],
            layout: { visibility: initialVisibility },
            paint: {
              'circle-color': '#2F5E2A',
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                12, 1.8,
                15, 3,
                18, 4.5,
              ],
              'circle-opacity': 0.95,
              'circle-stroke-width': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                3,
                1.2,
              ],
              'circle-stroke-color': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                '#FFD700',
                'rgba(255,255,255,0.85)',
              ],
            },
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

          // Trigger discovery on click
          if (onTreeDiscoveredRef.current) {
            onTreeDiscoveredRef.current(String(feature.id || Math.random()), properties)
          }

          if (onSelectRef.current) {
            onSelectRef.current({
              id: String(feature.id || Math.random()),
              type: 'tree',
              name: properties.COMMON_NAME || 'Unknown Tree',
              description: `A real DC street-tree inventory point. ${properties.CONDITION || 'Recorded'} condition, ${properties.SPECIES || 'species not listed'}${properties.DBH ? `, ${properties.DBH} inch trunk diameter` : ''}. Seasonal color is shown as a subtle local cue; the 3D tree models stay close to Mapbox's real basemap instead of turning every tree one fake color.`,
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

        // Hover popup — surfaces the DMV inventory data without requiring a
        // click, so the affordance is discoverable.
        const hoverPopup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 8,
          className: 'tree-hover-popup',
        })
        map.on('mouseenter', TREE_POINT_LAYER_ID, (e) => {
          map.getCanvas().style.cursor = 'pointer'
          const f = e.features?.[0]
          if (!f) return
          const props = f.properties || {}
          const name = props.COMMON_NAME || props.SPECIES || 'Tree'
          const dbh = props.DBH ? `${props.DBH}"` : '–'
          const condition = props.CONDITION || '–'
          hoverPopup
            .setLngLat((f.geometry as any).coordinates)
            .setHTML(
              `<div style="font: 600 12px ui-sans-serif; color:#1a2238; padding:6px 8px;">
                ${name}
                <div style="font-weight:400; color:#5a6878; margin-top:2px;">
                  ${condition} · ${dbh} dia. · click for more
                </div>
              </div>`
            )
            .addTo(map)
        })
        map.on('mouseleave', TREE_POINT_LAYER_ID, () => {
          map.getCanvas().style.cursor = ''
          hoverPopup.remove()
        })

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
        console.log(`✅ DMV tree layers ready (visibility: ${initialVisibility})`)
      } catch (error) {
        console.error('❌ Failed to initialize TreesLayer:', error)
      }
    }

    initializeLayer()
  }, [map, season, seasonColors, treeFilter, createSeasonIcons])

  // Handle visibility changes
  useEffect(() => {
    if (!map || !isInitialized.current) return
    const visibility = visible ? 'visible' : 'none'

    ALL_TREE_LAYERS.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visibility)
      }
    })
  }, [map, visible])

  // Recolor only the aura halo on season change. The neutral-green core
  // stays put so the markers always read as "trees", and the aura provides
  // the seasonal cue at each inventoried location.
  useEffect(() => {
    if (!map || !isInitialized.current) return
    if (map.getLayer(TREE_AURA_LAYER_ID)) {
      map.setPaintProperty(TREE_AURA_LAYER_ID, 'circle-color', AURA_COLOR[season])
    }
  }, [map, season])

  return null
}
