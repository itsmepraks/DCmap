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
  spring: 40, // cherry petals
  summer: 25, // dust motes
  fall: 35,   // leaves
  winter: 80, // snowflakes
}

function seasonColor(season: Season): string {
  switch (season) {
    case 'spring': return '#FFC2D1'
    case 'summer': return '#FFF4C2'
    case 'fall': return '#E0673F'
    case 'winter': return '#FFFFFF'
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, season: Season) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rot)
  ctx.globalAlpha = Math.min(1, p.life / 60)
  ctx.fillStyle = seasonColor(season)

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
      // snowflake — small circle with halo
      ctx.beginPath()
      ctx.arc(0, 0, p.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha *= 0.3
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
          : s === 'fall' ? 6 + Math.random() * 4
          : s === 'winter' ? 1.5 + Math.random() * 2
          : 1.5 + Math.random() * 1,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * (s === 'fall' ? 4 : 1.5),
        life: 60 + Math.random() * 60,
      }
    }

    seed()

    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const ps = particlesRef.current
      const h = window.innerHeight
      const w = window.innerWidth
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.vr * dt
        p.life -= dt * 10

        // Respawn when off-screen.
        if (p.y > h + 20 || p.x < -20 || p.x > w + 20) {
          ps[i] = spawn(season)
        }

        drawParticle(ctx, p, season)
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
