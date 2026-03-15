'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { createCommands, getCategoryLabel, type Command, type CommandCategory } from '@/lib/commands'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDark, setIsDark] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [open])

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.toggle('dark')
    setIsDark((prev) => !prev)
  }, [])

  const commands = useMemo(
    () => createCommands({ router, toggleTheme, isDark }),
    [router, toggleTheme, isDark]
  )

  const filtered = useMemo(() => {
    if (!query) return commands
    const q = query.toLowerCase()
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.category.includes(q)
    )
  }, [commands, query])

  const grouped = useMemo(() => {
    const groups = new Map<CommandCategory, Command[]>()
    for (const cmd of filtered) {
      const list = groups.get(cmd.category) ?? []
      list.push(cmd)
      groups.set(cmd.category, list)
    }
    return groups
  }, [filtered])

  // Flat list for keyboard navigation
  const flatList = useMemo(() => {
    const items: Command[] = []
    for (const cmds of grouped.values()) {
      items.push(...cmds)
    }
    return items
  }, [grouped])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
  }, [])

  const execute = useCallback(
    (cmd: Command) => {
      close()
      cmd.action()
    },
    [close]
  )

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const activeEl = listRef.current.querySelector('[data-active="true"]')
    activeEl?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Global shortcut to open
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      global: true,
      action: () => setOpen((prev) => !prev),
    },
  ])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => (i + 1) % flatList.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => (i - 1 + flatList.length) % flatList.length)
        break
      case 'Enter':
        e.preventDefault()
        if (flatList[activeIndex]) {
          execute(flatList[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
    }
  }

  function formatShortcut(keys: string[]): React.ReactNode {
    return keys.map((key, i) => (
      <kbd
        key={i}
        className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-medium text-muted-foreground bg-background border border-sidebar-border rounded"
      >
        {key === 'Ctrl' ? '⌘' : key === 'Shift' ? '⇧' : key}
      </kbd>
    ))
  }

  if (!open) return null

  let itemIndex = -1

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
              placeholder="Type a command or search..."
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
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/50 bg-background/50 rounded border border-sidebar-border">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {flatList.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No commands found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Try a different search term
                </p>
              </div>
            ) : (
              Array.from(grouped.entries()).map(([category, cmds]) => (
                <div key={category}>
                  <div className="px-4 py-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                      {getCategoryLabel(category)}
                    </span>
                  </div>
                  {cmds.map((cmd) => {
                    itemIndex++
                    const isActive = itemIndex === activeIndex
                    const currentIndex = itemIndex
                    const Icon = cmd.icon
                    return (
                      <button
                        key={cmd.id}
                        data-active={isActive}
                        onClick={() => execute(cmd)}
                        onMouseEnter={() => setActiveIndex(currentIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                          isActive
                            ? 'bg-accent/10 text-foreground'
                            : 'text-muted-foreground hover:bg-sidebar-hover hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {cmd.label}
                          </p>
                          {cmd.description && (
                            <p className="text-xs text-muted-foreground/60 truncate">
                              {cmd.description}
                            </p>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            {formatShortcut(cmd.shortcut)}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
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
              Execute
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
