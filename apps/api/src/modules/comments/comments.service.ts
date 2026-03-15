import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class CommentsService {
  constructor(private supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async create(
    userId: string,
    data: {
      document_id?: string;
      whiteboard_id?: string;
      content: string;
      position?: { x: number; y: number };
      parent_id?: string;
    },
  ) {
    const { data: comment, error } = await this.db
      .from('comments')
      .insert({
        user_id: userId,
        ...data,
      })
      .select('*, reactions(*)')
      .single();

    if (error) throw new ForbiddenException(error.message);
    return comment;
  }

  async findAllForDocument(documentId: string) {
    const { data, error } = await this.db
      .from('comments')
      .select('*, reactions(*)')
      .eq('document_id', documentId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async findAllForWhiteboard(whiteboardId: string) {
    const { data, error } = await this.db
      .from('comments')
      .select('*, reactions(*)')
      .eq('whiteboard_id', whiteboardId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async findReplies(parentId: string) {
    const { data, error } = await this.db
      .from('comments')
      .select('*, reactions(*)')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('comments')
      .select('*, reactions(*)')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async update(id: string, userId: string, data: { content?: string; is_resolved?: boolean }) {
    const { data: comment, error } = await this.db
      .from('comments')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, reactions(*)')
      .single();

    if (error) throw new ForbiddenException(error.message);
    return comment;
  }

  async resolve(id: string) {
    const { data: comment, error } = await this.db
      .from('comments')
      .update({ is_resolved: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);
    return comment;
  }

  async remove(id: string, userId: string) {
    const { error } = await this.db
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new ForbiddenException(error.message);
    return { message: 'Comment deleted' };
  }
}
