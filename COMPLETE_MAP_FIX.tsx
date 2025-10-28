// This is the CORRECT Map.tsx with all fixes
// Copy this to replace app/components/map/Map.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { useMap } from '@/app/lib/MapContext'
import type { LayerVisibility } from '@/app/types/map'
import MuseumsLayer from './layers/MuseumsLayer'
import TreesLayer from './layers/TreesLayer'
import LandmarksLayer from './layers/LandmarksLayer'
import PlayerAvatar from './PlayerAvatar'
import { checkNearbyLandmarks, findNearestLandmark, getBearing } from '@/app/lib/proximityDetector'

interface MapProps {
  layersVisible: LayerVisibility
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  is3D: boolean
  isWalking: boolean
  landmarks: Array<{ id: string; name: string; coordinates: [number, number] }>
  visitedLandmarks: Set<string>
  onLandmarkDiscovered: (landmarkId: string, landmarkData: any) => void
  onPlayerPositionChange?: (position: { lng: number; lat: number; bearing: number; nearestLandmark: any }) => void
}

export default function Map({ 
  layersVisible, 
  currentSeason, 
  is3D, 
  isWalking,
  landmarks,
  visitedLandmarks,
  onLandmarkDiscovered,
  onPlayerPositionChange
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const { map, setMap } = useMap()
  const isInitialized = useRef(false)
  
  // Player state
  const [playerPosition, setPlayerPosition] = useState({ lng: -77.0369, lat: 38.9072 })
  const [playerBearing, setPlayerBearing] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  // Initialize map only once
  useEffect(() => {
    if (isInitialized.current || !mapContainer.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) {
      console.error('❌ Missing Mapbox token')
      return
    }

    isInitialized.current = true
    mapboxgl.accessToken = token

    try {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: process.env.NEXT_PUBLIC_MAPBOX_STYLE || 'mapbox://styles/mapbox/light-v11',
        center: [-77.0369, 38.9072], // DC center
        zoom: 11,
        pitch: 0,
        bearing: 0,
        antialias: true,
        maxPitch: 85
      })

      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

      mapInstance.on('load', () => {
        console.log('✅ Map loaded!')
        
        // Add 3D terrain
        mapInstance.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14
        })
        
        mapInstance.setTerrain({ 
          source: 'mapbox-dem', 
          exaggeration: 1.5
        })
        
        // Add sky
        mapInstance.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
          }
        })
        
        // Add 3D buildings
        const layers = mapInstance.getStyle().layers
        let firstSymbolId: string | undefined
        for (const layer of layers || []) {
          if (layer.type === 'symbol') {
            firstSymbolId = layer.id
            break
          }
        }
        
        if (!mapInstance.getLayer('3d-buildings')) {
          mapInstance.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 13,
              paint: {
                'fill-extrusion-color': '#C1604A',
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  13, 0,
                  13.05, ['get', 'height']
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  13, 0,
                  13.05, ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.85,
                'fill-extrusion-ambient-occlusion-intensity': 0.5,
                'fill-extrusion-ambient-occlusion-radius': 3
              }
            },
            firstSymbolId
          )
        }
        
        console.log('🏗️ 3D ready!')
        setMap(mapInstance)
      })

      return () => {
        mapInstance.remove()
        isInitialized.current = false
      }
    } catch (error) {
      console.error('❌ Map error:', error)
      isInitialized.current = false
    }
  }, [])

  // Handle 3D toggle
  useEffect(() => {
    if (!map) return

    console.log(`🎮 3D mode: ${is3D ? 'ON' : 'OFF'}`)
    
    map.easeTo({
      pitch: is3D ? 60 : 0,
      duration: 1000,
      easing: (t) => t * (2 - t)
    })
  }, [map, is3D])

  // Handle walking mode
  useEffect(() => {
    if (!map || !isWalking) return

    const WALK_SPEED = 0.00008
    const RUN_SPEED = 0.00016
    const keys: { [key: string]: boolean } = {}
    let isShiftPressed = false
    let isDragging = false
    let lastMouseX = 0
    let lastMouseY = 0

    // Enter street view
    map.easeTo({
      pitch: 85,
      zoom: 20,
      duration: 1000
    })

    console.log('🚶 Walk mode ON - WASD to move, Shift to run')

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault()
        keys[key] = true
      }
      if (e.key === 'Shift') {
        isShiftPressed = true
        setIsRunning(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keys[key] = false
      if (e.key === 'Shift') {
        isShiftPressed = false
        setIsRunning(false)
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging = true
        lastMouseX = e.clientX
        lastMouseY = e.clientY
        map.getCanvas().style.cursor = 'grabbing'
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const deltaX = e.clientX - lastMouseX
      const deltaY = e.clientY - lastMouseY

      const newBearing = map.getBearing() + deltaX * 0.3
      map.setBearing(newBearing)

      const currentPitch = map.getPitch()
      const newPitch = Math.max(0, Math.min(85, currentPitch - deltaY * 0.2))
      map.setPitch(newPitch)

      lastMouseX = e.clientX
      lastMouseY = e.clientY
    }

    const handleMouseUp = () => {
      isDragging = false
      map.getCanvas().style.cursor = ''
    }

    let animationFrame: number
    let lastProximityCheck = Date.now()

    const moveCamera = () => {
      const bearing = map.getBearing()
      const center = map.getCenter()
      const currentSpeed = isShiftPressed ? RUN_SPEED : WALK_SPEED
      
      let deltaLng = 0
      let deltaLat = 0
      let moving = false

      if (keys['w'] || keys['arrowup']) {
        const rad = (bearing * Math.PI) / 180
        deltaLng += Math.sin(rad) * currentSpeed
        deltaLat += Math.cos(rad) * currentSpeed
        moving = true
      }
      if (keys['s'] || keys['arrowdown']) {
        const rad = (bearing * Math.PI) / 180
        deltaLng -= Math.sin(rad) * currentSpeed
        deltaLat -= Math.cos(rad) * currentSpeed
        moving = true
      }
      if (keys['a'] || keys['arrowleft']) {
        const rad = ((bearing - 90) * Math.PI) / 180
        deltaLng += Math.sin(rad) * currentSpeed
        deltaLat += Math.cos(rad) * currentSpeed
        moving = true
      }
      if (keys['d'] || keys['arrowright']) {
        const rad = ((bearing + 90) * Math.PI) / 180
        deltaLng += Math.sin(rad) * currentSpeed
        deltaLat += Math.cos(rad) * currentSpeed
        moving = true
      }

      setIsMoving(moving)

      if (deltaLng !== 0 || deltaLat !== 0) {
        const newCenter = [center.lng + deltaLng, center.lat + deltaLat]
        map.setCenter(newCenter as [number, number])
        setPlayerPosition({ lng: newCenter[0], lat: newCenter[1] })
      }

      setPlayerBearing(map.getBearing())

      // Check landmarks every 500ms
      const now = Date.now()
      if (now - lastProximityCheck > 500) {
        lastProximityCheck = now
        const playerPos = { lng: center.lng, lat: center.lat }
        
        const nearby = checkNearbyLandmarks(playerPos, landmarks, visitedLandmarks, 50)
        nearby.forEach(discovery => {
          const landmarkData = landmarks.find(l => l.id === discovery.id)
          if (landmarkData) {
            onLandmarkDiscovered(discovery.id, landmarkData)
          }
        })

        const nearest = findNearestLandmark(playerPos, landmarks)
        if (nearest && onPlayerPositionChange) {
          const landmarkBearing = getBearing(playerPos, nearest.coordinates)
          onPlayerPositionChange({
            lng: playerPos.lng,
            lat: playerPos.lat,
            bearing: map.getBearing(),
            nearestLandmark: {
              name: nearest.name,
              distance: nearest.distance!,
              bearing: landmarkBearing
            }
          })
        }
      }

      animationFrame = requestAnimationFrame(moveCamera)
    }

    animationFrame = requestAnimationFrame(moveCamera)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    const canvas = map.getCanvas()
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    map.scrollZoom.disable()
    map.boxZoom.disable()
    map.dragRotate.disable()
    map.dragPan.disable()
    map.keyboard.disable()
    map.doubleClickZoom.disable()
    map.touchZoomRotate.disable()

    return () => {
      console.log('🚶 Walk mode OFF')
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      setIsMoving(false)
      setIsRunning(false)

      map.scrollZoom.enable()
      map.boxZoom.enable()
      map.dragRotate.enable()
      map.dragPan.enable()
      map.keyboard.enable()
      map.doubleClickZoom.enable()
      map.touchZoomRotate.enable()

      map.easeTo({
        pitch: 0,
        zoom: 11,
        duration: 1000
      })
    }
  }, [map, isWalking, landmarks, visitedLandmarks, onLandmarkDiscovered, onPlayerPositionChange])

  return (
    <>
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />
      {map && (
        <>
          <MuseumsLayer visible={layersVisible.museums} />
          <TreesLayer visible={layersVisible.trees} season={currentSeason} />
          <LandmarksLayer map={map} visible={layersVisible.landmarks || true} visitedLandmarks={visitedLandmarks} />
          {!isWalking && (
            <PlayerAvatar 
              map={map}
              position={playerPosition}
              bearing={playerBearing}
              isMoving={isMoving}
              isRunning={isRunning}
            />
          )}
        </>
      )}
    </>
  )
}

