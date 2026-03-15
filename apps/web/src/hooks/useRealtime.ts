'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type PostgresEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeOptions<T extends Record<string, unknown>> {
  channel: string
  table: string
  schema?: string
  filter?: string
  event?: PostgresEvent
  onInsert?: (payload: T) => void
  onUpdate?: (payload: { old: T; new: T }) => void
  onDelete?: (payload: T) => void
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void
  enabled?: boolean
}

export function useRealtime<T extends Record<string, unknown>>({
  channel: channelName,
  table,
  schema = 'public',
  filter,
  event = '*',
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()

    const channel = supabase
      .channel(channelName)
      .on<T>(
        'postgres_changes',
        {
          event,
          schema,
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          onChange?.(payload)

          if (payload.eventType === 'INSERT' && onInsert) {
            onInsert(payload.new as T)
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            onUpdate({ old: payload.old as T, new: payload.new as T })
          } else if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload.old as T)
          }
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, table, schema, filter, event, enabled])

  return channelRef
}
