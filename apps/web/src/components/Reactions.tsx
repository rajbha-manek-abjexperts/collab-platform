'use client'

import { useReactions } from '@/hooks/useReactions'

interface ReactionsProps {
  commentId: string
  currentUserId?: string
  onUpdate?: () => void
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉']

export function Reactions({ commentId, onUpdate }: ReactionsProps) {
  const { toggleReaction } = useReactions()

  const handleReaction = async (emoji: string) => {
    await toggleReaction(commentId, emoji)
    onUpdate?.()
  }

  return (
    <div className="flex gap-1">
      {EMOJI_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReaction(emoji)}
          className="hover:bg-gray-100 rounded px-2 py-1 text-sm"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
