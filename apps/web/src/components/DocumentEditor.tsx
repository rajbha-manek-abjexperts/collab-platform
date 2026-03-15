'use client'

import { useState, useCallback } from 'react'
import { Save, Loader2, Sparkles, Bold, Italic, List, ListOrdered, Code, Quote, Link as LinkIcon } from 'lucide-react'
import RichTextEditor from './RichTextEditor'
import AISummarizer from './AISummarizer'
import type { OutputData } from '@editorjs/editorjs'

interface DocumentEditorProps {
  documentId?: string
  initialContent?: any
  onSave?: (content: any) => void
}

export default function DocumentEditor({ 
  documentId = 'new',
  initialContent,
  onSave 
}: DocumentEditorProps) {
  const [content, setContent] = useState<OutputData>(initialContent || { time: Date.now(), blocks: [] })
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showAI, setShowAI] = useState(false)

  const handleContentChange = useCallback((data: OutputData) => {
    setContent(data)
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      // Save the JSON content
      const contentJson = JSON.stringify(content)
      
      if (onSave) {
        onSave(content)
      } else {
        // Default: save to localStorage for demo
        localStorage.setItem(`document_${documentId}`, contentJson)
      }
      
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving document:', error)
    } finally {
      setSaving(false)
    }
  }, [content, documentId, onSave])

  // Convert Editor.js JSON to plain text for AI summarization
  const getPlainText = useCallback(() => {
    return content.blocks
      .map((block: any) => {
        if (block.type === 'paragraph') return block.data.text
        if (block.type === 'header') return `Heading: ${block.data.text}`
        if (block.type === 'list') return block.data.items?.join('\n') || ''
        if (block.type === 'code') return block.data.code
        if (block.type === 'quote') return block.data.text
        return ''
      })
      .join('\n\n')
  }, [content])

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save'}
            </button>
            
            {lastSaved && (
              <span className="text-sm text-gray-500">
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
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] p-8">
            <RichTextEditor
              initialData={content}
              onChange={handleContentChange}
              placeholder="Start writing your document..."
            />
          </div>
        </div>

        {/* AI Panel */}
        {showAI && (
          <div className="w-96 bg-white border-l border-gray-200 overflow-auto p-4">
            <AISummarizer
              documentId={documentId}
              content={getPlainText()}
            />
          </div>
        )}
      </div>
    </div>
  )
}
