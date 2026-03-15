'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface User {
  id: string
  name: string
  avatar?: string
  color: string
}

interface FollowModeContextType {
  isFollowing: boolean
  followedUser: User | null
  activeUsers: User[]
  startFollowing: (user: User) => void
  stopFollowing: () => void
}

const FollowModeContext = createContext<FollowModeContextType | null>(null)

// Demo users for testing
const demoUsers: User[] = [
  { id: '1', name: 'Alice', color: '#3B82F6' },
  { id: '2', name: 'Bob', color: '#10B981' },
  { id: '3', name: 'Charlie', color: '#F59E0B' },
]

export function FollowModeProvider({ children }: { children: ReactNode }) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [followedUser, setFollowedUser] = useState<User | null>(null)
  const [activeUsers] = useState<User[]>(demoUsers)

  const startFollowing = useCallback((user: User) => {
    setFollowedUser(user)
    setIsFollowing(true)
  }, [])

  const stopFollowing = useCallback(() => {
    setFollowedUser(null)
    setIsFollowing(false)
  }, [])

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
