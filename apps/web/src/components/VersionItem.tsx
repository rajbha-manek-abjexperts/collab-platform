'use client'

import { useState } from 'react'
import {
  Clock,
  MoreHorizontal,
  Tag,
  Trash2,
  RotateCcw,
  Pencil,
  Check,
  X,
} from 'lucide-react'

export interface Version {
  id: string
  document_id?: string
  whiteboard_id?: string
  snapshot: object
  created_by: string
  version_number: number
  label: string | null
  created_at: string
}

interface VersionItemProps {
  version: Version
  isActive: boolean
  onSelect: (version: Version) => void
  onRestore: (version: Version) => void
  onUpdateLabel: (id: string, label: string) => void
  onDelete: (id: string) => void
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function VersionItem({
  version,
  isActive,
  onSelect,
  onRestore,
  onUpdateLabel,
  onDelete,
}: VersionItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [labelValue, setLabelValue] = useState(version.label ?? '')

  const handleSaveLabel = () => {
    onUpdateLabel(version.id, labelValue)
    setEditing(false)
  }

  const handleCancelEdit = () => {
    setLabelValue(version.label ?? '')
    setEditing(false)
  }

  return (
    <div
      className={`group relative px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-sidebar-active text-foreground'
          : 'text-muted-foreground hover:bg-sidebar-hover hover:text-foreground'
      }`}
      onClick={() => onSelect(version)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">
              v{version.version_number}
            </span>
            {version.label && !editing && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-accent/10 text-accent-foreground">
                <Tag className="h-3 w-3" />
                {version.label}
              </span>
            )}
          </div>

          {editing ? (
            <div
              className="flex items-center gap-1 mt-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                placeholder="Add label..."
                className="flex-1 text-xs px-2 py-1 rounded border border-sidebar-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveLabel()
                  if (e.key === 'Escape') handleCancelEdit()
                }}
              />
              <button
                onClick={handleSaveLabel}
                className="p-1 rounded hover:bg-sidebar-hover text-green-500"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 rounded hover:bg-sidebar-hover text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(version.created_at)}</span>
            </div>
          )}
        </div>

        {/* Actions menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-sidebar-hover transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-dropdown border border-sidebar-border rounded-lg shadow-lg z-50 py-1">
              <button
                onClick={() => {
                  onRestore(version)
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </button>
              <button
                onClick={() => {
                  setEditing(true)
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                {version.label ? 'Edit Label' : 'Add Label'}
              </button>
              <div className="border-t border-sidebar-border my-1" />
              <button
                onClick={() => {
                  onDelete(version.id)
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-sidebar-hover transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
