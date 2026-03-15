'use client'

import { useState, useCallback } from 'react'
import { SmilePlus } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface Reaction {
  id: string
  comment_id: string
  user_id: string
  emoji: string
  created_at: string
}

interface GroupedReaction {
  emoji: string
  count: number
  userIds: string[]
  reacted: boolean
}

interface ReactionsProps {
  commentId: string
  reactions: Reaction[]
  currentUserId: string
  onUpdate?: () => void
}

const EMOJI_OPTIONS = ['👍', '👎', '❤️', '😄', '🎉', '😕', '🔥', '👀']

export function Reactions({ commentId, reactions, currentUserId, onUpdate }: ReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)

  const grouped: GroupedReaction[] = EMOJI_OPTIONS
    .map((emoji) => {
      const matching = reactions.filter((r) => r.emoji === emoji)
      return {
        emoji,
        count: matching.length,
        userIds: matching.map((r) => r.user_id),
        reacted: matching.some((r) => r.user_id === currentUserId),
      }
    })
    .filter((g) => g.count > 0)

  const toggleReaction = useCallback(
    async (emoji: string) => {
      const supabase = createClient()

      const existing = reactions.find(
        (r) => r.emoji === emoji && r.user_id === currentUserId,
      )

      if (existing) {
        await supabase.from('reactions').delete().eq('id', existing.id)
      } else {
        await supabase.from('reactions').insert({
          comment_id: commentId,
          user_id: currentUserId,
          emoji,
        })
      }

      setShowPicker(false)
      onUpdate?.()
    },
    [commentId, currentUserId, reactions, onUpdate],
  )

  return (
    <div className="flex flex-wrap items-center gap-1">
      {grouped.map((g) => (
        <button
          key={g.emoji}
          onClick={() => toggleReaction(g.emoji)}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
            g.reacted
              ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30'
              : 'border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
          }`}
        >
          <span>{g.emoji}</span>
          <span className="text-gray-600 dark:text-gray-400">{g.count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <SmilePlus size={14} />
        </button>

        {showPicker && (
          <div className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className="rounded p-1 text-base hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
