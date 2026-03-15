'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { useFollowMode } from '@/contexts/FollowModeContext'

export default function UserAvatars() {
  const { activeUsers, startFollowing, isFollowing, followedUser } = useFollowMode()
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <div className="flex -space-x-2">
          {activeUsers.slice(0, 3).map((user, i) => (
            <div
              key={user.id}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
              style={{ 
                backgroundColor: user.color,
                zIndex: activeUsers.length - i
              }}
              title={user.name}
            >
              {user.name.charAt(0)}
            </div>
          ))}
          {activeUsers.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
              +{activeUsers.length - 3}
            </div>
          )}
        </div>
        <Users className="w-4 h-4 text-gray-500" />
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase border-b border-gray-100 mb-1">
            Active in this document
          </div>
          
          {activeUsers.map(user => (
            <button
              key={user.id}
              onClick={() => startFollowing(user)}
              className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${
                isFollowing && followedUser?.id === user.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Editing</p>
              </div>
              {isFollowing && followedUser?.id === user.id && (
                <span className="text-xs text-blue-600 font-medium">Following</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
