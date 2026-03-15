'use client'

import { useEffect, useRef } from 'react'

interface UseRealtimeOptions {
  channel: string
  enabled?: boolean
  pollInterval?: number
  onRefetch?: () => void
}

/**
 * Polling-based realtime hook.
 * Replaces Supabase postgres_changes with periodic polling.
 * The NestJS WebSocket handles cursors/presence; this handles data freshness.
 */
export function useRealtime({
  channel,
  enabled = true,
  pollInterval = 5000,
  onRefetch,
}: UseRealtimeOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled || !onRefetch) return

    intervalRef.current = setInterval(onRefetch, pollInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [channel, enabled, pollInterval, onRefetch])

  return intervalRef
}
