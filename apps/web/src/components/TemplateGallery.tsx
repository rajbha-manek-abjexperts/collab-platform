'use client'

import { useState } from 'react'
import {
  Search,
  FileText,
  PenTool,
  FolderOpen,
  LayoutGrid,
  List,
  Star,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export interface Template {
  id: string
  name: string
  description: string | null
  type: 'document' | 'whiteboard' | 'workspace'
  category: string | null
  content: Record<string, unknown>
  is_public: boolean
  created_by: string | null
  usage_count: number
  created_at: string
}

const categories = [
  { value: 'all', label: 'All Templates' },
  { value: 'project', label: 'Project Management' },
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'hr', label: 'HR & People' },
  { value: 'education', label: 'Education' },
]

const typeIcons = {
  document: FileText,
  whiteboard: PenTool,
  workspace: FolderOpen,
}

const typeColors = {
  document: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
  whiteboard: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
  workspace: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
}

interface TemplateGalleryProps {
  templates: Template[]
  onUseTemplate: (template: Template) => void
  showHeader?: boolean
}

export default function TemplateGallery({
  templates,
  onUseTemplate,
  showHeader = true,
}: TemplateGalleryProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState<'all' | Template['type']>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filtered = templates.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
    const matchesType = selectedType === 'all' || t.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  return (
    <div>
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Templates</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Start quickly with pre-built templates for documents, whiteboards, and workspaces.
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5">
          {(['all', 'document', 'whiteboard', 'workspace'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${
              viewMode === 'grid'
                ? 'bg-gray-100 dark:bg-gray-800 text-foreground'
                : 'text-gray-400 hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-colors ${
              viewMode === 'list'
                ? 'bg-gray-100 dark:bg-gray-800 text-foreground'
                : 'text-gray-400 hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.value
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
            <Sparkles className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No templates found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {search
              ? `No templates match "${search}". Try adjusting your search or filters.`
              : 'No templates available in this category yet.'}
          </p>
        </div>
      )}

      {/* Grid View */}
      {filtered.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template) => {
            const Icon = typeIcons[template.type]
            const colors = typeColors[template.type]
            return (
              <div
                key={template.id}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  {template.usage_count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Star className="h-3 w-3" />
                      <span>{template.usage_count}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{template.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                  {template.description || 'No description'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 capitalize">{template.type}</span>
                  <button
                    onClick={() => onUseTemplate(template)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Use Template
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {filtered.length > 0 && viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Template
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Type
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Uses
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((template) => {
                const Icon = typeIcons[template.type]
                const colors = typeColors[template.type]
                return (
                  <tr
                    key={template.id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                          <Icon className={`h-4 w-4 ${colors.text}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{template.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {template.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 capitalize hidden md:table-cell">
                      {template.type}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {template.category || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {template.usage_count}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onUseTemplate(template)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Use
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Results Count */}
      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-4">
          {filtered.length} template{filtered.length !== 1 ? 's' : ''}
          {selectedCategory !== 'all' || selectedType !== 'all' || search ? ' found' : ' available'}
        </p>
      )}
    </div>
  )
}
