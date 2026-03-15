'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface PresenceUser {
  user_id: string
  email?: string
  name?: string
  avatar_url?: string
  online_at: string
  status: 'online' | 'away' | 'busy'
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
}

export function usePresence({ channelName, user, enabled = true }: UsePresenceOptions) {
  const [presentUsers, setPresentUsers] = useState<PresenceUser[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)

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

    // Track away status on visibility change
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

  return { presentUsers, updateStatus }
}
