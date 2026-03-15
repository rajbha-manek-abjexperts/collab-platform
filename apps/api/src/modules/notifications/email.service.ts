import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import * as nodemailer from 'nodemailer';

interface TemplateVariables {
  [key: string]: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private get db() {
    return this.supabaseService.getClient();
  }

  private renderTemplate(html: string, variables: TemplateVariables): string {
    return Object.entries(variables).reduce(
      (result, [key, value]) => result.replace(new RegExp(`{{${key}}}`, 'g'), value),
      html,
    );
  }

  private renderSubject(subject: string, variables: TemplateVariables): string {
    return this.renderTemplate(subject, variables);
  }

  private async isEmailEnabled(userId: string, type: string): Promise<boolean> {
    const { data } = await this.db
      .from('notification_types')
      .select('email_enabled')
      .eq('user_id', userId)
      .eq('type', type)
      .single();

    // Default to enabled if no preference exists
    return data?.email_enabled ?? true;
  }

  private async getTemplate(type: string) {
    const { data, error } = await this.db
      .from('email_templates')
      .select('*')
      .eq('type', type)
      .single();

    if (error) {
      this.logger.error(`Template not found for type: ${type}`);
      return null;
    }
    return data;
  }

  private async logEmail(
    userId: string | null,
    templateType: string,
    recipientEmail: string,
    subject: string,
    status: 'sent' | 'failed',
    errorMessage?: string,
  ) {
    await this.db.from('email_log').insert({
      user_id: userId,
      template_type: templateType,
      recipient_email: recipientEmail,
      subject,
      status,
      error_message: errorMessage,
    });
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    userId: string | null,
    templateType: string,
  ): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'noreply@collabplatform.com'),
        to,
        subject,
        html,
      });

      await this.logEmail(userId, templateType, to, subject, 'sent');
      this.logger.log(`Email sent: ${templateType} to ${to}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.logEmail(userId, templateType, to, subject, 'failed', message);
      this.logger.error(`Failed to send ${templateType} email to ${to}: ${message}`);
      return false;
    }
  }

  async sendWelcomeEmail(userId: string, email: string, userName: string): Promise<boolean> {
    const template = await this.getTemplate('welcome');
    if (!template) return false;

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');
    const html = this.renderTemplate(template.body_html, {
      user_name: userName || 'there',
      app_url: appUrl,
    });
    const subject = this.renderSubject(template.subject, {});

    return this.sendEmail(email, subject, html, userId, 'welcome');
  }

  async sendPasswordReset(userId: string, email: string, userName: string, resetUrl: string): Promise<boolean> {
    const template = await this.getTemplate('password_reset');
    if (!template) return false;

    const html = this.renderTemplate(template.body_html, {
      user_name: userName || 'there',
      reset_url: resetUrl,
    });
    const subject = this.renderSubject(template.subject, {});

    return this.sendEmail(email, subject, html, userId, 'password_reset');
  }

  async sendWorkspaceInvite(
    userId: string,
    email: string,
    userName: string,
    inviterName: string,
    workspaceName: string,
    inviteUrl: string,
  ): Promise<boolean> {
    if (!(await this.isEmailEnabled(userId, 'workspace_invite'))) return false;

    const template = await this.getTemplate('workspace_invite');
    if (!template) return false;

    const variables: TemplateVariables = {
      user_name: userName || 'there',
      inviter_name: inviterName,
      workspace_name: workspaceName,
      invite_url: inviteUrl,
    };
    const html = this.renderTemplate(template.body_html, variables);
    const subject = this.renderSubject(template.subject, variables);

    return this.sendEmail(email, subject, html, userId, 'workspace_invite');
  }

  async sendDocumentShare(
    userId: string,
    email: string,
    userName: string,
    sharerName: string,
    documentTitle: string,
    documentUrl: string,
  ): Promise<boolean> {
    if (!(await this.isEmailEnabled(userId, 'document_share'))) return false;

    const template = await this.getTemplate('document_share');
    if (!template) return false;

    const variables: TemplateVariables = {
      user_name: userName || 'there',
      sharer_name: sharerName,
      document_title: documentTitle,
      document_url: documentUrl,
    };
    const html = this.renderTemplate(template.body_html, variables);
    const subject = this.renderSubject(template.subject, variables);

    return this.sendEmail(email, subject, html, userId, 'document_share');
  }

  async sendCommentNotification(
    userId: string,
    email: string,
    userName: string,
    commenterName: string,
    documentTitle: string,
    commentContent: string,
    documentUrl: string,
  ): Promise<boolean> {
    if (!(await this.isEmailEnabled(userId, 'comment_notification'))) return false;

    const template = await this.getTemplate('comment_notification');
    if (!template) return false;

    const variables: TemplateVariables = {
      user_name: userName || 'there',
      commenter_name: commenterName,
      document_title: documentTitle,
      comment_content: commentContent,
      document_url: documentUrl,
    };
    const html = this.renderTemplate(template.body_html, variables);
    const subject = this.renderSubject(template.subject, variables);

    return this.sendEmail(email, subject, html, userId, 'comment_notification');
  }
}
