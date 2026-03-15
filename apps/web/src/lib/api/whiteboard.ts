import { getClient, unwrap } from '@/lib/api'
import type {
  WhiteboardSession,
  WhiteboardSessionInsert,
  WhiteboardSessionUpdate,
  WhiteboardSessionWithVersions,
  CommentInsert,
  CommentUpdate,
  CommentWithUser,
  VersionInsert,
  Version,
} from '@collab/shared'

// ---- Whiteboard Sessions ----

export async function listWhiteboards(workspaceId: string): Promise<WhiteboardSession[]> {
  const supabase = getClient()
  const response = await supabase
    .from('whiteboard_sessions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
  return unwrap(response)
}

export async function getWhiteboard(id: string): Promise<WhiteboardSessionWithVersions> {
  const supabase = getClient()
  const response = await supabase
    .from('whiteboard_sessions')
    .select(`
      *,
      versions(*)
    `)
    .eq('id', id)
    .order('version_number', { referencedTable: 'versions', ascending: false })
    .single()
  return unwrap(response) as unknown as WhiteboardSessionWithVersions
}

export async function createWhiteboard(session: WhiteboardSessionInsert): Promise<WhiteboardSession> {
  const supabase = getClient()
  const response = await supabase
    .from('whiteboard_sessions')
    .insert(session)
    .select()
    .single()
  return unwrap(response)
}

export async function updateWhiteboard(
  id: string,
  updates: WhiteboardSessionUpdate
): Promise<WhiteboardSession> {
  const supabase = getClient()
  const response = await supabase
    .from('whiteboard_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return unwrap(response)
}

export async function archiveWhiteboard(id: string): Promise<WhiteboardSession> {
  return updateWhiteboard(id, { is_archived: true })
}

export async function deleteWhiteboard(id: string): Promise<void> {
  const supabase = getClient()
  const response = await supabase.from('whiteboard_sessions').delete().eq('id', id)
  unwrap(response)
}

// ---- Whiteboard Comments ----

export async function listWhiteboardComments(whiteboardId: string): Promise<CommentWithUser[]> {
  const supabase = getClient()
  const response = await supabase
    .from('comments')
    .select(`
      *,
      user:user_id(id, email, full_name, avatar_url, created_at, updated_at),
      reactions(*)
    `)
    .eq('whiteboard_id', whiteboardId)
    .is('parent_id', null)
    .order('created_at', { ascending: true })
  return unwrap(response) as unknown as CommentWithUser[]
}

export async function createWhiteboardComment(comment: CommentInsert): Promise<CommentWithUser> {
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

export async function updateWhiteboardComment(
  id: string,
  updates: CommentUpdate
): Promise<CommentWithUser> {
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

export async function deleteWhiteboardComment(id: string): Promise<void> {
  const supabase = getClient()
  const response = await supabase.from('comments').delete().eq('id', id)
  unwrap(response)
}

// ---- Whiteboard Versions ----

export async function createWhiteboardVersion(version: VersionInsert): Promise<Version> {
  const supabase = getClient()
  const response = await supabase
    .from('versions')
    .insert(version)
    .select()
    .single()
  return unwrap(response)
}

export async function listWhiteboardVersions(whiteboardId: string): Promise<Version[]> {
  const supabase = getClient()
  const response = await supabase
    .from('versions')
    .select('*')
    .eq('whiteboard_id', whiteboardId)
    .order('version_number', { ascending: false })
  return unwrap(response)
}
