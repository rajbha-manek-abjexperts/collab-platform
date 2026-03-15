'use client'

import { useState } from 'react'
import { Plus, FolderOpen, Search, LayoutGrid, List } from 'lucide-react'
import WorkspaceCard from './WorkspaceCard'
import CreateWorkspaceModal from './CreateWorkspaceModal'
import InviteMemberModal from './InviteMemberModal'
import type { Workspace } from '@/types'

interface WorkspaceListProps {
  workspaces: (Workspace & { member_count?: number; document_count?: number })[]
  onCreateWorkspace: (data: { name: string; description?: string }) => Promise<void> | void
  onDeleteWorkspace: (id: string) => void
  onInviteMember: (data: { email: string; role: string }) => Promise<void> | void
}

export default function WorkspaceList({
  workspaces,
  onCreateWorkspace,
  onDeleteWorkspace,
  onInviteMember,
}: WorkspaceListProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredWorkspaces = workspaces.filter(
    (ws) =>
      ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleInvite = (workspace: Workspace) => {
    setSelectedWorkspace(workspace)
    setInviteModalOpen(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workspaces</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your team workspaces and collaborations.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Workspace
        </button>
      </div>

      {/* Toolbar */}
      {workspaces.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-gray-100 dark:bg-gray-800 text-foreground'
                  : 'text-gray-400 hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-gray-100 dark:bg-gray-800 text-foreground'
                  : 'text-gray-400 hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Count */}
          <span className="text-xs text-gray-400 hidden sm:block">
            {filteredWorkspaces.length} workspace{filteredWorkspaces.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Empty State */}
      {workspaces.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
            <FolderOpen className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No workspaces yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Create your first workspace to start collaborating with your team.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create Workspace
          </button>
        </div>
      )}

      {/* No Search Results */}
      {workspaces.length > 0 && filteredWorkspaces.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No workspaces match &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      )}

      {/* Grid View */}
      {filteredWorkspaces.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkspaces.map((ws) => (
            <WorkspaceCard
              key={ws.id}
              workspace={ws}
              onDelete={onDeleteWorkspace}
              onInvite={handleInvite}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {filteredWorkspaces.length > 0 && viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Description
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Members
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredWorkspaces.map((ws) => (
                <tr
                  key={ws.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium text-sm text-foreground">{ws.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    <span className="line-clamp-1">{ws.description || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                    {ws.member_count ?? 0}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                    {new Date(ws.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <CreateWorkspaceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={onCreateWorkspace}
      />

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => {
          setInviteModalOpen(false)
          setSelectedWorkspace(null)
        }}
        onSubmit={onInviteMember}
        workspaceName={selectedWorkspace?.name ?? ''}
      />
    </div>
  )
}
