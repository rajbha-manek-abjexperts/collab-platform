import { useState, useEffect, useCallback } from 'react'
import { apiFetch, getAuthToken } from '../lib/api'

export interface WhiteboardSession {
  id: string
  workspace_id: string
  title: string
  canvas_data: Record<string, unknown>
  is_archived: boolean
  created_by: string
  created_at: string
  updated_at: string
}

function getHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function useWhiteboards(workspaceId: string | undefined) {
  const [whiteboards, setWhiteboards] = useState<WhiteboardSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWhiteboards = useCallback(async () => {
    if (!workspaceId) {
      setWhiteboards([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await apiFetch<WhiteboardSession[]>(`/api/workspaces/${workspaceId}/whiteboards`, {
        headers: getHeaders(),
      })
      setWhiteboards(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch whiteboards')
      setWhiteboards([])
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    fetchWhiteboards()
  }, [fetchWhiteboards])

  const createWhiteboard = useCallback(async (title: string, canvas_data: Record<string, unknown> = {}) => {
    const whiteboard = await apiFetch<WhiteboardSession>(`/api/workspaces/${workspaceId}/whiteboards`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, canvas_data }),
    })
    setWhiteboards(prev => [...prev, whiteboard])
    return whiteboard
  }, [workspaceId])

  const updateWhiteboard = useCallback(async (id: string, updates: Partial<WhiteboardSession>) => {
    const whiteboard = await apiFetch<WhiteboardSession>(`/api/workspaces/${workspaceId}/whiteboards/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    })
    setWhiteboards(prev => prev.map(w => w.id === id ? whiteboard : w))
    return whiteboard
  }, [workspaceId])

  const archiveWhiteboard = useCallback(async (id: string) => {
    const whiteboard = await apiFetch<WhiteboardSession>(`/api/workspaces/${workspaceId}/whiteboards/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ is_archived: true }),
    })
    setWhiteboards(prev => prev.filter(w => w.id !== id))
    return whiteboard
  }, [workspaceId])

  const deleteWhiteboard = useCallback(async (id: string) => {
    await apiFetch(`/api/workspaces/${workspaceId}/whiteboards/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    setWhiteboards(prev => prev.filter(w => w.id !== id))
  }, [workspaceId])

  return {
    whiteboards,
    loading,
    error,
    refetch: fetchWhiteboards,
    createWhiteboard,
    updateWhiteboard,
    archiveWhiteboard,
    deleteWhiteboard,
  }
}

export function useWhiteboard(workspaceId: string | undefined, id: string | undefined) {
  const [whiteboard, setWhiteboard] = useState<WhiteboardSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWhiteboard = useCallback(async () => {
    if (!id || !workspaceId) {
      setWhiteboard(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await apiFetch<WhiteboardSession>(`/api/workspaces/${workspaceId}/whiteboards/${id}`, {
        headers: getHeaders(),
      })
      setWhiteboard(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch whiteboard')
      setWhiteboard(null)
    } finally {
      setLoading(false)
    }
  }, [workspaceId, id])

  useEffect(() => {
    fetchWhiteboard()
  }, [fetchWhiteboard])

  return {
    whiteboard,
    loading,
    error,
    refetch: fetchWhiteboard,
  }
}
