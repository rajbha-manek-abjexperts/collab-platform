'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Copy, Check } from 'lucide-react'
import { apiFetch } from '@/lib/api'

interface AISummarizerProps {
  documentId: string
  content: string
}

export default function AISummarizer({ documentId, content }: AISummarizerProps) {
  const [summary, setSummary] = useState('')
  const [keyPoints, setKeyPoints] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generateSummary() {
    setLoading(true)
    try {
      const data = await apiFetch<{ summary: string; keyPoints: string[] }>('/api/ai/summarize', {
        method: 'POST',
        body: JSON.stringify({ content }),
      })
      setSummary(data.summary)
      setKeyPoints(data.keyPoints || [])
    } catch (err) {
      console.error('Failed to generate summary:', err)
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Summary</h3>
              <p className="text-sm text-gray-500">Powered by AI</p>
            </div>
          </div>
          <button
            onClick={generateSummary}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>
      </div>

      {summary && (
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <div className="relative">
              <p className="text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">{summary}</p>
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {keyPoints.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Points</h4>
              <ul className="space-y-2">
                {keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-600">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
