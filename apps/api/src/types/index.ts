// Workspace types
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

// Document types
export interface DocumentContent {
  html: string
  plainText: string
}

export interface Document {
  id: string
  workspace_id: string
  title: string
  content: DocumentContent | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  snapshot: DocumentContent
  created_by: string
  created_at: string
}

// Whiteboard types
export interface Point {
  x: number
  y: number
}

export interface DrawElement {
  id: string
  type: 'pen' | 'rectangle' | 'ellipse' | 'line' | 'text'
  points: Point[]
  color: string
  strokeWidth: number
  text?: string
}

export interface WhiteboardState {
  elements: DrawElement[]
  zoom: number
  panOffset: Point
}

export interface WhiteboardSession {
  id: string
  workspace_id: string
  title: string
  canvas_data: WhiteboardState | null
  created_by: string
  created_at: string
  updated_at: string
}

// Comment types
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

// WebSocket event types
export interface CursorPosition {
  user_id: string
  x: number
  y: number
  room_id: string
}

export interface RealtimeEvent {
  type: 'cursor_move' | 'document_update' | 'whiteboard_update' | 'user_joined' | 'user_left'
  room_id: string
  user_id: string
  payload: unknown
}
