import { useState, useEffect, useCallback } from 'react'
import { apiFetch, API_URL, getAuthToken } from '../lib/api'

export interface FileAttachment {
  id: string
  workspace_id: string
  user_id: string
  document_id: string | null
  whiteboard_id: string | null
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  url?: string
}

function getHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function useStorage(workspaceId: string | undefined) {
  const [files, setFiles] = useState<FileAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = useCallback(async () => {
    if (!workspaceId) {
      setFiles([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await apiFetch<FileAttachment[]>(`/api/workspaces/${workspaceId}/files`, {
        headers: getHeaders(),
      })
      setFiles(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const uploadFile = useCallback(async (
    file: File,
    documentId?: string,
    whiteboardId?: string,
  ): Promise<FileAttachment> => {
    const formData = new FormData()
    formData.append('file', file)

    const params = new URLSearchParams()
    if (documentId) params.set('documentId', documentId)
    if (whiteboardId) params.set('whiteboardId', whiteboardId)
    const qs = params.toString()

    const token = getAuthToken()
    const response = await fetch(
      `${API_URL}/api/workspaces/${workspaceId}/files${qs ? `?${qs}` : ''}`,
      {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      },
    )

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(err.message || `Upload Error: ${response.status}`)
    }

    const attachment = await response.json()
    setFiles(prev => [attachment, ...prev])
    return attachment
  }, [workspaceId])

  const deleteFile = useCallback(async (id: string) => {
    await apiFetch(`/api/workspaces/${workspaceId}/files/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [workspaceId])

  return {
    files,
    loading,
    error,
    refetch: fetchFiles,
    uploadFile,
    deleteFile,
  }
}
