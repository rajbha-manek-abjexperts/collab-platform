'use client'

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'

interface FollowUser {
  id: string
  name: string
  avatar?: string
  color: string
}

interface FollowModeContextType {
  isFollowing: boolean
  followedUser: FollowUser | null
  activeUsers: FollowUser[]
  startFollowing: (user: FollowUser) => void
  stopFollowing: () => void
}

const FollowModeContext = createContext<FollowModeContextType | null>(null)

// Demo users for testing
const demoUsers: FollowUser[] = [
  { id: '1', name: 'Alice Johnson', color: '#3B82F6', avatar: undefined },
  { id: '2', name: 'Bob Smith', color: '#10B981', avatar: undefined },
  { id: '3', name: 'Charlie Brown', color: '#F59E0B', avatar: undefined },
  { id: '4', name: 'Diana Prince', color: '#8B5CF6', avatar: undefined },
  { id: '5', name: 'Eve Wilson', color: '#EC4899', avatar: undefined },
]

export function FollowModeProvider({ children }: { children: ReactNode }) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [followedUser, setFollowedUser] = useState<FollowUser | null>(null)
  const [activeUsers] = useState<FollowUser[]>(demoUsers)

  const startFollowing = useCallback((user: FollowUser) => {
    setFollowedUser(user)
    setIsFollowing(true)
  }, [])

  const stopFollowing = useCallback(() => {
    setFollowedUser(null)
    setIsFollowing(false)
  }, [])

  // Escape key to stop following
  useEffect(() => {
    if (!isFollowing) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopFollowing()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFollowing, stopFollowing])

  return (
    <FollowModeContext.Provider value={{
      isFollowing,
      followedUser,
      activeUsers,
      startFollowing,
      stopFollowing
    }}>
      {children}
    </FollowModeContext.Provider>
  )
}

export function useFollowMode() {
  const context = useContext(FollowModeContext)
  if (!context) {
    throw new Error('useFollowMode must be used within a FollowModeProvider')
  }
  return context
}
