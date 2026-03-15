'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWorkspaces, type Workspace } from '@/hooks/useWorkspaces'
import { apiFetch, getAuthToken } from '@/lib/api'
import {
  FolderOpen,
  FileText,
  PenTool,
  Users,
  Plus,
  ArrowRight,
  Clock,
  Loader2,
} from 'lucide-react'

interface UserStats {
  workspaces: number
  documents: number
  whiteboards: number
  members: number
}

const quickActions = [
  {
    href: '/documents',
    label: 'New Document',
    description: 'Create a new document',
    icon: FileText,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  },
  {
    href: '/workspaces',
    label: 'New Workspace',
    description: 'Set up a team workspace',
    icon: FolderOpen,
    color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  },
  {
    href: '/templates',
    label: 'From Template',
    description: 'Start from a template',
    icon: Plus,
    color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  },
  {
    href: '/calls',
    label: 'Start a Call',
    description: 'Start a video call',
    icon: Users,
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  },
]

const WORKSPACE_COLORS = [
  'from-blue-500 to-indigo-500',
  'from-green-500 to-emerald-500',
  'from-purple-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-red-500 to-rose-500',
  'from-cyan-500 to-teal-500',
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function UserDashboardPage() {
  const { workspaces, loading: workspacesLoading } = useWorkspaces()
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState<UserStats>({
    workspaces: 0,
    documents: 0,
    whiteboards: 0,
    members: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = getAuthToken()
        if (!token) {
          setStatsLoading(false)
          return
        }
        const data = await apiFetch<UserStats>('/api/analytics/user/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setStats(data)
      } catch {
        // Fall back to workspace count from the hook
        setStats((prev) => ({ ...prev, workspaces: (workspaces?.length || 0) }))
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [(workspaces?.length || 0)])

  const isLoading = workspacesLoading || statsLoading

  const statCards = [
    {
      label: 'Workspaces',
      value: stats.workspaces || (workspaces?.length || 0),
      icon: FolderOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Documents',
      value: stats.documents,
      icon: FileText,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Whiteboards',
      value: stats.whiteboards,
      icon: PenTool,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Team Members',
      value: stats.members,
      icon: Users,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ]

  const recentWorkspaces = (workspaces || []).slice(0, 3)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here&apos;s what&apos;s happening across your workspaces.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href + action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-center group"
              >
                <div className={`p-3 rounded-lg ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {action.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Workspaces */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FolderOpen className="h-4.5 w-4.5 text-gray-400" />
            Recent Workspaces
          </h2>
          <Link
            href="/workspaces"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {workspacesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (recentWorkspaces?.length || 0) === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No workspaces yet. Create one to get started.
            </div>
          ) : (
            recentWorkspaces.map((ws: Workspace, i: number) => (
              <Link
                key={ws.id}
                href={`/workspaces/${ws.id}`}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div
                  className={`h-10 w-10 rounded-lg bg-gradient-to-br ${WORKSPACE_COLORS[i % WORKSPACE_COLORS.length]} flex items-center justify-center text-white font-semibold text-sm shrink-0`}
                >
                  {(ws?.name || "W")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{(ws?.name || "Workspace")}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {(ws?.slug || "")}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                  <Clock className="h-3 w-3" />
                  {timeAgo(ws.created_at)}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
