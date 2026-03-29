"use client"

import { useCallback, useEffect, useRef } from "react"
import { createNoise3D } from "simplex-noise"
import { cn } from "~/lib/utils"

export interface WavyBackgroundProps {
  className?: string
  children?: React.ReactNode
  /** Wave colors array */
  colors?: string[]
  /** Width of each wave line */
  waveWidth?: number
  /** Number of wave lines */
  waveCount?: number
  /** Blur amount in pixels */
  blur?: number
  /** Animation speed */
  speed?: "slow" | "fast"
  /** Background opacity for trail effect */
  waveOpacity?: number
}

export function WavyBackground({
  className,
  children,
  colors = ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"],
  waveWidth = 50,
  waveCount = 5,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
}: WavyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const noiseRef = useRef(createNoise3D())
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  const getSpeedValue = useCallback(() => {
    return speed === "slow" ? 0.001 : 0.002
  }, [speed])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = 0
    let height = 0

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width
      canvas.height = height
    }
    updateSize()

    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(container)

    const drawWave = (n: number) => {
      const noise = noiseRef.current
      timeRef.current += getSpeedValue()

      for (let i = 0; i < n; i++) {
        ctx.beginPath()
        ctx.lineWidth = waveWidth
        ctx.strokeStyle = colors[i % colors.length]

        for (let x = 0; x < width; x += 5) {
          const y = noise(x / 800, 0.3 * i, timeRef.current) * 100
          if (x === 0) {
            ctx.moveTo(x, y + height * 0.5)
          } else {
            ctx.lineTo(x, y + height * 0.5)
          }
        }
        ctx.stroke()
      }
    }

    const render = () => {
      ctx.fillStyle = "#0a0a0a"
      ctx.globalAlpha = waveOpacity
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1
      ctx.filter = `blur(${blur}px)`
      drawWave(waveCount)
      ctx.filter = "none"
      animationRef.current = requestAnimationFrame(render)
    }

    animationRef.current = requestAnimationFrame(render)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      resizeObserver.disconnect()
    }
  }, [colors, waveWidth, waveCount, blur, waveOpacity, getSpeedValue])

  return (
    <div
      ref={containerRef}
      className={cn("fixed inset-0 overflow-hidden bg-neutral-950", className)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Content layer */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}

export default function WavyBackgroundDemo() {
  return <WavyBackground />
}
