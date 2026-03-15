'use client'

import { useState } from 'react'
import { Activity, FileText, Pencil, MessageSquare, UserPlus, Trash2 } from 'lucide-react'
import { useRealtime } from '@/hooks/useRealtime'

export interface ActivityItem {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  action: 'created' | 'updated' | 'deleted' | 'commented' | 'joined'
  entity_type: 'document' | 'whiteboard' | 'workspace' | 'comment'
  entity_id: string
  entity_title?: string
  metadata?: Record<string, unknown>
  created_at: string
}

const actionIcons: Record<ActivityItem['action'], typeof Activity> = {
  created: FileText,
  updated: Pencil,
  deleted: Trash2,
  commented: MessageSquare,
  joined: UserPlus,
}

const actionLabels: Record<ActivityItem['action'], string> = {
  created: 'created',
  updated: 'updated',
  deleted: 'deleted',
  commented: 'commented on',
  joined: 'joined',
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface ActivityFeedProps {
  workspaceId: string
  initialActivities?: ActivityItem[]
  maxItems?: number
}

export function ActivityFeed({
  workspaceId,
  initialActivities = [],
  maxItems = 50,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)

  useRealtime<ActivityItem & Record<string, unknown>>({
    channel: `activity-${workspaceId}`,
    table: 'activities',
    filter: `workspace_id=eq.${workspaceId}`,
    event: 'INSERT',
    onInsert: (newActivity) => {
      setActivities((prev) => [newActivity, ...prev].slice(0, maxItems))
    },
  })

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <Activity size={24} className="mb-2" />
        <p className="text-sm">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => {
        const Icon = actionIcons[activity.action] || Activity
        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Icon size={14} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-900 dark:text-gray-100">
                <span className="font-medium">
                  {activity.user_name || activity.user_email || 'Someone'}
                </span>{' '}
                {actionLabels[activity.action]}{' '}
                {activity.entity_title && (
                  <span className="font-medium">{activity.entity_title}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimeAgo(activity.created_at)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
