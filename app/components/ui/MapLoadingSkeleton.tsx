'use client'

import { motion } from 'framer-motion'

/**
 * Cinematic loading shot — deep dusk gradient + animated DC outline draw-on
 * + a single subtle "Exploring Washington, D.C." caption. Replaces the
 * emoji-led skeleton with something that feels like a film title card.
 */
export default function MapLoadingSkeleton() {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 60%, #2A3B5C 0%, #11192D 65%, #060A18 100%)',
      }}
      aria-busy="true"
      aria-label="Loading map"
    >
      {/* Animated DC diamond outline */}
      <motion.svg
        viewBox="0 0 200 200"
        width="220"
        height="220"
        className="absolute"
        style={{ filter: 'drop-shadow(0 0 24px rgba(255, 200, 120, 0.35))' }}
      >
        <motion.path
          d="M 100 12 L 188 100 L 100 188 L 12 100 Z"
          fill="none"
          stroke="#FFC880"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
        />
        {/* Inner pulse */}
        <motion.circle
          cx="100"
          cy="100"
          r="6"
          fill="#FFC880"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.8] }}
          transition={{ duration: 1.2, delay: 1.4 }}
        />
      </motion.svg>

      {/* Caption */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="absolute bottom-20 text-center px-6"
      >
        <p
          className="text-xs tracking-[0.4em] uppercase mb-2"
          style={{ color: 'rgba(255, 200, 120, 0.6)' }}
        >
          Now exploring
        </p>
        <h1
          className="text-2xl sm:text-3xl font-light tracking-wide"
          style={{ color: '#F5EBD9', fontWeight: 300 }}
        >
          Washington, D.C.
        </h1>
      </motion.div>

      {/* Bottom progress shimmer */}
      <motion.div
        className="absolute bottom-8 h-px w-40"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255, 200, 120, 0.8) 50%, transparent 100%)',
        }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
