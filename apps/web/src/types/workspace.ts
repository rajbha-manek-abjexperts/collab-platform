export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface Workspace {
  id: string
  name: string
  slug: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: MemberRole
  joined_at: string
}

export interface Comment {
  id: string
  content: string
  entity_type: 'document' | 'whiteboard'
  entity_id: string
  parent_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Reaction {
  id: string
  comment_id: string
  emoji: string
  user_id: string
  created_at: string
}
