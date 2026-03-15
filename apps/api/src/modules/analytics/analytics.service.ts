import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class AnalyticsService {
  constructor(private supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async trackEvent(
    userId: string,
    data: {
      workspaceId?: string;
      eventType: string;
      eventData?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
    },
  ) {
    const { data: event, error } = await this.db
      .from('analytics_events')
      .insert({
        user_id: userId,
        workspace_id: data.workspaceId,
        event_type: data.eventType,
        event_data: data.eventData || {},
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
      })
      .select()
      .single();

    if (error) throw new NotFoundException(error.message);
    return event;
  }

  async getWorkspaceStats(workspaceId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { data: events, error } = await this.db
      .from('analytics_events')
      .select('event_type, created_at')
      .eq('workspace_id', workspaceId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw new NotFoundException(error.message);

    // Aggregate by event type
    const eventCounts: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};

    for (const event of events || []) {
      eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
      const day = event.created_at.split('T')[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    }

    // Build daily activity array for chart
    const dailyActivity = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    }));

    return {
      totalEvents: events?.length || 0,
      eventCounts,
      dailyActivity,
    };
  }

  async getUserStats(userId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { data: events, error } = await this.db
      .from('analytics_events')
      .select('event_type, created_at, workspace_id')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw new NotFoundException(error.message);

    const eventCounts: Record<string, number> = {};
    const workspaceActivity: Record<string, number> = {};

    for (const event of events || []) {
      eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
      if (event.workspace_id) {
        workspaceActivity[event.workspace_id] =
          (workspaceActivity[event.workspace_id] || 0) + 1;
      }
    }

    return {
      totalEvents: events?.length || 0,
      eventCounts,
      workspaceActivity,
    };
  }

  async getPopularDocuments(workspaceId: string) {
    const { data, error } = await this.db
      .from('analytics_events')
      .select('event_data')
      .eq('workspace_id', workspaceId)
      .eq('event_type', 'document.view')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new NotFoundException(error.message);

    const docCounts: Record<string, { id: string; title: string; views: number }> = {};

    for (const event of data || []) {
      const docId = (event.event_data as Record<string, string>)?.document_id;
      const title = (event.event_data as Record<string, string>)?.document_title || 'Untitled';
      if (docId) {
        if (!docCounts[docId]) {
          docCounts[docId] = { id: docId, title, views: 0 };
        }
        docCounts[docId].views++;
      }
    }

    return Object.values(docCounts)
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  async getActiveUsers(workspaceId: string) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await this.db
      .from('analytics_events')
      .select('user_id, created_at')
      .eq('workspace_id', workspaceId)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) throw new NotFoundException(error.message);

    const userActivity: Record<string, { userId: string; eventCount: number; lastActive: string }> = {};

    for (const event of data || []) {
      if (!event.user_id) continue;
      if (!userActivity[event.user_id]) {
        userActivity[event.user_id] = {
          userId: event.user_id,
          eventCount: 0,
          lastActive: event.created_at,
        };
      }
      userActivity[event.user_id].eventCount++;
      if (event.created_at > userActivity[event.user_id].lastActive) {
        userActivity[event.user_id].lastActive = event.created_at;
      }
    }

    return Object.values(userActivity)
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 20);
  }
}
