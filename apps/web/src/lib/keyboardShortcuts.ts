export type ShortcutCategory = 'navigation' | 'editing' | 'formatting' | 'actions'

export interface ShortcutDefinition {
  id: string
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  category: ShortcutCategory
}

export const categoryLabels: Record<ShortcutCategory, string> = {
  navigation: 'Navigation',
  editing: 'Editing',
  formatting: 'Formatting',
  actions: 'Actions',
}

export const shortcuts: ShortcutDefinition[] = [
  // Navigation
  { id: 'command-palette', key: 'k', ctrl: true, description: 'Open command palette', category: 'navigation' },
  { id: 'shortcuts-help', key: '/', ctrl: true, description: 'Show keyboard shortcuts', category: 'navigation' },
  { id: 'settings', key: ',', ctrl: true, description: 'Open settings', category: 'navigation' },
  { id: 'new-document', key: 'n', ctrl: true, description: 'New document', category: 'navigation' },
  { id: 'toggle-sidebar', key: '\\', ctrl: true, description: 'Toggle sidebar', category: 'navigation' },

  // Editing
  { id: 'save', key: 's', ctrl: true, description: 'Save document', category: 'editing' },
  { id: 'undo', key: 'z', ctrl: true, description: 'Undo', category: 'editing' },
  { id: 'redo', key: 'z', ctrl: true, shift: true, description: 'Redo', category: 'editing' },
  { id: 'comment', key: 'c', ctrl: true, shift: true, description: 'Add comment', category: 'editing' },

  // Formatting
  { id: 'bold', key: 'b', ctrl: true, description: 'Bold', category: 'formatting' },
  { id: 'italic', key: 'i', ctrl: true, description: 'Italic', category: 'formatting' },
  { id: 'underline', key: 'u', ctrl: true, description: 'Underline', category: 'formatting' },
  { id: 'code', key: 'e', ctrl: true, description: 'Inline code', category: 'formatting' },

  // Actions
  { id: 'escape', key: 'Escape', description: 'Close modal / Cancel', category: 'actions' },
  { id: 'save-close', key: 'Enter', ctrl: true, description: 'Save and close', category: 'actions' },
]

/**
 * Returns the platform-aware modifier symbol (⌘ on Mac, Ctrl on others).
 */
export function getModifierSymbol(): string {
  if (typeof navigator === 'undefined') return 'Ctrl'
  return /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'
}

/**
 * Format a shortcut definition into a display string like "⌘ + S".
 */
export function formatShortcutKeys(shortcut: ShortcutDefinition): string[] {
  const keys: string[] = []
  const mod = getModifierSymbol()

  if (shortcut.ctrl) keys.push(mod)
  if (shortcut.shift) keys.push('⇧')
  if (shortcut.alt) keys.push('Alt')
  keys.push(shortcut.key === 'Escape' ? 'Esc' : shortcut.key.toUpperCase())

  return keys
}

/**
 * Get shortcuts filtered by category.
 */
export function getShortcutsByCategory(category: ShortcutCategory): ShortcutDefinition[] {
  return shortcuts.filter(s => s.category === category)
}

/**
 * Find a shortcut by id.
 */
export function findShortcut(id: string): ShortcutDefinition | undefined {
  return shortcuts.find(s => s.id === id)
}
