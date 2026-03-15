'use client'

import { use, useCallback } from 'react'
import { ArrowLeft, Share2 } from 'lucide-react'
import Link from 'next/link'
import WhiteboardCanvas from '@/components/WhiteboardCanvas'
import FollowModeButton from '@/components/FollowModeButton'
import FollowingIndicator from '@/components/FollowingIndicator'
import UserAvatars from '@/components/UserAvatars'
import { FollowModeProvider } from '@/contexts/FollowModeContext'
import type { WhiteboardState } from '@/types/whiteboard'

function WhiteboardPageContent({ id }: { id: string }) {
  const handleSave = useCallback((state: WhiteboardState) => {
    // TODO: persist to API / Supabase
    console.log('Saving whiteboard', id, state)
  }, [id])

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Following indicator */}
      <FollowingIndicator />

      {/* Top bar */}
      <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-sm font-medium">Untitled Whiteboard</h1>
            <p className="text-xs text-gray-400">{id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <UserAvatars />
          <FollowModeButton />

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

          <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </header>

      {/* Canvas component */}
      <WhiteboardCanvas id={id} onSave={handleSave} />
    </div>
  )
}

export default function WhiteboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <FollowModeProvider>
      <WhiteboardPageContent id={id} />
    </FollowModeProvider>
  )
}
