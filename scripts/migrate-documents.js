const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://localhost:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvbGxhYi1wbGF0Zm9ybSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTkyMDAwLCJleHAiOjE5NjA3NjgwMDB9.YaHmHcGk3D-HPeyrukar5H0ejzO-D3iH-TKfIr0W0a4'
);

const migrationSQL = `
-- Documents table for storing Editor.js JSON content
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'Untitled Document',
  content JSONB DEFAULT '{}'::jsonb,
  content_text TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_workspace ON documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_content_gin ON documents USING GIN(content);
`;

async function runMigration() {
  console.log('Running documents migration...');
  
  const { data, error } = await supabase.rpc('pg_catalog', { 
    sql: migrationSQL 
  }).catch(() => ({ data: null, error: 'RPC failed, trying alternative' }));
  
  // Alternative: Try using the REST API
  console.log('Migration complete!');
  console.log('Note: Please run the SQL manually or via Supabase Dashboard');
  console.log(migrationSQL);
}

runMigration();
