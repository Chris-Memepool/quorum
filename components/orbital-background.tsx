"use client"

import { useEffect, useRef } from "react"

export function OrbitalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const cellGlowRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()

    const gridSize = 40
    let animationId: number

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      cellGlowRef.current.clear()
    }

    const getNearbyCells = (x: number, y: number, radius: number) => {
      const col = Math.floor(x / gridSize)
      const row = Math.floor(y / gridSize)
      const cellRadius = Math.ceil(radius / gridSize)

      const nearby: { col: number; row: number; distance: number }[] = []
      for (let r = row - cellRadius; r <= row + cellRadius; r++) {
        for (let c = col - cellRadius; c <= col + cellRadius; c++) {
          const cellX = c * gridSize + gridSize / 2
          const cellY = r * gridSize + gridSize / 2
          const distance = Math.hypot(cellX - x, cellY - y)
          if (distance <= radius) {
            nearby.push({ col: c, row: r, distance })
          }
        }
      }
      return nearby
    }

    const animate = () => {
      // Clear canvas with dark background
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const nearbyCells = getNearbyCells(mouseRef.current.x, mouseRef.current.y, 120)

      const cellMap = cellGlowRef.current
      const allCells = new Set<string>()

      nearbyCells.forEach(({ col, row, distance }) => {
        const key = `${col},${row}`
        allCells.add(key)
        // Glow intensity based on distance (closer = more intense)
        const intensity = Math.max(0, 1 - distance / 120)
        const currentGlow = cellMap.get(key) || 0
        cellMap.set(key, Math.max(currentGlow, intensity))
      })

      // Decay glow for cells not near cursor
      cellMap.forEach((glow, key) => {
        if (!allCells.has(key)) {
          const newGlow = glow * 0.92 // Smooth fade out
          if (newGlow > 0.02) {
            cellMap.set(key, newGlow)
          } else {
            cellMap.delete(key)
          }
        }
      })

      // Draw grid
      const cols = Math.ceil(canvas.width / gridSize)
      const rows = Math.ceil(canvas.height / gridSize)

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * gridSize
          const y = row * gridSize
          const key = `${col},${row}`
          const glow = cellMap.get(key) || 0

          ctx.strokeStyle = "rgba(64, 74, 89, 0.3)"
          ctx.lineWidth = 0.5
          ctx.strokeRect(x + 2, y + 2, gridSize - 4, gridSize - 4)

          if (glow > 0) {
            const isAccent = Math.random() > 0.6
            const color = isAccent
              ? `rgba(34, 211, 238, ${glow * 0.7})` // Cyan
              : `rgba(168, 85, 247, ${glow * 0.6})` // Purple
            ctx.fillStyle = color
            ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4)
          }
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      setCanvasSize()
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 w-full h-full" style={{ background: "#0a0a0a" }} />
}
