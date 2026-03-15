import { useState, useEffect, useCallback } from 'react'
import { apiFetch, setAuthToken, clearAuthToken, getAuthToken } from '../lib/api'

export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      // For now, we'll decode the JWT to get user info
      // In production, you'd have a /me endpoint
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser({
        id: payload.id,
        email: payload.email,
      })
    } catch {
      clearAuthToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiFetch<AuthResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setAuthToken(response.access_token)
    setUser(response.user)
    return response
  }, [])

  const register = useCallback(async (email: string, password: string, firstName?: string, lastName?: string) => {
    const response = await apiFetch<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    })
    setAuthToken(response.access_token)
    setUser(response.user)
    return response
  }, [])

  const logout = useCallback(() => {
    clearAuthToken()
    setUser(null)
  }, [])

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }
}
