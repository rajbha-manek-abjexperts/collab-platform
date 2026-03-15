'use client'

import { use, useCallback, useState, useEffect, use } from 'react'
import { ArrowLeft, Share2, Users, Clock, MoreHorizontal, Edit2, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import DocumentEditor from '@/components/DocumentEditor'
import DocumentViewer from '@/components/DocumentViewer'
import { useDocuments } from '@/hooks/useDocuments'
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
  const [saving, setSaving] = useState(false)

  // Demo workspace ID - in production, get from context/routing
  const workspaceId = 'default-workspace'

  // Load document from API
  useEffect(() => {
    async function loadDocument() {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`http://localhost:3002/api/workspaces/${workspaceId}/documents/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.content) {
            setContent(data.content)
          }
          if (data.title) {
            setTitle(data.title)
          }
        } else {
          // Fallback to localStorage if API fails
          const saved = localStorage.getItem(`document_${id}`)
          if (saved) {
            try {
              const parsed = JSON.parse(saved)
              setContent(parsed)
            } catch (e) {
              console.error('Error parsing saved document:', e)
            }
          }
        }
      } catch (error) {
        console.error('Error loading document:', error)
        // Fallback to localStorage
        const saved = localStorage.getItem(`document_${id}`)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            setContent(parsed)
          } catch (e) {
            console.error('Error parsing saved document:', e)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadDocument()
  }, [id, workspaceId])

  const handleSave = useCallback(
    async (newContent: any) => {
      setSaving(true)
      try {
        const token = localStorage.getItem('auth_token')
        
        // Try to save to API first
        const response = await fetch(`http://localhost:3002/api/workspaces/${workspaceId}/documents/${id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title,
            content: newContent
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.title) setTitle(data.title)
        } else {
          // Fallback to localStorage if API fails
          const contentJson = JSON.stringify(newContent)
          localStorage.setItem(`document_${id}`, contentJson)
        }
        
        setContent(newContent)
        setLastSaved(new Date())
        
        // Update title from first header
        const headerBlock = newContent.blocks?.find((b: any) => b.type === 'header')
        if (headerBlock?.data?.text) {
          setTitle(headerBlock.data.text)
        }
      } catch (error) {
        console.error('Error saving document:', error)
        // Fallback to localStorage
        const contentJson = JSON.stringify(newContent)
        localStorage.setItem(`document_${id}`, contentJson)
        setContent(newContent)
        setLastSaved(new Date())
      } finally {
        setSaving(false)
      }
    },
    [id, workspaceId, title]
  )

  const toggleMode = useCallback(() => {
    if (isEditing && content) {
      // Save before switching to view mode
      localStorage.setItem(`document_${id}`, JSON.stringify(content))
    }
    setIsEditing(!isEditing)
  }, [isEditing, content, id])

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
              {saving && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {lastSaved && !saving && (
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
