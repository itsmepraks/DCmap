'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { usePlayerState } from '@/app/lib/playerState'

interface MinimapProps {
  isVisible: boolean
}

export default function Minimap({ isVisible }: MinimapProps) {
  const minimapContainerRef = useRef<HTMLDivElement>(null)
  const minimapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { state: playerState } = usePlayerState()
  const playerLat = playerState.position.lat
  const playerLng = playerState.position.lng
  const playerBearing = playerState.heading

  // Initialize minimap
  useEffect(() => {
    if (!isVisible || !minimapContainerRef.current || minimapRef.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) return

    mapboxgl.accessToken = token

      const map = new mapboxgl.Map({
        container: minimapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [playerLng, playerLat],
      zoom: 15,
        interactive: false,
        attributionControl: false,
      })

      map.on('load', () => {
        setIsLoaded(true)
        minimapRef.current = map
        
      // Create custom player marker
        const el = document.createElement('div')
      el.style.width = '12px'
      el.style.height = '12px'
      el.style.backgroundColor = '#3B82F6'
      el.style.border = '2px solid white'
      el.style.borderRadius = '50%'
      el.style.boxShadow = '0 0 8px rgba(59, 130, 246, 0.8)'

      const marker = new mapboxgl.Marker({
        element: el,
        rotation: playerBearing
      })
        .setLngLat([playerLng, playerLat])
        .addTo(map)

        markerRef.current = marker
      })

    return () => {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      if (minimapRef.current) {
        minimapRef.current.remove()
        minimapRef.current = null
      }
      setIsLoaded(false)
    }
  }, [isVisible, playerLat, playerLng])

  // Update player position and rotation
  useEffect(() => {
    if (!isLoaded || !minimapRef.current || !markerRef.current) return

      minimapRef.current.setCenter([playerLng, playerLat])
        markerRef.current.setLngLat([playerLng, playerLat])
    markerRef.current.setRotation(playerBearing)
  }, [playerLat, playerLng, playerBearing, isLoaded])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="fixed bottom-6 left-6 z-30 bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-gray-200"
          style={{ width: '200px', height: '200px' }}
            >
          {/* Label */}
          <div className="absolute top-2 left-2 z-10 bg-white px-2 py-1 rounded text-xs font-semibold text-gray-700 shadow-sm">
            📍 Your Location
            </div>

          {/* Minimap Container */}
              <div ref={minimapContainerRef} className="w-full h-full" />
              
          {/* Loading State */}
              {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-xs text-gray-500 font-medium">Loading map...</div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
