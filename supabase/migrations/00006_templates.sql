-- 00006_templates.sql
-- Templates system for documents, whiteboards, and workspaces

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('document', 'whiteboard', 'workspace')),
  category VARCHAR(100),
  content JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE template_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_created_by ON templates(created_by);
CREATE INDEX idx_templates_is_public ON templates(is_public);
CREATE INDEX idx_template_usage_template_id ON template_usage(template_id);
CREATE INDEX idx_template_usage_user_id ON template_usage(user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER set_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;

-- Templates: public templates visible to all, private only to creator
CREATE POLICY "Public templates are viewable by everyone"
  ON templates FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  USING (auth.uid() = created_by);

-- Template usage: users can see and create their own usage records
CREATE POLICY "Users can view own template usage"
  ON template_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can record template usage"
  ON template_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);
