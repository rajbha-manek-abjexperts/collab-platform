'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import type {
  Comment,
  CommentInsert,
  CommentUpdate,
  CommentWithUser,
} from '@collab/shared'

interface UseCommentsOptions {
  documentId?: string
  whiteboardId?: string
}

function commentsQueryKey(opts: UseCommentsOptions) {
  if (opts.documentId) return ['comments', 'document', opts.documentId] as const
  if (opts.whiteboardId) return ['comments', 'whiteboard', opts.whiteboardId] as const
  return ['comments'] as const
}

export function useComments(opts: UseCommentsOptions) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const queryKey = commentsQueryKey(opts)

  const list = useQuery({
    queryKey,
    queryFn: async (): Promise<CommentWithUser[]> => {
      let query = supabase
        .from('comments')
        .select(`
          *,
          user:user_id(id, email, full_name, avatar_url, created_at, updated_at),
          reactions(*)
        `)
        .is('parent_id', null)
        .order('created_at', { ascending: true })

      if (opts.documentId) {
        query = query.eq('document_id', opts.documentId)
      } else if (opts.whiteboardId) {
        query = query.eq('whiteboard_id', opts.whiteboardId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as unknown as CommentWithUser[]
    },
    enabled: !!(opts.documentId || opts.whiteboardId),
  })

  const create = useMutation({
    mutationFn: async (comment: CommentInsert): Promise<Comment> => {
      const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const update = useMutation({
    mutationFn: async ({ id, ...updates }: CommentUpdate & { id: string }): Promise<Comment> => {
      const { data, error } = await supabase
        .from('comments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const resolve = useMutation({
    mutationFn: async (id: string): Promise<Comment> => {
      const { data, error } = await supabase
        .from('comments')
        .update({ is_resolved: true })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const unresolve = useMutation({
    mutationFn: async (id: string): Promise<Comment> => {
      const { data, error } = await supabase
        .from('comments')
        .update({ is_resolved: false })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('comments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return { list, create, update, resolve, unresolve, remove }
}

export function useCommentReplies(parentId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['comments', 'replies', parentId],
    queryFn: async (): Promise<CommentWithUser[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id(id, email, full_name, avatar_url, created_at, updated_at),
          reactions(*)
        `)
        .eq('parent_id', parentId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as unknown as CommentWithUser[]
    },
    enabled: !!parentId,
  })
}
