import { useState, useEffect, useCallback } from 'react'
import { apiFetch, getAuthToken } from '../lib/api'

export interface Workspace {
  id: string
  name: string
  slug: string
  owner_id: string
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      if (!token) {
        setWorkspaces([])
        return
      }
      const data = await apiFetch<Workspace[]>('/api/workspaces', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setWorkspaces(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workspaces')
      setWorkspaces([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const createWorkspace = useCallback(async (name: string, slug: string) => {
    const token = getAuthToken()
    const workspace = await apiFetch<Workspace>('/api/workspaces', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, slug }),
    })
    setWorkspaces(prev => [...prev, workspace])
    return workspace
  }, [])

  const deleteWorkspace = useCallback(async (id: string) => {
    const token = getAuthToken()
    await apiFetch(`/api/workspaces/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    setWorkspaces(prev => prev.filter(w => w.id !== id))
  }, [])

  return {
    workspaces,
    loading,
    error,
    refetch: fetchWorkspaces,
    createWorkspace,
    deleteWorkspace,
  }
}
