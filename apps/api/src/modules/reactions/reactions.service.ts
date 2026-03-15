import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ReactionsService {
  constructor(private supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async toggle(userId: string, commentId: string, emoji: string) {
    // Check if reaction already exists
    const { data: existing } = await this.db
      .from('reactions')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      // Remove existing reaction
      const { error } = await this.db
        .from('reactions')
        .delete()
        .eq('id', existing.id);

      if (error) throw new ForbiddenException(error.message);
      return { action: 'removed', emoji };
    }

    // Add new reaction
    const { data: reaction, error } = await this.db
      .from('reactions')
      .insert({
        comment_id: commentId,
        user_id: userId,
        emoji,
      })
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);
    return { action: 'added', ...reaction };
  }

  async findAllForComment(commentId: string) {
    const { data, error } = await this.db
      .from('reactions')
      .select('*')
      .eq('comment_id', commentId)
      .order('created_at', { ascending: true });

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async remove(id: string, userId: string) {
    const { error } = await this.db
      .from('reactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new ForbiddenException(error.message);
    return { message: 'Reaction removed' };
  }
}
