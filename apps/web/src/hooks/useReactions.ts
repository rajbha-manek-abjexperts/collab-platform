'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import type { Reaction, ReactionInsert } from '@collab/shared'

interface UseReactionsOptions {
  documentId?: string
  whiteboardId?: string
}

export function useReactions(opts: UseReactionsOptions = {}) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const invalidateComments = () => {
    if (opts.documentId) {
      queryClient.invalidateQueries({ queryKey: ['comments', 'document', opts.documentId] })
    } else if (opts.whiteboardId) {
      queryClient.invalidateQueries({ queryKey: ['comments', 'whiteboard', opts.whiteboardId] })
    } else {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    }
  }

  const add = useMutation({
    mutationFn: async (reaction: ReactionInsert): Promise<Reaction> => {
      const { data, error } = await supabase
        .from('reactions')
        .insert(reaction)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: invalidateComments,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidateComments,
  })

  const toggle = useMutation({
    mutationFn: async ({ commentId, userId, emoji }: { commentId: string; userId: string; emoji: string }): Promise<Reaction | null> => {
      const { data: existing } = await supabase
        .from('reactions')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .eq('emoji', emoji)
        .maybeSingle()

      if (existing) {
        const { error } = await supabase.from('reactions').delete().eq('id', existing.id)
        if (error) throw error
        return null
      }

      const { data, error } = await supabase
        .from('reactions')
        .insert({ comment_id: commentId, user_id: userId, emoji })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: invalidateComments,
  })

  return { add, remove, toggle }
}
