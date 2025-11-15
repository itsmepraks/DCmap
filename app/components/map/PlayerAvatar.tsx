'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import type { AvatarType } from '@/app/types/avatar'

interface PlayerAvatarProps {
  map: mapboxgl.Map | null
  position: { lng: number; lat: number }
  isMoving: boolean
  isRunning: boolean
  bearing: number
  avatarType: AvatarType
}

/**
 * Legacy avatar renderer kept around for future experiments.
 * The current experience uses Realistic3DAvatars, but we keep a lightweight
 * fallback so importing PlayerAvatar never explodes the bundle.
 */
export default function PlayerAvatar({
  map,
  position,
  isMoving,
  isRunning,
  bearing,
  avatarType
}: PlayerAvatarProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const avatarElementRef = useRef<HTMLDivElement | null>(null)
  const animationRef = useRef<number>()
  const [animationFrame, setAnimationFrame] = useState(0)

  useEffect(() => {
    if (!isMoving) {
      setAnimationFrame(0)
      return
    }

    const tick = () => {
      setAnimationFrame((frame) => frame + (isRunning ? 0.16 : 0.08))
      animationRef.current = requestAnimationFrame(tick)
    }

    animationRef.current = requestAnimationFrame(tick)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isMoving, isRunning])

  useEffect(() => {
    if (!map) return

    const element = document.createElement('div')
    element.style.width = avatarType === 'scooter' ? '80px' : '60px'
    element.style.height = avatarType === 'scooter' ? '70px' : '80px'
    element.style.position = 'relative'
    element.style.cursor = 'pointer'
    element.style.zIndex = '10000'
    element.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.45))'

    avatarElementRef.current = element

    markerRef.current = new mapboxgl.Marker({
      element,
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

  useEffect(() => {
    markerRef.current?.setLngLat([position.lng, position.lat])
  }, [position])

  useEffect(() => {
    if (!avatarElementRef.current) return

    const container = avatarElementRef.current
    const bobY = isMoving ? Math.abs(Math.sin(animationFrame * 2)) * 3 : 0
    const limbSwing = isMoving ? Math.sin(animationFrame) * 20 : 0
    const wheelSpin = isMoving ? (animationFrame * (isRunning ? 160 : 90)) % 360 : 0

    if (avatarType === 'scooter') {
      container.innerHTML = `
        <div style="
          width: 80px;
          height: 70px;
          position: relative;
          transform: rotate(${bearing}deg);
          transition: transform 0.2s ease-out;
        ">
          <div style="
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 48px;
            height: 14px;
            background: radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, transparent 70%);
            filter: blur(4px);
          "></div>
          <div style="
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 26px;
            background: linear-gradient(145deg, #ff6b6b, #d4501e);
            border: 2px solid #fff;
            border-radius: 18px 18px 8px 8px;
            box-shadow: inset 0 -4px 6px rgba(0,0,0,0.3);
          "></div>
          ${[18, 62]
            .map(
              (offset) => `
            <div style="
              position: absolute;
              bottom: 4px;
              left: ${offset}px;
              width: 24px;
              height: 24px;
              border: 4px solid #000;
              border-radius: 50%;
              background: radial-gradient(circle, #222 40%, #555);
              transform: rotate(${wheelSpin}deg);
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                width: 12px;
                height: 4px;
                background: #fff;
                transform: translate(-50%, -50%);
              "></div>
            </div>
          `
            )
            .join('')}
        </div>
      `
      return
    }

    container.innerHTML = `
      <div style="
        width: 60px;
        height: 80px;
        position: relative;
        transform: rotate(${bearing}deg);
        transition: transform 0.25s ease-out;
        filter: drop-shadow(0 0 8px rgba(255,255,255,0.5));
      ">
        <div style="
          position: absolute;
          bottom: ${bobY * -1}px;
          left: 50%;
          transform: translateX(-50%);
          width: 26px;
          height: 32px;
          background: linear-gradient(145deg, #4A90E2, #1E3A5F);
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.45);
        "></div>
        <div style="
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #FFD4A3, #E8A16A);
          border-radius: 50%;
          box-shadow: inset -3px -3px 6px rgba(0,0,0,0.2);
        "></div>
        ${[-1, 1]
          .map(
            (dir) => `
          <div style="
            position: absolute;
            top: 20px;
            ${dir === -1 ? 'left: 6px;' : 'right: 6px;'}
            width: 12px;
            height: 24px;
            background: linear-gradient(145deg, #4A90E2, #1E3A5F);
            border-radius: 6px;
            transform-origin: top center;
            transform: rotate(${dir * limbSwing * 0.4}deg);
            transition: transform 0.1s ease-out;
          ">
            <div style="
              position: absolute;
              bottom: -8px;
              left: 50%;
              transform: translateX(-50%);
              width: 12px;
              height: 12px;
              background: linear-gradient(135deg, #FFD4A3, #E8A16A);
              border-radius: 50%;
            "></div>
          </div>
        `
          )
          .join('')}
        ${[-1, 1]
          .map(
            (dir) => `
          <div style="
            position: absolute;
            top: 46px;
            ${dir === -1 ? 'left: 15px;' : 'right: 15px;'}
            width: 12px;
            height: 28px;
            background: linear-gradient(145deg, #2C3E50, #1C262F);
            border-radius: 6px;
            transform-origin: top center;
            transform: rotate(${dir * limbSwing * 0.35}deg);
            transition: transform 0.1s ease-out;
          ">
            <div style="
              position: absolute;
              bottom: -8px;
              left: 50%;
              transform: translateX(-50%);
              width: 18px;
              height: 10px;
              background: linear-gradient(145deg, #111, #333);
              border-radius: 8px;
            "></div>
          </div>
        `
          )
          .join('')}
      </div>
    `
  }, [avatarType, bearing, isMoving, isRunning, animationFrame])

  return null
}

