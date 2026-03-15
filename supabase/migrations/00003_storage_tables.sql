-- 00003_storage_tables.sql
-- File attachments with Supabase Storage

-- ============================================================
-- STORAGE BUCKETS (Supabase built-in storage)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workspace-files',
  'workspace-files',
  true,
  52428800, -- 50MB
  ARRAY[
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv', 'text/markdown',
    'application/zip', 'application/json'
  ]
);

-- ============================================================
-- FILE ATTACHMENTS METADATA TABLE
-- ============================================================

CREATE TABLE file_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  whiteboard_id UUID REFERENCES whiteboard_sessions(id) ON DELETE SET NULL,
  bucket_id TEXT NOT NULL DEFAULT 'workspace-files',
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_file_attachments_workspace ON file_attachments(workspace_id);
CREATE INDEX idx_file_attachments_user ON file_attachments(user_id);
CREATE INDEX idx_file_attachments_document ON file_attachments(document_id);
CREATE INDEX idx_file_attachments_whiteboard ON file_attachments(whiteboard_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE TRIGGER trg_file_attachments_updated_at
  BEFORE UPDATE ON file_attachments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY file_attachments_select ON file_attachments
  FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY file_attachments_insert ON file_attachments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND is_workspace_member(workspace_id, auth.uid())
    AND get_workspace_role(workspace_id, auth.uid()) != 'viewer'
  );

CREATE POLICY file_attachments_update ON file_attachments
  FOR UPDATE USING (
    user_id = auth.uid()
    OR get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
  );

CREATE POLICY file_attachments_delete ON file_attachments
  FOR DELETE USING (
    user_id = auth.uid()
    OR get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
  );

-- ============================================================
-- STORAGE POLICIES (for Supabase Storage RLS)
-- ============================================================

CREATE POLICY storage_objects_select ON storage.objects
  FOR SELECT USING (bucket_id = 'workspace-files');

CREATE POLICY storage_objects_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'workspace-files'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY storage_objects_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'workspace-files'
    AND auth.uid() IS NOT NULL
  );
