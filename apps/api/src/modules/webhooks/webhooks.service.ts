import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  constructor(private supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  // ---- Webhook CRUD ----

  async createWebhook(
    workspaceId: string,
    userId: string,
    data: {
      name: string;
      url: string;
      events: string[];
      secret?: string;
    },
  ) {
    const secret = data.secret || crypto.randomBytes(32).toString('hex');

    const { data: webhook, error } = await this.db
      .from('webhooks')
      .insert({
        workspace_id: workspaceId,
        name: data.name,
        url: data.url,
        events: data.events,
        secret,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);
    return webhook;
  }

  async getWebhooks(workspaceId: string) {
    const { data, error } = await this.db
      .from('webhooks')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async getWebhook(webhookId: string) {
    const { data, error } = await this.db
      .from('webhooks')
      .select('*')
      .eq('id', webhookId)
      .single();

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async updateWebhook(
    webhookId: string,
    data: {
      name?: string;
      url?: string;
      events?: string[];
      is_active?: boolean;
    },
  ) {
    const { data: webhook, error } = await this.db
      .from('webhooks')
      .update(data)
      .eq('id', webhookId)
      .select()
      .single();

    if (error) throw new NotFoundException(error.message);
    return webhook;
  }

  async deleteWebhook(webhookId: string) {
    const { error } = await this.db
      .from('webhooks')
      .delete()
      .eq('id', webhookId);

    if (error) throw new NotFoundException(error.message);
    return { deleted: true };
  }

  // ---- Trigger & Deliver ----

  async triggerWebhook(event: string, workspaceId: string, payload: Record<string, any>) {
    const { data: webhooks } = await this.db
      .from('webhooks')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .contains('events', [event]);

    if (!webhooks || webhooks.length === 0) return [];

    const results = await Promise.allSettled(
      webhooks.map((webhook) => this.deliverWebhook(webhook, event, payload)),
    );

    return results.map((r) => (r.status === 'fulfilled' ? r.value : { error: r.reason?.message }));
  }

  private async deliverWebhook(
    webhook: any,
    event: string,
    payload: Record<string, any>,
  ) {
    const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
    const signature = crypto
      .createHmac('sha256', webhook.secret || '')
      .update(body)
      .digest('hex');

    let responseStatus: number | undefined;
    let responseBody: string | undefined;
    let success = false;

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
        },
        body,
        signal: AbortSignal.timeout(10000),
      });

      responseStatus = response.status;
      responseBody = await response.text();
      success = response.ok;
    } catch (err) {
      responseStatus = 0;
      responseBody = err.message;
      success = false;
    }

    // Log delivery
    await this.db.from('webhook_deliveries').insert({
      webhook_id: webhook.id,
      event,
      payload,
      response_status: responseStatus,
      response_body: responseBody,
      success,
    });

    // Update last_triggered_at
    await this.db
      .from('webhooks')
      .update({ last_triggered_at: new Date().toISOString() })
      .eq('id', webhook.id);

    return { webhook_id: webhook.id, success, response_status: responseStatus };
  }

  // ---- Deliveries ----

  async getDeliveries(webhookId: string, limit = 50) {
    const { data, error } = await this.db
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new NotFoundException(error.message);
    return data;
  }
}
