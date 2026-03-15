'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  FileText,
  FolderOpen,
  PenTool,
  Filter,
  X,
  Calendar,
} from 'lucide-react'
import {
  searchResources,
  addRecentSearch,
  type SearchResult,
  type SearchFilters,
} from '@/lib/api/search'

const resourceIcons: Record<string, typeof FileText> = {
  document: FileText,
  whiteboard: PenTool,
  workspace: FolderOpen,
}

const typeFilters = [
  { value: '', label: 'All Types' },
  { value: 'document', label: 'Documents' },
  { value: 'whiteboard', label: 'Whiteboards' },
  { value: 'workspace', label: 'Workspaces' },
]

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/50 text-foreground rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})

  const performSearch = useCallback(async (q: string, f: SearchFilters) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const data = await searchResources(q, f, 50)
      setResults(data)
      addRecentSearch(q)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Search on initial load if query param present
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, filters)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query, filters)
  }

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    const next = { ...filters, [key]: value || undefined }
    setFilters(next)
    if (query.trim()) {
      performSearch(query, next)
    }
  }

  const clearFilters = () => {
    setFilters({})
    if (query.trim()) {
      performSearch(query, {})
    }
  }

  const hasActiveFilters = filters.type || filters.dateFrom || filters.dateTo

  function getResultLink(result: SearchResult): string {
    if (result.resource_type === 'workspace') {
      return `/workspaces/${result.resource_id}`
    }
    return `/documents/${result.resource_id}`
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Search</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Find documents, whiteboards, and workspaces
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-sidebar-border bg-background focus-within:border-accent transition-colors">
            <Search className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across everything..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setResults([])
                }}
                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
              hasActiveFilters
                ? 'border-accent text-accent bg-accent/5'
                : 'border-sidebar-border text-muted-foreground hover:bg-sidebar-hover hover:text-foreground'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="h-4.5 w-4.5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>
      </form>

      {/* Filters Panel */}
      {filtersOpen && (
        <div className="mb-6 p-4 rounded-lg border border-sidebar-border bg-background">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-accent hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Type
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-sidebar-border bg-background text-foreground outline-none focus:border-accent transition-colors"
              >
                {typeFilters.map((tf) => (
                  <option key={tf.value} value={tf.value}>
                    {tf.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <Calendar className="h-3 w-3 inline mr-1" />
                From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-sidebar-border bg-background text-foreground outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <Calendar className="h-3 w-3 inline mr-1" />
                To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-sidebar-border bg-background text-foreground outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            <span className="text-sm">Searching...</span>
          </div>
        </div>
      ) : results.length > 0 ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
          <div className="space-y-2">
            {results.map((result) => {
              const Icon = resourceIcons[result.resource_type] || FileText
              return (
                <Link
                  key={result.id}
                  href={getResultLink(result)}
                  className="flex items-start gap-4 p-4 rounded-lg border border-sidebar-border bg-background hover:bg-sidebar-hover transition-colors group"
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-accent/10 text-accent shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                      {highlightMatch(result.title, query)}
                    </h3>
                    {result.content && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {highlightMatch(result.content.slice(0, 200), query)}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] uppercase font-medium text-muted-foreground/50 bg-sidebar-hover px-1.5 py-0.5 rounded">
                        {result.resource_type}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40">
                        Updated {new Date(result.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ) : query.trim() ? (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No results found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">Search your workspace</h3>
          <p className="text-sm text-muted-foreground">
            Enter a query above to search across all documents, whiteboards, and workspaces
          </p>
        </div>
      )}
    </div>
  )
}
