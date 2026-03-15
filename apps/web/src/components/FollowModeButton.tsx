'use client'

import { useState } from 'react'
import { Eye, EyeOff, ChevronDown, Check } from 'lucide-react'
import { useFollowMode } from '@/contexts/FollowModeContext'

export default function FollowModeButton() {
  const { isFollowing, followedUser, activeUsers, startFollowing, stopFollowing } = useFollowMode()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
          isFollowing
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {isFollowing ? (
          <>
            <Eye className="w-4 h-4" />
            <span>Following {followedUser?.name}</span>
            <ChevronDown className="w-3 h-3" />
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4" />
            <span>Follow</span>
            <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">
              Active Users
            </div>
            
            {activeUsers.map(user => (
              <button
                key={user.id}
                onClick={() => {
                  startFollowing(user)
                  setShowDropdown(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0)}
                </div>
                <span className="flex-1 text-left text-sm text-gray-700">{user.name}</span>
                {isFollowing && followedUser?.id === user.id && (
                  <Check className="w-4 h-4 text-blue-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
