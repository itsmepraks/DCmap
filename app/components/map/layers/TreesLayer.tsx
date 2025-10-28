'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '@/app/lib/MapContext'
import mapboxgl from 'mapbox-gl'

interface TreesLayerProps {
  visible: boolean
  season?: 'spring' | 'summer' | 'fall' | 'winter'
}

/**
 * TreesLayer - Displays D.C.'s tree canopy with seasonal variations
 * 
 * Features:
 * - Clustering for performance (clusterMaxZoom: 14, clusterRadius: 50)
 * - Seasonal icon changes (spring/summer/fall/winter)
 * - Individual tree popups with species info
 * - Smooth transitions between seasons
 */
export default function TreesLayer({ visible, season = 'summer' }: TreesLayerProps) {
  const { map } = useMap()
  const isInitialized = useRef(false)

  // Initialize layer on mount
  useEffect(() => {
    if (!map || isInitialized.current) return

    const initializeLayer = async () => {
      try {
        // Wait for map style to be loaded
        if (!map.isStyleLoaded()) {
          console.log('🌳 Waiting for map style to load...')
          map.once('idle', () => initializeLayer())
          return
        }

        console.log('🌳 Initializing TreesLayer...')

        // Create colored tree icons for each season
        const seasonalTreeColors = {
          spring: { leaf: '#FFB7CE', trunk: '#8B4513', name: 'Pink Blossoms' },  // PINK!
          summer: { leaf: '#4CAF50', trunk: '#8B4513', name: 'Green Leaves' },   // GREEN!
          fall: { leaf: '#FF6B35', trunk: '#8B4513', name: 'Orange Leaves' },    // ORANGE!
          winter: { leaf: '#B0BEC5', trunk: '#5D4037', name: 'Bare Branches' }   // GRAY!
        }

        // Create canvas-based tree icons with obvious colors
        Object.entries(seasonalTreeColors).forEach(([seasonName, colors]) => {
          const canvas = document.createElement('canvas')
          canvas.width = 50
          canvas.height = 50
          const ctx = canvas.getContext('2d')!

          // Draw brown trunk
          ctx.fillStyle = colors.trunk
          ctx.fillRect(22, 32, 6, 12)

          // Draw colored canopy (3 circles for tree shape)
          ctx.fillStyle = colors.leaf
          
          ctx.beginPath()
          ctx.arc(16, 22, 10, 0, Math.PI * 2)
          ctx.fill()
          
          ctx.beginPath()
          ctx.arc(25, 17, 11, 0, Math.PI * 2)
          ctx.fill()
          
          ctx.beginPath()
          ctx.arc(34, 22, 10, 0, Math.PI * 2)
          ctx.fill()

          // White outline for visibility
          ctx.strokeStyle = '#FFF'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(16, 22, 10, 0, Math.PI * 2)
          ctx.arc(25, 17, 11, 0, Math.PI * 2)
          ctx.arc(34, 22, 10, 0, Math.PI * 2)
          ctx.stroke()

          // Convert canvas to ImageData for Mapbox
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          
          // Add to map
          if (!map.hasImage(`tree-${seasonName}`)) {
            map.addImage(`tree-${seasonName}`, {
              width: canvas.width,
              height: canvas.height,
              data: imageData.data
            })
            console.log(`✅ Created ${seasonName} tree icon (${colors.name})`)
          }
        })

        // Load tree data
        console.log('Loading tree data from /data/dc_trees.geojson')
        const response = await fetch('/data/dc_trees.geojson')
        
        if (!response.ok) {
          console.error('Failed to load tree data:', response.status)
          return
        }
        
        const data = await response.json()
        console.log('Tree data loaded:', data.features?.length, 'trees')

        // Add source with clustering
        if (!map.getSource('trees-source')) {
          map.addSource('trees-source', {
            type: 'geojson',
            data: data,
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50   // Radius of each cluster when clustering points
          })
          console.log('✅ Added trees-source')
        }

        // Add cluster circle layer with seasonal color (will update based on season)
        if (!map.getLayer('trees-clusters')) {
          map.addLayer({
            id: 'trees-clusters',
            type: 'circle',
            source: 'trees-source',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#4CAF50',  // Default green, will change by season
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                15,   // Small clusters
                10,
                20,   // Medium clusters
                25,
                25    // Large clusters
              ],
              'circle-opacity': 0.8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#FFF'
            }
          })
          console.log('✅ Added trees-clusters layer')
        }

        // Add cluster count layer
        if (!map.getLayer('trees-cluster-count')) {
          map.addLayer({
            id: 'trees-cluster-count',
            type: 'symbol',
            source: 'trees-source',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            },
            paint: {
              'text-color': '#ffffff'
            }
          })
          console.log('✅ Added trees-cluster-count layer')
        }

        // Add unclustered tree points layer
        if (!map.getLayer('trees-unclustered')) {
          map.addLayer({
            id: 'trees-unclustered',
            type: 'symbol',
            source: 'trees-source',
            filter: ['!', ['has', 'point_count']],
            layout: {
              'icon-image': `tree-${season}`,
              'icon-size': 0.8,
              'icon-allow-overlap': false
            }
          })
          console.log(`✅ Added trees-unclustered layer with season: ${season}`)
        }

        // Set initial visibility
        const visibility = visible ? 'visible' : 'none'
        map.setLayoutProperty('trees-clusters', 'visibility', visibility)
        map.setLayoutProperty('trees-cluster-count', 'visibility', visibility)
        map.setLayoutProperty('trees-unclustered', 'visibility', visibility)

        // Click handler for clusters - zoom in
        map.on('click', 'trees-clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['trees-clusters']
          })
          
          if (features.length > 0) {
            const clusterId = features[0].properties?.cluster_id
            const source = map.getSource('trees-source') as mapboxgl.GeoJSONSource
            
            source.getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return
              
              const coordinates = (features[0].geometry as any).coordinates
              map.easeTo({
                center: coordinates,
                zoom: zoom || 15
              })
            })
          }
        })

        // Click handler for individual trees - show popup
        map.on('click', 'trees-unclustered', (e) => {
          if (!e.features || e.features.length === 0) return

          const feature = e.features[0]
          const coordinates = (feature.geometry as any).coordinates.slice()
          const props = feature.properties

          // Create popup content with bold styling
          const popupContent = `
            <div class="popup-wrapper" style="padding: 0; margin: -15px; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #7ED957 0%, #66BB6A 100%); padding: 16px; border-bottom: 3px solid #4A7C24;">
                <h3 style="margin: 0; color: white; font-size: 18px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                  🌳 ${props?.COMMON_NAME || 'Unknown Tree'}
                </h3>
              </div>
              <div style="padding: 16px; background: white;">
                <div style="margin-bottom: 12px;">
                  <span style="color: #8D7B68; font-size: 12px; font-weight: 600; text-transform: uppercase;">Species</span>
                  <p style="margin: 4px 0 0 0; color: #2C1810; font-size: 14px; font-weight: 500;">${props?.SPECIES || 'N/A'}</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div>
                    <span style="color: #8D7B68; font-size: 12px; font-weight: 600;">DBH</span>
                    <p style="margin: 4px 0 0 0; color: #2C1810; font-size: 14px;">${props?.DBH || 'N/A'}"</p>
                  </div>
                  <div>
                    <span style="color: #8D7B68; font-size: 12px; font-weight: 600;">Condition</span>
                    <p style="margin: 4px 0 0 0; color: #2C1810; font-size: 14px;">${props?.CONDITION || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          `

          // Ensure popup appears over the correct location on the map
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
          }

          new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true,
            maxWidth: '340px',
            className: 'custom-popup'
          })
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map)
        })

        // Change cursor on hover
        map.on('mouseenter', 'trees-clusters', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'trees-clusters', () => {
          map.getCanvas().style.cursor = ''
        })
        map.on('mouseenter', 'trees-unclustered', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'trees-unclustered', () => {
          map.getCanvas().style.cursor = ''
        })

        isInitialized.current = true
        console.log('✅ TreesLayer initialized successfully')
      } catch (error) {
        console.error('❌ Error initializing TreesLayer:', error)
      }
    }

    initializeLayer()

    // Cleanup on unmount
    return () => {
      if (map && isInitialized.current) {
        if (map.getLayer('trees-unclustered')) map.removeLayer('trees-unclustered')
        if (map.getLayer('trees-cluster-count')) map.removeLayer('trees-cluster-count')
        if (map.getLayer('trees-clusters')) map.removeLayer('trees-clusters')
        if (map.getSource('trees-source')) map.removeSource('trees-source')
        
        // Remove event listeners
        map.off('click', 'trees-clusters')
        map.off('click', 'trees-unclustered')
        map.off('mouseenter', 'trees-clusters')
        map.off('mouseleave', 'trees-clusters')
        map.off('mouseenter', 'trees-unclustered')
        map.off('mouseleave', 'trees-unclustered')
      }
    }
  }, [map])

  // Handle visibility changes
  useEffect(() => {
    if (!map || !isInitialized.current) return

    const visibility = visible ? 'visible' : 'none'
    
    if (map.getLayer('trees-clusters')) {
      map.setLayoutProperty('trees-clusters', 'visibility', visibility)
    }
    if (map.getLayer('trees-cluster-count')) {
      map.setLayoutProperty('trees-cluster-count', 'visibility', visibility)
    }
    if (map.getLayer('trees-unclustered')) {
      map.setLayoutProperty('trees-unclustered', 'visibility', visibility)
    }

    console.log(`🌳 TreesLayer visibility: ${visibility}`)
  }, [map, visible])

  // Handle season changes - update both icons AND cluster colors
  useEffect(() => {
    if (!map || !isInitialized.current) {
      console.log(`🍂 Season change skipped: map=${!!map}, initialized=${isInitialized.current}`)
      return
    }

    // Wait for map to be fully loaded
    if (!map.isStyleLoaded()) {
      console.log('🍂 Waiting for map style before season change...')
      map.once('idle', () => {
        updateSeasonalAppearance()
      })
      return
    }

    updateSeasonalAppearance()

    function updateSeasonalAppearance() {
      // Color mapping for seasons
      const seasonColors = {
        spring: '#FFB7CE',  // PINK
        summer: '#4CAF50',  // GREEN
        fall: '#FF6B35',    // ORANGE
        winter: '#B0BEC5'   // GRAY
      }

      // Update tree icons
      if (map!.getLayer('trees-unclustered')) {
        const iconName = `tree-${season}`
        console.log(`🍂 Changing season to: ${season}, using icon: ${iconName}`)
        
        if (map!.hasImage(iconName)) {
          map!.setLayoutProperty('trees-unclustered', 'icon-image', iconName)
          console.log(`✅ Tree icons changed to: ${season}`)
        } else {
          console.error(`❌ Icon not found: ${iconName}`)
        }
      } else {
        console.warn('⚠️ trees-unclustered layer not found')
      }

      // Update cluster colors to match season
      if (map!.getLayer('trees-clusters')) {
        map!.setPaintProperty('trees-clusters', 'circle-color', seasonColors[season])
        console.log(`✅ Cluster color changed to: ${seasonColors[season]} (${season})`)
      } else {
        console.warn('⚠️ trees-clusters layer not found')
      }
    }
  }, [map, season])

  return null
}

