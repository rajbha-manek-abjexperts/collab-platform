'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Lock, Eye, FileText, Layout, Loader2, AlertCircle } from 'lucide-react'
import { apiFetch } from '@/lib/api'

interface SharedContent {
  resource_type: 'document' | 'whiteboard'
  resource: Record<string, unknown>
  view_count: number
  max_views: number | null
}

export default function SharedPage() {
  const params = useParams()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<SharedContent | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadSharedContent()
  }, [slug])

  async function loadSharedContent(pw?: string) {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (pw) params.set('password', pw)
      const qs = params.toString()

      const data = await apiFetch<SharedContent>(
        `/api/sharing/public/${slug}${qs ? `?${qs}` : ''}`,
      )

      setContent(data)
      setNeedsPassword(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'

      if (message.toLowerCase().includes('password')) {
        setNeedsPassword(true)
        if (pw) {
          setError('Incorrect password.')
        }
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    await loadSharedContent(password)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error && !needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md mx-4">
          <div className="inline-flex p-3 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Unable to access
          </h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-sm mx-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full mb-4">
                <Lock className="h-8 w-8 text-amber-500" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                Password Required
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                This content is password protected
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!password || submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Unlock'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (!content) return null

  const resource = content.resource as Record<string, unknown>
  const isDocument = content.resource_type === 'document'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              {isDocument ? (
                <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Layout className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <h1 className="text-sm font-medium text-foreground truncate max-w-[300px]">
              {(resource.title as string) || 'Untitled'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Eye className="h-3.5 w-3.5" />
            <span>
              {content.view_count} view{content.view_count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {isDocument ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-foreground mb-6">
              {(resource.title as string) || 'Untitled Document'}
            </h1>
            {resource.content ? (
              <div className="prose dark:prose-invert max-w-none text-foreground">
                <pre className="whitespace-pre-wrap text-sm font-normal">
                  {typeof resource.content === 'string'
                    ? resource.content
                    : JSON.stringify(resource.content, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-400 italic">This document is empty.</p>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-foreground mb-6">
              {(resource.title as string) || 'Whiteboard'}
            </h1>
            <div className="aspect-video bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-400 text-sm">
                Whiteboard preview is view-only
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
