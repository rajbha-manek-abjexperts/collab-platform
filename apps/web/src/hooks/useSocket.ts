'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getSocket, type CollabSocket } from '@/lib/socket'
import { getAuthToken } from '@/lib/api'

interface UseSocketOptions {
  autoConnect?: boolean
  rooms?: string[]
  workspaceId?: string
}

interface PresenceUser {
  userId: string
  userName?: string
  avatarUrl?: string
  status: 'online' | 'away' | 'busy'
  cursorPosition?: { x: number; y: number }
  lastActivity: number
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true, rooms = [], workspaceId } = options
  const socketRef = useRef<CollabSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([])
  const cleanupRef = useRef<(() => void)[]>([])

  const connect = useCallback(async () => {
    const token = getAuthToken()
    if (!token) return

    const socket = getSocket()
    socketRef.current = socket

    const unsubs: (() => void)[] = []

    unsubs.push(socket.on('connected', () => setIsConnected(true)))
    unsubs.push(socket.on('disconnected', () => {
      setIsConnected(false)
      setIsAuthenticated(false)
    }))
    unsubs.push(socket.on('auth:success', () => setIsAuthenticated(true)))
    unsubs.push(socket.on('auth:error', () => setIsAuthenticated(false)))
    unsubs.push(socket.on('presence:update', (data) => {
      const payload = data as { users: PresenceUser[] }
      setPresenceUsers(payload.users || [])
    }))

    cleanupRef.current = unsubs

    await socket.connect(token)
  }, [])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      cleanupRef.current.forEach((unsub) => unsub())
      cleanupRef.current = []
    }
  }, [autoConnect, connect])

  // Join rooms when authenticated
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !isAuthenticated) return

    if (workspaceId) {
      socket.joinWorkspace(workspaceId)
    }

    rooms.forEach((room) => socket.joinRoom(room))

    return () => {
      if (workspaceId) {
        socket.leaveWorkspace(workspaceId)
      }
      rooms.forEach((room) => socket.leaveRoom(room))
    }
  }, [isAuthenticated, workspaceId, rooms.join(',')])

  // Track away/online based on page visibility
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !isAuthenticated) return

    const allRooms = [...rooms]
    if (workspaceId) allRooms.push(`workspace:${workspaceId}`)

    const handleVisibility = () => {
      const status = document.hidden ? 'away' : 'online'
      allRooms.forEach((room) => socket.sendPresenceUpdate(room, status))
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isAuthenticated, rooms.join(','), workspaceId])

  const on = useCallback((event: string, handler: (data: unknown) => void) => {
    const socket = socketRef.current
    if (!socket) return () => {}
    return socket.on(event, handler)
  }, [])

  const sendCursorMove = useCallback((room: string, x: number, y: number, pageId?: string) => {
    socketRef.current?.sendCursorMove(room, x, y, pageId)
  }, [])

  const sendCanvasDraw = useCallback((room: string, action: {
    type: string
    stroke?: unknown
    objectId?: string
    data?: unknown
  }) => {
    socketRef.current?.sendCanvasDraw(room, action)
  }, [])

  const sendDocumentUpdate = useCallback((room: string, ops: unknown) => {
    socketRef.current?.sendDocumentUpdate(room, ops)
  }, [])

  const sendDocumentSelection = useCallback((room: string, range: { index: number; length: number } | null) => {
    socketRef.current?.sendDocumentSelection(room, range)
  }, [])

  const sendTypingStart = useCallback((room: string) => {
    socketRef.current?.sendTypingStart(room)
  }, [])

  const sendTypingStop = useCallback((room: string) => {
    socketRef.current?.sendTypingStop(room)
  }, [])

  const sendPresenceUpdate = useCallback((room: string, status: 'online' | 'away' | 'busy') => {
    socketRef.current?.sendPresenceUpdate(room, status)
  }, [])

  const sendViewingStart = useCallback((room: string, entityId: string, entityType: 'document' | 'whiteboard' | 'page') => {
    socketRef.current?.sendViewingStart(room, entityId, entityType)
  }, [])

  const sendViewingStop = useCallback((room: string) => {
    socketRef.current?.sendViewingStop(room)
  }, [])

  const sendFollowStart = useCallback((room: string, targetUserId: string) => {
    socketRef.current?.sendFollowStart(room, targetUserId)
  }, [])

  const sendFollowStop = useCallback((room: string) => {
    socketRef.current?.sendFollowStop(room)
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    isAuthenticated,
    presenceUsers,
    connect,
    on,
    sendCursorMove,
    sendCanvasDraw,
    sendDocumentUpdate,
    sendDocumentSelection,
    sendTypingStart,
    sendTypingStop,
    sendPresenceUpdate,
    sendViewingStart,
    sendViewingStop,
    sendFollowStart,
    sendFollowStop,
  }
}
