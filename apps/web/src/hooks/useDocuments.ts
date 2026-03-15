'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import type {
  Document,
  DocumentInsert,
  DocumentUpdate,
  DocumentWithVersions,
} from '@collab/shared'

const DOCUMENTS_KEY = ['documents'] as const

export function useDocuments(workspaceId: string | undefined) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const list = useQuery({
    queryKey: [...DOCUMENTS_KEY, workspaceId],
    queryFn: async (): Promise<Document[]> => {
      const { data, error } = await supabase
        .from('documents')
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
    mutationFn: async (doc: DocumentInsert): Promise<Document> => {
      const { data, error } = await supabase
        .from('documents')
        .insert(doc)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DOCUMENTS_KEY, workspaceId] })
    },
  })

  const update = useMutation({
    mutationFn: async ({ id, ...updates }: DocumentUpdate & { id: string }): Promise<Document> => {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [...DOCUMENTS_KEY, workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['document', data.id] })
    },
  })

  const archive = useMutation({
    mutationFn: async (id: string): Promise<Document> => {
      const { data, error } = await supabase
        .from('documents')
        .update({ is_archived: true })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DOCUMENTS_KEY, workspaceId] })
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('documents').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DOCUMENTS_KEY, workspaceId] })
    },
  })

  return { list, create, update, archive, remove }
}

export function useDocument(id: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['document', id],
    queryFn: async (): Promise<DocumentWithVersions> => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          versions(*)
        `)
        .eq('id', id!)
        .order('version_number', { referencedTable: 'versions', ascending: false })
        .single()
      if (error) throw error
      return data as unknown as DocumentWithVersions
    },
    enabled: !!id,
  })
}
