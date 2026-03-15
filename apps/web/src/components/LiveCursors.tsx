'use client'

import { useState, useEffect } from 'react'

interface Cursor {
  id: string
  name: string
  color: string
  x: number
  y: number
}

interface LiveCursorsProps {
  roomId: string
  currentUserId: string
  onCursorMove?: (x: number, y: number) => void
}

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']

export default function LiveCursors({ roomId, currentUserId, onCursorMove }: LiveCursorsProps) {
  const [cursors, setCursors] = useState<Cursor[]>([])
  const [myPosition, setMyPosition] = useState({ x: 0, y: 0 })

  // Demo: simulate other users' cursors
  useEffect(() => {
    const interval = setInterval(() => {
      const demoCursors: Cursor[] = []
      for (let i = 0; i < 3; i++) {
        demoCursors.push({
          id: `user-${i}`,
          name: names[i],
          color: colors[i],
          x: Math.random() * 800 + 100,
          y: Math.random() * 400 + 100,
        })
      }
      setCursors(demoCursors)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  function handleMouseMove(e: React.MouseEvent) {
    const x = e.clientX
    const y = e.clientY
    setMyPosition({ x, y })
    onCursorMove?.(x, y)
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40"
      onMouseMove={handleMouseMove}
    >
      {/* Other users' cursors */}
      {cursors.map(cursor => (
        <div
          key={cursor.id}
          className="absolute transition-all duration-100"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-2px, -2px)'
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={cursor.color}>
            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L5.85 2.36a.5.5 0 0 0-.35.85z"/>
          </svg>
          <div
            className="absolute left-4 top-4 px-2 py-0.5 rounded-full text-xs text-white font-medium whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  )
}
