'use client'

import { Users } from 'lucide-react'
import type { PresenceUser } from '@/hooks/usePresence'

const statusColors: Record<PresenceUser['status'], string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
}

function getInitials(user: PresenceUser): string {
  if (user.name) {
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  if (user.email) {
    return user.email[0].toUpperCase()
  }
  return '?'
}

interface PresenceIndicatorProps {
  users: PresenceUser[]
  maxVisible?: number
}

export function PresenceIndicator({ users, maxVisible = 5 }: PresenceIndicatorProps) {
  const visible = users.slice(0, maxVisible)
  const overflow = users.length - maxVisible

  if (users.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Users size={16} />
        <span>No one else online</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visible.map((user) => (
          <div key={user.user_id} className="relative group">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || user.email || 'User'}
                className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-xs font-medium text-white dark:border-gray-800">
                {getInitials(user)}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-800 ${statusColors[user.status]}`}
            />
            <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap group-hover:block dark:bg-gray-700">
              {user.name || user.email || 'Unknown'}
              <span className="ml-1 text-gray-400">({user.status})</span>
            </div>
          </div>
        ))}
        {overflow > 0 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-300">
            +{overflow}
          </div>
        )}
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {users.length} online
      </span>
    </div>
  )
}
