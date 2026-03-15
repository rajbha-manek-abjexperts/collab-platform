'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getSocket } from '@/lib/socket'

// ─── Types ────────────────────────────────────────────────────────

export interface PresenceUser {
  user_id: string
  email?: string
  name?: string
  avatar_url?: string
  online_at: string
  status: 'online' | 'away' | 'busy'
  cursor_position?: { x: number; y: number }
  is_typing?: boolean
  viewing_entity_id?: string
  viewing_entity_type?: 'document' | 'whiteboard' | 'page'
  following_user_id?: string
}

interface CursorData {
  userId: string
  userName?: string
  x: number
  y: number
  pageId?: string
}

interface TypingUser {
  userId: string
  userName?: string
  startedAt: number
}

interface FollowState {
  targetUserId: string | null
  followers: string[]
}

interface UsePresenceOptions {
  channelName: string
  user: {
    id: string
    email?: string
    name?: string
    avatar_url?: string
  } | null
  enabled?: boolean
  room?: string
  trackCursors?: boolean
  trackTyping?: boolean
}

// ─── Hook ─────────────────────────────────────────────────────────

export function usePresence({
  channelName,
  user,
  enabled = true,
  room,
  trackCursors = false,
  trackTyping = false,
}: UsePresenceOptions) {
  const [presentUsers, setPresentUsers] = useState<PresenceUser[]>([])
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map())
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map())
  const [viewingUsers, setViewingUsers] = useState<Map<string, { entityId: string; entityType: string }>>(new Map())
  const [followState, setFollowState] = useState<FollowState>({ targetUserId: null, followers: [] })

  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const cleanupRef = useRef<(() => void)[]>([])

  // ─── WebSocket Presence (status tracking via WS gateway) ─────

  const updateStatus = useCallback(
    (status: PresenceUser['status']) => {
      if (!room || !user) return
      const socket = getSocket()
      socket.sendPresenceUpdate(room, status)
    },
    [room, user],
  )

  useEffect(() => {
    if (!enabled || !user || !room) return

    const socket = getSocket()
    const unsubs: (() => void)[] = []

    // Send initial presence
    socket.sendPresenceUpdate(room, 'online')

    // Request current presence state
    socket.requestPresence(room)

    // Listen for presence updates from other users
    unsubs.push(
      socket.on('presence:sync', (data) => {
        const users = data as PresenceUser[]
        setPresentUsers(users)
      }),
    )

    unsubs.push(
      socket.on('presence:update', (data) => {
        const presenceData = data as PresenceUser
        if (presenceData.user_id === user.id) return
        setPresentUsers((prev) => {
          const existing = prev.findIndex((u) => u.user_id === presenceData.user_id)
          if (existing >= 0) {
            const next = [...prev]
            next[existing] = presenceData
            return next
          }
          return [...prev, presenceData]
        })
      }),
    )

    unsubs.push(
      socket.on('presence:leave', (data) => {
        const { userId } = data as { userId: string }
        setPresentUsers((prev) => prev.filter((u) => u.user_id !== userId))
      }),
    )

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateStatus('away')
      } else {
        updateStatus('online')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    cleanupRef.current = unsubs

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      unsubs.forEach((unsub) => unsub())
      cleanupRef.current = []
    }
  }, [channelName, user?.id, room, enabled])

  // ─── WebSocket Events (cursors, typing, viewing, follow) ─────

  useEffect(() => {
    if (!enabled || !user || !room) return
    if (!trackCursors && !trackTyping) return

    const socket = getSocket()
    const unsubs: (() => void)[] = []

    // Cursor tracking
    if (trackCursors) {
      unsubs.push(
        socket.on('cursor:update', (data) => {
          const cursor = data as CursorData
          if (cursor.userId === user.id) return
          setCursors((prev) => {
            const next = new Map(prev)
            next.set(cursor.userId, cursor)
            return next
          })
        }),
      )
    }

    // Typing indicators
    if (trackTyping) {
      unsubs.push(
        socket.on('typing:start', (data) => {
          const { userId, userName } = data as { userId: string; userName?: string }
          if (userId === user.id) return

          setTypingUsers((prev) => {
            const next = new Map(prev)
            next.set(userId, { userId, userName, startedAt: Date.now() })
            return next
          })

          // Auto-clear after 5s if no stop event
          const existing = typingTimeoutsRef.current.get(userId)
          if (existing) clearTimeout(existing)
          typingTimeoutsRef.current.set(
            userId,
            setTimeout(() => {
              setTypingUsers((prev) => {
                const next = new Map(prev)
                next.delete(userId)
                return next
              })
              typingTimeoutsRef.current.delete(userId)
            }, 5000),
          )
        }),
      )

      unsubs.push(
        socket.on('typing:stop', (data) => {
          const { userId } = data as { userId: string }
          setTypingUsers((prev) => {
            const next = new Map(prev)
            next.delete(userId)
            return next
          })
          const timeout = typingTimeoutsRef.current.get(userId)
          if (timeout) {
            clearTimeout(timeout)
            typingTimeoutsRef.current.delete(userId)
          }
        }),
      )
    }

    // Viewing status
    unsubs.push(
      socket.on('viewing:update', (data) => {
        const { userId, entityId, entityType } = data as {
          userId: string
          entityId: string | null
          entityType: string | null
        }
        if (userId === user.id) return
        setViewingUsers((prev) => {
          const next = new Map(prev)
          if (entityId && entityType) {
            next.set(userId, { entityId, entityType })
          } else {
            next.delete(userId)
          }
          return next
        })
      }),
    )

    // Follow mode
    unsubs.push(
      socket.on('follow:started', (data) => {
        const { userId, targetUserId } = data as { userId: string; userName?: string; targetUserId: string }
        if (targetUserId === user.id) {
          setFollowState((prev) => ({
            ...prev,
            followers: [...prev.followers.filter((id) => id !== userId), userId],
          }))
        }
      }),
    )

    unsubs.push(
      socket.on('follow:stopped', (data) => {
        const { userId } = data as { userId: string }
        setFollowState((prev) => ({
          ...prev,
          followers: prev.followers.filter((id) => id !== userId),
        }))
      }),
    )

    // Listen for cursor updates from the user we're following
    unsubs.push(
      socket.on('cursor:update', (data) => {
        const cursor = data as CursorData
        if (followState.targetUserId && cursor.userId === followState.targetUserId) {
          window.dispatchEvent(
            new CustomEvent('presence:follow-cursor', { detail: cursor }),
          )
        }
      }),
    )

    return () => {
      unsubs.forEach((unsub) => unsub())
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      typingTimeoutsRef.current.clear()
    }
  }, [enabled, user?.id, room, trackCursors, trackTyping, followState.targetUserId])

  // ─── Actions ─────────────────────────────────────────────────

  const broadcastCursor = useCallback(
    (x: number, y: number, pageId?: string) => {
      if (!room) return
      const socket = getSocket()
      socket.sendCursorMove(room, x, y, pageId)
    },
    [room],
  )

  const startTyping = useCallback(() => {
    if (!room) return
    const socket = getSocket()
    socket.sendTypingStart(room)
  }, [room])

  const stopTyping = useCallback(() => {
    if (!room) return
    const socket = getSocket()
    socket.sendTypingStop(room)
  }, [room])

  const startViewing = useCallback(
    (entityId: string, entityType: 'document' | 'whiteboard' | 'page') => {
      if (!room) return
      const socket = getSocket()
      socket.sendViewingStart(room, entityId, entityType)
    },
    [room],
  )

  const stopViewing = useCallback(() => {
    if (!room) return
    const socket = getSocket()
    socket.sendViewingStop(room)
  }, [room])

  const followUser = useCallback(
    (targetUserId: string) => {
      if (!room) return
      const socket = getSocket()
      socket.sendFollowStart(room, targetUserId)
      setFollowState((prev) => ({ ...prev, targetUserId }))
    },
    [room],
  )

  const unfollowUser = useCallback(() => {
    if (!room) return
    const socket = getSocket()
    socket.sendFollowStop(room)
    setFollowState((prev) => ({ ...prev, targetUserId: null }))
  }, [room])

  return {
    presentUsers,
    updateStatus,
    // Cursor tracking
    cursors: Array.from(cursors.values()),
    broadcastCursor,
    // Typing indicators
    typingUsers: Array.from(typingUsers.values()),
    startTyping,
    stopTyping,
    // Viewing status
    viewingUsers,
    startViewing,
    stopViewing,
    // Follow mode
    followState,
    followUser,
    unfollowUser,
  }
}
