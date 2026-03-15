-- Search index for full-text search across resources
CREATE TABLE search_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  searchable_content TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GIN index for fast full-text search
CREATE INDEX idx_search_content ON search_index USING GIN(searchable_content);

-- Index for filtering by workspace and resource type
CREATE INDEX idx_search_workspace ON search_index(workspace_id);
CREATE INDEX idx_search_resource ON search_index(resource_type, resource_id);

-- Auto-generate tsvector from title and content
CREATE OR REPLACE FUNCTION search_index_update_tsvector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.searchable_content :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER search_index_tsvector_trigger
  BEFORE INSERT OR UPDATE ON search_index
  FOR EACH ROW
  EXECUTE FUNCTION search_index_update_tsvector();

-- Updated at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;

-- Users can search within workspaces they belong to
CREATE POLICY "Users can search within their workspaces"
  ON search_index FOR SELECT
  USING (
    workspace_id IN (
      SELECT w.id FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE wm.user_id = auth.uid()
    )
  );

-- Users can insert search entries for their workspaces
CREATE POLICY "Users can insert search entries"
  ON search_index FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT w.id FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE wm.user_id = auth.uid()
    )
  );

-- Users can update their own search entries
CREATE POLICY "Users can update own search entries"
  ON search_index FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own search entries
CREATE POLICY "Users can delete own search entries"
  ON search_index FOR DELETE
  USING (user_id = auth.uid());

-- Unique constraint for upsert logic
CREATE UNIQUE INDEX idx_search_resource_unique ON search_index(resource_type, resource_id);

-- Auto-index documents on insert/update
CREATE OR REPLACE FUNCTION index_document_for_search()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO search_index (workspace_id, user_id, resource_type, resource_id, title, content)
  VALUES (NEW.workspace_id, NEW.created_by, NEW.type, NEW.id, NEW.title, NEW.content)
  ON CONFLICT (resource_type, resource_id) DO UPDATE
  SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER index_document_search
  AFTER INSERT OR UPDATE OF title, content ON documents
  FOR EACH ROW
  EXECUTE FUNCTION index_document_for_search();

-- Clean up search index when documents are deleted
CREATE OR REPLACE FUNCTION remove_document_from_search()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM search_index WHERE resource_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER remove_document_search
  AFTER DELETE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION remove_document_from_search();
