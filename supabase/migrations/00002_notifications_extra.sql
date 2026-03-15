-- ============================================================
-- Migration: Email Notifications System
-- ============================================================

-- Notification preferences per user per type
CREATE TABLE notification_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Email templates for each notification type
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body_html TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email send log for tracking and debugging
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  template_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notification_types_user ON notification_types(user_id);
CREATE INDEX idx_email_log_user ON email_log(user_id);
CREATE INDEX idx_email_log_status ON email_log(status);

-- RLS policies
ALTER TABLE notification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Users can manage their own notification preferences
CREATE POLICY "Users manage own notification preferences"
  ON notification_types FOR ALL
  USING (auth.uid() = user_id);

-- Email templates are readable by authenticated users
CREATE POLICY "Authenticated users can read email templates"
  ON email_templates FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can view their own email log
CREATE POLICY "Users view own email log"
  ON email_log FOR SELECT
  USING (auth.uid() = user_id);

-- Seed default email templates
INSERT INTO email_templates (type, subject, body_html) VALUES
(
  'welcome',
  'Welcome to Collab Platform!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #4F46E5;">Welcome to Collab Platform!</h1>
    <p>Hi {{user_name}},</p>
    <p>Thanks for joining Collab Platform. You''re all set to start collaborating with your team.</p>
    <p>Get started by creating your first workspace or joining an existing one.</p>
    <a href="{{app_url}}/dashboard" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
  </div>'
),
(
  'password_reset',
  'Reset Your Password',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #4F46E5;">Password Reset</h1>
    <p>Hi {{user_name}},</p>
    <p>We received a request to reset your password. Click the button below to set a new password.</p>
    <a href="{{reset_url}}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
    <p style="color: #666; font-size: 14px;">If you didn''t request this, you can safely ignore this email.</p>
  </div>'
),
(
  'workspace_invite',
  'You''ve been invited to {{workspace_name}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #4F46E5;">Workspace Invitation</h1>
    <p>Hi {{user_name}},</p>
    <p><strong>{{inviter_name}}</strong> has invited you to join the workspace <strong>{{workspace_name}}</strong>.</p>
    <a href="{{invite_url}}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Accept Invitation</a>
  </div>'
),
(
  'document_share',
  '{{sharer_name}} shared a document with you',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #4F46E5;">Document Shared</h1>
    <p>Hi {{user_name}},</p>
    <p><strong>{{sharer_name}}</strong> has shared the document <strong>{{document_title}}</strong> with you.</p>
    <a href="{{document_url}}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Open Document</a>
  </div>'
),
(
  'comment_notification',
  '{{commenter_name}} commented on {{document_title}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #4F46E5;">New Comment</h1>
    <p>Hi {{user_name}},</p>
    <p><strong>{{commenter_name}}</strong> commented on <strong>{{document_title}}</strong>:</p>
    <blockquote style="border-left: 3px solid #4F46E5; padding-left: 12px; color: #555;">{{comment_content}}</blockquote>
    <a href="{{document_url}}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">View Comment</a>
  </div>'
);
