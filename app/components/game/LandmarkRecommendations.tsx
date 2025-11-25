'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'
import { formatDistance } from '@/app/lib/proximityDetector'

interface Landmark {
  id: string
  name: string
  coordinates: [number, number]
}

interface LandmarkRecommendationsProps {
  landmarks: Landmark[]
  visitedLandmarks: Set<string>
  currentPosition?: { lng: number; lat: number }
  onNavigate?: (coordinates: [number, number]) => void
}

export default function LandmarkRecommendations({
  landmarks,
  visitedLandmarks,
  currentPosition,
  onNavigate
}: LandmarkRecommendationsProps) {
  const [recommendedLandmark, setRecommendedLandmark] = useState<Landmark | null>(null)
  const [distance, setDistance] = useState<number | null>(null)

  useEffect(() => {
    // Find unvisited landmarks
    const unvisited = landmarks.filter(l => !visitedLandmarks.has(l.id))
    
    if (unvisited.length === 0) {
      setRecommendedLandmark(null)
      return
    }

    // If we have current position, find nearest unvisited landmark
    if (currentPosition) {
      let nearest: Landmark | null = null
      let nearestDistance = Infinity

      unvisited.forEach(landmark => {
        const d = calculateDistance(
          currentPosition,
          { lng: landmark.coordinates[0], lat: landmark.coordinates[1] }
        )
        if (d < nearestDistance) {
          nearestDistance = d
          nearest = landmark
        }
      })

      if (nearest) {
        setRecommendedLandmark(nearest)
        setDistance(nearestDistance)
      }
    } else {
      // Just show first unvisited
      setRecommendedLandmark(unvisited[0])
      setDistance(null)
    }
  }, [landmarks, visitedLandmarks, currentPosition])

  if (!recommendedLandmark) return null

  const handleNavigate = () => {
    if (onNavigate && recommendedLandmark) {
      onNavigate(recommendedLandmark.coordinates)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-30"
      >
        <div
          className="px-6 py-4 shadow-lg relative cursor-pointer"
          onClick={handleNavigate}
          style={{
            background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
            border: `${minecraftTheme.minecraft.borderWidth} solid ${minecraftTheme.colors.terracotta.base}`,
            borderRadius: minecraftTheme.minecraft.borderRadius,
            boxShadow: minecraftTheme.minecraft.shadowRaised,
            imageRendering: minecraftTheme.minecraft.imageRendering,
            minWidth: '280px',
            maxWidth: '400px'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎯</div>
            <div className="flex-1">
              <div className="text-sm font-bold mb-1" style={{ 
                color: minecraftTheme.colors.text.primary,
                fontFamily: 'monospace'
              }}>
                Recommended: {recommendedLandmark.name}
              </div>
              {distance !== null && (
                <div className="text-xs" style={{ 
                  color: minecraftTheme.colors.text.secondary,
                  fontFamily: 'monospace'
                }}>
                  📍 {formatDistance(distance)} away
                </div>
              )}
              <div className="text-[10px] mt-1" style={{ 
                color: minecraftTheme.colors.text.light,
                fontFamily: 'monospace'
              }}>
                Click to navigate →
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function calculateDistance(
  pos1: { lng: number; lat: number },
  pos2: { lng: number; lat: number }
): number {
  const R = 6371000 // Earth radius in meters
  const dLat = (pos2.lat - pos1.lat) * Math.PI / 180
  const dLng = (pos2.lng - pos1.lng) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

