'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MinimapProps {
  isVisible: boolean
  playerLat: number
  playerLng: number
  playerBearing: number
}

export default function Minimap({ isVisible, playerLat, playerLng, playerBearing }: MinimapProps) {
  const minimapContainerRef = useRef<HTMLDivElement>(null)
  const minimapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!isVisible || !minimapContainerRef.current || minimapRef.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      console.warn('Mapbox token not found - Minimap disabled')
      return
    }

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: minimapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [playerLng, playerLat],
      zoom: 13.5,
      pitch: 0,
      bearing: 0,
      interactive: false,
      attributionControl: false,
    })

    map.on('load', () => {
      setIsLoaded(true)
      minimapRef.current = map

      // Create custom player marker with direction
      const el = document.createElement('div')
      el.style.width = '24px'
      el.style.height = '24px'
      el.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #7ED957 0%, #5DA5DB 100%);
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${playerBearing}deg);
        ">
          <div style="
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-bottom: 8px solid white;
            margin-bottom: 2px;
          "></div>
        </div>
      `

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([playerLng, playerLat])
        .addTo(map)

      markerRef.current = marker
    })

    return () => {
      if (markerRef.current) markerRef.current.remove()
      if (minimapRef.current) {
        minimapRef.current.remove()
        minimapRef.current = null
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (minimapRef.current && isLoaded) {
      minimapRef.current.setCenter([playerLng, playerLat])

      if (markerRef.current) {
        markerRef.current.setLngLat([playerLng, playerLat])
        const el = markerRef.current.getElement()
        const innerDiv = el.querySelector('div')
        if (innerDiv) {
          innerDiv.style.transform = `rotate(${playerBearing}deg)`
        }
      }
    }
  }, [playerLat, playerLng, playerBearing, isLoaded])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="fixed bottom-6 left-6 z-30"
        >
          <div className="relative">
            {/* Minimap Label */}
            <div className="absolute -top-8 left-0 z-10 bg-white/95 px-3 py-1 rounded-lg shadow-md border-2 border-blue-500">
              <span className="text-xs font-bold text-blue-600">📍 YOUR LOCATION</span>
            </div>
            
            <div
              className="rounded-2xl overflow-hidden shadow-lg"
              style={{
                width: '200px',
                height: '200px',
                border: '4px solid rgba(93, 165, 219, 0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.8)'
              }}
            >
              <div ref={minimapContainerRef} className="w-full h-full" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
