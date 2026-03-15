import { useState, useEffect, useCallback, useRef } from 'react'
import { authFetch, getAuthToken } from '../lib/api'

export interface Notification {
  id: string
  user_id: string
  type: 'comment' | 'mention' | 'invite' | 'document_update' | 'reaction'
  title: string
  message: string
  entity_type: 'document' | 'whiteboard' | 'workspace' | 'comment'
  entity_id: string
  actor_id: string | null
  actor_name: string | null
  actor_avatar_url: string | null
  is_read: boolean
  created_at: string
}

interface UseNotificationsOptions {
  userId: string
  enabled?: boolean
  pollInterval?: number
}

function getHeaders(): Record<string, string> | undefined {
  const token = getAuthToken()
  if (!token) return undefined
  return { Authorization: `Bearer ${token}` }
}

export function useNotifications({ userId, enabled = true, pollInterval = 30000 }: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!enabled || !userId) return

    try {
      const token = getAuthToken() || undefined
      if (!token) {
        setNotifications([])
        setLoading(false)
        return
      }
      const data = await authFetch<Notification[]>('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.is_read).length)
    } catch {
      // Silently fail for polling
    } finally {
      setLoading(false)
    }
  }, [userId, enabled])

  // Fetch initial notifications and poll for updates
  useEffect(() => {
    if (!enabled || !userId) return

    fetchNotifications()

    // Poll for new notifications
    intervalRef.current = setInterval(fetchNotifications, pollInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [userId, enabled, pollInterval, fetchNotifications])

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await authFetch(`/api/notifications/${notificationId}/read`, {
          method: 'PATCH',
          headers: getHeaders(),
        })
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch {
        // Silently fail
      }
    },
    [],
  )

  const markAllAsRead = useCallback(async () => {
    try {
      await authFetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: getHeaders(),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {
      // Silently fail
    }
  }, [])

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await authFetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: getHeaders(),
        })
        setNotifications((prev) => {
          const removed = prev.find((n) => n.id === notificationId)
          if (removed && !removed.is_read) {
            setUnreadCount((c) => Math.max(0, c - 1))
          }
          return prev.filter((n) => n.id !== notificationId)
        })
      } catch {
        // Silently fail
      }
    },
    [],
  )

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  }
}
