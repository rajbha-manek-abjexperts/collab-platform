'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type EditorJS from '@editorjs/editorjs'
import type { OutputData } from '@editorjs/editorjs'

interface RichTextEditorProps {
  initialData?: OutputData
  onChange?: (data: OutputData) => void
  placeholder?: string
  readOnly?: boolean
}

export default function RichTextEditor({
  initialData,
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
}: RichTextEditorProps) {
  const ejInstance = useRef<EditorJS | null>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const isInitializing = useRef(false)

  const initEditor = useCallback(async () => {
    if (isInitializing.current || ejInstance.current) return
    if (!holderRef.current) return
    isInitializing.current = true

    // Dynamic imports to avoid SSR issues with Editor.js
    const [
      { default: EditorJSClass },
      { default: Header },
      { default: List },
      { default: Paragraph },
      { default: Code },
      { default: Quote },
      { default: Table },
      { default: LinkTool },
      { default: Marker },
      { default: InlineCode },
    ] = await Promise.all([
      import('@editorjs/editorjs'),
      import('@editorjs/header'),
      import('@editorjs/list'),
      import('@editorjs/paragraph'),
      import('@editorjs/code'),
      import('@editorjs/quote'),
      import('@editorjs/table'),
      import('@editorjs/link'),
      import('@editorjs/marker'),
      import('@editorjs/inline-code'),
    ])

    const editor = new EditorJSClass({
      holder: holderRef.current!,
      readOnly,
      placeholder,
      data: initialData || { time: Date.now(), blocks: [] },
      onChange: async (api) => {
        const data = await api.saver.save()
        onChange?.(data)
      },
      tools: {
        header: {
          class: Header as never,
          config: {
            placeholder: 'Enter a heading',
            levels: [1, 2, 3, 4],
            defaultLevel: 2,
          },
        },
        list: {
          class: List as never,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered',
          },
        },
        paragraph: {
          class: Paragraph as never,
          inlineToolbar: true,
        },
        code: {
          class: Code as never,
        },
        quote: {
          class: Quote as never,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: "Quote's author",
          },
        },
        table: {
          class: Table as never,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3,
            withHeadings: true,
          },
        },
        linkTool: {
          class: LinkTool as never,
        },
        marker: {
          class: Marker as never,
        },
        inlineCode: {
          class: InlineCode as never,
        },
      },
    })

    await editor.isReady
    ejInstance.current = editor
    setIsReady(true)
    isInitializing.current = false
  }, [initialData, onChange, placeholder, readOnly])

  useEffect(() => {
    initEditor()

    return () => {
      if (ejInstance.current && ejInstance.current.destroy) {
        ejInstance.current.destroy()
        ejInstance.current = null
      }
    }
  }, [initEditor])

  return (
    <div className="rich-text-editor h-full flex flex-col relative">
      <div
        ref={holderRef}
        className="flex-1 overflow-auto prose prose-sm dark:prose-invert max-w-none px-8 py-6"
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80">
          <div className="text-sm text-gray-400">Loading editor...</div>
        </div>
      )}
      <style jsx global>{`
        .ce-block__content {
          max-width: 100%;
        }
        .ce-toolbar__content {
          max-width: 100%;
        }
        .codex-editor__redactor {
          padding-bottom: 100px !important;
        }
        .ce-toolbar__actions {
          right: 0;
        }
        .ce-header {
          font-weight: 600;
          margin: 1em 0 0.5em;
        }
        .ce-paragraph {
          line-height: 1.7;
        }
        .ce-code__textarea {
          font-family: 'Monaco', 'Menlo', monospace;
        }
        .ce-quote__text {
          font-style: italic;
        }
      `}</style>
    </div>
  )
}
