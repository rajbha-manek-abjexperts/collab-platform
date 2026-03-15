export type Tool = 'select' | 'hand' | 'pen' | 'eraser' | 'rectangle' | 'ellipse' | 'line' | 'text'

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
