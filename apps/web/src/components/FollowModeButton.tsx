'use client'

import { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff, ChevronDown, UserCheck } from 'lucide-react'
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

export default function FollowModeButton() {
  const { isFollowing, followedUser, activeUsers, startFollowing, stopFollowing } = useFollowMode()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          if (isFollowing) {
            stopFollowing()
          } else {
            setIsOpen(!isOpen)
          }
        }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isFollowing
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        {isFollowing ? (
          <>
            <EyeOff className="h-4 w-4" />
            <span className="max-w-[100px] truncate">Following {followedUser?.name?.split(' ')[0]}</span>
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            <span>Follow</span>
            <ChevronDown className="h-3 w-3" />
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && !isFollowing && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white py-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Active Users
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {activeUsers.length === 0 ? (
              <p className="px-3 py-4 text-sm text-center text-gray-400">
                No other users online
              </p>
            ) : (
              activeUsers.map((user) => {
                const bgColor = avatarColors[user.color] || 'bg-indigo-600'

                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      startFollowing(user)
                      setIsOpen(false)
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white ${bgColor}`}
                        >
                          {getInitials(user.name)}
                        </div>
                      )}
                      {/* Online dot */}
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-gray-800" />
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
                    </div>

                    {/* Follow icon */}
                    <UserCheck className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
