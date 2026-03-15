'use client'

import type { ReactNode } from 'react'
import { FileText, FolderOpen, Users, MessageSquare, Search, type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  preset?: 'documents' | 'members' | 'messages' | 'search' | 'general'
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

const presetIcons: Record<string, LucideIcon> = {
  documents: FileText,
  members: Users,
  messages: MessageSquare,
  search: Search,
  general: FolderOpen,
}

const presetColors: Record<string, string> = {
  documents: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  members: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  messages: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  search: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  general: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
}

export function EmptyState({
  icon,
  preset = 'general',
  title,
  description,
  action,
  secondaryAction,
  children,
}: EmptyStateProps) {
  const Icon = icon || presetIcons[preset]
  const colorClass = presetColors[preset]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center mb-5`}>
        <Icon className="w-7 h-7" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-1.5">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-background border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium rounded-lg transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}

      {/* Custom content */}
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}

export default EmptyState
