// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Workspace Types
// ============================================

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
}

// ============================================
// Document Types
// ============================================

export type DocumentType = 'document' | 'whiteboard';

export interface Document {
  id: string;
  workspace_id: string;
  title: string;
  content: Record<string, unknown> | null;
  type: DocumentType;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Whiteboard Types
// ============================================

export interface WhiteboardSession {
  id: string;
  document_id: string;
  canvas_state: Record<string, unknown>;
  active_users: string[];
  created_at: string;
  updated_at: string;
}

// ============================================
// Comment Types
// ============================================

export interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Reaction Types
// ============================================

export type ReactionEmoji = '👍' | '👎' | '❤️' | '🎉' | '😄' | '😕' | '🚀' | '👀';

export interface Reaction {
  id: string;
  comment_id: string;
  user_id: string;
  emoji: ReactionEmoji;
  created_at: string;
}

// ============================================
// Version Types
// ============================================

export interface Version {
  id: string;
  document_id: string;
  version_number: number;
  content: Record<string, unknown>;
  created_by: string;
  change_summary: string | null;
  created_at: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}
