import {
  Plus,
  FileText,
  PenTool,
  Search,
  Moon,
  Sun,
  Settings,
  Save,
  Undo2,
  Redo2,
  Bold,
  Italic,
  FolderOpen,
  LayoutDashboard,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react'

export type CommandCategory = 'create' | 'navigation' | 'edit' | 'view' | 'file'

export interface Command {
  id: string
  label: string
  description?: string
  icon: LucideIcon
  category: CommandCategory
  shortcut?: string[]
  action: () => void
}

const categoryLabels: Record<CommandCategory, string> = {
  create: 'Create',
  navigation: 'Navigation',
  edit: 'Edit',
  view: 'View',
  file: 'File',
}

export function getCategoryLabel(category: CommandCategory): string {
  return categoryLabels[category]
}

export function createCommands(deps: {
  router: { push: (path: string) => void }
  toggleTheme: () => void
  isDark: boolean
}): Command[] {
  const { router, toggleTheme, isDark } = deps

  return [
    // Create
    {
      id: 'create-workspace',
      label: 'Create New Workspace',
      description: 'Start a new workspace for your team',
      icon: Plus,
      category: 'create',
      shortcut: ['Ctrl', 'Shift', 'W'],
      action: () => router.push('/workspaces?create=true'),
    },
    {
      id: 'create-document',
      label: 'Create New Document',
      description: 'Create a blank document',
      icon: FileText,
      category: 'create',
      shortcut: ['Ctrl', 'N'],
      action: () => router.push('/documents?create=true'),
    },
    {
      id: 'create-whiteboard',
      label: 'Create New Whiteboard',
      description: 'Open a blank whiteboard canvas',
      icon: PenTool,
      category: 'create',
      shortcut: ['Ctrl', 'Shift', 'N'],
      action: () => router.push('/documents?create=whiteboard'),
    },

    // Navigation
    {
      id: 'go-dashboard',
      label: 'Go to Dashboard',
      icon: LayoutDashboard,
      category: 'navigation',
      action: () => router.push('/'),
    },
    {
      id: 'go-workspaces',
      label: 'Go to Workspaces',
      icon: FolderOpen,
      category: 'navigation',
      action: () => router.push('/workspaces'),
    },
    {
      id: 'go-documents',
      label: 'Go to Documents',
      icon: FileText,
      category: 'navigation',
      action: () => router.push('/documents'),
    },
    {
      id: 'go-team',
      label: 'Go to Team',
      icon: Users,
      category: 'navigation',
      action: () => router.push('/team'),
    },
    {
      id: 'go-calls',
      label: 'Go to Calls',
      icon: Video,
      category: 'navigation',
      action: () => router.push('/calls'),
    },
    {
      id: 'search-everywhere',
      label: 'Search Everywhere',
      description: 'Search documents, workspaces, and more',
      icon: Search,
      category: 'navigation',
      shortcut: ['Ctrl', 'K'],
      action: () => {
        // The command palette itself serves as search
      },
    },

    // View
    {
      id: 'toggle-dark-mode',
      label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle between light and dark themes',
      icon: isDark ? Sun : Moon,
      category: 'view',
      shortcut: ['Ctrl', 'Shift', 'L'],
      action: toggleTheme,
    },
    {
      id: 'open-settings',
      label: 'Open Settings',
      description: 'Manage your account and preferences',
      icon: Settings,
      category: 'view',
      shortcut: ['Ctrl', ','],
      action: () => router.push('/settings'),
    },

    // File
    {
      id: 'save-document',
      label: 'Save Document',
      description: 'Save the current document',
      icon: Save,
      category: 'file',
      shortcut: ['Ctrl', 'S'],
      action: () => {
        document.dispatchEvent(new CustomEvent('collab:save'))
      },
    },

    // Edit
    {
      id: 'undo',
      label: 'Undo',
      icon: Undo2,
      category: 'edit',
      shortcut: ['Ctrl', 'Z'],
      action: () => {
        document.dispatchEvent(new CustomEvent('collab:undo'))
      },
    },
    {
      id: 'redo',
      label: 'Redo',
      icon: Redo2,
      category: 'edit',
      shortcut: ['Ctrl', 'Shift', 'Z'],
      action: () => {
        document.dispatchEvent(new CustomEvent('collab:redo'))
      },
    },
    {
      id: 'bold',
      label: 'Bold',
      icon: Bold,
      category: 'edit',
      shortcut: ['Ctrl', 'B'],
      action: () => {
        document.dispatchEvent(new CustomEvent('collab:bold'))
      },
    },
    {
      id: 'italic',
      label: 'Italic',
      icon: Italic,
      category: 'edit',
      shortcut: ['Ctrl', 'I'],
      action: () => {
        document.dispatchEvent(new CustomEvent('collab:italic'))
      },
    },
  ]
}
