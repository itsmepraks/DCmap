'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { motion, AnimatePresence } from 'framer-motion'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MinimapProps {
  isVisible: boolean
  playerPosition: { lng: number; lat: number }
  landmarks: Array<{
    id: string
    name: string
    coordinates: [number, number]
    visited: boolean
  }>
}

export default function Minimap({ isVisible, playerPosition, landmarks }: MinimapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const playerMarker = useRef<mapboxgl.Marker | null>(null)
  const landmarkMarkers = useRef<mapboxgl.Marker[]>([])

  // Initialize minimap
  useEffect(() => {
    if (!mapContainer.current || map.current || !isVisible) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: process.env.NEXT_PUBLIC_MAPBOX_STYLE || 'mapbox://styles/mapbox/light-v11',
      center: [playerPosition.lng, playerPosition.lat],
      zoom: 14, // Wider view for better navigation
      interactive: false, // No interaction on minimap
      attributionControl: false,
      logoPosition: 'bottom-right'
    })

    // Create player marker
    const playerEl = document.createElement('div')
    playerEl.className = 'minimap-player-marker'
    playerEl.style.width = '12px'
    playerEl.style.height = '12px'
    playerEl.style.borderRadius = '50%'
    playerEl.style.background = '#2196F3'
    playerEl.style.border = '2px solid white'
    playerEl.style.boxShadow = '0 0 8px rgba(33, 150, 243, 0.8)'

    playerMarker.current = new mapboxgl.Marker(playerEl)
      .setLngLat([playerPosition.lng, playerPosition.lat])
      .addTo(map.current)

    return () => {
      landmarkMarkers.current.forEach(marker => marker.remove())
      playerMarker.current?.remove()
      map.current?.remove()
      map.current = null
    }
  }, [isVisible])

  // Update player position
  useEffect(() => {
    if (!map.current || !playerMarker.current) return

    map.current.setCenter([playerPosition.lng, playerPosition.lat])
    playerMarker.current.setLngLat([playerPosition.lng, playerPosition.lat])
  }, [playerPosition])

  // Update landmark markers
  useEffect(() => {
    if (!map.current) return

    // Remove old markers
    landmarkMarkers.current.forEach(marker => marker.remove())
    landmarkMarkers.current = []

    // Add landmark markers
    landmarks.forEach(landmark => {
      const el = document.createElement('div')
      el.style.width = '8px'
      el.style.height = '8px'
      el.style.borderRadius = '50%'
      el.style.background = landmark.visited ? '#FFD700' : '#999'
      el.style.border = '1px solid #000'
      el.style.boxShadow = landmark.visited 
        ? '0 0 6px rgba(255, 215, 0, 0.8)' 
        : '0 0 2px rgba(0, 0, 0, 0.5)'

      const marker = new mapboxgl.Marker(el)
        .setLngLat(landmark.coordinates)
        .addTo(map.current!)

      landmarkMarkers.current.push(marker)
    })
  }, [landmarks])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 z-20"
          style={{
            width: '240px',
            height: '240px'
          }}
        >
          <div
            className="relative w-full h-full rounded-xl overflow-hidden"
            style={{
              border: '4px solid #4A7C24',
              boxShadow: '0 8px 0 #2E5F1A, 0 12px 24px rgba(0,0,0,0.5)',
              imageRendering: 'pixelated'
            }}
          >
            {/* Map container */}
            <div ref={mapContainer} className="w-full h-full" />

            {/* Title overlay */}
            <div
              className="absolute top-2 left-2 px-2 py-1 rounded"
              style={{
                background: 'rgba(74, 124, 36, 0.9)',
                border: '2px solid #4A7C24',
                fontFamily: 'monospace',
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#FFD700',
                textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
              }}
            >
              📍 MINIMAP
            </div>

            {/* Legend */}
            <div
              className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded text-xs"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                fontFamily: 'monospace',
                color: '#FFF',
                fontSize: '9px'
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 border border-white" />
                <span>You</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500 border border-black" />
                <span>Visited</span>
                <div className="w-2 h-2 rounded-full bg-gray-500 border border-black ml-2" />
                <span>New</span>
              </div>
            </div>

            {/* Pixelated corners */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-black/30" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute top-0 right-0 w-2 h-2 bg-black/30" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-black/30" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-black/30" style={{ imageRendering: 'pixelated' }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


