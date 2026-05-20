'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { minecraftTheme } from '@/app/lib/theme'
import { useFocusTrap } from '@/app/hooks/useFocusTrap'
import { STORAGE_KEYS } from '@/app/lib/storageKeys'

const ONBOARDING_STORAGE_KEY = STORAGE_KEYS.onboardingComplete

const tutorialSteps = [
  {
    title: 'Welcome to DC Explorer!',
    icon: '🗺️',
    description: 'Discover Washington DC in a fun, gamified way. Explore landmarks and earn achievements!',
    image: '🏛️',
  },
  {
    title: 'Discover Landmarks',
    icon: '🎯',
    description: 'Click on landmark markers to discover iconic sites. Each discovery earns you points and reveals fun facts!',
    image: '⭐',
  },
  {
    title: 'Explore in 3D',
    icon: '🎮',
    description: 'Toggle 3D mode to see DC from a cinematic angle. Enable layers to view museums, parks, and more!',
    image: '🌆',
  },
]

export default function OnboardingTutorial() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(ONBOARDING_STORAGE_KEY)) return
    const timer = window.setTimeout(() => setIsVisible(true), 500)
    return () => window.clearTimeout(timer)
  }, [])

  const handleSkip = () => handleComplete()
  const dialogRef = useFocusTrap<HTMLDivElement>(isVisible, handleSkip)

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  function handleComplete() {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    // Notify same-tab listeners (storage events don't fire in the originating tab).
    window.dispatchEvent(new Event('dc:onboarding-complete'))
    setIsVisible(false)
  }

  const step = tutorialSteps[currentStep]
  const isLastStep = currentStep === tutorialSteps.length - 1

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleSkip()
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            aria-describedby="onboarding-desc"
            initial={reduceMotion ? { opacity: 0 } : { scale: 0.8, y: 50 }}
            animate={reduceMotion ? { opacity: 1 } : { scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { scale: 0.8, y: 50 }}
            transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 300, damping: 25 }}
            className="relative max-w-md mx-4"
            style={{
              background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base} 0%, ${minecraftTheme.colors.beige.light} 100%)`,
              border: `4px solid ${minecraftTheme.colors.terracotta.base}`,
              borderRadius: '8px',
              boxShadow: `0 12px 0 ${minecraftTheme.colors.terracotta.dark}, 0 16px 32px rgba(0,0,0,0.6)`,
              imageRendering: minecraftTheme.minecraft.imageRendering,
              padding: '32px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pixelated corners */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-black/40" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-black/40" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-black/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-black/40" />

            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-xs font-bold px-3 py-1"
              style={{
                color: minecraftTheme.colors.text.secondary,
                fontFamily: 'monospace',
                background: minecraftTheme.colors.beige.dark,
                border: `2px solid ${minecraftTheme.colors.terracotta.light}`,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              SKIP
            </button>

            {/* Content */}
            <div className="text-center mb-6">
              <motion.div
                key={currentStep}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="text-6xl mb-4"
              >
                {step.icon}
              </motion.div>
              
              <motion.h2
                id="onboarding-title"
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold mb-3"
                style={{
                  color: minecraftTheme.colors.terracotta.base,
                  fontFamily: 'monospace',
                  textShadow: '2px 2px 0 rgba(0,0,0,0.1)',
                }}
              >
                {step.title}
              </motion.h2>

              <motion.div
                key={`image-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-5xl mb-4"
              >
                {step.image}
              </motion.div>

              <motion.p
                id="onboarding-desc"
                key={`desc-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm leading-relaxed"
                style={{
                  color: minecraftTheme.colors.text.primary,
                  fontFamily: 'monospace',
                  lineHeight: '1.6',
                }}
              >
                {step.description}
              </motion.p>
            </div>

            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className="transition-all duration-300"
                  style={{
                    width: index === currentStep ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: index === currentStep 
                      ? minecraftTheme.colors.terracotta.base
                      : minecraftTheme.colors.beige.dark,
                  }}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 py-3 text-sm font-bold"
                  style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.dark} 0%, ${minecraftTheme.colors.beige.base} 100%)`,
                    border: `3px solid ${minecraftTheme.colors.terracotta.light}`,
                    borderRadius: '4px',
                    boxShadow: `0 4px 0 ${minecraftTheme.colors.terracotta.light}, 0 6px 12px rgba(0,0,0,0.3)`,
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    imageRendering: minecraftTheme.minecraft.imageRendering,
                  }}
                >
                  ← BACK
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="flex-1 py-3 text-sm font-bold"
                style={{
                  background: `linear-gradient(145deg, ${minecraftTheme.colors.terracotta.base} 0%, ${minecraftTheme.colors.terracotta.dark} 100%)`,
                  border: `3px solid ${minecraftTheme.colors.terracotta.dark}`,
                  borderRadius: '4px',
                  boxShadow: `0 4px 0 ${minecraftTheme.colors.terracotta.dark}, 0 6px 12px rgba(0,0,0,0.3)`,
                  color: '#FFF',
                  fontFamily: 'monospace',
                  textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  imageRendering: minecraftTheme.minecraft.imageRendering,
                }}
              >
                {isLastStep ? "LET'S GO! →" : 'NEXT →'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

