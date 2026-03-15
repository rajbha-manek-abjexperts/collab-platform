'use client'

import Link from 'next/link'
import {
  FolderOpen,
  Users,
  MoreHorizontal,
  FileText,
  PenTool,
  Trash2,
  Settings,
  UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import type { Workspace } from '@/types'

interface WorkspaceCardProps {
  workspace: Workspace & { member_count?: number; document_count?: number }
  onDelete?: (id: string) => void
  onInvite?: (workspace: Workspace) => void
}

const workspaceColors = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
]

function getColorFromId(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return workspaceColors[Math.abs(hash) % workspaceColors.length]
}

export default function WorkspaceCard({ workspace, onDelete, onInvite }: WorkspaceCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const gradient = getColorFromId(workspace.id)

  return (
    <div className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md">
      {/* Color Banner */}
      <div className={`h-2 rounded-t-xl bg-gradient-to-r ${gradient}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradient} shadow-sm`}>
            <FolderOpen className="h-5 w-5 text-white" />
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-dropdown border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
                  <button
                    onClick={() => {
                      onInvite?.(workspace)
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                  </button>
                  <Link
                    href={`/workspaces/${workspace.slug}/settings`}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  <button
                    onClick={() => {
                      onDelete?.(workspace.id)
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Workspace
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <Link href={`/workspaces/${workspace.slug}`} className="block">
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {workspace.name}
          </h3>
          {workspace.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
              {workspace.description}
            </p>
          )}
          {!workspace.description && <div className="mb-4" />}

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{workspace.member_count ?? 0} members</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>{workspace.document_count ?? 0} docs</span>
            </div>
          </div>
        </Link>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Created {new Date(workspace.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <div className="flex items-center gap-1">
            <Link
              href={`/workspaces/${workspace.slug}`}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Open workspace"
            >
              <FolderOpen className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href={`/workspaces/${workspace.slug}/whiteboard`}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Open whiteboard"
            >
              <PenTool className="h-3.5 w-3.5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
