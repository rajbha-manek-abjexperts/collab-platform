'use client'

import { useState } from 'react'
import { Loader2, Check, Users, Shield, Trash2 } from 'lucide-react'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import type { MemberRole } from '@/types/workspace'

const roleLabels: Record<MemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
}

const roleBadgeColors: Record<MemberRole, string> = {
  owner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  member: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  viewer: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

export default function WorkspaceSettings() {
  const { workspaces, update, remove } = useWorkspaces()
  const workspace = workspaces?.[0]

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: workspace?.name || '',
    description: workspace?.description || '',
  })
  const [inviteEmail, setInviteEmail] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace) return
    setSaving(true)
    try {
      await update.mutateAsync({ id: workspace.id, ...form })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  // Demo members for display
  const members = [
    { id: '1', name: 'You', email: 'you@example.com', role: 'owner' as MemberRole },
    { id: '2', name: 'Alice Chen', email: 'alice@example.com', role: 'admin' as MemberRole },
    { id: '3', name: 'Bob Smith', email: 'bob@example.com', role: 'member' as MemberRole },
  ]

  return (
    <div className="space-y-8">
      {/* General */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Workspace Details</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Configure your workspace name and description.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Workspace Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full max-w-md px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-shadow"
              placeholder="My Workspace"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full max-w-md px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-shadow resize-none"
              placeholder="What is this workspace for?"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4" />
                Saved
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Members */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--muted-foreground)]" />
              Members
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
              Manage who has access to this workspace.
            </p>
          </div>
        </div>

        {/* Invite */}
        <div className="flex gap-3 mb-6">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 max-w-sm px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-shadow"
            placeholder="colleague@company.com"
          />
          <button
            type="button"
            className="px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Invite
          </button>
        </div>

        {/* Member List */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleBadgeColors[member.role]}`}
                >
                  {roleLabels[member.role]}
                </span>
                {member.role !== 'owner' && (
                  <button className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">Danger Zone</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Deleting a workspace removes all documents, whiteboards, and member access permanently.
        </p>
        <button className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          Delete Workspace
        </button>
      </div>
    </div>
  )
}
