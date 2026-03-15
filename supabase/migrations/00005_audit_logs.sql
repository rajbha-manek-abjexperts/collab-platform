-- Audit logs for enterprise security tracking
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  workspace_id UUID REFERENCES workspaces(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_workspace ON audit_logs(workspace_id, created_at);
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);

-- RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Workspace admins and owners can view audit logs
CREATE POLICY "Workspace admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
  );

-- Service role can insert audit logs (via API)
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);
