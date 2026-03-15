'use client'

import { use, useCallback, useState } from 'react'
import { ArrowLeft, Share2, Users, Clock, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import DocumentEditor from '@/components/DocumentEditor'
import type { DocumentContent } from '@/types/document'

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [title, setTitle] = useState('Untitled Document')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const handleSave = useCallback(
    (content: DocumentContent) => {
      // TODO: persist to API / Supabase
      console.log('Saving document', id, { title, content })
      setLastSaved(new Date())
    },
    [id, title]
  )

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-gray-950">
      {/* Top bar */}
      <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/documents"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 p-0"
              placeholder="Untitled Document"
            />
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{id.slice(0, 8)}</span>
              {lastSaved && (
                <>
                  <span>&middot;</span>
                  <Clock className="h-3 w-3" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Users className="h-4 w-4" />
            <span>0 online</span>
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </header>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <DocumentEditor onSave={handleSave} />
      </div>
    </div>
  )
}
