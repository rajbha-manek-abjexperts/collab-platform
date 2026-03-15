import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class StorageService {
  constructor(private supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  private get storage() {
    return this.supabaseService.getClient().storage.from('workspace-files');
  }

  async upload(
    userId: string,
    workspaceId: string,
    file: Express.Multer.File,
    options?: { documentId?: string; whiteboardId?: string },
  ) {
    const storagePath = `${workspaceId}/${Date.now()}-${file.originalname}`;

    const { error: uploadError } = await this.storage.upload(
      storagePath,
      file.buffer,
      {
        contentType: file.mimetype,
        upsert: false,
      },
    );

    if (uploadError) throw new ForbiddenException(uploadError.message);

    const { data: attachment, error } = await this.db
      .from('file_attachments')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        document_id: options?.documentId || null,
        whiteboard_id: options?.whiteboardId || null,
        storage_path: storagePath,
        file_name: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype,
      })
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);

    const { data: urlData } = this.storage.getPublicUrl(storagePath);

    return { ...attachment, url: urlData.publicUrl };
  }

  async findAllInWorkspace(workspaceId: string) {
    const { data, error } = await this.db
      .from('file_attachments')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw new NotFoundException(error.message);

    return data.map((attachment) => {
      const { data: urlData } = this.storage.getPublicUrl(
        attachment.storage_path,
      );
      return { ...attachment, url: urlData.publicUrl };
    });
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('file_attachments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(error.message);

    const { data: urlData } = this.storage.getPublicUrl(data.storage_path);

    return { ...data, url: urlData.publicUrl };
  }

  async getSignedUrl(id: string, expiresIn = 3600) {
    const { data: attachment, error } = await this.db
      .from('file_attachments')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(error.message);

    const { data, error: signError } = await this.storage.createSignedUrl(
      attachment.storage_path,
      expiresIn,
    );

    if (signError) throw new ForbiddenException(signError.message);

    return { signedUrl: data.signedUrl };
  }

  async remove(id: string) {
    const { data: attachment, error: findError } = await this.db
      .from('file_attachments')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (findError) throw new NotFoundException(findError.message);

    const { error: storageError } = await this.storage.remove([
      attachment.storage_path,
    ]);

    if (storageError) throw new ForbiddenException(storageError.message);

    const { error } = await this.db
      .from('file_attachments')
      .delete()
      .eq('id', id);

    if (error) throw new ForbiddenException(error.message);

    return { message: 'File deleted' };
  }
}
