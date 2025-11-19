'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'

interface NearbyLandmark {
  id: string
  name: string
  icon: string
  distance: number
  direction: string
}

interface ProximityHintProps {
  nearbyLandmarks: NearbyLandmark[]
  visitedLandmarks?: Set<string>
  onNavigate?: (landmarkId: string) => void
}

export default function ProximityHint({ nearbyLandmarks, visitedLandmarks = new Set(), onNavigate }: ProximityHintProps) {
  const getDirectionArrow = (direction: string) => {
    const directions: { [key: string]: string } = {
      'N': '↑',
      'NE': '↗',
      'E': '→',
      'SE': '↘',
      'S': '↓',
      'SW': '↙',
      'W': '←',
      'NW': '↖'
    }
    return directions[direction] || '○'
  }

  const getDistanceColor = (distance: number) => {
    if (distance < 100) return '#7ED957' // Very close - green
    if (distance < 200) return '#FFD700' // Close - gold
    if (distance < 500) return '#FFA500' // Medium - orange
    return '#D4501E' // Far - red
  }

  // Only show the 3 nearest unvisited landmarks
  const displayLandmarks = nearbyLandmarks
    .filter(l => !visitedLandmarks.has(l.id))
    .slice(0, 3)

  return (
    <AnimatePresence>
      {displayLandmarks.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div
            className="px-4 py-3"
            style={{
              background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
              border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
              borderRadius: minecraftTheme.minecraft.borderRadius,
              boxShadow: minecraftTheme.minecraft.shadowRaised,
              imageRendering: minecraftTheme.minecraft.imageRendering,
              maxWidth: '400px',
            }}
          >
            {/* Pixelated corners */}
            <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" />
            <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" />
            <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" />
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" />

            {/* Header */}
            <div
              className="text-xs font-bold mb-2 flex items-center gap-2"
              style={{
                color: minecraftTheme.colors.terracotta.base,
                fontFamily: 'monospace',
                textTransform: 'uppercase'
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                📍
              </motion.span>
              Nearby Landmarks
            </div>

            {/* Landmarks list */}
            <div className="space-y-2">
              {displayLandmarks.map((landmark, index) => (
                <motion.button
                  key={landmark.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onNavigate?.(landmark.id)}
                  className="w-full flex items-center justify-between p-2 rounded transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.light} 0%, ${minecraftTheme.colors.beige.base} 100%)`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.light}`,
                    cursor: 'pointer',
                    imageRendering: minecraftTheme.minecraft.imageRendering,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{landmark.icon}</span>
                    <div className="text-left">
                      <div
                        className="text-xs font-bold"
                        style={{
                          color: minecraftTheme.colors.text.primary,
                          fontFamily: 'monospace'
                        }}
                      >
                        {landmark.name}
                      </div>
                      <div
                        className="text-[10px]"
                        style={{
                          color: minecraftTheme.colors.text.secondary,
                          fontFamily: 'monospace'
                        }}
                      >
                        {Math.round(landmark.distance)}m away
                      </div>
                    </div>
                  </div>

                  {/* Direction indicator */}
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ 
                        x: [0, 3, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      className="text-lg font-bold"
                      style={{
                        color: getDistanceColor(landmark.distance)
                      }}
                    >
                      {getDirectionArrow(landmark.direction)}
                    </motion.div>
                    
                    {/* Distance indicator */}
                    <div
                      className="px-2 py-1 rounded text-[10px] font-bold"
                      style={{
                        background: getDistanceColor(landmark.distance),
                        color: '#FFF',
                        fontFamily: 'monospace',
                        minWidth: '40px',
                        textAlign: 'center'
                      }}
                    >
                      {landmark.distance < 100 ? 'NEAR' : landmark.distance < 200 ? 'CLOSE' : landmark.distance < 500 ? 'FAR' : 'DIST'}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer tip */}
            {displayLandmarks.length > 0 && displayLandmarks[0].distance < 50 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 pt-2 border-t text-center"
                style={{
                  borderColor: minecraftTheme.colors.terracotta.light
                }}
              >
                <div
                  className="text-[10px] font-bold"
                  style={{
                    color: '#7ED957',
                    fontFamily: 'monospace'
                  }}
                >
                  💡 Click the landmark to discover it!
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

