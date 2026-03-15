import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import * as crypto from 'crypto';

@Injectable()
export class SharingService {
  constructor(
    private supabaseService: SupabaseService,
    private auditService: AuditService,
  ) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  private generateSlug(): string {
    return crypto.randomBytes(12).toString('base64url');
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async createSharedLink(
    userId: string,
    data: {
      resource_type: 'document' | 'whiteboard';
      resource_id: string;
      password?: string;
      expires_at?: string;
      max_views?: number;
    },
  ) {
    // Verify the resource exists
    const table =
      data.resource_type === 'document' ? 'documents' : 'whiteboard_sessions';
    const { data: resource, error: resourceError } = await this.db
      .from(table)
      .select('id, workspace_id')
      .eq('id', data.resource_id)
      .single();

    if (resourceError || !resource) {
      throw new NotFoundException(
        `${data.resource_type} not found`,
      );
    }

    const slug = this.generateSlug();
    const passwordProtected = !!data.password;
    const passwordHash = data.password
      ? this.hashPassword(data.password)
      : null;

    const { data: link, error } = await this.db
      .from('shared_links')
      .insert({
        resource_type: data.resource_type,
        resource_id: data.resource_id,
        slug,
        password_protected: passwordProtected,
        password_hash: passwordHash,
        expires_at: data.expires_at || null,
        max_views: data.max_views || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);

    await this.auditService.logAction({
      user_id: userId,
      workspace_id: resource.workspace_id,
      action: 'shared_link.create',
      resource_type: data.resource_type,
      resource_id: data.resource_id,
      new_values: { slug, password_protected: passwordProtected },
    });

    return { ...link, password_hash: undefined };
  }

  async getSharedLinksForResource(
    resourceType: string,
    resourceId: string,
  ) {
    const { data, error } = await this.db
      .from('shared_links')
      .select('id, slug, resource_type, resource_id, password_protected, expires_at, max_views, view_count, created_at')
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false });

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async accessSharedLink(slug: string, password?: string) {
    const { data: link, error } = await this.db
      .from('shared_links')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !link) {
      throw new NotFoundException('Shared link not found');
    }

    // Check expiration
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      throw new BadRequestException('This shared link has expired');
    }

    // Check max views
    if (link.max_views && link.view_count >= link.max_views) {
      throw new BadRequestException(
        'This shared link has reached its maximum view count',
      );
    }

    // Check password
    if (link.password_protected) {
      if (!password) {
        return { requires_password: true, slug };
      }
      if (this.hashPassword(password) !== link.password_hash) {
        throw new ForbiddenException('Incorrect password');
      }
    }

    // Increment view count
    await this.db
      .from('shared_links')
      .update({ view_count: link.view_count + 1 })
      .eq('id', link.id);

    // Fetch the actual resource
    const table =
      link.resource_type === 'document' ? 'documents' : 'whiteboard_sessions';
    const { data: resource } = await this.db
      .from(table)
      .select('*')
      .eq('id', link.resource_id)
      .single();

    return {
      resource_type: link.resource_type,
      resource: resource,
      view_count: link.view_count + 1,
      max_views: link.max_views,
    };
  }

  async deleteSharedLink(id: string, userId: string) {
    const { data: link } = await this.db
      .from('shared_links')
      .select('*')
      .eq('id', id)
      .single();

    if (!link) throw new NotFoundException('Shared link not found');
    if (link.created_by !== userId) {
      throw new ForbiddenException('You can only delete your own shared links');
    }

    const { error } = await this.db
      .from('shared_links')
      .delete()
      .eq('id', id);

    if (error) throw new ForbiddenException(error.message);

    return { message: 'Shared link deleted' };
  }
}
