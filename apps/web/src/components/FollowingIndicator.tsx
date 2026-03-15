'use client'

import { X, Eye } from 'lucide-react'
import { useFollowMode } from '@/contexts/FollowModeContext'

export default function FollowingIndicator() {
  const { isFollowing, followedUser, stopFollowing } = useFollowMode()

  if (!isFollowing || !followedUser) return null

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg">
        <Eye className="w-4 h-4" />
        <span className="text-sm font-medium">
          Following {followedUser.name}'s view
        </span>
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
          style={{ backgroundColor: followedUser.color }}
        >
          {followedUser.name.charAt(0)}
        </div>
        <button
          onClick={stopFollowing}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
