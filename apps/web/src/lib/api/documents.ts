import { getClient, unwrap } from '@/lib/api'
import type {
  Document,
  DocumentInsert,
  DocumentUpdate,
  DocumentWithVersions,
  CommentInsert,
  CommentUpdate,
  CommentWithUser,
  VersionInsert,
  Version,
} from '@collab/shared'

// ---- Documents ----

export async function listDocuments(workspaceId: string): Promise<Document[]> {
  const supabase = getClient()
  const response = await supabase
    .from('documents')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
  return unwrap(response)
}

export async function getDocument(id: string): Promise<DocumentWithVersions> {
  const supabase = getClient()
  const response = await supabase
    .from('documents')
    .select(`
      *,
      versions(*)
    `)
    .eq('id', id)
    .order('version_number', { referencedTable: 'versions', ascending: false })
    .single()
  return unwrap(response) as unknown as DocumentWithVersions
}

export async function createDocument(doc: DocumentInsert): Promise<Document> {
  const supabase = getClient()
  const response = await supabase
    .from('documents')
    .insert(doc)
    .select()
    .single()
  return unwrap(response)
}

export async function updateDocument(id: string, updates: DocumentUpdate): Promise<Document> {
  const supabase = getClient()
  const response = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return unwrap(response)
}

export async function archiveDocument(id: string): Promise<Document> {
  return updateDocument(id, { is_archived: true })
}

export async function deleteDocument(id: string): Promise<void> {
  const supabase = getClient()
  const response = await supabase.from('documents').delete().eq('id', id)
  unwrap(response)
}

// ---- Document Comments ----

export async function listDocumentComments(documentId: string): Promise<CommentWithUser[]> {
  const supabase = getClient()
  const response = await supabase
    .from('comments')
    .select(`
      *,
      user:user_id(id, email, full_name, avatar_url, created_at, updated_at),
      reactions(*)
    `)
    .eq('document_id', documentId)
    .is('parent_id', null)
    .order('created_at', { ascending: true })
  return unwrap(response) as unknown as CommentWithUser[]
}

export async function createComment(comment: CommentInsert): Promise<CommentWithUser> {
  const supabase = getClient()
  const response = await supabase
    .from('comments')
    .insert(comment)
    .select(`
      *,
      user:user_id(id, email, full_name, avatar_url, created_at, updated_at),
      reactions(*)
    `)
    .single()
  return unwrap(response) as unknown as CommentWithUser
}

export async function updateComment(id: string, updates: CommentUpdate): Promise<CommentWithUser> {
  const supabase = getClient()
  const response = await supabase
    .from('comments')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      user:user_id(id, email, full_name, avatar_url, created_at, updated_at),
      reactions(*)
    `)
    .single()
  return unwrap(response) as unknown as CommentWithUser
}

export async function deleteComment(id: string): Promise<void> {
  const supabase = getClient()
  const response = await supabase.from('comments').delete().eq('id', id)
  unwrap(response)
}

// ---- Document Versions ----

export async function createDocumentVersion(version: VersionInsert): Promise<Version> {
  const supabase = getClient()
  const response = await supabase
    .from('versions')
    .insert(version)
    .select()
    .single()
  return unwrap(response)
}

export async function listDocumentVersions(documentId: string): Promise<Version[]> {
  const supabase = getClient()
  const response = await supabase
    .from('versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false })
  return unwrap(response)
}
