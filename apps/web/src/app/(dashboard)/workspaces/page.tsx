'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FolderOpen, Users, MoreHorizontal, Loader2 } from 'lucide-react'
import { useWorkspaces } from '@/hooks/useWorkspaces'

export default function WorkspacesPage() {
  const { workspaces, loading, error, refetch, createWorkspace } = useWorkspaces()
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    const name = prompt('Workspace name:')
    if (name?.trim()) {
      try {
        setCreating(true)
        await createWorkspace(name.trim(), name.trim().toLowerCase().replace(/\s+/g, '-'))
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to create workspace')
      } finally {
        setCreating(false)
      }
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workspaces</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your team workspaces and collaborations.
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          New Workspace
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={() => refetch()}
            className="text-sm text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : workspaces.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <FolderOpen className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">No workspaces yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create your first workspace to start collaborating.
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Create Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={`/workspaces/${ws.slug}`}
              className="block p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <h3 className="font-medium mb-1">{ws.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {ws.slug}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Users className="h-3.5 w-3.5" />
                <span>Workspace</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
