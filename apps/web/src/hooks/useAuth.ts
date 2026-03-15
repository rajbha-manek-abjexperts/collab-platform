'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import type { User } from '@collab/shared'

const AUTH_QUERY_KEY = ['auth', 'user'] as const

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async (): Promise<User | null> => {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      if (error || !authUser) return null
      return {
        id: authUser.id,
        email: authUser.email ?? '',
        full_name: authUser.user_metadata?.full_name ?? null,
        avatar_url: authUser.user_metadata?.avatar_url ?? null,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at ?? authUser.created_at,
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  const signInWithPassword = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
      router.push('/')
    },
  })

  const signUp = useMutation({
    mutationFn: async ({ email, password, fullName }: { email: string; password: string; fullName?: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
    },
  })

  const signInWithOAuth = useMutation({
    mutationFn: async (provider: 'google' | 'github') => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
      return data
    },
  })

  const signOut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear()
      router.push('/login')
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (profile: { full_name?: string; avatar_url?: string }) => {
      const { data, error } = await supabase.auth.updateUser({
        data: profile,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
    },
  })

  const resetPassword = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })
      if (error) throw error
    },
  })

  return {
    user,
    isLoading,
    signInWithPassword,
    signUp,
    signInWithOAuth,
    signOut,
    updateProfile,
    resetPassword,
  }
}
