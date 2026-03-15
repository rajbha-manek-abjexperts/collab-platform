'use client'

import { useState, useMemo, useEffect } from 'react'
import { X, Search, Keyboard } from 'lucide-react'
import {
  shortcuts as allShortcuts,
  categoryLabels,
  formatShortcutKeys,
  type ShortcutCategory,
  type ShortcutDefinition,
} from '@/lib/keyboardShortcuts'

interface ShortcutsHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

const categoryOrder: ShortcutCategory[] = ['navigation', 'editing', 'formatting', 'actions']

export default function ShortcutsHelpModal({ isOpen, onClose }: ShortcutsHelpModalProps) {
  const [search, setSearch] = useState('')

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) setSearch('')
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const filteredShortcuts = useMemo(() => {
    if (!search) return allShortcuts
    const q = search.toLowerCase()
    return allShortcuts.filter(
      s => s.description.toLowerCase().includes(q) || s.category.includes(q)
    )
  }, [search])

  const groupedByCategory = useMemo(() => {
    const map = new Map<ShortcutCategory, ShortcutDefinition[]>()
    for (const s of filteredShortcuts) {
      const list = map.get(s.category) ?? []
      list.push(s)
      map.set(s.category, list)
    }
    return map
  }, [filteredShortcuts])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700/50">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                <Keyboard className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Navigate faster with shortcuts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search shortcuts..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-shadow"
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4 max-h-[400px] overflow-y-auto">
          {filteredShortcuts.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No shortcuts match &ldquo;{search}&rdquo;
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {categoryOrder
                .filter(cat => groupedByCategory.has(cat))
                .map(category => (
                  <div key={category}>
                    <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      {categoryLabels[category]}
                    </h3>
                    <div className="space-y-0.5">
                      {groupedByCategory.get(category)!.map(shortcut => (
                        <ShortcutRow key={shortcut.id} shortcut={shortcut} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Press{' '}
            <KeyCap>⌘</KeyCap>
            {' '}+{' '}
            <KeyCap>/</KeyCap>
            {' '}anytime to toggle this panel
          </p>
        </div>
      </div>
    </div>
  )
}

function ShortcutRow({ shortcut }: { shortcut: ShortcutDefinition }) {
  const keys = formatShortcutKeys(shortcut)

  return (
    <div className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {shortcut.description}
      </span>
      <div className="flex items-center gap-1 shrink-0 ml-4">
        {keys.map((key, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300 dark:text-gray-600 text-xs">+</span>}
            <KeyCap>{key}</KeyCap>
          </span>
        ))}
      </div>
    </div>
  )
}

function KeyCap({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_1px_rgba(0,0,0,0.2)] font-mono">
      {children}
    </kbd>
  )
}
