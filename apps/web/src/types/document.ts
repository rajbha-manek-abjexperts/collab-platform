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
