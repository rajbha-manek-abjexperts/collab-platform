'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, Search, MoreHorizontal, Clock } from 'lucide-react'

interface Document {
  id: string
  title: string
  workspace_id: string
  workspace_name: string
  updated_at: string
  created_by: string
}

export default function DocumentsPage() {
  const [documents] = useState<Document[]>([])
  const [search, setSearch] = useState('')

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Browse and manage all your documents.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="h-4 w-4" />
          New Document
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <FileText className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create your first document to get started.
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <Plus className="h-4 w-4" />
            Create Document
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-200 dark:divide-gray-800">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-sm">{doc.title}</p>
                  <p className="text-xs text-gray-400">{doc.workspace_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
