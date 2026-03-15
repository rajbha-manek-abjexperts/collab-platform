-- Shared Links system
-- Allows users to create public/password-protected share links for documents and whiteboards

CREATE TABLE shared_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  password_protected BOOLEAN DEFAULT false,
  password_hash VARCHAR(255),
  expires_at TIMESTAMP,
  max_views INTEGER,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_resource_type CHECK (resource_type IN ('document', 'whiteboard'))
);

-- Indexes
CREATE INDEX idx_shared_links_slug ON shared_links(slug);
CREATE INDEX idx_shared_links_resource ON shared_links(resource_type, resource_id);
CREATE INDEX idx_shared_links_created_by ON shared_links(created_by);

-- Updated_at trigger
CREATE TRIGGER set_shared_links_updated_at
  BEFORE UPDATE ON shared_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shared links"
  ON shared_links FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can create shared links for resources in their workspaces"
  ON shared_links FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND (
      (resource_type = 'document' AND resource_id IN (
        SELECT d.id FROM documents d
        JOIN workspace_members wm ON wm.workspace_id = d.workspace_id
        WHERE wm.user_id = auth.uid()
      ))
      OR
      (resource_type = 'whiteboard' AND resource_id IN (
        SELECT ws.id FROM whiteboard_sessions ws
        JOIN workspace_members wm ON wm.workspace_id = ws.workspace_id
        WHERE wm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can update their own shared links"
  ON shared_links FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own shared links"
  ON shared_links FOR DELETE
  USING (created_by = auth.uid());

-- Public access policy (for anonymous slug lookups via service role)
-- The API will use the service role key to look up shared links by slug
