'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { motion, AnimatePresence } from 'framer-motion'

interface PlayerAvatarProps {
  map: mapboxgl.Map | null
  position: { lng: number; lat: number }
  bearing: number
  isMoving: boolean
  isRunning: boolean
}

export default function PlayerAvatar({ map, position, bearing, isMoving, isRunning }: PlayerAvatarProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const avatarElementRef = useRef<HTMLDivElement | null>(null)
  const [animationFrame, setAnimationFrame] = useState(0)

  // Create custom player avatar element
  useEffect(() => {
    if (!map) return

    // Create avatar container
    const avatarContainer = document.createElement('div')
    avatarContainer.style.width = '80px'
    avatarContainer.style.height = '80px'
    avatarContainer.style.position = 'relative'
    avatarContainer.style.cursor = 'pointer'
    
    avatarElementRef.current = avatarContainer

    // Create the player marker
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

  // Animate walking/running
  useEffect(() => {
    if (!isMoving || !avatarElementRef.current) return

    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 4)
    }, isRunning ? 100 : 200) // Faster animation when running

    return () => clearInterval(interval)
  }, [isMoving, isRunning])

  // Render realistic human avatar directly into the marker element
  useEffect(() => {
    if (!avatarElementRef.current) return

    const container = avatarElementRef.current
    
    // Clear previous content
    container.innerHTML = ''

    // Calculate limb positions for walking animation
    const legSwing = isMoving ? Math.sin(animationFrame * Math.PI / 2) * 15 : 0
    const armSwing = isMoving ? Math.cos(animationFrame * Math.PI / 2) * 12 : 0
    const bobY = isMoving ? Math.abs(Math.sin(animationFrame * Math.PI / 2) * 3) : 0

    // Create realistic human avatar HTML
    const avatarHTML = `
      <div style="
        width: 80px;
        height: 80px;
        position: relative;
        transform: rotate(${bearing}deg);
        transition: transform 0.1s ease-out;
      ">
        <!-- Shadow -->
        <div style="
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 35px;
          height: 10px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%);
          border-radius: 50%;
        "></div>

        <!-- Human Character -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) translateY(-${bobY}px);
          width: 60px;
          height: 70px;
        ">
          <!-- Head -->
          <div style="
            position: absolute;
            top: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 18px;
            height: 18px;
            background: linear-gradient(135deg, #FFB380 0%, #FFA866 100%);
            border-radius: 50%;
            border: 2px solid #FFF;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            z-index: 10;
          ">
            <!-- Face eyes -->
            <div style="
              position: absolute;
              top: 6px;
              left: 5px;
              width: 2px;
              height: 2px;
              background: #000;
              border-radius: 50%;
            "></div>
            <div style="
              position: absolute;
              top: 6px;
              right: 5px;
              width: 2px;
              height: 2px;
              background: #000;
              border-radius: 50%;
            "></div>
          </div>

          <!-- Body (torso) -->
          <div style="
            position: absolute;
            top: 22px;
            left: 50%;
            transform: translateX(-50%);
            width: 22px;
            height: 25px;
            background: linear-gradient(135deg, #4A7C24 0%, #5E9E2E 100%);
            border-radius: 8px 8px 4px 4px;
            border: 2px solid #FFF;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            z-index: 5;
          "></div>

          <!-- Left Arm -->
          <div style="
            position: absolute;
            top: 26px;
            left: 8px;
            width: 6px;
            height: 20px;
            background: linear-gradient(180deg, #4A7C24 0%, #5E9E2E 100%);
            border-radius: 3px;
            border: 1px solid #FFF;
            transform-origin: top center;
            transform: rotate(${armSwing}deg);
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            z-index: ${armSwing > 0 ? 4 : 6};
          "></div>

          <!-- Right Arm -->
          <div style="
            position: absolute;
            top: 26px;
            right: 8px;
            width: 6px;
            height: 20px;
            background: linear-gradient(180deg, #4A7C24 0%, #5E9E2E 100%);
            border-radius: 3px;
            border: 1px solid #FFF;
            transform-origin: top center;
            transform: rotate(${-armSwing}deg);
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            z-index: ${armSwing < 0 ? 4 : 6};
          "></div>

          <!-- Left Leg -->
          <div style="
            position: absolute;
            top: 45px;
            left: 16px;
            width: 7px;
            height: 22px;
            background: linear-gradient(180deg, #2C5F1A 0%, #3E7028 100%);
            border-radius: 3px;
            border: 1px solid #FFF;
            transform-origin: top center;
            transform: rotate(${legSwing}deg);
            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
            z-index: ${legSwing > 0 ? 3 : 7};
          "></div>

          <!-- Right Leg -->
          <div style="
            position: absolute;
            top: 45px;
            right: 16px;
            width: 7px;
            height: 22px;
            background: linear-gradient(180deg, #2C5F1A 0%, #3E7028 100%);
            border-radius: 3px;
            border: 1px solid #FFF;
            transform-origin: top center;
            transform: rotate(${-legSwing}deg);
            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
            z-index: ${legSwing < 0 ? 3 : 7};
          "></div>

          <!-- Direction indicator arrow -->
          <div style="
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 14px solid #FFD700;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
            z-index: 15;
          "></div>

          <!-- Movement pulse effect -->
          ${isMoving ? `
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: ${isRunning ? '80px' : '70px'};
              height: ${isRunning ? '80px' : '70px'};
              border: 3px solid ${isRunning ? '#FF6B6B' : '#7ED957'};
              border-radius: 50%;
              animation: pulse 1.2s infinite;
              pointer-events: none;
            "></div>
            <style>
              @keyframes pulse {
                0% { opacity: 0.8; transform: translate(-50%, -50%) scale(0.9); }
                50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3); }
              }
            </style>
          ` : ''}

          <!-- Speed badge (when running) -->
          ${isRunning ? `
            <div style="
              position: absolute;
              top: -25px;
              right: -25px;
              background: linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%);
              color: white;
              font-size: 11px;
              font-weight: bold;
              padding: 5px 10px;
              border-radius: 12px;
              border: 3px solid #FFF;
              box-shadow: 0 3px 10px rgba(0,0,0,0.4);
              font-family: 'Arial', sans-serif;
              z-index: 20;
              animation: speedBadge 0.6s infinite;
              white-space: nowrap;
            ">
              ⚡ RUNNING
            </div>
            <style>
              @keyframes speedBadge {
                0%, 100% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-3px) scale(1.05); }
              }
            </style>
          ` : ''}
        </div>
      </div>
    `

    container.innerHTML = avatarHTML
  }, [bearing, animationFrame, isMoving, isRunning])

  return null
}

