'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { minecraftTheme } from '@/app/lib/theme'

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

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) {
      console.error('❌ Mapbox token not found - Minimap disabled')
      console.error('Looking for: NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN')
      return
    }

    console.log('✅ Initializing minimap with token:', token.substring(0, 20) + '...')
    mapboxgl.accessToken = token

    console.log('🗺️ Minimap initializing at position:', playerLat, playerLng)
    
    try {
      const map = new mapboxgl.Map({
        container: minimapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [playerLng, playerLat],
        zoom: 14,
        pitch: 0,
        bearing: 0,
        interactive: false,
        attributionControl: false,
      })

      map.on('error', (e) => {
        console.error('❌ Minimap error:', e.error || e)
      })
      
      map.on('style.load', () => {
        console.log('✅ Minimap style loaded')
      })

      map.on('load', () => {
        console.log('✅ Minimap fully loaded and ready')
        setIsLoaded(true)
        minimapRef.current = map
        
        // Force a resize to ensure proper rendering
        setTimeout(() => {
          map.resize()
          console.log('📐 Minimap resized')
        }, 100)

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
    } catch (error) {
      console.error('❌ Failed to initialize minimap:', error)
    }

    return () => {
      if (markerRef.current) markerRef.current.remove()
      if (minimapRef.current) {
        minimapRef.current.remove()
        minimapRef.current = null
      }
    }
  }, [isVisible, playerLat, playerLng])

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
            <div 
              className="absolute -top-8 left-0 z-10 px-3 py-1 shadow-md relative"
              style={{
                background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
                border: `2px solid ${minecraftTheme.colors.terracotta.base}`,
                borderRadius: minecraftTheme.minecraft.borderRadius,
                boxShadow: '0 4px 0 ' + minecraftTheme.colors.terracotta.dark + ', 0 6px 8px rgba(0,0,0,0.3)',
                imageRendering: minecraftTheme.minecraft.imageRendering,
              }}
            >
              {/* Pixelated corners */}
              <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
              
              <span 
                className="text-xs font-bold"
                style={{ 
                  color: minecraftTheme.colors.terracotta.base,
                  fontFamily: 'monospace'
                }}
              >
                📍 YOUR LOCATION
              </span>
            </div>

            <div
              className="shadow-lg relative"
              style={{
                width: '200px',
                height: '200px',
                border: `4px solid ${minecraftTheme.colors.terracotta.base}`,
                borderRadius: minecraftTheme.minecraft.borderRadius,
                overflow: 'hidden',
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 2px ${minecraftTheme.colors.beige.light}`,
                imageRendering: minecraftTheme.minecraft.imageRendering,
              }}
            >
              {/* Pixelated corners */}
              <div className="absolute top-0 left-0 w-1 h-1 bg-black/40 z-10 pointer-events-none" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute top-0 right-0 w-1 h-1 bg-black/40 z-10 pointer-events-none" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40 z-10 pointer-events-none" style={{ imageRendering: 'pixelated' }} />
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40 z-10 pointer-events-none" style={{ imageRendering: 'pixelated' }} />
              
              <div ref={minimapContainerRef} className="w-full h-full" />
              
              {/* Loading indicator */}
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-20" style={{ background: minecraftTheme.colors.beige.dark }}>
                  <div className="text-center">
                    <div className="animate-spin text-2xl mb-2">🧭</div>
                    <span style={{ color: minecraftTheme.colors.text.secondary, fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' }}>
                      LOADING MAP...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
