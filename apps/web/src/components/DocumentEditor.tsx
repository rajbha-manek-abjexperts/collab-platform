'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Save,
  Code,
  Quote,
  Sparkles,
} from 'lucide-react'
import type { DocumentContent } from '@/types/document'
import AISummarizer from './AISummarizer'

interface DocumentEditorProps {
  documentId?: string
  initialContent?: DocumentContent | null
  onSave?: (content: DocumentContent) => void
}

type FormatCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'justifyLeft'
  | 'justifyCenter'
  | 'justifyRight'
  | 'undo'
  | 'redo'

interface ToolbarButton {
  command: FormatCommand | 'heading1' | 'heading2' | 'link' | 'code' | 'blockquote'
  icon: typeof Bold
  label: string
  group: number
}

const toolbarButtons: ToolbarButton[] = [
  { command: 'undo', icon: Undo2, label: 'Undo', group: 0 },
  { command: 'redo', icon: Redo2, label: 'Redo', group: 0 },
  { command: 'heading1', icon: Heading1, label: 'Heading 1', group: 1 },
  { command: 'heading2', icon: Heading2, label: 'Heading 2', group: 1 },
  { command: 'bold', icon: Bold, label: 'Bold', group: 2 },
  { command: 'italic', icon: Italic, label: 'Italic', group: 2 },
  { command: 'underline', icon: Underline, label: 'Underline', group: 2 },
  { command: 'strikeThrough', icon: Strikethrough, label: 'Strikethrough', group: 2 },
  { command: 'code', icon: Code, label: 'Inline Code', group: 2 },
  { command: 'insertUnorderedList', icon: List, label: 'Bullet List', group: 3 },
  { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered List', group: 3 },
  { command: 'blockquote', icon: Quote, label: 'Blockquote', group: 3 },
  { command: 'justifyLeft', icon: AlignLeft, label: 'Align Left', group: 4 },
  { command: 'justifyCenter', icon: AlignCenter, label: 'Align Center', group: 4 },
  { command: 'justifyRight', icon: AlignRight, label: 'Align Right', group: 4 },
  { command: 'link', icon: LinkIcon, label: 'Insert Link', group: 5 },
]

export default function DocumentEditor({ documentId, initialContent, onSave }: DocumentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [showSummarizer, setShowSummarizer] = useState(false)

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }, [])

  const handleToolbarClick = useCallback(
    (btn: ToolbarButton) => {
      switch (btn.command) {
        case 'heading1':
          execCommand('formatBlock', 'h1')
          break
        case 'heading2':
          execCommand('formatBlock', 'h2')
          break
        case 'link': {
          const url = prompt('Enter URL:')
          if (url) execCommand('createLink', url)
          break
        }
        case 'code': {
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const code = document.createElement('code')
            code.className = 'bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono'
            range.surroundContents(code)
          }
          break
        }
        case 'blockquote':
          execCommand('formatBlock', 'blockquote')
          break
        default:
          execCommand(btn.command)
      }
    },
    [execCommand]
  )

  const updateCounts = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    const text = el.innerText || ''
    const words = text.trim().split(/\s+/).filter(Boolean)
    setWordCount(words.length)
    setCharCount(text.length)
  }, [])

  const handleSave = useCallback(() => {
    const el = editorRef.current
    if (!el || !onSave) return
    onSave({
      html: el.innerHTML,
      plainText: el.innerText || '',
    })
  }, [onSave])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl/Cmd+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    },
    [handleSave]
  )

  // Group toolbar buttons for dividers
  const groups = toolbarButtons.reduce<Record<number, ToolbarButton[]>>((acc, btn) => {
    ;(acc[btn.group] ??= []).push(btn)
    return acc
  }, {})
  const groupEntries = Object.entries(groups).sort(([a], [b]) => Number(a) - Number(b))

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex-wrap">
        {groupEntries.map(([groupId, buttons], gi) => (
          <div key={groupId} className="flex items-center gap-0.5">
            {gi > 0 && (
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            )}
            {buttons.map((btn) => {
              const Icon = btn.icon
              return (
                <button
                  key={btn.command}
                  title={btn.label}
                  onMouseDown={(e) => {
                    e.preventDefault() // keep focus in editor
                    handleToolbarClick(btn)
                  }}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </button>
              )
            })}
          </div>
        ))}

        <div className="flex-1" />
        <button
          onClick={() => setShowSummarizer(!showSummarizer)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
            showSummarizer
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
              : 'text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          title="AI Summary"
        >
          <Sparkles className="h-4 w-4" />
          AI
        </button>
        {onSave && (
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        )}
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={updateCounts}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: initialContent?.html ?? '' }}
        className="flex-1 p-8 overflow-auto outline-none prose prose-sm dark:prose-invert max-w-none
          [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
          [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3
          [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600
          [&_ul]:list-disc [&_ul]:pl-6
          [&_ol]:list-decimal [&_ol]:pl-6
          [&_a]:text-blue-600 [&_a]:underline"
        data-placeholder="Start typing..."
      />

      {/* AI Summarizer panel */}
      {showSummarizer && (
        <div className="border-t border-gray-200 dark:border-gray-800">
          <AISummarizer
            documentId={documentId || ''}
            content={editorRef.current?.innerText || ''}
          />
        </div>
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400">
        <span>
          {wordCount} {wordCount === 1 ? 'word' : 'words'} &middot; {charCount}{' '}
          {charCount === 1 ? 'character' : 'characters'}
        </span>
        <span className="text-gray-300 dark:text-gray-600">
          Ctrl+S to save
        </span>
      </div>
    </div>
  )
}
