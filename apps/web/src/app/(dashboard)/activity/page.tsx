'use client'

import { useState, useCallback, useRef } from 'react'
import { Activity, Loader2 } from 'lucide-react'
import { ActivityFeed } from '@/components/ActivityFeed'
import type { ActivityItem } from '@/components/ActivityFeed'

// Mock data for the full activity page
const allActivities: ActivityItem[] = [
  {
    id: '1',
    user_id: 'u1',
    user_name: 'Sarah Chen',
    action: 'updated',
    entity_type: 'document',
    entity_id: 'd1',
    entity_title: 'Q1 Product Roadmap',
    workspace_name: 'Design Team',
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    user_id: 'u2',
    user_name: 'Alex Rivera',
    action: 'commented',
    entity_type: 'document',
    entity_id: 'd2',
    entity_title: 'API Documentation',
    workspace_name: 'Engineering',
    created_at: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    user_id: 'u3',
    user_name: 'Jordan Lee',
    action: 'created',
    entity_type: 'document',
    entity_id: 'd3',
    entity_title: 'Sprint Retrospective Notes',
    workspace_name: 'Engineering',
    created_at: new Date(Date.now() - 47 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    user_id: 'u4',
    user_name: 'Morgan Davis',
    action: 'uploaded',
    entity_type: 'file',
    entity_id: 'f1',
    entity_title: 'brand-assets-v2.zip',
    workspace_name: 'Marketing',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    user_id: 'u5',
    user_name: 'Casey Wright',
    action: 'joined',
    entity_type: 'workspace',
    entity_id: 'w1',
    entity_title: 'Design Team',
    workspace_name: 'Design Team',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    user_id: 'u1',
    user_name: 'Sarah Chen',
    action: 'created',
    entity_type: 'whiteboard',
    entity_id: 'wb1',
    entity_title: 'User Flow Diagram',
    workspace_name: 'Design Team',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    user_id: 'u2',
    user_name: 'Alex Rivera',
    action: 'starred',
    entity_type: 'document',
    entity_id: 'd4',
    entity_title: 'Architecture Decision Records',
    workspace_name: 'Engineering',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    user_id: 'u3',
    user_name: 'Jordan Lee',
    action: 'updated',
    entity_type: 'document',
    entity_id: 'd5',
    entity_title: 'Design System Guidelines',
    workspace_name: 'Design Team',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '9',
    user_id: 'u4',
    user_name: 'Morgan Davis',
    action: 'viewed',
    entity_type: 'document',
    entity_id: 'd1',
    entity_title: 'Q1 Product Roadmap',
    workspace_name: 'Design Team',
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10',
    user_id: 'u5',
    user_name: 'Casey Wright',
    action: 'commented',
    entity_type: 'document',
    entity_id: 'd6',
    entity_title: 'Sprint Planning Notes',
    workspace_name: 'Engineering',
    created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '11',
    user_id: 'u2',
    user_name: 'Alex Rivera',
    action: 'deleted',
    entity_type: 'document',
    entity_id: 'd7',
    entity_title: 'Old Meeting Notes (Draft)',
    workspace_name: 'Engineering',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '12',
    user_id: 'u1',
    user_name: 'Sarah Chen',
    action: 'uploaded',
    entity_type: 'file',
    entity_id: 'f2',
    entity_title: 'mockups-final.fig',
    workspace_name: 'Design Team',
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '13',
    user_id: 'u3',
    user_name: 'Jordan Lee',
    action: 'created',
    entity_type: 'document',
    entity_id: 'd8',
    entity_title: 'Testing Strategy 2026',
    workspace_name: 'Engineering',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '14',
    user_id: 'u4',
    user_name: 'Morgan Davis',
    action: 'commented',
    entity_type: 'document',
    entity_id: 'd5',
    entity_title: 'Design System Guidelines',
    workspace_name: 'Design Team',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '15',
    user_id: 'u5',
    user_name: 'Casey Wright',
    action: 'updated',
    entity_type: 'whiteboard',
    entity_id: 'wb2',
    entity_title: 'Component Architecture',
    workspace_name: 'Engineering',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '16',
    user_id: 'u1',
    user_name: 'Sarah Chen',
    action: 'starred',
    entity_type: 'document',
    entity_id: 'd6',
    entity_title: 'Sprint Planning Notes',
    workspace_name: 'Engineering',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '17',
    user_id: 'u2',
    user_name: 'Alex Rivera',
    action: 'created',
    entity_type: 'document',
    entity_id: 'd9',
    entity_title: 'Deployment Runbook',
    workspace_name: 'Engineering',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '18',
    user_id: 'u4',
    user_name: 'Morgan Davis',
    action: 'uploaded',
    entity_type: 'file',
    entity_id: 'f3',
    entity_title: 'campaign-report.pdf',
    workspace_name: 'Marketing',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '19',
    user_id: 'u3',
    user_name: 'Jordan Lee',
    action: 'joined',
    entity_type: 'workspace',
    entity_id: 'w3',
    entity_title: 'Marketing',
    workspace_name: 'Marketing',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '20',
    user_id: 'u1',
    user_name: 'Sarah Chen',
    action: 'updated',
    entity_type: 'document',
    entity_id: 'd9',
    entity_title: 'Deployment Runbook',
    workspace_name: 'Engineering',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const PAGE_SIZE = 10

export default function ActivityPage() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const hasMore = visibleCount < allActivities.length

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setLoading(true)
          // Simulate loading delay
          setTimeout(() => {
            setVisibleCount((prev) =>
              Math.min(prev + PAGE_SIZE, allActivities.length)
            )
            setLoading(false)
          }, 500)
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [loading, hasMore]
  )

  const visibleActivities = allActivities.slice(0, visibleCount)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Activity
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track all activity across your workspaces.
          </p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <ActivityFeed
          initialActivities={visibleActivities}
          showFilter
          maxItems={visibleCount}
        />

        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div ref={lastItemRef} className="flex justify-center py-6">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        )}

        {!hasMore && visibleActivities.length > 0 && (
          <div className="text-center py-6 border-t border-gray-100 dark:border-gray-800 mt-4">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              You&apos;ve reached the end of the activity feed.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
