'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  opacityDrift: number
}

const COUNT = 75

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: Particle[] = []

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }

    function spawn(randomY = true): Particle {
      return {
        x: Math.random() * canvas!.width,
        y: randomY ? Math.random() * canvas!.height : canvas!.height + 5,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(Math.random() * 0.35 + 0.1),
        size: Math.random() * 1.4 + 0.4,
        opacity: Math.random() * 0.35 + 0.08,
        opacityDrift: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.004 + 0.001),
      }
    }

    resize()
    window.addEventListener('resize', resize)
    for (let i = 0; i < COUNT; i++) particles.push(spawn(true))

    function tick() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy
        p.opacity += p.opacityDrift

        if (p.opacity <= 0.04) { p.opacityDrift = Math.abs(p.opacityDrift); p.opacity = 0.04 }
        if (p.opacity >= 0.45) { p.opacityDrift = -Math.abs(p.opacityDrift); p.opacity = 0.45 }

        // wrap horizontal
        if (p.x < -2) p.x = canvas!.width + 2
        if (p.x > canvas!.width + 2) p.x = -2

        // respawn at bottom when off top
        if (p.y < -2) particles[i] = spawn(false)

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(255,255,255,${p.opacity})`
        ctx!.fill()
      }

      animId = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
