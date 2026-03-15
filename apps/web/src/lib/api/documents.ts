import { authFetch } from '@/lib/api'
import type {
  Document,
  Comment,
  Version,
} from '@collab-platform/shared'

// Local type aliases for insert/update patterns
type DocumentInsert = Omit<Document, 'id' | 'created_at' | 'updated_at'>
type DocumentUpdate = Partial<Pick<Document, 'title' | 'content' | 'type'>> & { is_archived?: boolean }
interface DocumentWithVersions extends Document {
  versions?: Version[]
}
type CommentInsert = Omit<Comment, 'id' | 'created_at' | 'updated_at'>
type CommentUpdate = Partial<Pick<Comment, 'content' | 'resolved'>>
interface CommentWithUser extends Comment {
  user?: { id: string; email: string; full_name: string | null; avatar_url: string | null }
}
type VersionInsert = Omit<Version, 'id' | 'created_at'>

// ---- Documents ----

export async function listDocuments(workspaceId: string): Promise<Document[]> {
  return authFetch<Document[]>(`/api/workspaces/${workspaceId}/documents`)
}

export async function getDocument(workspaceId: string, id: string): Promise<DocumentWithVersions> {
  return authFetch<DocumentWithVersions>(`/api/workspaces/${workspaceId}/documents/${id}`)
}

export async function createDocument(workspaceId: string, doc: Omit<DocumentInsert, 'workspace_id'>): Promise<Document> {
  return authFetch<Document>(`/api/workspaces/${workspaceId}/documents`, {
    method: 'POST',
    body: JSON.stringify(doc),
  })
}

export async function updateDocument(workspaceId: string, id: string, updates: DocumentUpdate): Promise<Document> {
  return authFetch<Document>(`/api/workspaces/${workspaceId}/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export async function archiveDocument(workspaceId: string, id: string): Promise<Document> {
  return updateDocument(workspaceId, id, { is_archived: true })
}

export async function deleteDocument(workspaceId: string, id: string): Promise<void> {
  await authFetch(`/api/workspaces/${workspaceId}/documents/${id}`, {
    method: 'DELETE',
  })
}

// ---- Document Comments ----

export async function listDocumentComments(documentId: string): Promise<CommentWithUser[]> {
  return authFetch<CommentWithUser[]>(`/api/documents/${documentId}/comments`)
}

export async function createComment(documentId: string, comment: Omit<CommentInsert, 'document_id'>): Promise<CommentWithUser> {
  return authFetch<CommentWithUser>(`/api/documents/${documentId}/comments`, {
    method: 'POST',
    body: JSON.stringify(comment),
  })
}

export async function updateComment(id: string, updates: CommentUpdate): Promise<CommentWithUser> {
  return authFetch<CommentWithUser>(`/api/comments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export async function deleteComment(id: string): Promise<void> {
  await authFetch(`/api/comments/${id}`, {
    method: 'DELETE',
  })
}

// ---- Document Versions ----

export async function createDocumentVersion(documentId: string, version: Omit<VersionInsert, 'document_id'>): Promise<Version> {
  return authFetch<Version>(`/api/documents/${documentId}/versions`, {
    method: 'POST',
    body: JSON.stringify(version),
  })
}

export async function listDocumentVersions(documentId: string): Promise<Version[]> {
  return authFetch<Version[]>(`/api/documents/${documentId}/versions`)
}
