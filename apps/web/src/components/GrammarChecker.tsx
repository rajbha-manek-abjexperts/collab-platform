'use client'

import { useState } from 'react'
import { SpellCheck, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface GrammarCheckerProps {
  initialText?: string
}

export default function GrammarChecker({ initialText = '' }: GrammarCheckerProps) {
  const [text, setText] = useState(initialText)
  const [result, setResult] = useState<{ issues: string[]; suggestions: string[] } | null>(null)
  const [loading, setLoading] = useState(false)

  async function checkGrammar() {
    if (!text.trim()) return
    
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3002/api/ai/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error('Failed to check grammar:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <SpellCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Grammar & Style</h3>
              <p className="text-sm text-gray-500">AI-powered writing assistant</p>
            </div>
          </div>
          <button
            onClick={checkGrammar}
            disabled={loading || !text.trim()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SpellCheck className="w-4 h-4" />}
            {loading ? 'Checking...' : 'Check Grammar'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Text
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your text here to check for grammar and style issues..."
            className="w-full h-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {result && (
          <div className="space-y-4">
            {result.issues.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Issues Found
                </h4>
                <ul className="space-y-2">
                  {result.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-orange-50 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Suggestions
                </h4>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.issues.length === 0 && result.suggestions.length === 0 && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">No issues found! Your text looks great.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
