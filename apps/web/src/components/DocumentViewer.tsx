'use client'

import { useEffect, useState } from 'react'
import type { OutputData } from '@editorjs/editorjs'
import { FileText, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

interface DocumentViewerProps {
  content: string | OutputData
}

export default function DocumentViewer({ content }: DocumentViewerProps) {
  const [data, setData] = useState<OutputData | null>(null)

  useEffect(() => {
    if (typeof content === 'string') {
      try {
        setData(JSON.parse(content))
      } catch {
        setData({ time: Date.now(), blocks: [] })
      }
    } else {
      setData(content)
    }
  }, [content])

  if (!data || !data.blocks) {
    return (
      <div className="prose max-w-none">
        <p className="text-gray-400 italic">No content</p>
      </div>
    )
  }

  return (
    <div className="prose max-w-none">
      {data.blocks.map((block: any, index: number) => {
        switch (block.type) {
          case 'header':
            const level = (block.data?.level || 2) as number
            const getHeadingTag = (lvl: number): string => {
              const tags: Record<number, string> = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4' }
              return tags[lvl] || 'h2'
            }
            const HeadingTag = getHeadingTag(level)
            
            if (HeadingTag === 'h1') {
              return (
                <h1 key={index} className="text-4xl font-bold text-gray-900 mb-6 mt-8">
                  {block.data.text}
                </h1>
              )
            }
            if (HeadingTag === 'h2') {
              return (
                <h2 key={index} className="text-2xl font-semibold text-gray-900 mb-4 mt-6">
                  {block.data.text}
                </h2>
              )
            }
            if (HeadingTag === 'h3') {
              return (
                <h3 key={index} className="text-xl font-semibold text-gray-900 mb-3 mt-5">
                  {block.data.text}
                </h3>
              )
            }
            return (
              <h4 key={index} className="text-lg font-medium text-gray-900 mb-2 mt-4">
                {block.data.text}
              </h4>
            )

          case 'paragraph':
            return (
              <p 
                key={index} 
                className="text-gray-700 leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
              />
            )

          case 'list':
            if (block.data.style === 'ordered') {
              return (
                <ol key={index} className="list-decimal list-inside space-y-2 mb-4 ml-4">
                  {block.data.items?.map((item: string, i: number) => (
                    <li key={i} className="text-gray-700">{item}</li>
                  ))}
                </ol>
              )
            }
            return (
              <ul key={index} className="list-disc list-inside space-y-2 mb-4 ml-4">
                {block.data.items?.map((item: string, i: number) => (
                  <li key={i} className="text-gray-700">{item}</li>
                ))}
              </ul>
            )

          case 'nestedList':
            const renderNestedItems = (items: any[], level: number = 0) => {
              return items.map((item, i) => (
                <div key={i} style={{ marginLeft: `${level * 20}px` }} className="mb-1">
                  <span className="text-gray-700">{item.content}</span>
                  {item.children && item.children.length > 0 && (
                    <div>{renderNestedItems(item.children, level + 1)}</div>
                  )}
                </div>
              ))
            }
            return (
              <div key={index} className="mb-4 ml-4">
                {block.data.items ? renderNestedItems(block.data.items) : null}
              </div>
            )

          case 'checklist':
            return (
              <div key={index} className="mb-4 space-y-2">
                {block.data.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                      item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}>
                      {item.checked && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-gray-700 ${item.checked ? 'line-through text-gray-400' : ''}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )

          case 'code':
            return (
              <div key={index} className="mb-4">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono">
                  <code>{block.data.code}</code>
                </pre>
              </div>
            )

          case 'quote':
            return (
              <blockquote key={index} className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 rounded-r-xl">
                <p className="text-gray-700 italic text-lg">{block.data.text}</p>
                {block.data.caption && (
                  <cite className="block text-sm text-gray-500 mt-2">— {block.data.caption}</cite>
                )}
              </blockquote>
            )

          case 'warning':
            const warningStyles = {
              info: 'bg-blue-50 border-blue-500 text-blue-700',
              warning: 'bg-yellow-50 border-yellow-500 text-yellow-700',
              success: 'bg-green-50 border-green-500 text-green-700'
            }
            const warningIcons = {
              info: <Info className="w-5 h-5" />,
              warning: <AlertTriangle className="w-5 h-5" />,
              success: <CheckCircle className="w-5 h-5" />
            }
            const warningLevel = block.data.message || 'info'
            return (
              <div key={index} className={`mb-4 p-4 rounded-xl border-l-4 ${warningStyles[warningLevel as keyof typeof warningStyles] || warningStyles.info}`}>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-0.5">
                    {warningIcons[warningLevel as keyof typeof warningIcons] || warningIcons.info}
                  </span>
                  <div>
                    {block.data.title && (
                      <p className="font-semibold mb-1">{block.data.title}</p>
                    )}
                    <p className="text-gray-700">{block.data.message}</p>
                  </div>
                </div>
              </div>
            )

          case 'delimiter':
            return (
              <hr key={index} className="my-8 border-gray-200" />
            )

          case 'embed':
            return (
              <div key={index} className="mb-4">
                <iframe
                  src={block.data.embed}
                  className="w-full aspect-video rounded-xl"
                  frameBorder="0"
                  allowFullScreen
                />
                {block.data.caption && (
                  <p className="text-center text-sm text-gray-500 mt-2">{block.data.caption}</p>
                )}
              </div>
            )

          case 'attaches':
            return (
              <div key={index} className="mb-4">
                <a 
                  href={block.data.file?.url}
                  download={block.data.file?.name}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{block.data.file?.name}</p>
                    <p className="text-sm text-gray-500">
                      {block.data.file?.size ? `${Math.round(block.data.file.size / 1024)} KB` : ''}
                    </p>
                  </div>
                </a>
              </div>
            )

          case 'table':
            return (
              <div key={index} className="overflow-x-auto mb-4">
                <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
                  {block.data.withHeadings && block.data.content?.[0] && (
                    <thead className="bg-gray-50">
                      <tr>
                        {block.data.content[0].map((_: any, i: number) => (
                          <th key={i} className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b">
                            {block.data.content[0][i]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {block.data.content?.slice(1).map((row: string[], rowIndex: number) => (
                      <tr key={rowIndex} className="border-b border-gray-100">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 text-sm text-gray-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

          case 'link':
            return (
              <p key={index} className="mb-4">
                <a 
                  href={block.data.link} 
                  className="text-blue-600 hover:text-blue-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {block.data.meta?.title || block.data.link}
                </a>
              </p>
            )

          case 'image':
            return (
              <figure key={index} className="mb-4">
                <img 
                  src={block.data.file?.url || block.data.url} 
                  alt={block.data.caption || ''}
                  className="rounded-xl max-w-full"
                />
                {block.data.caption && (
                  <figcaption className="text-center text-sm text-gray-500 mt-2">
                    {block.data.caption}
                  </figcaption>
                )}
              </figure>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
