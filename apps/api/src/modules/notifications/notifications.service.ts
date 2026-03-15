import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { EmailService } from './email.service';

@Injectable()
export class NotificationsService {
  constructor(
    private supabaseService: SupabaseService,
    private emailService: EmailService,
  ) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  // ---- Notification CRUD ----

  async getNotifications(userId: string) {
    const { data, error } = await this.db
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async markAsRead(userId: string, notificationId: string) {
    const { data, error } = await this.db
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async markAllAsRead(userId: string) {
    const { error } = await this.db
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw new NotFoundException(error.message);
    return { success: true };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const { error } = await this.db
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw new NotFoundException(error.message);
    return { success: true };
  }

  // ---- Notification Preferences ----

  async getPreferences(userId: string) {
    const { data, error } = await this.db
      .from('notification_types')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async updatePreference(userId: string, type: string, emailEnabled: boolean) {
    const { data, error } = await this.db
      .from('notification_types')
      .upsert(
        { user_id: userId, type, email_enabled: emailEnabled },
        { onConflict: 'user_id,type' },
      )
      .select()
      .single();

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  // ---- Email Log ----

  async getEmailLog(userId: string) {
    const { data, error } = await this.db
      .from('email_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  // ---- Trigger Emails ----

  async onUserRegistered(userId: string, email: string, fullName: string) {
    return this.emailService.sendWelcomeEmail(userId, email, fullName);
  }

  async onPasswordResetRequested(userId: string, email: string, fullName: string, resetUrl: string) {
    return this.emailService.sendPasswordReset(userId, email, fullName, resetUrl);
  }

  async onWorkspaceInvite(
    invitedUserId: string,
    invitedEmail: string,
    invitedName: string,
    inviterName: string,
    workspaceName: string,
    inviteUrl: string,
  ) {
    return this.emailService.sendWorkspaceInvite(
      invitedUserId,
      invitedEmail,
      invitedName,
      inviterName,
      workspaceName,
      inviteUrl,
    );
  }

  async onDocumentShared(
    recipientUserId: string,
    recipientEmail: string,
    recipientName: string,
    sharerName: string,
    documentTitle: string,
    documentUrl: string,
  ) {
    return this.emailService.sendDocumentShare(
      recipientUserId,
      recipientEmail,
      recipientName,
      sharerName,
      documentTitle,
      documentUrl,
    );
  }

  async onCommentCreated(
    documentOwnerId: string,
    ownerEmail: string,
    ownerName: string,
    commenterName: string,
    documentTitle: string,
    commentContent: string,
    documentUrl: string,
  ) {
    return this.emailService.sendCommentNotification(
      documentOwnerId,
      ownerEmail,
      ownerName,
      commenterName,
      documentTitle,
      commentContent,
      documentUrl,
    );
  }
}
