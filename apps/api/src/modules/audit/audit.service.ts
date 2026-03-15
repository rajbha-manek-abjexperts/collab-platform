import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export interface AuditLogEntry {
  user_id: string;
  workspace_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: object;
  new_values?: object;
  ip_address?: string;
  user_agent?: string;
}

@Injectable()
export class AuditService {
  constructor(private supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async logAction(entry: AuditLogEntry) {
    const { error } = await this.db.from('audit_logs').insert(entry);

    if (error) {
      console.error('Failed to write audit log:', error.message);
    }
  }

  async getWorkspaceAuditLogs(
    workspaceId: string,
    options?: {
      limit?: number;
      offset?: number;
      action?: string;
      resource_type?: string;
      user_id?: string;
      from?: string;
      to?: string;
    },
  ) {
    let query = this.db
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (options?.action) {
      query = query.eq('action', options.action);
    }
    if (options?.resource_type) {
      query = query.eq('resource_type', options.resource_type);
    }
    if (options?.user_id) {
      query = query.eq('user_id', options.user_id);
    }
    if (options?.from) {
      query = query.gte('created_at', options.from);
    }
    if (options?.to) {
      query = query.lte('created_at', options.to);
    }

    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new NotFoundException(error.message);
    return { data, total: count, limit, offset };
  }

  async getUserAuditLogs(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      workspace_id?: string;
    },
  ) {
    let query = this.db
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.workspace_id) {
      query = query.eq('workspace_id', options.workspace_id);
    }

    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new NotFoundException(error.message);
    return { data, total: count, limit, offset };
  }

  async exportAuditLogs(
    workspaceId: string,
    options?: {
      from?: string;
      to?: string;
      action?: string;
      resource_type?: string;
    },
  ) {
    let query = this.db
      .from('audit_logs')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (options?.from) {
      query = query.gte('created_at', options.from);
    }
    if (options?.to) {
      query = query.lte('created_at', options.to);
    }
    if (options?.action) {
      query = query.eq('action', options.action);
    }
    if (options?.resource_type) {
      query = query.eq('resource_type', options.resource_type);
    }

    const { data, error } = await query;

    if (error) throw new ForbiddenException(error.message);
    return data;
  }
}
