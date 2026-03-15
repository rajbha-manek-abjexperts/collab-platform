import { authFetch } from '@/lib/api'
import type {
  Workspace,
  WorkspaceRole,
  WorkspaceMember,
} from '@collab-platform/shared'

// Local type aliases
type WorkspaceInsert = Omit<Workspace, 'id' | 'created_at' | 'updated_at'>
type WorkspaceUpdate = Partial<Pick<Workspace, 'name' | 'slug' | 'description'>>
interface WorkspaceWithMembers extends Workspace {
  members?: WorkspaceMember[]
}
type WorkspaceMemberInsert = Omit<WorkspaceMember, 'id' | 'joined_at'>

// ---- Workspaces ----

export async function listWorkspaces(): Promise<Workspace[]> {
  return authFetch<Workspace[]>('/api/workspaces')
}

export async function getWorkspace(id: string): Promise<WorkspaceWithMembers> {
  return authFetch<WorkspaceWithMembers>(`/api/workspaces/${id}`)
}

export async function createWorkspace(workspace: WorkspaceInsert): Promise<Workspace> {
  return authFetch<Workspace>('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify(workspace),
  })
}

export async function updateWorkspace(id: string, updates: WorkspaceUpdate): Promise<Workspace> {
  return authFetch<Workspace>(`/api/workspaces/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export async function deleteWorkspace(id: string): Promise<void> {
  await authFetch(`/api/workspaces/${id}`, {
    method: 'DELETE',
  })
}

// ---- Workspace Members ----

export async function addWorkspaceMember(workspaceId: string, member: Omit<WorkspaceMemberInsert, 'workspace_id'>): Promise<WorkspaceMember> {
  return authFetch<WorkspaceMember>(`/api/workspaces/${workspaceId}/members`, {
    method: 'POST',
    body: JSON.stringify(member),
  })
}

export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole
): Promise<WorkspaceMember> {
  // Remove and re-add with new role (no dedicated update endpoint)
  await removeWorkspaceMember(workspaceId, userId)
  return addWorkspaceMember(workspaceId, { user_id: userId, role })
}

export async function removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
  await authFetch(`/api/workspaces/${workspaceId}/members/${userId}`, {
    method: 'DELETE',
  })
}
