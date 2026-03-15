import { authFetch } from '@/lib/api'

export interface WhiteboardSession {
  id: string
  workspace_id: string
  title: string
  canvas_data: Record<string, unknown>
  canvas_state?: Record<string, unknown>
  created_by: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface WhiteboardSessionWithVersions extends WhiteboardSession {
  versions?: Version[]
}

export interface Version {
  id: string
  whiteboard_id?: string
  snapshot: Record<string, unknown>
  label?: string
  created_by: string
  created_at: string
}

export interface Comment {
  id: string
  document_id?: string
  whiteboard_id?: string
  user_id: string
  content: string
  position?: Record<string, unknown>
  resolved?: boolean
  created_at: string
  updated_at: string
}

export interface CommentWithUser extends Comment {
  user?: { id: string; email: string; full_name: string | null; avatar_url: string | null }
}

type WhiteboardSessionUpdate = Partial<Pick<WhiteboardSession, 'title' | 'canvas_data' | 'canvas_state'>> & {
  is_archived?: boolean
}

// ---- Whiteboard Sessions ----

export async function listWhiteboards(workspaceId: string): Promise<WhiteboardSession[]> {
  return authFetch<WhiteboardSession[]>(`/api/workspaces/${workspaceId}/whiteboards`)
}

export async function getWhiteboard(
  workspaceId: string,
  id: string,
): Promise<WhiteboardSessionWithVersions> {
  return authFetch<WhiteboardSessionWithVersions>(
    `/api/workspaces/${workspaceId}/whiteboards/${id}`,
  )
}

export async function createWhiteboard(
  workspaceId: string,
  session: { title: string; canvas_data?: Record<string, unknown> },
): Promise<WhiteboardSession> {
  return authFetch<WhiteboardSession>(`/api/workspaces/${workspaceId}/whiteboards`, {
    method: 'POST',
    body: JSON.stringify(session),
  })
}

export async function updateWhiteboard(
  workspaceId: string,
  id: string,
  updates: WhiteboardSessionUpdate,
): Promise<WhiteboardSession> {
  return authFetch<WhiteboardSession>(`/api/workspaces/${workspaceId}/whiteboards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export async function archiveWhiteboard(
  workspaceId: string,
  id: string,
): Promise<WhiteboardSession> {
  return updateWhiteboard(workspaceId, id, { is_archived: true })
}

export async function deleteWhiteboard(workspaceId: string, id: string): Promise<void> {
  await authFetch(`/api/workspaces/${workspaceId}/whiteboards/${id}`, {
    method: 'DELETE',
  })
}

// ---- Whiteboard Comments ----

export async function listWhiteboardComments(whiteboardId: string): Promise<CommentWithUser[]> {
  return authFetch<CommentWithUser[]>(`/api/whiteboards/${whiteboardId}/comments`)
}

export async function createWhiteboardComment(
  whiteboardId: string,
  comment: { content: string; position?: Record<string, unknown> },
): Promise<CommentWithUser> {
  return authFetch<CommentWithUser>(`/api/whiteboards/${whiteboardId}/comments`, {
    method: 'POST',
    body: JSON.stringify(comment),
  })
}

export async function updateWhiteboardComment(
  id: string,
  updates: { content?: string; resolved?: boolean },
): Promise<CommentWithUser> {
  return authFetch<CommentWithUser>(`/api/comments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export async function deleteWhiteboardComment(id: string): Promise<void> {
  await authFetch(`/api/comments/${id}`, {
    method: 'DELETE',
  })
}

// ---- Whiteboard Versions ----

export async function createWhiteboardVersion(
  whiteboardId: string,
  version: { snapshot: Record<string, unknown>; label?: string },
): Promise<Version> {
  return authFetch<Version>(`/api/whiteboards/${whiteboardId}/versions`, {
    method: 'POST',
    body: JSON.stringify(version),
  })
}

export async function listWhiteboardVersions(whiteboardId: string): Promise<Version[]> {
  return authFetch<Version[]>(`/api/whiteboards/${whiteboardId}/versions`)
}
