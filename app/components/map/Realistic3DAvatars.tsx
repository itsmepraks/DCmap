'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { AvatarType } from '@/app/types/avatar'

interface Realistic3DAvatarsProps {
  map: mapboxgl.Map | null
  position: { lng: number; lat: number }
  bearing: number
  isMoving: boolean
  isRunning: boolean
  avatarType: AvatarType
}

export default function Realistic3DAvatars({ 
  map, 
  position, 
  bearing, 
  isMoving, 
  isRunning,
  avatarType 
}: Realistic3DAvatarsProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const avatarElementRef = useRef<HTMLDivElement | null>(null)

  // Create simple position marker
  useEffect(() => {
    if (!map) return

    const avatarContainer = document.createElement('div')
    avatarContainer.style.width = '20px'
    avatarContainer.style.height = '20px'
    avatarContainer.style.position = 'relative'
    avatarContainer.style.cursor = 'pointer'
    avatarContainer.style.zIndex = '10000'
    
    avatarElementRef.current = avatarContainer

    markerRef.current = new mapboxgl.Marker({
      element: avatarContainer,
      anchor: 'center',
      rotationAlignment: 'map',
      pitchAlignment: 'map'
    })
      .setLngLat([position.lng, position.lat])
      .addTo(map)

    return () => {
      markerRef.current?.remove()
      markerRef.current = null
    }
  }, [map])

  // Update position
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat([position.lng, position.lat])
    }
  }, [position])

  // Simple position marker - lightweight and performant
  useEffect(() => {
    if (!avatarElementRef.current) return

    const container = avatarElementRef.current
    
    // Simple pulsing dot to show position
    container.style.width = '20px'
    container.style.height = '20px'
    
    const pulseColor = isMoving 
      ? (isRunning ? 'rgba(255, 100, 100, 0.9)' : 'rgba(100, 200, 255, 0.9)')
      : 'rgba(255, 200, 0, 0.8)'
    
    const avatarHTML = `
      <div style="
        width: 20px;
        height: 20px;
        position: relative;
      ">
        <!-- Simple position dot -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(${bearing}deg);
          width: 16px;
          height: 16px;
          background: ${pulseColor};
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 ${isMoving ? '4px' : '0px'} rgba(255,255,255,0.3);
          transition: box-shadow 0.3s ease;
        "></div>
        
        <!-- Direction arrow -->
        <div style="
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%) rotate(${bearing}deg);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 12px solid #ffffff;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
        "></div>
      </div>
    `
    
    container.innerHTML = avatarHTML
  }, [bearing, isMoving, isRunning])

  return null
}
