'use client'

import { useEffect, useCallback, useRef } from 'react'

interface ShortcutHandler {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  /** If true, shortcut works even when an input/textarea is focused */
  global?: boolean
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    const isInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable

    for (const shortcut of shortcutsRef.current) {
      const ctrlMatch = shortcut.ctrl
        ? e.ctrlKey || e.metaKey
        : !e.ctrlKey && !e.metaKey
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
      const altMatch = shortcut.alt ? e.altKey : !e.altKey
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        if (isInput && !shortcut.global) continue

        e.preventDefault()
        e.stopPropagation()
        shortcut.action()
        return
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [handleKeyDown])
}
