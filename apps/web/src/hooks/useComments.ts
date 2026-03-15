import { useState, useEffect, useCallback } from 'react'
import { apiFetch, getAuthToken } from '../lib/api'

export interface Comment {
  id: string
  document_id?: string
  whiteboard_id?: string
  user_id: string
  content: string
  parent_id?: string | null
  is_resolved?: boolean
  position?: Record<string, unknown>
  reactions?: Reaction[]
  created_at: string
  updated_at?: string
}

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

export function useComments(documentId?: string, whiteboardId?: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!documentId && !whiteboardId) {
      setComments([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const token = getAuthToken()
      if (!token) {
        setComments([])
        return
      }
      const endpoint = documentId
        ? `/api/documents/${documentId}/comments`
        : `/api/whiteboards/${whiteboardId}/comments`
      const data = await apiFetch<Comment[]>(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setComments(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments')
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [documentId, whiteboardId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const addComment = useCallback(async (content: string, parentId?: string) => {
    const endpoint = documentId
      ? `/api/documents/${documentId}/comments`
      : `/api/whiteboards/${whiteboardId}/comments`
    const comment = await apiFetch<Comment>(endpoint, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content, parent_id: parentId }),
    })
    setComments(prev => [...prev, comment])
    return comment
  }, [documentId, whiteboardId])

  const updateComment = useCallback(async (id: string, content: string) => {
    const updated = await apiFetch<Comment>(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    })
    setComments(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }, [])

  const resolveComment = useCallback(async (id: string) => {
    const updated = await apiFetch<Comment>(`/api/comments/${id}/resolve`, {
      method: 'PATCH',
      headers: getHeaders(),
    })
    setComments(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }, [])

  const unresolveComment = useCallback(async (id: string) => {
    const updated = await apiFetch<Comment>(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ is_resolved: false }),
    })
    setComments(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }, [])

  const deleteComment = useCallback(async (id: string) => {
    await apiFetch(`/api/comments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    setComments(prev => prev.filter(c => c.id !== id))
  }, [])

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
    addComment,
    updateComment,
    resolveComment,
    unresolveComment,
    deleteComment,
  }
}
