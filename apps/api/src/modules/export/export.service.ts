import { Injectable } from '@nestjs/common'
import { createClient } from '@supabase/supabase-js'

@Injectable()
export class ExportService {
  private supabase = createClient(
    process.env.SUPABASE_URL || 'http://localhost:54321',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  )

  async exportUserData(userId: string): Promise<{
    user: any
    workspaces: any[]
    documents: any[]
    whiteboardSessions: any[]
    comments: any[]
    notifications: any[]
  }> {
    // Get user profile
    const { data: user } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // Get workspaces where user is member or owner
    const { data: workspaceMembers } = await this.supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', userId)

    const workspaceIds = workspaceMembers?.map(wm => wm.workspace_id) || []
    
    const { data: workspaces } = await this.supabase
      .from('workspaces')
      .select('*')
      .in('id', [...workspaceIds, userId])

    // Get documents
    const { data: documents } = await this.supabase
      .from('documents')
      .select('*')
      .in('workspace_id', workspaceIds)
      .eq('created_by', userId)

    // Get whiteboard sessions
    const { data: whiteboardSessions } = await this.supabase
      .from('whiteboard_sessions')
      .select('*')
      .in('workspace_id', workspaceIds)
      .eq('created_by', userId)

    // Get comments
    const { data: comments } = await this.supabase
      .from('comments')
      .select('*')
      .eq('user_id', userId)

    // Get notifications
    const { data: notifications } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)

    return {
      user: user ? { ...user, password_hash: '[REDACTED]' } : null,
      workspaces: workspaces || [],
      documents: documents || [],
      whiteboardSessions: whiteboardSessions || [],
      comments: comments || [],
      notifications: notifications || []
    }
  }

  async exportAsCSV(data: any): Promise<string> {
    // Simple CSV conversion for each data type
    const csvLines: string[] = []

    // Documents CSV
    if (data.documents?.length > 0) {
      csvLines.push('# Documents')
      const headers = Object.keys(data.documents[0])
      csvLines.push(headers.join(','))
      data.documents.forEach((doc: any) => {
        csvLines.push(headers.map(h => JSON.stringify(doc[h] ?? '')).join(','))
      })
    }

    return csvLines.join('\n')
  }
}
