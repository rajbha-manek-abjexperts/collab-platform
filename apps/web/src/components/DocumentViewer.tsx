'use client'

import { useEffect, useState } from 'react'
import type { OutputData } from '@editorjs/editorjs'

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
      {data.blocks.map((block, index) => {
        switch (block.type) {
          case 'header':
            const HeadingTag = `h${block.data.level || 2}` as keyof JSX.IntrinsicElements
            const HeadingComponent = {
              1: 'h1',
              2: 'h2', 
              3: 'h3',
              4: 'h4'
            }[block.data.level || 2] || 'h2'
            
            if (HeadingComponent === 'h1') {
              return (
                <h1 key={index} className="text-4xl font-bold text-gray-900 mb-6 mt-8">
                  {block.data.text}
                </h1>
              )
            }
            if (HeadingComponent === 'h2') {
              return (
                <h2 key={index} className="text-2xl font-semibold text-gray-900 mb-4 mt-6">
                  {block.data.text}
                </h2>
              )
            }
            if (HeadingComponent === 'h3') {
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
