'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Save, Loader2, Sparkles, Keyboard } from 'lucide-react'
import type { OutputData } from '@editorjs/editorjs'
import type { DocumentContent } from '@/types/document'
import RichTextEditor from './RichTextEditor'
import AISummarizer from './AISummarizer'
import { getModifierSymbol } from '@/lib/keyboardShortcuts'

interface DocumentEditorProps {
  documentId?: string
  initialContent?: DocumentContent | null
  onSave?: (content: DocumentContent) => void
}

function editorJsToPlainText(data: OutputData): string {
  return data.blocks
    .map((block) => {
      switch (block.type) {
        case 'paragraph':
        case 'header':
          return (block.data.text as string) || ''
        case 'list':
          return ((block.data.items as string[]) || []).join('\n')
        case 'quote':
          return (block.data.text as string) || ''
        case 'code':
          return (block.data.code as string) || ''
        default:
          return ''
      }
    })
    .filter(Boolean)
    .join('\n\n')
}

export default function DocumentEditor({
  documentId = 'new',
  initialContent,
  onSave,
}: DocumentEditorProps) {
  const latestData = useRef<OutputData | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showAI, setShowAI] = useState(false)

  const handleChange = useCallback((data: OutputData) => {
    latestData.current = data
  }, [])

  const handleSave = useCallback(async () => {
    if (!latestData.current) return
    setSaving(true)
    try {
      const plainText = editorJsToPlainText(latestData.current)
      const content: DocumentContent = {
        editorJs: latestData.current,
        plainText,
      }

      if (onSave) {
        onSave(content)
      } else {
        localStorage.setItem(`document_${documentId}`, JSON.stringify(content))
      }
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving document:', error)
    } finally {
      setSaving(false)
    }
  }, [documentId, onSave])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    },
    [handleSave]
  )

  const initialEditorData = initialContent?.editorJs || undefined
  const mod = typeof window !== 'undefined' ? getModifierSymbol() : 'Ctrl'

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950" onKeyDown={handleKeyDown}>
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              title={`Save (${mod}+S)`}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save'}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-1 text-[10px] text-white/60 font-mono">
                {mod === '⌘' ? '⌘' : 'Ctrl+'}S
              </kbd>
            </button>

            {lastSaved && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAI(!showAI)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                showAI
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Tools
            </button>
          </div>
        </div>
      </div>

      {/* Editor + AI Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 min-h-[600px] p-8">
            <RichTextEditor
              initialData={initialEditorData}
              onChange={handleChange}
              placeholder="Start writing your document..."
            />
          </div>
        </div>

        {/* AI Panel */}
        {showAI && (
          <div className="w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-auto p-4">
            <AISummarizer
              documentId={documentId}
              content={latestData.current ? editorJsToPlainText(latestData.current) : ''}
            />
          </div>
        )}
      </div>
    </div>
  )
}
