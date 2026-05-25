'use client'

import { useEffect, useRef } from 'react'

type Season = 'spring' | 'summer' | 'fall' | 'winter'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  vr: number
  life: number
}

const COUNT: Record<Season, number> = {
  spring: 34,  // cherry petals
  summer: 8,   // sunlit dust/pollen in the air
  fall: 34,    // leaves
  winter: 24,  // light snow, not a whiteout
}

const FALL_PALETTE = ['#E0673F', '#C7421D', '#FFAA3B', '#A33B16', '#F0B860']
function seasonColor(season: Season, idx: number): string {
  switch (season) {
    case 'spring': return idx % 3 === 0 ? '#FFE0EA' : '#FFC2D1'
    case 'summer': return idx % 2 === 0 ? '#FFF4C2' : '#DDF0A4'
    case 'fall': return FALL_PALETTE[idx % FALL_PALETTE.length]
    case 'winter': return '#FFFFFF'
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, season: Season, idx: number) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rot)
  const alphaBySeason: Record<Season, number> = {
    spring: 0.62,
    summer: 0.28,
    fall: 0.58,
    winter: 0.42,
  }
  ctx.globalAlpha = Math.min(1, p.life / 60) * alphaBySeason[season]
  ctx.fillStyle = seasonColor(season, idx)

  switch (season) {
    case 'spring': {
      // petal — soft ellipse
      ctx.beginPath()
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'fall': {
      // leaf — diamond-ish
      ctx.beginPath()
      ctx.moveTo(0, -p.size)
      ctx.lineTo(p.size * 0.7, 0)
      ctx.lineTo(0, p.size)
      ctx.lineTo(-p.size * 0.7, 0)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'winter': {
      // snowflake - small circle with a restrained halo
      ctx.beginPath()
      ctx.arc(0, 0, p.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha *= 0.18
      ctx.beginPath()
      ctx.arc(0, 0, p.size * 2.2, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'summer': {
      // dust mote — tiny soft dot
      ctx.beginPath()
      ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2)
      ctx.fill()
      break
    }
  }
  ctx.restore()
}

/** Decorative ambient particle layer tied to the current season. */
export default function SeasonalParticles({ season }: { season: Season }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    reducedMotionRef.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reducedMotionRef.current) return // respect user preference — no particles

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // Seed particles.
    const seed = () => {
      const count = COUNT[season]
      if (count === 0) {
        particlesRef.current = []
        return
      }
      const arr: Particle[] = []
      for (let i = 0; i < count; i++) {
        arr.push(spawn(season, true))
      }
      particlesRef.current = arr
    }

    function spawn(s: Season, initial = false): Particle {
      const w = window.innerWidth
      const h = window.innerHeight
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -10,
        vx:
          s === 'spring' ? -10 + Math.random() * 20
          : s === 'fall' ? -25 + Math.random() * 50
          : s === 'winter' ? -10 + Math.random() * 20
          : -5 + Math.random() * 10,
        vy:
          s === 'spring' ? 30 + Math.random() * 30
          : s === 'fall' ? 50 + Math.random() * 40
          : s === 'winter' ? 25 + Math.random() * 35
          : 5 + Math.random() * 10,
        size:
          s === 'spring' ? 4 + Math.random() * 3
          : s === 'fall' ? 5 + Math.random() * 3.5
          : s === 'winter' ? 1.6 + Math.random() * 1.8
          : 1.8 + Math.random() * 1.2,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * (s === 'fall' ? 4 : 1.5),
        life: 60 + Math.random() * 60,
      }
    }

    seed()

    let raf = 0
    let last = performance.now()
    let elapsed = 0
    // Wind speed and frequency vary per season. Spring and fall sway gently;
    // winter gusts more dramatically; summer dust drifts almost imperceptibly.
    const WIND_AMPLITUDE: Record<Season, number> = { spring: 18, summer: 6, fall: 28, winter: 22 }
    const WIND_FREQ: Record<Season, number> = { spring: 0.6, summer: 0.3, fall: 0.8, winter: 1.1 }

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      elapsed += dt
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const ps = particlesRef.current
      const h = window.innerHeight
      const w = window.innerWidth
      // Global wind component (sine + cosine for organic gusts).
      const wind =
        Math.sin(elapsed * WIND_FREQ[season]) * WIND_AMPLITUDE[season] +
        Math.cos(elapsed * WIND_FREQ[season] * 0.4) * (WIND_AMPLITUDE[season] * 0.4)

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]
        // Each particle samples wind slightly off-phase so the swarm doesn't
        // move in lockstep — produces a believable scatter pattern.
        const phase = (i * 0.13) % (Math.PI * 2)
        const localWind = wind + Math.sin(elapsed * WIND_FREQ[season] + phase) * 4
        p.x += (p.vx + localWind) * dt
        p.y += p.vy * dt
        p.rot += p.vr * dt + Math.sin(elapsed + phase) * 0.6 * dt
        p.life -= dt * 10

        if (p.y > h + 20 || p.x < -30 || p.x > w + 30) {
          ps[i] = spawn(season)
        }

        drawParticle(ctx, p, season, i)
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [season])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
