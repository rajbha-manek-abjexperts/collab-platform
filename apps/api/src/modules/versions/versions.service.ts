import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class VersionsService {
  constructor(private supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async create(
    userId: string,
    data: {
      document_id?: string;
      whiteboard_id?: string;
      snapshot: object;
      label?: string;
    },
  ) {
    // Get the next version number
    const entityFilter = data.document_id
      ? { column: 'document_id', value: data.document_id }
      : { column: 'whiteboard_id', value: data.whiteboard_id! };

    const { data: latest } = await this.db
      .from('versions')
      .select('version_number')
      .eq(entityFilter.column, entityFilter.value)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const nextVersion = (latest?.version_number ?? 0) + 1;

    const { data: version, error } = await this.db
      .from('versions')
      .insert({
        ...data,
        created_by: userId,
        version_number: nextVersion,
      })
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);
    return version;
  }

  async findAllForDocument(documentId: string) {
    const { data, error } = await this.db
      .from('versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async findAllForWhiteboard(whiteboardId: string) {
    const { data, error } = await this.db
      .from('versions')
      .select('*')
      .eq('whiteboard_id', whiteboardId)
      .order('version_number', { ascending: false });

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('versions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async updateLabel(id: string, label: string) {
    const { data, error } = await this.db
      .from('versions')
      .update({ label })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.db
      .from('versions')
      .delete()
      .eq('id', id);

    if (error) throw new ForbiddenException(error.message);
    return { message: 'Version deleted' };
  }
}
