'use client'

import { useState, useCallback } from 'react'
import { MessageSquare, MoreHorizontal, Check, Trash2, Edit2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Reactions } from './Reactions'

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
  parent_id: string | null
  is_resolved: boolean
  position: { x: number; y: number } | null
  reactions: Reaction[]
  created_at: string
  updated_at: string
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface CommentProps {
  comment: CommentData
  currentUserId: string
  onReply?: (parentId: string) => void
  onUpdate?: () => void
  replies?: CommentData[]
}

export function Comment({ comment, currentUserId, onReply, onUpdate, replies = [] }: CommentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showMenu, setShowMenu] = useState(false)

  const isOwner = comment.user_id === currentUserId

  const handleEdit = useCallback(async () => {
    if (!editContent.trim()) return
    const supabase = createClient()
    await supabase
      .from('comments')
      .update({ content: editContent.trim() })
      .eq('id', comment.id)

    setIsEditing(false)
    onUpdate?.()
  }, [comment.id, editContent, onUpdate])

  const handleDelete = useCallback(async () => {
    const supabase = createClient()
    await supabase.from('comments').delete().eq('id', comment.id)
    setShowMenu(false)
    onUpdate?.()
  }, [comment.id, onUpdate])

  const handleResolve = useCallback(async () => {
    const supabase = createClient()
    await supabase
      .from('comments')
      .update({ is_resolved: !comment.is_resolved })
      .eq('id', comment.id)

    setShowMenu(false)
    onUpdate?.()
  }, [comment.id, comment.is_resolved, onUpdate])

  return (
    <div
      className={`rounded-lg border p-3 ${
        comment.is_resolved
          ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {comment.user_id.substring(0, 2).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimeAgo(comment.created_at)}
          </span>
          {comment.is_resolved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <Check size={10} />
              Resolved
            </span>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <MoreHorizontal size={14} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <button
                onClick={handleResolve}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Check size={14} />
                {comment.is_resolved ? 'Unresolve' : 'Resolve'}
              </button>
              {isOwner && (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      setShowMenu(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(comment.content)
                }}
                className="rounded-md px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>
        )}
      </div>

      <div className="mt-2">
        <Reactions
          commentId={comment.id}
          reactions={comment.reactions || []}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
        />
      </div>

      <div className="mt-2 flex items-center gap-2">
        {onReply && !comment.parent_id && (
          <button
            onClick={() => onReply(comment.id)}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <MessageSquare size={12} />
            Reply
          </button>
        )}
      </div>

      {replies.length > 0 && (
        <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-3 dark:border-gray-700">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
