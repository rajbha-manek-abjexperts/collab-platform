import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DocumentService {
  constructor(
    private supabaseService: SupabaseService,
    private auditService: AuditService,
  ) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async create(
    userId: string,
    workspaceId: string,
    data: { title?: string; content?: object },
  ) {
    const { data: document, error } = await this.db
      .from('documents')
      .insert({
        workspace_id: workspaceId,
        created_by: userId,
        ...data,
      })
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);

    await this.auditService.logAction({
      user_id: userId,
      workspace_id: workspaceId,
      action: 'document.create',
      resource_type: 'document',
      resource_id: document.id,
      new_values: { title: data.title },
    });

    return document;
  }

  async findAllInWorkspace(workspaceId: string) {
    const { data, error } = await this.db
      .from('documents')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('documents')
      .select('*, comments(*)')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async update(
    id: string,
    data: { title?: string; content?: object },
    userId?: string,
  ) {
    const { data: document, error } = await this.db
      .from('documents')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);

    if (userId) {
      await this.auditService.logAction({
        user_id: userId,
        workspace_id: document.workspace_id,
        action: 'document.update',
        resource_type: 'document',
        resource_id: id,
        new_values: { title: data.title },
      });
    }

    return document;
  }

  async remove(id: string, userId?: string) {
    const { data: doc } = await this.db
      .from('documents')
      .select('workspace_id')
      .eq('id', id)
      .single();

    const { error } = await this.db
      .from('documents')
      .update({ is_archived: true })
      .eq('id', id);

    if (error) throw new ForbiddenException(error.message);

    if (userId && doc) {
      await this.auditService.logAction({
        user_id: userId,
        workspace_id: doc.workspace_id,
        action: 'document.archive',
        resource_type: 'document',
        resource_id: id,
      });
    }

    return { message: 'Document archived' };
  }
}
