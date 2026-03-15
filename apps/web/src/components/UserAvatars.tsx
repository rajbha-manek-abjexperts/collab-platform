'use client'

import { useState } from 'react'
import { useFollowMode } from '@/contexts/FollowModeContext'

const avatarColorMap: Record<string, string> = {
  '#3B82F6': 'bg-blue-600',
  '#10B981': 'bg-emerald-600',
  '#F59E0B': 'bg-amber-600',
  '#8B5CF6': 'bg-purple-600',
  '#EC4899': 'bg-pink-600',
}

const borderColorMap: Record<string, string> = {
  '#3B82F6': 'ring-blue-400',
  '#10B981': 'ring-emerald-400',
  '#F59E0B': 'ring-amber-400',
  '#8B5CF6': 'ring-purple-400',
  '#EC4899': 'ring-pink-400',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface UserAvatarsProps {
  maxVisible?: number
}

export default function UserAvatars({ maxVisible = 4 }: UserAvatarsProps) {
  const { activeUsers, followedUser, startFollowing, isFollowing } = useFollowMode()
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null)

  const visible = activeUsers.slice(0, maxVisible)
  const overflow = activeUsers.length - maxVisible

  return (
    <div className="flex items-center gap-2">
      {/* Avatar stack */}
      <div className="flex -space-x-2">
        {visible.map((user) => {
          const isFollowed = isFollowing && followedUser?.id === user.id
          const bgColor = avatarColorMap[user.color] || 'bg-indigo-600'
          const ringColor = borderColorMap[user.color] || 'ring-indigo-400'

          return (
            <div
              key={user.id}
              className="group relative"
              onMouseEnter={() => setHoveredUserId(user.id)}
              onMouseLeave={() => setHoveredUserId(null)}
            >
              <button
                onClick={() => startFollowing(user)}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium text-white transition-all duration-200 hover:z-10 hover:scale-110 ${bgColor} ${
                  isFollowed
                    ? `border-indigo-500 ring-2 ${ringColor} ring-opacity-50`
                    : 'border-white dark:border-gray-800'
                }`}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user.name)
                )}

                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-gray-800" />
              </button>

              {/* Tooltip */}
              {hoveredUserId === user.id && (
                <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap">
                  <div className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                    {user.name}
                    {isFollowed && (
                      <span className="ml-1.5 text-indigo-300">(Following)</span>
                    )}
                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Overflow */}
        {overflow > 0 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-300">
            +{overflow}
          </div>
        )}
      </div>

      {/* Count */}
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {activeUsers.length} online
      </span>
    </div>
  )
}
