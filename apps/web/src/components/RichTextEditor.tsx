'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import EditorJS, { EditorConfig, OutputData } from '@editorjs/editorjs'
// @ts-ignore - Editor.js types
import Header from '@editorjs/header'
// @ts-ignore
import List from '@editorjs/list'
// @ts-ignore
import Paragraph from '@editorjs/paragraph'
// @ts-ignore
import Code from '@editorjs/code'
// @ts-ignore
import Quote from '@editorjs/quote'
// @ts-ignore
import Table from '@editorjs/table'
// @ts-ignore
import Link from '@editorjs/link'
// @ts-ignore
import Marker from '@editorjs/marker'
// @ts-ignore
import InlineCode from '@editorjs/inline-code'
// @ts-ignore
import Checklist from '@editorjs/checklist'
// @ts-ignore
import Delimiter from '@editorjs/delimiter'
// @ts-ignore
import Warning from '@editorjs/warning'
// @ts-ignore
import Embed from '@editorjs/embed'
// @ts-ignore
import Attaches from '@editorjs/attaches'
// @ts-ignore
import NestedList from '@editorjs/nested-list'

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
  readOnly = false
}: RichTextEditorProps) {
  const ejInstance = useRef<EditorJS | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  const initEditor = useCallback(() => {
    if (!containerRef.current || ejInstance.current) return

    const editorConfig: EditorConfig = {
      holder: containerRef.current,
      readOnly,
      placeholder,
      data: initialData || { time: Date.now(), blocks: [] },
      onChange: async () => {
        if (ejInstance.current) {
          try {
            const data = await ejInstance.current.save()
            onChange?.(data)
          } catch (error) {
            console.error('Error saving editor data:', error)
          }
        }
      },
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: 'Enter a heading',
            levels: [1, 2, 3, 4],
            defaultLevel: 2
          }
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        },
        nestedList: {
          class: NestedList,
          inlineToolbar: true
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true
        },
        code: {
          class: Code,
          inlineToolbar: false
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: "Quote's author"
          }
        },
        table: {
          class: Table,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3,
            withHeadings: true
          }
        },
        link: {
          class: Link,
          inlineToolbar: true
        },
        marker: {
          class: Marker,
          inlineToolbar: true
        },
        inlineCode: {
          class: InlineCode,
          inlineToolbar: true
        },
        delimiter: {
          class: Delimiter
        },
        warning: {
          class: Warning,
          config: {
            placeholder: 'Enter a warning...',
            defaultLevel: 'info'
          }
        },
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              twitter: true,
              facebook: true,
              instagram: true,
              vimeo: true,
              imgur: true
            }
          }
        },
        attaches: {
          class: Attaches,
          config: {
            uploader: {
              async uploadByFile(file: File) {
                // Demo: create object URL
                return {
                  success: 1,
                  file: {
                    url: URL.createObjectURL(file),
                    name: file.name,
                    size: file.size
                  }
                }
              }
            }
          }
        }
      }
    }

    ejInstance.current = new EditorJS(editorConfig)
    ejInstance.current.isReady.then(() => {
      setIsReady(true)
    })
  }, [initialData, onChange, placeholder, readOnly])

  useEffect(() => {
    initEditor()

    return () => {
      if (ejInstance.current) {
        ejInstance.current.destroy()
        ejInstance.current = null
      }
    }
  }, [initEditor])

  return (
    <div className="rich-text-editor">
      <div 
        ref={containerRef} 
        className="prose max-w-none min-h-[400px] bg-white rounded-xl"
      />
      <style jsx global>{`
        .codex-editor__redactor {
          padding-bottom: 100px !important;
        }
        .ce-block__content {
          max-width: 100%;
        }
        .ce-toolbar__content {
          max-width: 100%;
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
        .ce-delimiter {
          margin: 1.5em 0;
        }
        .ce-warning {
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1em 0;
        }
        .ce-warning--info {
          background-color: #eff6ff;
          border-left: 4px solid #3b82f6;
        }
        .ce-warning--warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
        }
        .ce-warning--success {
          background-color: #d1fae5;
          border-left: 4px solid #10b981;
        }
        .ce-embed {
          margin: 1em 0;
        }
      `}</style>
    </div>
  )
}
