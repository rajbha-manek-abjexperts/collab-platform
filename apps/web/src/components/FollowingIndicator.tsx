'use client'

import { Eye, X } from 'lucide-react'
import { useFollowMode } from '@/contexts/FollowModeContext'

const avatarColors: Record<string, string> = {
  '#3B82F6': 'bg-blue-600',
  '#10B981': 'bg-emerald-600',
  '#F59E0B': 'bg-amber-600',
  '#8B5CF6': 'bg-purple-600',
  '#EC4899': 'bg-pink-600',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function FollowingIndicator() {
  const { isFollowing, followedUser, stopFollowing } = useFollowMode()

  if (!isFollowing || !followedUser) return null

  const bgColor = avatarColors[followedUser.color] || 'bg-indigo-600'

  return (
    <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="flex items-center gap-3 rounded-full border border-indigo-200 bg-indigo-50 py-1.5 pl-2 pr-1.5 shadow-lg dark:border-indigo-800 dark:bg-indigo-950/90">
        {/* Pulsing eye icon */}
        <div className="relative">
          <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-20" />
        </div>

        <span className="text-sm text-indigo-700 dark:text-indigo-300">Following</span>

        {/* User info */}
        <div className="flex items-center gap-2">
          {followedUser.avatar ? (
            <img
              src={followedUser.avatar}
              alt={followedUser.name}
              className="h-6 w-6 rounded-full object-cover ring-2 ring-indigo-300 dark:ring-indigo-700"
            />
          ) : (
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-indigo-300 dark:ring-indigo-700 ${bgColor}`}
            >
              {getInitials(followedUser.name)}
            </div>
          )}
          <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
            {followedUser.name}
          </span>
        </div>

        {/* Stop button */}
        <button
          onClick={stopFollowing}
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-indigo-500 transition-colors hover:bg-indigo-200 dark:hover:bg-indigo-800"
          title="Stop following (Esc)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
