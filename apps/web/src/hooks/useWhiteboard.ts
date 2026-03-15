'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import type {
  WhiteboardSession,
  WhiteboardSessionInsert,
  WhiteboardSessionUpdate,
  WhiteboardSessionWithVersions,
} from '@collab/shared'

const WHITEBOARDS_KEY = ['whiteboards'] as const

export function useWhiteboards(workspaceId: string | undefined) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const list = useQuery({
    queryKey: [...WHITEBOARDS_KEY, workspaceId],
    queryFn: async (): Promise<WhiteboardSession[]> => {
      const { data, error } = await supabase
        .from('whiteboard_sessions')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!workspaceId,
  })

  const create = useMutation({
    mutationFn: async (session: WhiteboardSessionInsert): Promise<WhiteboardSession> => {
      const { data, error } = await supabase
        .from('whiteboard_sessions')
        .insert(session)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WHITEBOARDS_KEY, workspaceId] })
    },
  })

  const update = useMutation({
    mutationFn: async ({ id, ...updates }: WhiteboardSessionUpdate & { id: string }): Promise<WhiteboardSession> => {
      const { data, error } = await supabase
        .from('whiteboard_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [...WHITEBOARDS_KEY, workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['whiteboard', data.id] })
    },
  })

  const archive = useMutation({
    mutationFn: async (id: string): Promise<WhiteboardSession> => {
      const { data, error } = await supabase
        .from('whiteboard_sessions')
        .update({ is_archived: true })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WHITEBOARDS_KEY, workspaceId] })
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('whiteboard_sessions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WHITEBOARDS_KEY, workspaceId] })
    },
  })

  return { list, create, update, archive, remove }
}

export function useWhiteboard(id: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['whiteboard', id],
    queryFn: async (): Promise<WhiteboardSessionWithVersions> => {
      const { data, error } = await supabase
        .from('whiteboard_sessions')
        .select(`
          *,
          versions(*)
        `)
        .eq('id', id!)
        .order('version_number', { referencedTable: 'versions', ascending: false })
        .single()
      if (error) throw error
      return data as unknown as WhiteboardSessionWithVersions
    },
    enabled: !!id,
  })
}
