'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Link2,
  Copy,
  Check,
  Trash2,
  Lock,
  Clock,
  Eye,
  Loader2,
  Globe,
} from 'lucide-react'
import { getClient, unwrap } from '@/lib/api'

interface SharedLink {
  id: string
  slug: string
  resource_type: string
  resource_id: string
  password_protected: boolean
  expires_at: string | null
  max_views: number | null
  view_count: number
  created_at: string
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  resourceType: 'document' | 'whiteboard'
  resourceId: string
  resourceTitle?: string
}

export default function ShareModal({
  isOpen,
  onClose,
  resourceType,
  resourceId,
  resourceTitle,
}: ShareModalProps) {
  const [links, setLinks] = useState<SharedLink[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Create form state
  const [password, setPassword] = useState('')
  const [usePassword, setUsePassword] = useState(false)
  const [expiresIn, setExpiresIn] = useState('')
  const [maxViews, setMaxViews] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchLinks()
    }
  }, [isOpen, resourceType, resourceId])

  async function fetchLinks() {
    setLoading(true)
    try {
      const supabase = getClient()
      const { data } = await supabase
        .from('shared_links')
        .select('id, slug, resource_type, resource_id, password_protected, expires_at, max_views, view_count, created_at')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false })
      setLinks(data || [])
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }

  async function createLink() {
    setCreating(true)
    try {
      const supabase = getClient()
      let expiresAt: string | undefined
      if (expiresIn) {
        const date = new Date()
        const hours = parseInt(expiresIn, 10)
        date.setHours(date.getHours() + hours)
        expiresAt = date.toISOString()
      }

      const slug = generateSlug()
      const { data: link } = await supabase
        .from('shared_links')
        .insert({
          resource_type: resourceType,
          resource_id: resourceId,
          slug,
          password_protected: usePassword && password.length > 0,
          password_hash: usePassword && password ? hashPassword(password) : null,
          expires_at: expiresAt || null,
          max_views: maxViews ? parseInt(maxViews, 10) : null,
        })
        .select()
        .single()

      if (link) {
        setLinks((prev) => [link, ...prev])
        setPassword('')
        setUsePassword(false)
        setExpiresIn('')
        setMaxViews('')
      }
    } catch {
      // silently handle
    } finally {
      setCreating(false)
    }
  }

  async function deleteLink(id: string) {
    try {
      const supabase = getClient()
      await supabase.from('shared_links').delete().eq('id', id)
      setLinks((prev) => prev.filter((l) => l.id !== id))
    } catch {
      // silently handle
    }
  }

  function getShareUrl(slug: string) {
    return `${window.location.origin}/shared/${slug}`
  }

  function copyLink(slug: string, id: string) {
    navigator.clipboard.writeText(getShareUrl(slug))
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function generateSlug(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    for (let i = 0; i < 16; i++) {
      result += chars[array[i] % chars.length]
    }
    return result
  }

  function hashPassword(pw: string): string {
    // Simple client-side hash for storage; the API also validates
    let hash = 0
    for (let i = 0; i < pw.length; i++) {
      const char = pw.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash |= 0
    }
    return hash.toString(16)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Share</h2>
              {resourceTitle && (
                <p className="text-sm text-gray-500 truncate max-w-[280px]">
                  {resourceTitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Create Link Section */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 space-y-4">
          <h3 className="text-sm font-medium text-foreground">
            Generate a public link
          </h3>

          {/* Password toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={usePassword}
                onChange={(e) => setUsePassword(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <Lock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-foreground">
                Password protect
              </span>
            </label>
          </div>

          {usePassword && (
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          )}

          {/* Expiration & Max Views */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                <Clock className="h-3.5 w-3.5" />
                Expires in
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                <option value="">Never</option>
                <option value="1">1 hour</option>
                <option value="24">24 hours</option>
                <option value="168">7 days</option>
                <option value="720">30 days</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                <Eye className="h-3.5 w-3.5" />
                Max views
              </label>
              <input
                type="number"
                placeholder="Unlimited"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                min="1"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={createLink}
            disabled={creating || (usePassword && !password)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            {creating ? 'Generating...' : 'Generate Link'}
          </button>
        </div>

        {/* Existing Links */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="text-sm font-medium text-foreground mb-3">
            Active links
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : links.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No shared links yet
            </p>
          ) : (
            <div className="space-y-2">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        /shared/{link.slug}
                      </code>
                      {link.password_protected && (
                        <Lock className="h-3 w-3 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{link.view_count} views</span>
                      {link.max_views && (
                        <span>/ {link.max_views} max</span>
                      )}
                      {link.expires_at && (
                        <span>
                          Expires{' '}
                          {new Date(link.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={() => copyLink(link.slug, link.id)}
                      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Copy link"
                    >
                      {copiedId === link.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete link"
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
