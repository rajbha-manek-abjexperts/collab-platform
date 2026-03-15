import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class WhiteboardService {
  constructor(private supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async create(
    userId: string,
    workspaceId: string,
    data: { title?: string; canvas_data?: object },
  ) {
    const { data: whiteboard, error } = await this.db
      .from('whiteboard_sessions')
      .insert({
        workspace_id: workspaceId,
        created_by: userId,
        ...data,
      })
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);
    return whiteboard;
  }

  async findAllInWorkspace(workspaceId: string) {
    const { data, error } = await this.db
      .from('whiteboard_sessions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('whiteboard_sessions')
      .select('*, comments(*)')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async update(id: string, data: { title?: string; canvas_data?: object }) {
    const { data: whiteboard, error } = await this.db
      .from('whiteboard_sessions')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);
    return whiteboard;
  }

  async remove(id: string) {
    const { error } = await this.db
      .from('whiteboard_sessions')
      .update({ is_archived: true })
      .eq('id', id);

    if (error) throw new ForbiddenException(error.message);
    return { message: 'Whiteboard archived' };
  }
}
