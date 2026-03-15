import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class WorkspaceService {
  constructor(
    private supabaseService: SupabaseService,
    private auditService: AuditService,
  ) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async create(
    userId: string,
    data: { name: string; slug: string; description?: string },
  ) {
    const { data: workspace, error } = await this.db
      .from('workspaces')
      .insert({ ...data, owner_id: userId })
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);

    await this.auditService.logAction({
      user_id: userId,
      workspace_id: workspace.id,
      action: 'workspace.create',
      resource_type: 'workspace',
      resource_id: workspace.id,
      new_values: data,
    });

    return workspace;
  }

  async findAllForUser(userId: string) {
    const { data, error } = await this.db
      .from('workspace_members')
      .select('workspace_id, role, workspaces(*)')
      .eq('user_id', userId);

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async findOne(id: string, userId: string) {
    const { data, error } = await this.db
      .from('workspaces')
      .select('*, workspace_members(*)')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async update(
    id: string,
    userId: string,
    data: { name?: string; description?: string },
  ) {
    const { data: workspace, error } = await this.db
      .from('workspaces')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);

    await this.auditService.logAction({
      user_id: userId,
      workspace_id: id,
      action: 'workspace.update',
      resource_type: 'workspace',
      resource_id: id,
      new_values: data,
    });

    return workspace;
  }

  async remove(id: string, userId: string) {
    const { error } = await this.db
      .from('workspaces')
      .delete()
      .eq('id', id)
      .eq('owner_id', userId);

    if (error) throw new ForbiddenException(error.message);

    await this.auditService.logAction({
      user_id: userId,
      workspace_id: id,
      action: 'workspace.delete',
      resource_type: 'workspace',
      resource_id: id,
    });

    return { message: 'Workspace deleted' };
  }

  async addMember(workspaceId: string, userId: string, role = 'member') {
    const { data, error } = await this.db
      .from('workspace_members')
      .insert({ workspace_id: workspaceId, user_id: userId, role })
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);

    await this.auditService.logAction({
      user_id: userId,
      workspace_id: workspaceId,
      action: 'member.add',
      resource_type: 'workspace_member',
      new_values: { user_id: userId, role },
    });

    return data;
  }

  async removeMember(workspaceId: string, userId: string) {
    const { error } = await this.db
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (error) throw new ForbiddenException(error.message);

    await this.auditService.logAction({
      user_id: userId,
      workspace_id: workspaceId,
      action: 'member.remove',
      resource_type: 'workspace_member',
      old_values: { user_id: userId },
    });

    return { message: 'Member removed' };
  }
}
