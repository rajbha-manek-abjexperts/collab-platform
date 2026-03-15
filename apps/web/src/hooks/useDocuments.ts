import { useState, useEffect, useCallback } from 'react'
import { apiFetch, getAuthToken } from '../lib/api'

export interface Document {
  id: string
  workspace_id: string
  title: string
  content: Record<string, unknown>
  content_text: string
  created_by: string
  created_at: string
  updated_at: string
}

export function useDocuments(workspaceId: string) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    if (!workspaceId) {
      setDocuments([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const token = getAuthToken()
      if (!token) {
        setDocuments([])
        return
      }
      const data = await apiFetch<Document[]>(`/api/workspaces/${workspaceId}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setDocuments(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const createDocument = useCallback(async (title: string, content: Record<string, unknown> = {}) => {
    const token = getAuthToken()
    const document = await apiFetch<Document>(`/api/workspaces/${workspaceId}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    })
    setDocuments(prev => [...prev, document])
    return document
  }, [workspaceId])

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    const token = getAuthToken()
    const document = await apiFetch<Document>(`/api/workspaces/${workspaceId}/documents/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })
    setDocuments(prev => prev.map(d => d.id === id ? document : d))
    return document
  }, [workspaceId])

  const deleteDocument = useCallback(async (id: string) => {
    const token = getAuthToken()
    await apiFetch(`/api/workspaces/${workspaceId}/documents/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    setDocuments(prev => prev.filter(d => d.id !== id))
  }, [workspaceId])

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  }
}
