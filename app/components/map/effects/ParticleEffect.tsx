'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  emoji: string
}

interface ParticleEffectProps {
  coordinates: [number, number]
  icon: string
  isActive: boolean
  map: mapboxgl.Map | null
}

export default function ParticleEffect({ coordinates, icon, isActive, map }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!map || !isActive) return

    // Convert lng/lat to screen coordinates
    const point = map.project(coordinates)
    setPosition({ x: point.x, y: point.y })

    // Generate particles
    const newParticles: Particle[] = []
    const emojis = ['✨', '⭐', '💫', '🌟']
    
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: i,
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        size: Math.random() * 10 + 10,
        duration: Math.random() * 1.5 + 1,
        delay: Math.random() * 0.5,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      })
    }
    setParticles(newParticles)

    // Update position on map move
    const updatePosition = () => {
      const point = map.project(coordinates)
      setPosition({ x: point.x, y: point.y })
    }

    map.on('move', updatePosition)
    return () => {
      map.off('move', updatePosition)
    }
  }, [map, coordinates, isActive])

  if (!position || !isActive) return null

  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        zIndex: 100
      }}
    >
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 0
            }}
            animate={{
              x: particle.x,
              y: particle.y,
              opacity: 0,
              scale: 1
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: 'easeOut'
            }}
            style={{
              position: 'absolute',
              fontSize: `${particle.size}px`,
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
            }}
          >
            {particle.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Central icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1.2, rotate: 0 }}
        exit={{ scale: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-4xl"
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
        }}
      >
        {icon}
      </motion.div>
    </div>
  )
}

