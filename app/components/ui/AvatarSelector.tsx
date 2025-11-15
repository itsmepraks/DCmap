'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AvatarType, AVATAR_CONFIGS } from '@/app/types/avatar'

interface AvatarSelectorProps {
  currentAvatar: AvatarType
  onSelectAvatar: (avatar: AvatarType) => void
  isVisible: boolean
}

export default function AvatarSelector({ currentAvatar, onSelectAvatar, isVisible }: AvatarSelectorProps) {
  const avatars: AvatarType[] = ['human', 'scooter']

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-32 right-6 z-30"
          style={{
            background: 'linear-gradient(145deg, #EFE6D5 0%, #F5EBD9 100%)',
            border: '3px solid #D4501E',
            borderRadius: '4px',
            boxShadow: '0 8px 0 #B8431A, 0 10px 20px rgba(0,0,0,0.4)',
            padding: '12px',
            imageRendering: 'pixelated',
            fontFamily: 'monospace'
          }}
        >
          {/* Title */}
          <div className="mb-2 pb-2 border-b-2 border-terracotta-400">
            <h3 
              className="text-xs font-bold text-center"
              style={{
                color: '#2C1810',
                textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
                letterSpacing: '0.5px'
              }}
            >
              🎭 CHOOSE AVATAR
            </h3>
          </div>

          {/* Avatar Grid */}
          <div className="grid grid-cols-2 gap-2">
            {avatars.map((avatarType) => {
              const config = AVATAR_CONFIGS[avatarType]
              const isSelected = currentAvatar === avatarType

              return (
                <motion.button
                  key={avatarType}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectAvatar(avatarType)}
                  className="relative"
                  style={{
                    width: '70px',
                    height: '70px',
                    background: isSelected
                      ? 'linear-gradient(145deg, #7ED957 0%, #5DA040 100%)'
                      : 'linear-gradient(145deg, #F5EBD9 0%, #E5D6C5 100%)',
                    border: isSelected ? '3px solid #5DA040' : '3px solid #D4501E',
                    borderRadius: '4px',
                    boxShadow: isSelected
                      ? 'inset -4px -4px 8px rgba(0,0,0,0.3), inset 4px 4px 8px rgba(255,255,255,0.1)'
                      : '0 4px 0 #B8431A, 0 6px 8px rgba(0,0,0,0.3)',
                    transform: isSelected ? 'translateY(2px)' : 'translateY(0)',
                    transition: 'all 0.1s ease',
                    cursor: 'pointer',
                    imageRendering: 'pixelated'
                  }}
                >
                  {/* Avatar Emoji */}
                  <div className="flex flex-col items-center justify-center h-full">
                    <span 
                      className="text-3xl mb-1"
                      style={{
                        filter: isSelected ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
                      }}
                    >
                      {config.emoji}
                    </span>
                    <span 
                      className="text-[8px] font-bold"
                      style={{
                        color: isSelected ? '#FFF' : '#2C1810',
                        textShadow: isSelected 
                          ? '1px 1px 0 rgba(0,0,0,0.5)'
                          : '1px 1px 0 rgba(255,255,255,0.5)',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {config.name.toUpperCase()}
                    </span>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 border-2 border-white"
                      style={{ boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)' }}
                    />
                  )}

                  {/* Pixelated corners */}
                  <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
                  <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
                  <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
                  <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
                </motion.button>
              )
            })}
          </div>

          {/* Current Avatar Info */}
          <motion.div
            key={currentAvatar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 pt-3 border-t-2 border-terracotta-400"
          >
            <div className="text-center">
              <p 
                className="text-[9px] font-bold mb-1"
                style={{
                  color: '#2C1810',
                  textShadow: '1px 1px 0 rgba(255,255,255,0.5)'
                }}
              >
                📷 {AVATAR_CONFIGS[currentAvatar].camera.description}
              </p>
              <div className="flex items-center justify-center gap-2 text-[8px]">
                <span style={{ color: '#5DA040' }}>
                  🚶 {(AVATAR_CONFIGS[currentAvatar].speed.walk * 1000000).toFixed(0)}
                </span>
                <span style={{ color: '#2C1810' }}>|</span>
                <span style={{ color: '#D4501E' }}>
                  🏃 {(AVATAR_CONFIGS[currentAvatar].speed.run * 1000000).toFixed(0)}
                </span>
              </div>
              {currentAvatar === 'scooter' && (
                <p
                  className="mt-1 text-[8px] font-bold"
                  style={{ color: '#7A2E0E' }}
                >
                  Hold Shift for turbo boost ⚡
                </p>
              )}
            </div>
          </motion.div>

          {/* Pixelated corners for container */}
          <div className="absolute top-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
          <div className="absolute top-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" style={{ imageRendering: 'pixelated' }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

