'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, FileText, FilePen, Layers } from 'lucide-react'

interface SearchResult {
  id: string
  type: 'document' | 'whiteboard' | 'workspace'
  title: string
  workspace?: string
  updatedAt: string
  snippet?: string
}

function SearchContent() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('q')

  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam)
    }
  }, [queryParam])

  function handleSearch(searchQuery: string) {
    if (!searchQuery.trim()) return
    setLoading(true)
    // Simulated search - in production would call API
    setTimeout(() => {
      setResults([
        { id: '1', type: 'document', title: 'Project Plan', workspace: 'My Workspace', updatedAt: new Date().toISOString() },
        { id: '2', type: 'whiteboard', title: 'Brainstorm', workspace: 'My Workspace', updatedAt: new Date().toISOString() },
      ])
      setLoading(false)
    }, 500)
  }

  function getIcon(type: string) {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5" />
      case 'whiteboard': return <FilePen className="h-5 w-5" />
      default: return <Layers className="h-5 w-5" />
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        <p className="text-gray-600 mt-1">Find documents, whiteboards, and more</p>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
          <Filter className="h-5 w-5" />
          Filters
        </button>
      </div>

      {loading && <div className="text-center py-8 text-gray-500">Searching...</div>}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((result) => (
            <div key={result.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{result.title}</h3>
                  <p className="text-sm text-gray-500">{result.workspace} • {result.type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-8 text-gray-500">No results found</div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}
