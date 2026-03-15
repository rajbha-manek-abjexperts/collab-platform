-- 00001_initial_schema.sql
-- Initial database schema for Collab Platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workspace members (junction table)
CREATE TABLE workspace_members (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Whiteboard sessions
CREATE TABLE whiteboard_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Whiteboard',
  canvas_data JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments (polymorphic: can be on documents or whiteboards)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  whiteboard_id UUID REFERENCES whiteboard_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position JSONB, -- {x, y} for whiteboard annotations
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- threaded replies
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT comment_target CHECK (
    (document_id IS NOT NULL AND whiteboard_id IS NULL) OR
    (document_id IS NULL AND whiteboard_id IS NOT NULL)
  )
);

-- Reactions
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id, emoji)
);

-- Versions (for documents and whiteboards)
CREATE TABLE versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  whiteboard_id UUID REFERENCES whiteboard_sessions(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT version_target CHECK (
    (document_id IS NOT NULL AND whiteboard_id IS NULL) OR
    (document_id IS NULL AND whiteboard_id IS NOT NULL)
  )
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_documents_workspace ON documents(workspace_id);
CREATE INDEX idx_whiteboard_sessions_workspace ON whiteboard_sessions(workspace_id);
CREATE INDEX idx_comments_document ON comments(document_id);
CREATE INDEX idx_comments_whiteboard ON comments(whiteboard_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_reactions_comment ON reactions(comment_id);
CREATE INDEX idx_versions_document ON versions(document_id);
CREATE INDEX idx_versions_whiteboard ON versions(whiteboard_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_whiteboard_sessions_updated_at
  BEFORE UPDATE ON whiteboard_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is a member of a workspace
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID, uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id AND user_id = uid
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check workspace role
CREATE OR REPLACE FUNCTION get_workspace_role(ws_id UUID, uid UUID)
RETURNS TEXT AS $$
  SELECT role FROM workspace_members
  WHERE workspace_id = ws_id AND user_id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- Workspaces policies ----
CREATE POLICY workspace_select ON workspaces
  FOR SELECT USING (is_workspace_member(id, auth.uid()));

CREATE POLICY workspace_insert ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY workspace_update ON workspaces
  FOR UPDATE USING (
    get_workspace_role(id, auth.uid()) IN ('owner', 'admin')
  );

CREATE POLICY workspace_delete ON workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- ---- Workspace members policies ----
CREATE POLICY members_select ON workspace_members
  FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY members_insert ON workspace_members
  FOR INSERT WITH CHECK (
    get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
  );

CREATE POLICY members_update ON workspace_members
  FOR UPDATE USING (
    get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
  );

CREATE POLICY members_delete ON workspace_members
  FOR DELETE USING (
    get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
    OR user_id = auth.uid() -- members can leave
  );

-- ---- Documents policies ----
CREATE POLICY documents_select ON documents
  FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY documents_insert ON documents
  FOR INSERT WITH CHECK (
    is_workspace_member(workspace_id, auth.uid())
    AND get_workspace_role(workspace_id, auth.uid()) != 'viewer'
  );

CREATE POLICY documents_update ON documents
  FOR UPDATE USING (
    is_workspace_member(workspace_id, auth.uid())
    AND get_workspace_role(workspace_id, auth.uid()) != 'viewer'
  );

CREATE POLICY documents_delete ON documents
  FOR DELETE USING (
    created_by = auth.uid()
    OR get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
  );

-- ---- Whiteboard sessions policies ----
CREATE POLICY whiteboards_select ON whiteboard_sessions
  FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY whiteboards_insert ON whiteboard_sessions
  FOR INSERT WITH CHECK (
    is_workspace_member(workspace_id, auth.uid())
    AND get_workspace_role(workspace_id, auth.uid()) != 'viewer'
  );

CREATE POLICY whiteboards_update ON whiteboard_sessions
  FOR UPDATE USING (
    is_workspace_member(workspace_id, auth.uid())
    AND get_workspace_role(workspace_id, auth.uid()) != 'viewer'
  );

CREATE POLICY whiteboards_delete ON whiteboard_sessions
  FOR DELETE USING (
    created_by = auth.uid()
    OR get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
  );

-- ---- Comments policies ----
CREATE POLICY comments_select ON comments
  FOR SELECT USING (
    (document_id IS NOT NULL AND is_workspace_member(
      (SELECT workspace_id FROM documents WHERE id = document_id), auth.uid()
    ))
    OR
    (whiteboard_id IS NOT NULL AND is_workspace_member(
      (SELECT workspace_id FROM whiteboard_sessions WHERE id = whiteboard_id), auth.uid()
    ))
  );

CREATE POLICY comments_insert ON comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY comments_update ON comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY comments_delete ON comments
  FOR DELETE USING (user_id = auth.uid());

-- ---- Reactions policies ----
CREATE POLICY reactions_select ON reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM comments c
      WHERE c.id = comment_id
    )
  );

CREATE POLICY reactions_insert ON reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY reactions_delete ON reactions
  FOR DELETE USING (user_id = auth.uid());

-- ---- Versions policies ----
CREATE POLICY versions_select ON versions
  FOR SELECT USING (
    (document_id IS NOT NULL AND is_workspace_member(
      (SELECT workspace_id FROM documents WHERE id = document_id), auth.uid()
    ))
    OR
    (whiteboard_id IS NOT NULL AND is_workspace_member(
      (SELECT workspace_id FROM whiteboard_sessions WHERE id = whiteboard_id), auth.uid()
    ))
  );

CREATE POLICY versions_insert ON versions
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- ============================================================
-- AUTO-ADD OWNER AS MEMBER ON WORKSPACE CREATION
-- ============================================================

CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_workspace_add_owner
  AFTER INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION add_owner_as_member();
