'use client'

import { useState, useMemo } from 'react'
import { X, Search, Command, ArrowUp } from 'lucide-react'
import { defaultShortcuts } from '@/hooks/useKeyboardShortcuts'

interface ShortcutsHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ShortcutsHelpModal({ isOpen, onClose }: ShortcutsHelpModalProps) {
  const [search, setSearch] = useState('')

  const filteredShortcuts = useMemo(() => {
    if (!search) return defaultShortcuts
    return defaultShortcuts.filter(s => 
      s.description.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const grouped = useMemo(() => {
    const groups = {
      navigation: defaultShortcuts.filter(s => s.category === 'navigation'),
      editing: defaultShortcuts.filter(s => s.category === 'editing'),
      formatting: defaultShortcuts.filter(s => s.category === 'formatting'),
      actions: defaultShortcuts.filter(s => s.category === 'actions'),
    }
    return search ? { all: filteredShortcuts } : groups
  }, [filteredShortcuts, search])

  if (!isOpen) return null

  const renderKey = (key: string) => {
    if (key === 'Control' || key === 'Meta' || key === 'Shift' || key === 'Alt') {
      return (
        <kbd className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-mono">
          {key === 'Meta' ? '⌘' : key}
        </kbd>
      )
    }
    return (
      <kbd className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-mono min-w-[24px] text-center">
        {key}
      </kbd>
    )
  }

  const renderShortcut = (shortcut: typeof defaultShortcuts[0]) => {
    const keys: React.ReactNode[] = []
    
    if (shortcut.ctrl) keys.push(renderKey('Control'))
    if (shortcut.meta) keys.push(renderKey('Meta'))
    if (shortcut.shift) keys.push(renderKey('Shift'))
    if (shortcut.alt) keys.push(renderKey('Alt'))
    keys.push(renderKey(shortcut.key.toUpperCase()))

    return (
      <div key={shortcut.description} className="flex items-center justify-between py-2">
        <span className="text-gray-600">{shortcut.description}</span>
        <div className="flex items-center gap-1">
          {keys}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search shortcuts..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {search ? (
            <div className="space-y-1">
              {filteredShortcuts.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No shortcuts found</p>
              ) : (
                filteredShortcuts.map(renderShortcut)
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Navigation */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Navigation
                </h3>
                <div className="space-y-1">
                  {grouped.navigation.map(renderShortcut)}
                </div>
              </div>

              {/* Editing */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Editing
                </h3>
                <div className="space-y-1">
                  {grouped.editing.map(renderShortcut)}
                </div>
              </div>

              {/* Formatting */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Formatting
                </h3>
                <div className="space-y-1">
                  {grouped.formatting.map(renderShortcut)}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Actions
                </h3>
                <div className="space-y-1">
                  {grouped.actions.map(renderShortcut)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">/</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  )
}
