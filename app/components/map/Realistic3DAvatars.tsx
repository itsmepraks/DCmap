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
  const dotRef = useRef<HTMLDivElement | null>(null)
  const arrowRef = useRef<HTMLDivElement | null>(null)

  // Create simple position marker with static structure
  useEffect(() => {
    if (!map) return

    const avatarContainer = document.createElement('div')
    avatarContainer.style.width = '20px'
    avatarContainer.style.height = '20px'
    avatarContainer.style.position = 'relative'
    avatarContainer.style.cursor = 'pointer'
    avatarContainer.style.zIndex = '10000'
    
    // Create Dot
    const dot = document.createElement('div')
    Object.assign(dot.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '16px',
      height: '16px',
      border: '3px solid #ffffff',
      borderRadius: '50%',
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      transition: 'box-shadow 0.3s ease, background 0.3s ease',
      transform: 'translate(-50%, -50%)', // Initial transform
      willChange: 'transform, background' // Optimize for animations
    })
    avatarContainer.appendChild(dot)
    dotRef.current = dot

    // Create Arrow
    const arrow = document.createElement('div')
    Object.assign(arrow.style, {
      position: 'absolute',
      top: '-8px',
      left: '50%',
      width: '0',
      height: '0',
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderBottom: '12px solid #ffffff',
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
      transform: 'translateX(-50%)', // Initial transform
      willChange: 'transform' // Optimize for animations
    })
    avatarContainer.appendChild(arrow)
    arrowRef.current = arrow
    
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

  // Update visuals (rotation and color) without rebuilding DOM
  useEffect(() => {
    if (!dotRef.current || !arrowRef.current) return

    const pulseColor = isMoving 
      ? (isRunning ? 'rgba(255, 100, 100, 0.9)' : 'rgba(100, 200, 255, 0.9)')
      : 'rgba(255, 200, 0, 0.8)'
    
    const shadow = `0 2px 8px rgba(0,0,0,0.4)${isMoving ? ', 0 0 0 4px rgba(255,255,255,0.3)' : ''}`

    // Update Dot
    dotRef.current.style.background = pulseColor
    dotRef.current.style.boxShadow = shadow
    dotRef.current.style.transform = `translate(-50%, -50%) rotate(${bearing}deg)`

    // Update Arrow
    arrowRef.current.style.transform = `translateX(-50%) rotate(${bearing}deg)`

  }, [bearing, isMoving, isRunning])

  return null
}
