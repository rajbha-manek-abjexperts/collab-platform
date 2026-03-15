'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, X, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRealtime } from '@/hooks/useRealtime'
import { Comment } from './Comment'

interface Reaction {
  id: string
  comment_id: string
  user_id: string
  emoji: string
  created_at: string
}

interface CommentData {
  id: string
  user_id: string
  content: string
  document_id: string | null
  whiteboard_id: string | null
  parent_id: string | null
  is_resolved: boolean
  position: { x: number; y: number } | null
  reactions: Reaction[]
  created_at: string
  updated_at: string
}

interface CommentsPanelProps {
  entityType: 'document' | 'whiteboard'
  entityId: string
  currentUserId: string
  isOpen: boolean
  onClose: () => void
}

export function CommentsPanel({
  entityType,
  entityId,
  currentUserId,
  isOpen,
  onClose,
}: CommentsPanelProps) {
  const [comments, setComments] = useState<CommentData[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    const supabase = createClient()
    const column = entityType === 'document' ? 'document_id' : 'whiteboard_id'

    const { data } = await supabase
      .from('comments')
      .select('*, reactions(*)')
      .eq(column, entityId)
      .order('created_at', { ascending: true })

    if (data) setComments(data as CommentData[])
    setLoading(false)
  }, [entityType, entityId])

  useEffect(() => {
    if (isOpen) fetchComments()
  }, [isOpen, fetchComments])

  useRealtime<CommentData & Record<string, unknown>>({
    channel: `comments-${entityId}`,
    table: 'comments',
    filter: `${entityType === 'document' ? 'document_id' : 'whiteboard_id'}=eq.${entityId}`,
    event: '*',
    onChange: () => fetchComments(),
    enabled: isOpen,
  })

  useRealtime<Reaction & Record<string, unknown>>({
    channel: `reactions-${entityId}`,
    table: 'reactions',
    event: '*',
    onChange: () => fetchComments(),
    enabled: isOpen,
  })

  const handleSubmit = useCallback(async () => {
    if (!newComment.trim()) return

    const supabase = createClient()
    const column = entityType === 'document' ? 'document_id' : 'whiteboard_id'

    await supabase.from('comments').insert({
      [column]: entityId,
      user_id: currentUserId,
      content: newComment.trim(),
      parent_id: replyTo,
    })

    setNewComment('')
    setReplyTo(null)
  }, [newComment, entityType, entityId, currentUserId, replyTo])

  const topLevel = comments.filter((c) => !c.parent_id)
  const repliesMap = comments.reduce<Record<string, CommentData[]>>((acc, c) => {
    if (c.parent_id) {
      if (!acc[c.parent_id]) acc[c.parent_id] = []
      acc[c.parent_id].push(c)
    }
    return acc
  }, {})

  if (!isOpen) return null

  return (
    <div className="flex h-full w-80 flex-col border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Comments
          </h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {topLevel.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          </div>
        ) : topLevel.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare size={24} className="mb-2" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Start the conversation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topLevel.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onReply={(parentId) => setReplyTo(parentId)}
                onUpdate={fetchComments}
                replies={repliesMap[comment.id] || []}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between rounded-md bg-blue-50 px-3 py-1.5 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            <span>Replying to comment</span>
            <button onClick={() => setReplyTo(null)} className="ml-2">
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="Write a comment..."
            className="flex-1 resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            rows={2}
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="self-end rounded-md bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
