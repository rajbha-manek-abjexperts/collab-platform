'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useRealtime } from '@/hooks/useRealtime'

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
}

export function useNotifications({ userId, enabled = true }: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch initial notifications
  useEffect(() => {
    if (!enabled || !userId) return

    const fetchNotifications = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setNotifications(data as Notification[])
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length)
      }
      setLoading(false)
    }

    fetchNotifications()
  }, [userId, enabled])

  // Subscribe to new notifications in real time
  useRealtime<Notification & Record<string, unknown>>({
    channel: `notifications-${userId}`,
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
    event: '*',
    enabled,
    onInsert: (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev].slice(0, 50))
      setUnreadCount((prev) => prev + 1)
    },
    onUpdate: ({ new: updated }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? (updated as Notification) : n)),
      )
      // Recalculate unread count
      setNotifications((prev) => {
        setUnreadCount(prev.filter((n) => !n.is_read).length)
        return prev
      })
    },
    onDelete: (deleted) => {
      setNotifications((prev) => prev.filter((n) => n.id !== deleted.id))
      if (!deleted.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    },
  })

  const markAsRead = useCallback(
    async (notificationId: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    },
    [userId],
  )

  const markAllAsRead = useCallback(async () => {
    const supabase = createClient()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }, [userId])

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (!error) {
        setNotifications((prev) => {
          const removed = prev.find((n) => n.id === notificationId)
          if (removed && !removed.is_read) {
            setUnreadCount((c) => Math.max(0, c - 1))
          }
          return prev.filter((n) => n.id !== notificationId)
        })
      }
    },
    [userId],
  )

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}
