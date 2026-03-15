'use client'

import {
  MessageSquare,
  AtSign,
  UserPlus,
  FileText,
  Heart,
  X,
  Bell,
} from 'lucide-react'
import type { Notification } from '@/hooks/useNotifications'

const typeIcons: Record<Notification['type'], typeof Bell> = {
  comment: MessageSquare,
  mention: AtSign,
  invite: UserPlus,
  document_update: FileText,
  reaction: Heart,
}

const typeColors: Record<Notification['type'], string> = {
  comment: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  mention: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
  invite: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
  document_update: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  reaction: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
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

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  const Icon = typeIcons[notification.type] || Bell
  const colorClass = typeColors[notification.type] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

  return (
    <div
      className={`group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
        notification.is_read
          ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
          : 'bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'
      }`}
      onClick={() => {
        if (!notification.is_read) {
          onRead(notification.id)
        }
      }}
    >
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${notification.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
          {notification.actor_name && (
            <span className="font-medium">{notification.actor_name} </span>
          )}
          {notification.message}
        </p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
          {formatTimeAgo(notification.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {!notification.is_read && (
          <span className="h-2 w-2 rounded-full bg-blue-500" />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(notification.id)
          }}
          className="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
