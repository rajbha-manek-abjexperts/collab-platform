'use client'

import { useState, useCallback } from 'react'
import {
  History,
  X,
  Plus,
  Loader2,
} from 'lucide-react'
import VersionItem, { type Version } from './VersionItem'

interface VersionHistoryProps {
  entityType: 'document' | 'whiteboard'
  entityId: string
  versions: Version[]
  loading?: boolean
  onCreateVersion: () => void
  onRestoreVersion: (version: Version) => void
  onUpdateLabel: (id: string, label: string) => void
  onDeleteVersion: (id: string) => void
  onSelectVersion: (version: Version) => void
  onClose: () => void
}

export default function VersionHistory({
  entityType,
  entityId,
  versions,
  loading = false,
  onCreateVersion,
  onRestoreVersion,
  onUpdateLabel,
  onDeleteVersion,
  onSelectVersion,
  onClose,
}: VersionHistoryProps) {
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null)

  const handleSelect = useCallback(
    (version: Version) => {
      setActiveVersionId(version.id)
      onSelectVersion(version)
    },
    [onSelectVersion],
  )

  return (
    <aside className="w-72 border-l border-sidebar-border bg-sidebar flex flex-col shrink-0 h-full">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <History className="h-4.5 w-4.5 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Version History
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-sidebar-hover text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Save Version Button */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={onCreateVersion}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Save Version
        </button>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 px-4">
            <History className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No versions yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Save a version to track changes to this {entityType}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {versions.map((version) => (
              <VersionItem
                key={version.id}
                version={version}
                isActive={activeVersionId === version.id}
                onSelect={handleSelect}
                onRestore={onRestoreVersion}
                onUpdateLabel={onUpdateLabel}
                onDelete={onDeleteVersion}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {versions.length > 0 && (
        <div className="px-4 py-2.5 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground/60">
            {versions.length} version{versions.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </aside>
  )
}
