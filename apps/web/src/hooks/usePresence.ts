'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { getSocket } from '@/lib/socket'
import type { RealtimeChannel } from '@supabase/supabase-js'

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

  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const cleanupRef = useRef<(() => void)[]>([])

  // ─── Supabase Presence (status tracking) ─────────────────────

  const updateStatus = useCallback(
    (status: PresenceUser['status']) => {
      if (!channelRef.current || !user) return
      channelRef.current.track({
        user_id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        online_at: new Date().toISOString(),
        status,
      })
    },
    [user],
  )

  useEffect(() => {
    if (!enabled || !user) return

    const supabase = createClient()

    const channel = supabase.channel(channelName, {
      config: { presence: { key: user.id } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>()
        const users: PresenceUser[] = []

        for (const presences of Object.values(state)) {
          if (presences.length > 0) {
            users.push(presences[0] as unknown as PresenceUser)
          }
        }

        setPresentUsers(users)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            email: user.email,
            name: user.name,
            avatar_url: user.avatar_url,
            online_at: new Date().toISOString(),
            status: 'online' as const,
          })
        }
      })

    channelRef.current = channel

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateStatus('away')
      } else {
        updateStatus('online')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      supabase.removeChannel(channel)
    }
  }, [channelName, user?.id, enabled])

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
          // Emit a custom event for consumers to scroll/pan to the followed user's position
          window.dispatchEvent(
            new CustomEvent('presence:follow-cursor', { detail: cursor }),
          )
        }
      }),
    )

    cleanupRef.current = unsubs

    return () => {
      unsubs.forEach((unsub) => unsub())
      cleanupRef.current = []
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
