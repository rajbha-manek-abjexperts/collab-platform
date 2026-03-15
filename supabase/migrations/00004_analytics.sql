-- Analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX idx_analytics_workspace ON analytics_events(workspace_id, created_at);
CREATE INDEX idx_analytics_user ON analytics_events(user_id, created_at);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: workspace members can view analytics for their workspaces
CREATE POLICY "Workspace members can view analytics"
  ON analytics_events FOR SELECT
  USING (is_workspace_member(workspace_id));

-- Policy: authenticated users can insert analytics events
CREATE POLICY "Authenticated users can insert analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
