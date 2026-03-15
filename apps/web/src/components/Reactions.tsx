'use client'

import { useComments } from '@/hooks/useComments'

export function Reactions({ commentId }: { commentId: string }) {
  const { addReaction, reactions } = useReactionsForComment(commentId)
  
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🎉']

  return (
    <div className="flex gap-1">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => addReaction(emoji)}
          className="hover:bg-gray-100 rounded px-2 py-1 text-sm"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

function useReactionsForComment(commentId: string) {
  // Simplified - would use actual hook in production
  const addReaction = async (emoji: string) => {
    console.log('Add reaction:', emoji, 'to comment:', commentId)
  }
  
  return {
    reactions: [],
    addReaction,
  }
}
