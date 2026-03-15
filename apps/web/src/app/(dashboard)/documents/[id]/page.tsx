'use client'

import { use, useCallback, useState, useEffect } from 'react'
import { ArrowLeft, Share2, Users, Clock, MoreHorizontal, Edit2, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import DocumentEditor from '@/components/DocumentEditor'
import DocumentViewer from '@/components/DocumentViewer'
import type { OutputData } from '@editorjs/editorjs'

// Dynamic import for RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )
})

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [title, setTitle] = useState('Untitled Document')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isEditing, setIsEditing] = useState(true)
  const [content, setContent] = useState<OutputData | null>(null)
  const [loading, setLoading] = useState(true)

  // Load document from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`document_${id}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setContent(parsed)
        
        // Try to extract title from first header block
        const headerBlock = parsed.blocks?.find((b: any) => b.type === 'header')
        if (headerBlock?.data?.text) {
          setTitle(headerBlock.data.text)
        }
      } catch (e) {
        console.error('Error parsing saved document:', e)
      }
    }
    setLoading(false)
  }, [id])

  const handleSave = useCallback(
    (newContent: any) => {
      // Save to localStorage for demo
      const contentJson = JSON.stringify(newContent)
      localStorage.setItem(`document_${id}`, contentJson)
      setContent(newContent)
      setLastSaved(new Date())
      
      // Update title from first header
      const headerBlock = newContent.blocks?.find((b: any) => b.type === 'header')
      if (headerBlock?.data?.text) {
        setTitle(headerBlock.data.text)
      }
    },
    [id]
  )

  const toggleMode = useCallback(() => {
    if (isEditing) {
      // Save before switching to view mode
      const currentContent = localStorage.getItem(`document_${id}`)
      if (currentContent) {
        try {
          setContent(JSON.parse(currentContent))
        } catch (e) {
          console.error('Error loading content:', e)
        }
      }
    }
    setIsEditing(!isEditing)
  }, [isEditing, id])

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

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
                  <span>·</span>
                  <Clock className="h-3 w-3" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
              isEditing 
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            {isEditing ? (
              <>
                <Eye className="h-4 w-4" />
                Preview
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4" />
                Edit
              </>
            )}
          </button>
          
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

      {/* Editor / Viewer */}
      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <DocumentEditor 
            documentId={id} 
            initialContent={content}
            onSave={handleSave} 
          />
        ) : (
          <div className="max-w-4xl mx-auto p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
              {content ? (
                <DocumentViewer content={content} />
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400">No content yet. Click Edit to start writing.</p>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Start Editing
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
