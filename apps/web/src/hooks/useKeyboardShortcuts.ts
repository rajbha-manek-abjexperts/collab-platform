import { useEffect, useCallback, useState } from 'react'

export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description?: string
  category?: 'navigation' | 'editing' | 'actions' | 'formatting'
  /** If true, fires even when focus is in an input/textarea/contentEditable */
  global?: boolean
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled: boolean = true) {
  const [showHelp, setShowHelp] = useState(false)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      const target = event.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        // ctrl flag matches either Ctrl or Cmd (metaKey) for cross-platform support
        const modMatch = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey
        const shiftMatch = !!shortcut.shift === event.shiftKey
        const altMatch = !!shortcut.alt === event.altKey

        if (keyMatch && modMatch && shiftMatch && altMatch) {
          // Skip if in input and shortcut isn't global or modifier-based
          if (isInput && !shortcut.global && !shortcut.ctrl && !shortcut.alt) continue

          event.preventDefault()
          shortcut.action()
          return
        }
      }

      // Built-in: Ctrl/Cmd + / shows shortcuts help
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault()
        setShowHelp(prev => !prev)
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
