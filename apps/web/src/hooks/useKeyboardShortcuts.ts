import { useEffect, useCallback, useState } from 'react'

export interface Shortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  category: 'navigation' | 'editing' | 'actions' | 'formatting'
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled: boolean = true) {
  const [showHelp, setShowHelp] = useState(false)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.isContentEditable

      // Allow some shortcuts even in inputs
      const allowedInInput = ['ctrlKey', 'metaKey', 'altKey'].some(k => event[k])

      if (isInput && !allowedInInput) return

      const matchedShortcut = shortcuts.find((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = !!shortcut.ctrl === event.ctrlKey
        const metaMatch = !!shortcut.meta === event.metaKey
        const shiftMatch = !!shortcut.shift === event.shiftKey
        const altMatch = !!shortcut.alt === event.altKey

        return keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch
      })

      if (matchedShortcut) {
        event.preventDefault()
        matchedShortcut.action()
      }

      // Show help with Ctrl/Cmd + /
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault()
        setShowHelp(true)
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { showHelp, setShowHelp }
}

// Predefined shortcuts for the app
export const defaultShortcuts: Omit<Shortcut, 'action'>[] = [
  // Navigation
  { key: 'k', ctrl: true, description: 'Open command palette', category: 'navigation' },
  { key: '/', ctrl: true, description: 'Show keyboard shortcuts', category: 'navigation' },
  { key: ',', ctrl: true, description: 'Open settings', category: 'navigation' },
  { key: 'n', ctrl: true, description: 'New document', category: 'navigation' },
  { key: 'b', ctrl: true, description: 'Toggle sidebar', category: 'navigation' },
  
  // Editing
  { key: 's', ctrl: true, description: 'Save document', category: 'editing' },
  { key: 'z', ctrl: true, description: 'Undo', category: 'editing' },
  { key: 'z', ctrl: true, shift: true, description: 'Redo', category: 'editing' },
  { key: 'c', ctrl: true, shift: true, description: 'Add comment', category: 'editing' },
  
  // Formatting
  { key: 'b', ctrl: true, description: 'Bold', category: 'formatting' },
  { key: 'i', ctrl: true, description: 'Italic', category: 'formatting' },
  { key: 'u', ctrl: true, description: 'Underline', category: 'formatting' },
  { key: 'e', ctrl: true, description: 'Code', category: 'formatting' },
  
  // Actions
  { key: 'Escape', description: 'Close modal / Cancel', category: 'actions' },
  { key: 'Enter', ctrl: true, description: 'Save and close', category: 'actions' },
]
