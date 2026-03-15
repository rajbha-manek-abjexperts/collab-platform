import { getClient, unwrap } from '@/lib/api'
import type {
  Workspace,
  WorkspaceInsert,
  WorkspaceUpdate,
  WorkspaceWithMembers,
  WorkspaceMemberInsert,
  WorkspaceRole,
  WorkspaceMember,
} from '@collab/shared'

// ---- Workspaces ----

export async function listWorkspaces(): Promise<Workspace[]> {
  const supabase = getClient()
  const response = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false })
  return unwrap(response)
}

export async function getWorkspace(id: string): Promise<WorkspaceWithMembers> {
  const supabase = getClient()
  const response = await supabase
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
    .eq('id', id)
    .single()
  return unwrap(response) as unknown as WorkspaceWithMembers
}

export async function createWorkspace(workspace: WorkspaceInsert): Promise<Workspace> {
  const supabase = getClient()
  const response = await supabase
    .from('workspaces')
    .insert(workspace)
    .select()
    .single()
  return unwrap(response)
}

export async function updateWorkspace(id: string, updates: WorkspaceUpdate): Promise<Workspace> {
  const supabase = getClient()
  const response = await supabase
    .from('workspaces')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return unwrap(response)
}

export async function deleteWorkspace(id: string): Promise<void> {
  const supabase = getClient()
  const response = await supabase.from('workspaces').delete().eq('id', id)
  unwrap(response)
}

// ---- Workspace Members ----

export async function addWorkspaceMember(member: WorkspaceMemberInsert): Promise<WorkspaceMember> {
  const supabase = getClient()
  const response = await supabase
    .from('workspace_members')
    .insert(member)
    .select()
    .single()
  return unwrap(response)
}

export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole
): Promise<WorkspaceMember> {
  const supabase = getClient()
  const response = await supabase
    .from('workspace_members')
    .update({ role })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .select()
    .single()
  return unwrap(response)
}

export async function removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
  const supabase = getClient()
  const response = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
  unwrap(response)
}
