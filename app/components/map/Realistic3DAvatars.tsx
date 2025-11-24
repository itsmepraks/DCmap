'use client'

import { useEffect, useRef } from 'react'
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
  const personRef = useRef<HTMLDivElement | null>(null)

  // Create person avatar marker
  useEffect(() => {
    if (!map) return

    const avatarContainer = document.createElement('div')
    avatarContainer.style.width = '40px'
    avatarContainer.style.height = '40px'
    avatarContainer.style.position = 'relative'
    avatarContainer.style.cursor = 'pointer'
    avatarContainer.style.zIndex = '10000'
    
    // Create person figure
    const person = document.createElement('div')
    person.innerHTML = '🚶'
    Object.assign(person.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      fontSize: '32px',
      transform: 'translate(-50%, -50%)',
      transition: 'transform 0.15s ease-out',
      willChange: 'transform',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
      textShadow: '0 0 8px rgba(255,255,255,0.6)'
    })
    avatarContainer.appendChild(person)
    personRef.current = person

    // Add shadow circle
    const shadow = document.createElement('div')
    Object.assign(shadow.style, {
      position: 'absolute',
      bottom: '-5px',
      left: '50%',
      width: '24px',
      height: '8px',
      background: 'radial-gradient(ellipse, rgba(0,0,0,0.3), transparent)',
      borderRadius: '50%',
      transform: 'translateX(-50%)',
      transition: 'width 0.3s ease, height 0.3s ease'
    })
    avatarContainer.appendChild(shadow)
    
    avatarElementRef.current = avatarContainer

    markerRef.current = new mapboxgl.Marker({
      element: avatarContainer,
      anchor: 'bottom',
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

  // Update visuals (rotation and animation) without rebuilding DOM
  useEffect(() => {
    if (!personRef.current) return

    // Change emoji based on state
    // Using arrow to show clear direction (temporary for debugging)
    let emoji = '⬆️' // Standing/pointing up
    if (isMoving) {
      emoji = isRunning ? '⬆️' : '⬆️' // Use arrow to see direction clearly
    }
    
    personRef.current.innerHTML = emoji

    // Rotate to face direction
    // Bearing: 0=North(up), 90=East(right), 180=South(down), 270=West(left)
    // Arrow emoji points up naturally, so bearing aligns correctly
    const rotation = bearing
    personRef.current.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`
    
    // Add pulse effect when moving
    if (isMoving) {
      const glowColor = isRunning ? 'rgba(255, 100, 100, 0.8)' : 'rgba(100, 200, 255, 0.8)'
      personRef.current.style.textShadow = `0 0 12px ${glowColor}, 0 0 20px ${glowColor}`
      personRef.current.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))'
      // Debug log
      console.log(`🎯 Moving - Bearing: ${bearing.toFixed(1)}°`)
    } else {
      personRef.current.style.textShadow = '0 0 8px rgba(255,255,255,0.6)'
      personRef.current.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
    }

  }, [bearing, isMoving, isRunning])

  return null
}
