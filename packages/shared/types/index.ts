// ============================================================
// Shared Type Definitions for Collab Platform
// ============================================================

// ---- Enums & Literal Types ----

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

// ---- Core Entities ----

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  description: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
}

export interface Document {
  id: string;
  workspace_id: string;
  title: string;
  content: Record<string, unknown>;
  created_by: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhiteboardSession {
  id: string;
  workspace_id: string;
  title: string;
  canvas_data: Record<string, unknown>;
  created_by: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentPosition {
  x: number;
  y: number;
}

export interface Comment {
  id: string;
  document_id: string | null;
  whiteboard_id: string | null;
  user_id: string;
  content: string;
  position: CommentPosition | null;
  parent_id: string | null;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  id: string;
  comment_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Version {
  id: string;
  document_id: string | null;
  whiteboard_id: string | null;
  snapshot: Record<string, unknown>;
  created_by: string;
  version_number: number;
  label: string | null;
  created_at: string;
}

// ---- Insert Types (for creating new records) ----

export interface WorkspaceInsert {
  name: string;
  slug: string;
  owner_id: string;
  description?: string | null;
  avatar_url?: string | null;
}

export interface WorkspaceMemberInsert {
  workspace_id: string;
  user_id: string;
  role?: WorkspaceRole;
}

export interface DocumentInsert {
  workspace_id: string;
  title?: string;
  content?: Record<string, unknown>;
  created_by: string;
}

export interface WhiteboardSessionInsert {
  workspace_id: string;
  title?: string;
  canvas_data?: Record<string, unknown>;
  created_by: string;
}

export interface CommentInsert {
  document_id?: string | null;
  whiteboard_id?: string | null;
  user_id: string;
  content: string;
  position?: CommentPosition | null;
  parent_id?: string | null;
}

export interface ReactionInsert {
  comment_id: string;
  user_id: string;
  emoji: string;
}

export interface VersionInsert {
  document_id?: string | null;
  whiteboard_id?: string | null;
  snapshot: Record<string, unknown>;
  created_by: string;
  version_number: number;
  label?: string | null;
}

// ---- Update Types (partial updates) ----

export interface WorkspaceUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  avatar_url?: string | null;
}

export interface DocumentUpdate {
  title?: string;
  content?: Record<string, unknown>;
  is_archived?: boolean;
}

export interface WhiteboardSessionUpdate {
  title?: string;
  canvas_data?: Record<string, unknown>;
  is_archived?: boolean;
}

export interface CommentUpdate {
  content?: string;
  is_resolved?: boolean;
}

// ---- Joined / Enriched Types ----

export interface WorkspaceWithMembers extends Workspace {
  members: (WorkspaceMember & { user: User })[];
}

export interface CommentWithUser extends Comment {
  user: User;
  reactions: Reaction[];
  replies?: CommentWithUser[];
}

export interface DocumentWithVersions extends Document {
  versions: Version[];
}

export interface WhiteboardSessionWithVersions extends WhiteboardSession {
  versions: Version[];
}
