import { useCallback } from 'react'
import { apiFetch, getAuthToken } from '../lib/api'

export interface Reaction {
  id: string
  comment_id: string
  user_id: string
  emoji: string
  created_at: string
}

function getHeaders() {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function useReactions() {
  const toggleReaction = useCallback(async (commentId: string, emoji: string): Promise<Reaction | null> => {
    return apiFetch<Reaction | null>(`/api/comments/${commentId}/reactions/${encodeURIComponent(emoji)}`, {
      method: 'POST',
      headers: getHeaders(),
    })
  }, [])

  const removeReaction = useCallback(async (id: string) => {
    await apiFetch(`/api/reactions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
  }, [])

  return {
    toggleReaction,
    removeReaction,
  }
}
