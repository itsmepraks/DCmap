'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { useMap } from '@/app/lib/MapContext'
import { applyWorldBorder, DC_CENTER, ZOOM_LEVELS } from '@/app/lib/worldBorder'

interface UseMapInitializationOptions {
  styleUrl?: string
}

export function useMapInitialization(
  containerRef: React.RefObject<HTMLDivElement>,
  options: UseMapInitializationOptions = {}
) {
  const { map, setMap } = useMap()
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current || map || !containerRef.current) {
      return
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    console.log('🗺️ Initializing map...')


    if (!token || token.includes('placeholder')) {
      console.error(
        '❌ Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env.local file. ' +
          'Get your token from https://account.mapbox.com/access-tokens/'
      )
      return
    }

    isInitialized.current = true
    mapboxgl.accessToken = token

    let mapInstance: mapboxgl.Map | null = null

    try {
      console.log('🎮 Creating cartoonish/Minecraft-style map')
      
      // Load custom cartoonish style JSON
      const loadCartoonStyle = async () => {
        try {
          // Check container ref is still available
          if (!containerRef.current) {
            console.error('❌ Map container ref is null')
            return
          }
          
          const response = await fetch('/custom-isometric-style.json')
          const cartoonStyle = await response.json()
          
          // Update center and zoom to match our defaults
          cartoonStyle.center = DC_CENTER
          cartoonStyle.zoom = ZOOM_LEVELS.default
          cartoonStyle.pitch = 50
          cartoonStyle.bearing = 0
          
          // Disable telemetry to prevent blocked requests
          mapInstance = new mapboxgl.Map({
            container: containerRef.current,
            style: cartoonStyle, // Use custom cartoon style
            center: DC_CENTER,
            zoom: ZOOM_LEVELS.default,
            pitch: 50,
            bearing: 0,
            antialias: true,
            maxPitch: 85,
            minZoom: ZOOM_LEVELS.min,
            maxZoom: ZOOM_LEVELS.max,
            preserveDrawingBuffer: false,
            refreshExpiredTiles: true,
            fadeDuration: 0, // No fade for instant cartoonish appearance
            crossSourceCollisions: false,
            renderWorldCopies: false,
            pitchWithRotate: true,
            touchZoomRotate: true,
            touchPitch: true,
            trackResize: true,
            attributionControl: true // Required by Mapbox terms
          })
          
          // Ensure cartoonish style is visible immediately
          mapInstance.once('style.load', () => {
            console.log('✅ Cartoonish map style loaded with bright colors!')
            // Force a repaint to ensure style is visible
            mapInstance?.triggerRepaint()
          })
          
          // Continue with rest of initialization
          initializeMapFeatures()
        } catch (error) {
          console.error('Failed to load custom cartoon style, falling back to outdoors-v12:', error)
          // Fallback to outdoors-v12 if custom style fails
          mapInstance = new mapboxgl.Map({
            container: containerRef.current,
            style: options.styleUrl || process.env.NEXT_PUBLIC_MAPBOX_STYLE || 'mapbox://styles/mapbox/outdoors-v12',
            center: DC_CENTER,
            zoom: ZOOM_LEVELS.default,
            pitch: 50,
            bearing: 0,
            antialias: true,
            maxPitch: 85,
            minZoom: ZOOM_LEVELS.min,
            maxZoom: ZOOM_LEVELS.max,
            preserveDrawingBuffer: false,
            refreshExpiredTiles: true,
            fadeDuration: 0,
            crossSourceCollisions: false,
            renderWorldCopies: false,
            pitchWithRotate: true,
            touchZoomRotate: true,
            touchPitch: true,
            trackResize: true,
            attributionControl: true
          })
          initializeMapFeatures()
        }
      }
      
      // Initialize map features (terrain, sky, buildings, etc.)
      const initializeMapFeatures = () => {
        if (!mapInstance) return
        
        // Apply world border after creation
        applyWorldBorder(mapInstance)

        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

      mapInstance.on('load', () => {
        console.log('✅ Map loaded successfully!')

        try {
          if (!mapInstance?.getSource('mapbox-dem')) {
            mapInstance?.addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512,
              maxzoom: 14
            })
          }

          try {
            mapInstance?.setTerrain({
              source: 'mapbox-dem',
              exaggeration: 1.5
            })
          } catch (terrainError) {
            console.warn('Terrain setup skipped:', terrainError)
          }

          if (!mapInstance?.getLayer('sky')) {
            try {
              mapInstance?.addLayer({
                id: 'sky',
                type: 'sky',
                paint: {
                  'sky-type': 'atmosphere',
                  'sky-atmosphere-sun': [0.0, 0.0],
                  'sky-atmosphere-sun-intensity': 15,
                  'sky-atmosphere-color': '#87CEEB',
                  'sky-atmosphere-halo-color': '#FFD700'
                }
              })
              console.log('✅ Added realistic atmospheric sky')
            } catch (skyError) {
              console.warn('Sky layer setup skipped:', skyError)
            }
          }
        } catch (error) {
          console.error('Error setting up terrain/sky:', error)
        }

        const layers = mapInstance?.getStyle().layers
        let firstSymbolId: string | undefined
        for (const layer of layers || []) {
          if (layer.type === 'symbol') {
            firstSymbolId = layer.id
            break
          }
        }

        try {
          if (!mapInstance?.getLayer('realistic-buildings')) {
            try {
              mapInstance?.addLayer(
                {
                  id: 'realistic-buildings',
                  source: 'composite',
                  'source-layer': 'building',
                  filter: ['==', ['get', 'extrude'], 'true'],
                  type: 'fill-extrusion',
                  minzoom: 10,
                  paint: {
                    'fill-extrusion-color': [
                      'case',
                      ['>', ['get', 'height'], 120],
                      '#D9D4C7',
                      ['>', ['get', 'height'], 60],
                      '#E2DBCE',
                      ['>', ['get', 'height'], 35],
                      '#E8E3D7',
                      ['>', ['get', 'height'], 15],
                      '#EFEAE1',
                      '#F7F4ED'
                    ],
                    'fill-extrusion-height': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      10,
                      0,
                      10.05,
                      ['get', 'height']
                    ],
                    'fill-extrusion-base': 0,
                    'fill-extrusion-opacity': 1.0,
                    'fill-extrusion-ambient-occlusion-intensity': 1.0,
                    'fill-extrusion-ambient-occlusion-radius': 15,
                    'fill-extrusion-vertical-gradient': true,
                    'fill-extrusion-vertical-scale': 1.0
                  }
                },
                firstSymbolId
              )

              if (!mapInstance?.getLayer('building-roofs')) {
                mapInstance?.addLayer(
                  {
                    id: 'building-roofs',
                    type: 'fill-extrusion',
                    source: 'composite',
                    'source-layer': 'building',
                    filter: ['==', ['get', 'extrude'], 'true'],
                    minzoom: 10,
                    paint: {
                      'fill-extrusion-color': [
                        'case',
                        ['>', ['get', 'height'], 100],
                        '#0F1A25',
                        ['>', ['get', 'height'], 50],
                        '#1A252F',
                        ['>', ['get', 'height'], 30],
                        '#2C3E50',
                        ['>', ['get', 'height'], 20],
                        '#34495E',
                        ['>', ['get', 'height'], 10],
                        '#5D6D7E',
                        '#7F8C8D'
                      ],
                      'fill-extrusion-height': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        10,
                        0,
                        10.05,
                        ['+', ['get', 'height'], 1.5]
                      ],
                      'fill-extrusion-base': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        10,
                        0,
                        10.05,
                        ['get', 'height']
                      ],
                      'fill-extrusion-opacity': 0.97,
                      'fill-extrusion-ambient-occlusion-intensity': 1.0,
                      'fill-extrusion-vertical-gradient': true
                    }
                  },
                  'realistic-buildings'
                )
              }

              if (!mapInstance?.getLayer('building-outline')) {
                mapInstance?.addLayer(
                  {
                    id: 'building-outline',
                    type: 'line',
                    source: 'composite',
                    'source-layer': 'building',
                    filter: ['==', ['get', 'extrude'], 'true'],
                    minzoom: 10,
                    paint: {
                      'line-color': [
                        'case',
                        ['>', ['get', 'height'], 100],
                        '#333333',
                        ['>', ['get', 'height'], 50],
                        '#444444',
                        ['>', ['get', 'height'], 20],
                        '#555555',
                        '#666666'
                      ],
                      'line-width': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        10,
                        0.4,
                        13,
                        0.9,
                        16,
                        1.4,
                        18,
                        2.2
                      ],
                      'line-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        10,
                        0.6,
                        15,
                        0.85,
                        18,
                        1.0
                      ]
                    }
                  },
                  'realistic-buildings'
                )
              }
            } catch (buildingError) {
              console.warn('Building layer setup skipped:', buildingError)
            }
          }
        } catch (error) {
          console.error('Error setting up buildings:', error)
        }

        const applyOpenWorldVisuals = () => {
          try {
            const mapWithLights = mapInstance as mapboxgl.Map & {
              setLights?: (lights: Array<{ id: string; type: 'directional' | 'ambient' | 'point'; properties: any }>) => void
            }
            if (mapWithLights?.setLights) {
              mapWithLights.setLights([
                {
                  id: 'global-sunlight',
                  type: 'directional',
                  properties: {
                    direction: [210, 45],
                    color: '#FFE4C4',
                    intensity: 0.9
                  }
                }
              ])
            } else {
              mapInstance?.setLight?.({
                anchor: 'map',
                position: [1.2, 210, 45],
                color: '#FFE4C4',
                intensity: 0.9
              })
            }
          } catch (lightError) {
            console.warn('Light setup skipped:', lightError)
          }

          try {
            mapInstance?.setFog({
              range: [0.6, 6],
              color: '#d7e6fb',
              'high-color': '#9ec8ff',
              'horizon-blend': 0.2,
              'space-color': '#020b1a',
              'star-intensity': 0.0
            })
          } catch (fogError) {
            console.warn('Fog setup skipped:', fogError)
          }

          const addLayer = (id: string, layer: mapboxgl.AnyLayer) => {
            if (!mapInstance?.getLayer(id)) {
              mapInstance?.addLayer(layer, firstSymbolId)
            }
          }

          addLayer('open-world-ground', {
            id: 'open-world-ground',
            type: 'fill',
            source: 'composite',
            'source-layer': 'landcover',
            paint: {
              'fill-color': [
                'match',
                ['get', 'class'],
                'grass',
                '#2F4426',
                'forest',
                '#24351E',
                'scrub',
                '#3A4A2E',
                'crop',
                '#4A5C32',
                '#2D2D2D'
              ],
              'fill-opacity': 0.35
            }
          })

          addLayer('open-world-water', {
            id: 'open-world-water',
            type: 'fill',
            source: 'composite',
            'source-layer': 'water',
            paint: {
              'fill-color': '#2C5F87',
              'fill-opacity': 0.65
            }
          })

          addLayer('open-world-water-glow', {
            id: 'open-world-water-glow',
            type: 'line',
            source: 'composite',
            'source-layer': 'water',
            paint: {
              'line-color': '#7BD4FF',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10,
                1,
                14,
                3,
                18,
                6
              ],
              'line-blur': 2,
              'line-opacity': 0.5
            }
          })

          addLayer('open-world-road-glow', {
            id: 'open-world-road-glow',
            type: 'line',
            source: 'composite',
            'source-layer': 'road',
            filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]],
            paint: {
              'line-color': '#FFB347',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10,
                1.5,
                14,
                3,
                18,
                8
              ],
              'line-blur': 1.5,
              'line-opacity': 0.7
            }
          })

          addLayer('open-world-road-highlight', {
            id: 'open-world-road-highlight',
            type: 'line',
            source: 'composite',
            'source-layer': 'road',
            filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]],
            paint: {
              'line-color': '#FFEDB5',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10,
                0.6,
                14,
                1.5,
                18,
                3.5
              ],
              'line-gap-width': 0,
              'line-opacity': 0.85
            }
          })

          addLayer('open-world-paths', {
            id: 'open-world-paths',
            type: 'line',
            source: 'composite',
            'source-layer': 'road',
            filter: ['in', ['get', 'class'], ['literal', ['path', 'pedestrian', 'service']]],
            paint: {
              'line-color': '#F2D0A4',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14,
                0.5,
                16,
                1,
                18,
                2.2
              ],
              'line-dasharray': [2, 1.5],
              'line-opacity': 0.9
            }
          })
        }

        try {
          applyOpenWorldVisuals()
          console.log('🌆 Applied GTA open-world ambience')
        } catch (visualError) {
          console.warn('Open-world styling skipped:', visualError)
        }

        console.log('🏗️ 3D buildings and terrain enabled!')

        try {
          setMap(mapInstance)
        } catch (error) {
          console.error('Error setting map instance:', error)
        }
      })

      mapInstance.on('error', (e) => {
        console.error('❌ Map error:', e.error)
      })
      }
      
      // Start loading the cartoon style
      loadCartoonStyle()
    } catch (error) {
      console.error('❌ Error creating map:', error)
      isInitialized.current = false
    }

    return () => {
      if (mapInstance) {
        console.log('🧹 Cleaning up map instance on unmount')
        mapInstance.remove()
      }
      isInitialized.current = false
    }
  }, [containerRef, options.styleUrl, setMap])
}



