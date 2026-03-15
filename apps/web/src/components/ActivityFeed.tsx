'use client'

import { useState } from 'react'
import {
  Activity,
  FileText,
  Pencil,
  MessageSquare,
  UserPlus,
  Trash2,
  Upload,
  PenTool,
  Eye,
  Star,
  Filter,
} from 'lucide-react'
import { useRealtime } from '@/hooks/useRealtime'

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'commented'
  | 'joined'
  | 'uploaded'
  | 'viewed'
  | 'starred'

export interface ActivityItem {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  action: ActivityAction
  entity_type: 'document' | 'whiteboard' | 'workspace' | 'comment' | 'file'
  entity_id: string
  entity_title?: string
  workspace_name?: string
  metadata?: Record<string, unknown>
  created_at: string
}

const actionIcons: Record<ActivityAction, typeof Activity> = {
  created: FileText,
  updated: Pencil,
  deleted: Trash2,
  commented: MessageSquare,
  joined: UserPlus,
  uploaded: Upload,
  viewed: Eye,
  starred: Star,
}

const actionColors: Record<ActivityAction, string> = {
  created: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  updated:
    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  deleted: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  commented:
    'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  joined:
    'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  uploaded:
    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  viewed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  starred:
    'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const actionLabels: Record<ActivityAction, string> = {
  created: 'created',
  updated: 'updated',
  deleted: 'deleted',
  commented: 'commented on',
  joined: 'joined',
  uploaded: 'uploaded',
  viewed: 'viewed',
  starred: 'starred',
}

const filterOptions: { value: ActivityAction | 'all'; label: string }[] = [
  { value: 'all', label: 'All Activity' },
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'commented', label: 'Comments' },
  { value: 'joined', label: 'Members' },
  { value: 'uploaded', label: 'Uploads' },
]

export function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  return date.toLocaleDateString()
}

function getUserInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return (email?.[0] || '?').toUpperCase()
}

interface ActivityFeedProps {
  workspaceId?: string
  initialActivities?: ActivityItem[]
  maxItems?: number
  showFilter?: boolean
  compact?: boolean
}

export function ActivityFeed({
  workspaceId,
  initialActivities = [],
  maxItems = 50,
  showFilter = false,
  compact = false,
}: ActivityFeedProps) {
  const [activities, setActivities] =
    useState<ActivityItem[]>(initialActivities)
  const [activeFilter, setActiveFilter] = useState<ActivityAction | 'all'>(
    'all'
  )
  const [filterOpen, setFilterOpen] = useState(false)

  useRealtime({
    channel: `activity-${workspaceId}`,
    enabled: !!workspaceId,
  })

  const filtered =
    activeFilter === 'all'
      ? activities
      : activities.filter((a) => a.action === activeFilter)

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <Activity size={24} className="mb-2" />
        <p className="text-sm">No recent activity</p>
      </div>
    )
  }

  return (
    <div>
      {showFilter && (
        <div className="flex items-center gap-2 mb-4">
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="h-3.5 w-3.5" />
              {filterOptions.find((f) => f.value === activeFilter)?.label}
            </button>
            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setFilterOpen(false)}
                />
                <div className="absolute left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 py-1 w-44">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setActiveFilter(option.value)
                        setFilterOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        activeFilter === option.value
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      <div className="space-y-0">
        {filtered.map((activity) => {
          const Icon = actionIcons[activity.action] || Activity
          const colorClass = actionColors[activity.action] || actionColors.viewed
          return (
            <div
              key={activity.id}
              className={`flex items-start gap-3 ${compact ? 'py-2' : 'py-3'} border-b border-gray-100 dark:border-gray-800 last:border-0 group hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded-lg transition-colors`}
            >
              <div
                className={`${compact ? 'p-1.5' : 'p-2'} rounded-lg ${colorClass} shrink-0 mt-0.5`}
              >
                <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`${compact ? 'text-xs' : 'text-sm'} text-gray-700 dark:text-gray-300`}
                >
                  <span className="font-medium text-foreground">
                    {activity.user_name || activity.user_email || 'Someone'}
                  </span>{' '}
                  {actionLabels[activity.action]}{' '}
                  {activity.entity_title && (
                    <span className="font-medium text-foreground">
                      {activity.entity_title}
                    </span>
                  )}
                </p>
                <div
                  className={`flex items-center gap-2 ${compact ? 'mt-0.5' : 'mt-1'}`}
                >
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatTimeAgo(activity.created_at)}
                  </span>
                  {activity.workspace_name && (
                    <>
                      <span className="text-xs text-gray-300 dark:text-gray-600">
                        &middot;
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {activity.workspace_name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No activity found for this filter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityFeed
