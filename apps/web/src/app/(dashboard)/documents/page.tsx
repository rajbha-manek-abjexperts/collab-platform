'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, FileText, Search, MoreHorizontal, Clock, Loader2 } from 'lucide-react'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import { apiFetch, getAuthToken } from '@/lib/api'
import CreateDocumentDialog from '@/components/Dialogs/CreateDocumentDialog'

interface Document {
  id: string
  workspace_id: string
  title: string
  content: Record<string, unknown>
  content_text: string
  created_by: string
  created_at: string
  updated_at: string
}

export default function DocumentsPage() {
  const { workspaces, loading: workspacesLoading } = useWorkspaces()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchAllDocuments = useCallback(async () => {
    if (workspaces.length === 0) {
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
      // Fetch documents from all workspaces in parallel
      const results = await Promise.allSettled(
        workspaces.map((ws) =>
          apiFetch<Document[]>(`/api/workspaces/${ws.id}/documents`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      )
      const allDocs = results
        .filter((r): r is PromiseFulfilledResult<Document[]> => r.status === 'fulfilled')
        .flatMap((r) => r.value)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      setDocuments(allDocs)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }, [workspaces])

  useEffect(() => {
    if (!workspacesLoading) {
      fetchAllDocuments()
    }
  }, [workspacesLoading, fetchAllDocuments])

  // Build workspace name lookup
  const workspaceNames = Object.fromEntries(workspaces.map((ws) => [ws.id, ws.name]))

  const filtered = search.trim()
    ? documents.filter((doc) =>
        doc.title.toLowerCase().includes(search.toLowerCase())
      )
    : documents

  const isLoading = workspacesLoading || loading

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Browse and manage all your documents.
          </p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Document
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Document List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={() => fetchAllDocuments()}
            className="text-sm text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <FileText className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {search ? 'No matching documents' : 'No documents yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {search
              ? 'Try a different search term.'
              : 'Create your first document to get started.'}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Create Document
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-200 dark:divide-gray-800">
          {filtered.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-sm">{doc.title}</p>
                  <p className="text-xs text-gray-400">
                    {workspaceNames[doc.workspace_id] || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateDocumentDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        workspaceId={workspaces[0]?.id}
        onSuccess={() => fetchAllDocuments()}
      />
    </div>
  )
}
