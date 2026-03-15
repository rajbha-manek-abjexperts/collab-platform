'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
  FileText,
  FolderOpen,
  PenTool,
  Clock,
  ArrowRight,
  Trash2,
} from 'lucide-react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import {
  searchResources,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  type SearchResult,
} from '@/lib/api/search'

const resourceIcons: Record<string, typeof FileText> = {
  document: FileText,
  whiteboard: PenTool,
  workspace: FolderOpen,
}

export default function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Open with Ctrl+Shift+F
  useKeyboardShortcuts([
    {
      key: 'f',
      ctrl: true,
      shift: true,
      global: true,
      action: () => setOpen((prev) => !prev),
    },
  ])

  // Load recent searches when opened
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches())
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      setQuery('')
      setResults([])
      setActiveIndex(0)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setActiveIndex(0)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchResources(query)
        setResults(data)
        setActiveIndex(0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const activeEl = listRef.current.querySelector('[data-active="true"]')
    activeEl?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const close = useCallback(() => setOpen(false), [])

  const navigateToResult = useCallback(
    (result: SearchResult) => {
      addRecentSearch(query)
      close()
      if (result.resource_type === 'workspace') {
        router.push(`/workspaces/${result.resource_id}`)
      } else {
        router.push(`/documents/${result.resource_id}`)
      }
    },
    [query, close, router]
  )

  const handleRecentClick = useCallback(
    (term: string) => {
      setQuery(term)
    },
    []
  )

  const handleViewAll = useCallback(() => {
    if (query.trim()) {
      addRecentSearch(query)
      close()
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }, [query, close, router])

  const totalItems = results.length + (query.trim() ? 1 : 0) // +1 for "View all"

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => (i + 1) % Math.max(totalItems, 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => (i - 1 + Math.max(totalItems, 1)) % Math.max(totalItems, 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex < results.length) {
          navigateToResult(results[activeIndex])
        } else if (query.trim()) {
          handleViewAll()
        }
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <div className="relative flex items-start justify-center pt-[20vh]">
        <div
          className="w-full max-w-lg bg-dropdown border border-sidebar-border rounded-xl shadow-2xl overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 border-b border-sidebar-border">
            <Search className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents, workspaces..."
              className="flex-1 py-3.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/50 bg-background/50 rounded border border-sidebar-border">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {/* Loading state */}
            {loading && (
              <div className="px-4 py-3 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-3.5 w-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                  Searching...
                </div>
              </div>
            )}

            {/* Search results */}
            {!loading && query.trim() && results.length > 0 && (
              <>
                <div className="px-4 py-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                    Results
                  </span>
                </div>
                {results.map((result, index) => {
                  const Icon = resourceIcons[result.resource_type] || FileText
                  const isActive = index === activeIndex
                  return (
                    <button
                      key={result.id}
                      data-active={isActive}
                      onClick={() => navigateToResult(result)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                        isActive
                          ? 'bg-accent/10 text-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-hover hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {result.title}
                        </p>
                        {result.content && (
                          <p className="text-xs text-muted-foreground/60 truncate">
                            {result.content.slice(0, 100)}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/40 capitalize shrink-0">
                        {result.resource_type}
                      </span>
                    </button>
                  )
                })}
                {/* View all results link */}
                <button
                  data-active={activeIndex === results.length}
                  onClick={handleViewAll}
                  onMouseEnter={() => setActiveIndex(results.length)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-t border-sidebar-border mt-1 ${
                    activeIndex === results.length
                      ? 'bg-accent/10 text-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-hover hover:text-foreground'
                  }`}
                >
                  <ArrowRight className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">
                    View all results for &ldquo;{query}&rdquo;
                  </span>
                </button>
              </>
            )}

            {/* No results */}
            {!loading && query.trim() && results.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No results found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Try a different search term
                </p>
              </div>
            )}

            {/* Recent searches (when no query) */}
            {!query.trim() && recentSearches.length > 0 && (
              <>
                <div className="px-4 py-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                    Recent Searches
                  </span>
                  <button
                    onClick={() => {
                      clearRecentSearches()
                      setRecentSearches([])
                    }}
                    className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                </div>
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleRecentClick(term)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors"
                  >
                    <Clock className="h-4 w-4 shrink-0" />
                    <span className="text-sm truncate">{term}</span>
                  </button>
                ))}
              </>
            )}

            {/* Empty state */}
            {!query.trim() && recentSearches.length === 0 && (
              <div className="px-4 py-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Search across all your documents and workspaces
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Start typing to find what you&apos;re looking for
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-sidebar-border text-[11px] text-muted-foreground/50">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-sidebar-border text-[10px]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-sidebar-border text-[10px]">↵</kbd>
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-sidebar-border text-[10px]">esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
