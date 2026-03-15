'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import type {
  Workspace,
  WorkspaceInsert,
  WorkspaceUpdate,
  WorkspaceWithMembers,
  WorkspaceMemberInsert,
  WorkspaceRole,
} from '@collab/shared'

const WORKSPACES_KEY = ['workspaces'] as const

export function useWorkspaces() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const list = useQuery({
    queryKey: WORKSPACES_KEY,
    queryFn: async (): Promise<Workspace[]> => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const create = useMutation({
    mutationFn: async (workspace: WorkspaceInsert): Promise<Workspace> => {
      const { data, error } = await supabase
        .from('workspaces')
        .insert(workspace)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY })
    },
  })

  const update = useMutation({
    mutationFn: async ({ id, ...updates }: WorkspaceUpdate & { id: string }): Promise<Workspace> => {
      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY })
      queryClient.invalidateQueries({ queryKey: ['workspace', data.id] })
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workspaces').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY })
    },
  })

  return { list, create, update, remove }
}

export function useWorkspace(id: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['workspace', id],
    queryFn: async (): Promise<WorkspaceWithMembers> => {
      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          members:workspace_members(
            workspace_id,
            user_id,
            role,
            joined_at,
            user:user_id(id, email, full_name, avatar_url, created_at, updated_at)
          )
        `)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as unknown as WorkspaceWithMembers
    },
    enabled: !!id,
  })
}

export function useWorkspaceMembers(workspaceId: string | undefined) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const addMember = useMutation({
    mutationFn: async (member: WorkspaceMemberInsert) => {
      const { data, error } = await supabase
        .from('workspace_members')
        .insert(member)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
    },
  })

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: WorkspaceRole }) => {
      const { data, error } = await supabase
        .from('workspace_members')
        .update({ role })
        .eq('workspace_id', workspaceId!)
        .eq('user_id', userId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
    },
  })

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspaceId!)
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
    },
  })

  return { addMember, updateRole, removeMember }
}
