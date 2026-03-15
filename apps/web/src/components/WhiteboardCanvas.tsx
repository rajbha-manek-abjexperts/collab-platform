'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  ZoomIn,
  ZoomOut,
  Hand,
  MousePointer2,
  Square,
  Circle,
  Type,
  Minus,
  Pencil,
  Eraser,
  Trash2,
  Download,
  Undo2,
  Redo2,
  Save,
} from 'lucide-react'
import type { Tool, Point, DrawElement, WhiteboardState } from '@/types/whiteboard'

const tools: { id: Tool; icon: typeof MousePointer2; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'hand', icon: Hand, label: 'Pan' },
  { id: 'pen', icon: Pencil, label: 'Pen' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'text', icon: Type, label: 'Text' },
]

const COLORS = [
  '#000000', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
  '#ffffff',
]

const STROKE_WIDTHS = [2, 4, 6, 8]
const ERASER_RADIUS = 10

interface WhiteboardCanvasProps {
  id: string
  onSave?: (state: WhiteboardState) => void
}

export default function WhiteboardCanvas({ id, onSave }: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTool, setActiveTool] = useState<Tool>('pen')
  const [activeColor, setActiveColor] = useState('#000000')
  const [activeStrokeWidth, setActiveStrokeWidth] = useState(2)
  const [isDrawing, setIsDrawing] = useState(false)
  const [elements, setElements] = useState<DrawElement[]>([])
  const [undoneElements, setUndoneElements] = useState<DrawElement[]>([])
  const [currentElement, setCurrentElement] = useState<DrawElement | null>(null)
  const [zoom, setZoom] = useState(100)
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 })
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null)

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      const scale = zoom / 100
      return {
        x: (e.clientX - rect.left - panOffset.x) / scale,
        y: (e.clientY - rect.top - panOffset.y) / scale,
      }
    },
    [zoom, panOffset]
  )

  const drawAll = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()

    const scale = zoom / 100
    ctx.translate(panOffset.x, panOffset.y)
    ctx.scale(scale, scale)

    // Draw dot grid
    ctx.fillStyle = '#e5e7eb'
    const gridSize = 20
    const startX = Math.floor(-panOffset.x / scale / gridSize) * gridSize
    const startY = Math.floor(-panOffset.y / scale / gridSize) * gridSize
    const endX = startX + canvas.width / scale + gridSize
    const endY = startY + canvas.height / scale + gridSize
    for (let x = startX; x < endX; x += gridSize) {
      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath()
        ctx.arc(x, y, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const allElements = currentElement
      ? [...elements, currentElement]
      : elements

    for (const el of allElements) {
      ctx.strokeStyle = el.color
      ctx.lineWidth = el.strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (el.type === 'pen' && el.points.length > 0) {
        ctx.beginPath()
        ctx.moveTo(el.points[0].x, el.points[0].y)
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y)
        }
        ctx.stroke()
      } else if (el.type === 'rectangle' && el.points.length === 2) {
        const [start, end] = el.points
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y)
      } else if (el.type === 'ellipse' && el.points.length === 2) {
        const [start, end] = el.points
        const cx = (start.x + end.x) / 2
        const cy = (start.y + end.y) / 2
        const rx = Math.abs(end.x - start.x) / 2
        const ry = Math.abs(end.y - start.y) / 2
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.stroke()
      } else if (el.type === 'line' && el.points.length === 2) {
        ctx.beginPath()
        ctx.moveTo(el.points[0].x, el.points[0].y)
        ctx.lineTo(el.points[1].x, el.points[1].y)
        ctx.stroke()
      } else if (el.type === 'text' && el.text && el.points.length > 0) {
        ctx.fillStyle = el.color
        ctx.font = `${el.strokeWidth * 6}px sans-serif`
        ctx.fillText(el.text, el.points[0].x, el.points[0].y)
      }
    }

    ctx.restore()
  }, [elements, currentElement, zoom, panOffset])

  // Resize canvas to fill container
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    if (!container) return

    const resize = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      drawAll()
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [drawAll])

  // Redraw when state changes
  useEffect(() => {
    drawAll()
  }, [drawAll])

  // Eraser: remove elements whose points are near the cursor
  const eraseAt = useCallback(
    (point: Point) => {
      setElements((prev) =>
        prev.filter((el) => {
          for (const p of el.points) {
            const dx = p.x - point.x
            const dy = p.y - point.y
            if (Math.sqrt(dx * dx + dy * dy) < ERASER_RADIUS) {
              return false
            }
          }
          return true
        })
      )
    },
    []
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getCanvasPoint(e)

      if (activeTool === 'hand') {
        setLastPanPoint({ x: e.clientX, y: e.clientY })
        setIsDrawing(true)
        return
      }

      if (activeTool === 'select') return

      if (activeTool === 'eraser') {
        setIsDrawing(true)
        eraseAt(point)
        return
      }

      if (activeTool === 'text') {
        const text = prompt('Enter text:')
        if (text) {
          const newEl: DrawElement = {
            id: crypto.randomUUID(),
            type: 'text',
            points: [point],
            color: activeColor,
            strokeWidth: activeStrokeWidth,
            text,
          }
          setElements((prev) => [...prev, newEl])
          setUndoneElements([])
        }
        return
      }

      setIsDrawing(true)
      const newEl: DrawElement = {
        id: crypto.randomUUID(),
        type: activeTool as DrawElement['type'],
        points: activeTool === 'pen' ? [point] : [point, point],
        color: activeColor,
        strokeWidth: activeStrokeWidth,
      }
      setCurrentElement(newEl)
    },
    [activeTool, activeColor, activeStrokeWidth, getCanvasPoint, eraseAt]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return

      if (activeTool === 'hand' && lastPanPoint) {
        const dx = e.clientX - lastPanPoint.x
        const dy = e.clientY - lastPanPoint.y
        setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
        setLastPanPoint({ x: e.clientX, y: e.clientY })
        return
      }

      if (activeTool === 'eraser') {
        eraseAt(getCanvasPoint(e))
        return
      }

      if (!currentElement) return
      const point = getCanvasPoint(e)

      if (currentElement.type === 'pen') {
        setCurrentElement((prev) =>
          prev ? { ...prev, points: [...prev.points, point] } : null
        )
      } else {
        setCurrentElement((prev) =>
          prev ? { ...prev, points: [prev.points[0], point] } : null
        )
      }
    },
    [isDrawing, activeTool, lastPanPoint, currentElement, getCanvasPoint, eraseAt]
  )

  const handleMouseUp = useCallback(() => {
    if (activeTool === 'hand') {
      setIsDrawing(false)
      setLastPanPoint(null)
      return
    }
    if (currentElement) {
      setElements((prev) => [...prev, currentElement])
      setCurrentElement(null)
      setUndoneElements([])
    }
    setIsDrawing(false)
  }, [activeTool, currentElement])

  const undo = () => {
    setElements((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setUndoneElements((u) => [...u, last])
      return prev.slice(0, -1)
    })
  }

  const redo = () => {
    setUndoneElements((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setElements((e) => [...e, last])
      return prev.slice(0, -1)
    })
  }

  const clearCanvas = () => {
    setElements([])
    setCurrentElement(null)
    setUndoneElements([])
  }

  const exportCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `whiteboard-${id}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const handleSave = () => {
    const state: WhiteboardState = { elements, zoom, panOffset }
    onSave?.(state)
  }

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(25, Math.min(300, prev + delta)))
  }

  const cursorStyle =
    activeTool === 'hand'
      ? isDrawing ? 'grabbing' : 'grab'
      : activeTool === 'select'
        ? 'default'
        : activeTool === 'eraser'
          ? 'cell'
          : 'crosshair'

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {/* Toolbar */}
      <div className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                title={tool.label}
                onClick={() => setActiveTool(tool.id)}
                className={`p-2 rounded-md transition-colors ${
                  activeTool === tool.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-white dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            title="Undo"
            onClick={undo}
            disabled={elements.length === 0}
            className="p-2 rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-30"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            title="Redo"
            onClick={redo}
            disabled={undoneElements.length === 0}
            className="p-2 rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-30"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            title="Clear canvas"
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={exportCanvas}
            title="Export as PNG"
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>
          {onSave && (
            <button
              onClick={handleSave}
              title="Save whiteboard"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Left sidebar - color & stroke picker */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-2 shadow-sm space-y-2">
        <div className="space-y-1">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setActiveColor(color)}
              className={`block w-6 h-6 rounded-full border-2 transition-transform ${
                activeColor === color
                  ? 'border-blue-500 scale-125'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-1 flex flex-col items-center">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => setActiveStrokeWidth(w)}
              className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${
                activeStrokeWidth === w
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={`${w}px`}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: w + 2, height: w + 2 }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: cursorStyle }}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1 shadow-sm">
        <button
          onClick={() => handleZoom(-10)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom(100)}
          className="px-2 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {zoom}%
        </button>
        <button
          onClick={() => handleZoom(10)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
