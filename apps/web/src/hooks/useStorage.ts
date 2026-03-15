'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'

const FILES_KEY = ['files'] as const

interface FileAttachment {
  id: string
  workspace_id: string
  user_id: string
  document_id: string | null
  whiteboard_id: string | null
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  url?: string
}

export function useStorage(workspaceId: string | undefined) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const list = useQuery({
    queryKey: [...FILES_KEY, workspaceId],
    queryFn: async (): Promise<FileAttachment[]> => {
      const { data, error } = await supabase
        .from('file_attachments')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!workspaceId,
  })

  const upload = useMutation({
    mutationFn: async ({
      file,
      documentId,
      whiteboardId,
    }: {
      file: File
      documentId?: string
      whiteboardId?: string
    }): Promise<FileAttachment> => {
      const storagePath = `${workspaceId}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('workspace-files')
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('workspace-files')
        .getPublicUrl(storagePath)

      const { data, error } = await supabase
        .from('file_attachments')
        .insert({
          workspace_id: workspaceId!,
          user_id: (await supabase.auth.getUser()).data.user!.id,
          document_id: documentId || null,
          whiteboard_id: whiteboardId || null,
          storage_path: storagePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single()
      if (error) throw error

      return { ...data, url: urlData.publicUrl }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...FILES_KEY, workspaceId] })
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { data: attachment, error: findError } = await supabase
        .from('file_attachments')
        .select('storage_path')
        .eq('id', id)
        .single()
      if (findError) throw findError

      const { error: storageError } = await supabase.storage
        .from('workspace-files')
        .remove([attachment.storage_path])
      if (storageError) throw storageError

      const { error } = await supabase
        .from('file_attachments')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...FILES_KEY, workspaceId] })
    },
  })

  return { list, upload, remove }
}
